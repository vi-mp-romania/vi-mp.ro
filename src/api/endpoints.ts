/**
 * The `api` object: every call the site makes to Supabase. Components and hooks use this, never
 * supabase-js directly. Each call validates what comes back and throws ApiError on failure.
 */
// Libs
import { z } from 'zod';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

// Logic
import { ApiError, NotConfiguredError, toApiError } from './errors';
import {
  newsItemSchema,
  siteSettingsSchema,
  statusStageSchema,
  textOverrideSchema,
  voteCountSchema,
  type NewsItem,
  type NewsItemDraft,
  type SiteSettings,
} from './types';

// Types
import type { PollAnswer, PollKey } from '@/lib/polls';
import type { StatusStage } from '@/lib/statusProgress';
import type { TextOverride } from '@/lib/texts';
import type { VoteCount } from '@/lib/voteResults';

// Constants
const NEWS_COLUMNS = 'id, source, kind_label, title, summary, url, image_url, cta_label, is_published, position, created_at';

/** Everything the site can ask of the back-end. */
export type Api = ReturnType<typeof createApi>;

/** Builds the api over a Supabase client; with null, every call throws NotConfiguredError. */
export function createApi(client: SupabaseClient | null) {
  /** The client, or the not-configured error. */
  function db(): SupabaseClient {
    if (!client) throw new NotConfiguredError();
    return client;
  }

  return {
    /** True when the build has a Supabase project. */
    isConfigured: client !== null,

    // ---- Public reads ----------------------------------------------------------------------

    /** The site settings row. */
    async getSettings(): Promise<SiteSettings> {
      const rows = await run(db().from('site_settings').select('discord_url, hero_image_url, current_stage').eq('id', 1));
      const row = parse(z.array(siteSettingsSchema), rows)[0];
      if (!row) throw new ApiError('Setările site-ului lipsesc din baza de date.');
      return row;
    },

    /** Timeline stages, ordered by position. */
    async listStages(): Promise<StatusStage[]> {
      const rows = await run(db().from('status_stages').select('position, title, caption').order('position'));
      return parse(z.array(statusStageSchema), rows);
    },

    /** Texts an admin changed. */
    async listTextOverrides(): Promise<TextOverride[]> {
      return parse(z.array(textOverrideSchema), await run(db().from('site_texts').select('key, value')));
    },

    /**
     * News, ordered for display. Visitors only ever receive published items (row level security);
     * an admin receives drafts too, so public pages also filter on is_published.
     */
    async listNews(options: { publishedOnly: boolean; limit?: number }): Promise<NewsItem[]> {
      let query = db().from('news_items').select(NEWS_COLUMNS).order('position').order('created_at', { ascending: false });
      if (options.publishedOnly) query = query.eq('is_published', true);
      if (options.limit) query = query.limit(options.limit);
      return parse(z.array(newsItemSchema), await run(query));
    },

    // ---- Votes -----------------------------------------------------------------------------

    /** Records or changes this browser's answer to a poll. */
    async castVote(voterId: string, poll: PollKey, answer: PollAnswer): Promise<void> {
      await run(db().rpc('cast_vote', { p_voter_id: voterId, p_poll: poll, p_answer: answer }));
    },

    /** Vote totals per poll and answer. */
    async getVoteResults(): Promise<VoteCount[]> {
      return parse(z.array(voteCountSchema), await run(db().rpc('vote_results')));
    },

    // ---- Admin session ---------------------------------------------------------------------

    /** The stored admin session, if any. */
    async getSession(): Promise<Session | null> {
      const { data, error } = await db().auth.getSession();
      if (error) throw toApiError(error);
      return data.session;
    },

    /** Calls `listener` whenever the session changes; returns the unsubscribe function. */
    onSessionChange(listener: (session: Session | null) => void): () => void {
      if (!client) return () => {};
      const { data } = client.auth.onAuthStateChange((_event, session) => listener(session));
      return () => data.subscription.unsubscribe();
    },

    /** Signs in with email and password. */
    async signIn(email: string, password: string): Promise<void> {
      const { error } = await db().auth.signInWithPassword({ email, password });
      if (error) throw toApiError(error);
    },

    /** Signs out of this browser. */
    async signOut(): Promise<void> {
      const { error } = await db().auth.signOut();
      if (error) throw toApiError(error);
    },

    /** True when the signed-in user is listed in public.admins. */
    async isAdmin(): Promise<boolean> {
      return parse(z.boolean(), await run(db().rpc('is_admin')));
    },

    // ---- Admin writes ----------------------------------------------------------------------

    /** Saves the Discord and hero image URLs. */
    async saveLinks(links: Pick<SiteSettings, 'discord_url' | 'hero_image_url'>): Promise<void> {
      await run(db().from('site_settings').update({ ...links, updated_at: new Date().toISOString() }).eq('id', 1));
    },

    /** Replaces the timeline and the current stage atomically (save_status RPC). */
    async saveStatus(stages: readonly Pick<StatusStage, 'title' | 'caption'>[], currentStage: number): Promise<void> {
      await run(db().rpc('save_status', { p_stages: stages, p_current_stage: currentStage }));
    },

    /** Stores an override for one text. */
    async saveText(key: string, value: string): Promise<void> {
      await run(db().from('site_texts').upsert({ key, value, updated_at: new Date().toISOString() }));
    },

    /** Removes the override for one text, so its default shows again. */
    async resetText(key: string): Promise<void> {
      await run(db().from('site_texts').delete().eq('key', key));
    },

    /** Creates a news item (no id) or updates an existing one. */
    async saveNewsItem(draft: NewsItemDraft, id?: string): Promise<void> {
      const table = db().from('news_items');
      await run(id ? table.update(draft).eq('id', id) : table.insert(draft));
    },

    /** Deletes a news item. */
    async deleteNewsItem(id: string): Promise<void> {
      await run(db().from('news_items').delete().eq('id', id));
    },

    /** Deletes every vote of one poll. */
    async resetVotes(poll: PollKey): Promise<void> {
      await run(db().rpc('reset_votes', { p_poll: poll }));
    },
  };
}

// Internals

/** Validates data from the database; a mismatch means the schema and the site disagree. */
function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('[api] unexpected data shape', result.error);
    throw new ApiError('Datele primite de la server nu au formatul așteptat.', { cause: result.error });
  }
  return result.data;
}

/** Awaits a Supabase query or RPC and returns its data, throwing ApiError on any failure. */
async function run<T>(query: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  let result: { data: T; error: unknown };
  try {
    result = await query;
  } catch (failure) {
    throw toApiError(failure);
  }
  if (result.error) throw toApiError(result.error);
  return result.data;
}
