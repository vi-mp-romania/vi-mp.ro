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
  faqItemSchema,
  newsItemSchema,
  siteSettingsSchema,
  statusStageSchema,
  textOverrideSchema,
  voteCountSchema,
  type FaqItem,
  type FaqItemDraft,
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
const MEDIA_BUCKET = 'media'; // public Storage bucket for uploaded images (migration 0004)

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
      // Every column: the row is public and small, and a column added by a later migration
      // (ga_measurement_id) must not break the site before that migration has been applied.
      const rows = await run(db().from('site_settings').select('*').eq('id', 1));
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
      // Every column, so news stays readable before a migration that adds columns is applied.
      let query = db().from('news_items').select('*').order('position').order('created_at', { ascending: false });
      if (options.publishedOnly) query = query.eq('is_published', true);
      if (options.limit) query = query.limit(options.limit);
      return parse(z.array(newsItemSchema), await run(query));
    },

    /** FAQ entries in display order; `publishedOnly` as for news. */
    async listFaq(options: { publishedOnly: boolean }): Promise<FaqItem[]> {
      let query = db().from('faq_items').select('id, question, answer, is_published, position').order('position');
      if (options.publishedOnly) query = query.eq('is_published', true);
      return parse(z.array(faqItemSchema), await run(query));
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

    /** Signs in with the session an emailed reset or invitation link carried. */
    async setSessionFromLink(accessToken: string, refreshToken: string): Promise<void> {
      const { error } = await db().auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) throw toApiError(error);
    },

    /** Sets a new password for the signed-in user. */
    async updatePassword(password: string): Promise<void> {
      const { error } = await db().auth.updateUser({ password });
      if (error) throw toApiError(error);
    },

    /**
     * Emails a password reset link that returns to `redirectTo` (which must be listed under the
     * project's Redirect URLs). Succeeds for unknown addresses too, so it reveals nothing.
     */
    async requestPasswordReset(email: string, redirectTo: string): Promise<void> {
      const { error } = await db().auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw toApiError(error);
    },

    /** True when the signed-in user is listed in public.admins. */
    async isAdmin(): Promise<boolean> {
      return parse(z.boolean(), await run(db().rpc('is_admin')));
    },

    // ---- Admin writes ----------------------------------------------------------------------

    /** Saves the Discord and hero image URLs and the Google Analytics measurement id. */
    async saveSiteSettings(values: Pick<SiteSettings, 'discord_url' | 'hero_image_url' | 'ga_measurement_id'>): Promise<void> {
      await run(db().from('site_settings').update({ ...values, updated_at: new Date().toISOString() }).eq('id', 1));
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

    /** Creates a FAQ entry (no id) or updates an existing one. */
    async saveFaqItem(draft: FaqItemDraft, id?: string): Promise<void> {
      const table = db().from('faq_items');
      await run(id ? table.update(draft).eq('id', id) : table.insert(draft));
    },

    /** Deletes a FAQ entry. */
    async deleteFaqItem(id: string): Promise<void> {
      await run(db().from('faq_items').delete().eq('id', id));
    },

    /** Deletes a news item. */
    async deleteNewsItem(id: string): Promise<void> {
      await run(db().from('news_items').delete().eq('id', id));
    },

    /**
     * Uploads an image to the media bucket under a fresh random name (so files are never replaced
     * and can be cached forever) and returns its public URL.
     */
    async uploadImage(image: { blob: Blob; extension: string }, folder: 'hero' | 'news'): Promise<string> {
      const path = `${folder}/${crypto.randomUUID()}.${image.extension}`;
      const storage = db().storage.from(MEDIA_BUCKET);
      const { error } = await storage.upload(path, image.blob, {
        contentType: image.blob.type,
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw toApiError(error);
      return storage.getPublicUrl(path).data.publicUrl;
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
