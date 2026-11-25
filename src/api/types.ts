/** Shapes of the rows and RPC results the site reads, validated at the boundary with zod. */
import { z } from 'zod';

/** Source of a news item; decides its icon and label. */
export const NEWS_SOURCES = ['youtube', 'reddit', 'discord', 'link'] as const;

/** Source of a news item. */
export type NewsSource = (typeof NEWS_SOURCES)[number];

/** The single public.site_settings row. */
export const siteSettingsSchema = z.object({
  discord_url: z.string(),
  hero_image_url: z.string(),
  current_stage: z.number().int(),
  // Added by migration 0003; defaults to "off" for a database (or a cached snapshot) without it.
  ga_measurement_id: z.string().default(''),
});

/** Site-wide settings edited in the control panel. */
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/** A public.status_stages row. */
export const statusStageSchema = z.object({
  position: z.number().int(),
  title: z.string(),
  caption: z.string(),
});

/** A public.site_texts row. */
export const textOverrideSchema = z.object({ key: z.string(), value: z.string() });

/** A public.news_items row. */
export const newsItemSchema = z.object({
  id: z.string(),
  source: z.enum(NEWS_SOURCES),
  kind_label: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string(),
  image_url: z.string(),
  cta_label: z.string(),
  is_published: z.boolean(),
  position: z.number().int(),
  created_at: z.string(),
  // Added by migration 0005; defaults keep a database without them readable.
  slug: z.string().default(''),
  body: z.string().default(''),
});

/** A news item. */
export type NewsItem = z.infer<typeof newsItemSchema>;

/** The editable fields of a news item (id and created_at are set by the database). */
export type NewsItemDraft = Omit<NewsItem, 'id' | 'created_at'>;

/** A public.faq_items row (migration 0005). */
export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  is_published: z.boolean(),
  position: z.number().int(),
});

/** A FAQ entry. */
export type FaqItem = z.infer<typeof faqItemSchema>;

/** The editable fields of a FAQ entry. */
export type FaqItemDraft = Omit<FaqItem, 'id'>;

/** A vote_results() row; bigint counts arrive as numbers or strings depending on size. */
export const voteCountSchema = z.object({
  poll: z.string(),
  answer: z.string(),
  total: z.coerce.number().int().nonnegative(),
});

/** The editable fields of a stored news item. */
export function toNewsDraft({ id: _id, created_at: _createdAt, ...draft }: NewsItem): NewsItemDraft {
  return draft;
}

/** The editable fields of a stored FAQ entry. */
export function toFaqDraft({ id: _id, ...draft }: FaqItem): FaqItemDraft {
  return draft;
}

/** The URL slug of a news item; items saved before slugs existed use their id. */
export function newsSlug(item: Pick<NewsItem, 'id' | 'slug'>): string {
  return item.slug || item.id;
}
