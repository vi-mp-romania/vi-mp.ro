/**
 * The last data loaded from Supabase, kept in localStorage so a returning visitor's first paint
 * already shows real content (no placeholders, no jump). Fresh data always replaces it. Stored
 * JSON is untrusted: it is validated with the same schemas as network data, and anything that does
 * not match is ignored.
 */
// Libs
import { z } from 'zod';

// Logic
import { readStored, writeStored } from '@/lib/browserStorage';
import { newsItemSchema, siteSettingsSchema, statusStageSchema, textOverrideSchema } from './types';

// Types
import type { NewsItem, SiteSettings } from './types';
import type { TextOverride } from '@/lib/texts';
import type { StatusStage } from '@/lib/statusProgress';

// Constants
const SITE_KEY = 'vimp.cache.v1.site'; // bump the version when a cached shape changes
const NEWS_KEY_PREFIX = 'vimp.cache.v1.news.'; // + the list limit ("all" without one)

const siteSnapshotSchema = z.object({
  settings: siteSettingsSchema,
  stages: z.array(statusStageSchema),
  overrides: z.array(textOverrideSchema),
});

/** App-wide data as last loaded. */
export type SiteSnapshot = z.infer<typeof siteSnapshotSchema>;

/** The cached app-wide data, or null when there is none or it is unreadable. */
export function readCachedSite(): SiteSnapshot | null {
  return readJson(SITE_KEY, siteSnapshotSchema);
}

/** Remembers the app-wide data just loaded. */
export function writeCachedSite(snapshot: {
  settings: SiteSettings;
  stages: StatusStage[];
  overrides: TextOverride[];
}): void {
  writeStored(SITE_KEY, JSON.stringify(snapshot));
}

/** The cached published news for this limit, or null. */
export function readCachedNews(limit: number | undefined): NewsItem[] | null {
  return readJson(NEWS_KEY_PREFIX + (limit ?? 'all'), z.array(newsItemSchema));
}

/** Remembers the published news just loaded for this limit. */
export function writeCachedNews(limit: number | undefined, items: NewsItem[]): void {
  writeStored(NEWS_KEY_PREFIX + (limit ?? 'all'), JSON.stringify(items));
}

// Internals

/** Parses and validates a stored value; null when missing, corrupt or of another shape. */
function readJson<T>(key: string, schema: z.ZodType<T>): T | null {
  const stored = readStored(key);
  if (!stored) return null;
  try {
    const result = schema.safeParse(JSON.parse(stored));
    return result.success ? result.data : null;
  } catch {
    return null; // corrupt JSON behaves like an empty cache
  }
}
