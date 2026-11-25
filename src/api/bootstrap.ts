/**
 * The data a page is first drawn with. The build loads it from Supabase, prerenders every page from
 * it, and embeds it in the HTML (a JSON <script> element); the browser reads it back so its first
 * render matches the prerendered page exactly: real content at once, no placeholders, no jump.
 * Fresh data is still fetched afterwards. The embedded JSON is untrusted input and is validated with
 * the row schemas; anything that does not match is ignored.
 */
// Libs
import { z } from 'zod';

// Logic
import {
  faqItemSchema,
  newsItemSchema,
  siteSettingsSchema,
  statusStageSchema,
  textOverrideSchema,
} from './types';
import { serializeJson } from '@/lib/pageMeta';

// Types
import type { Api } from './endpoints';

// Constants
/** id of the <script type="application/json"> element holding the bootstrap data. */
export const BOOTSTRAP_ELEMENT_ID = 'vimp-bootstrap';

const bootstrapSchema = z.object({
  settings: siteSettingsSchema,
  stages: z.array(statusStageSchema),
  overrides: z.array(textOverrideSchema),
  news: z.array(newsItemSchema), // every published item, in display order
  faq: z.array(faqItemSchema), // every published entry, in display order
});

/** Everything the public pages show, as loaded at build time. */
export type Bootstrap = z.infer<typeof bootstrapSchema>;

/**
 * Loads the bootstrap data through the api. The FAQ is optional (its table arrives with migration
 * 0005): failing to read it yields no entries rather than failing the build.
 */
export async function loadBootstrap(api: Api): Promise<Bootstrap> {
  const [settings, stages, overrides, news, faq] = await Promise.all([
    api.getSettings(),
    api.listStages(),
    api.listTextOverrides(),
    api.listNews({ publishedOnly: true }),
    api.listFaq({ publishedOnly: true }).catch(() => []),
  ]);
  return { settings, stages, overrides, news, faq };
}

/** The <script> element that embeds `bootstrap` in a page. */
export function bootstrapElement(bootstrap: Bootstrap): string {
  return `<script id="${BOOTSTRAP_ELEMENT_ID}" type="application/json">${serializeJson(bootstrap)}</script>`;
}

/** The bootstrap data embedded in this page, or null when there is none or it does not validate. */
export function readBootstrap(): Bootstrap | null {
  const text = document.getElementById(BOOTSTRAP_ELEMENT_ID)?.textContent;
  if (!text) return null;
  try {
    const result = bootstrapSchema.safeParse(JSON.parse(text));
    return result.success ? result.data : null;
  } catch {
    return null; // malformed JSON behaves like no bootstrap data
  }
}
