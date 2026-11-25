/** Resolves the texts the site shows: registry defaults overridden by rows from the database. */
import { TEXT_KEYS, TEXT_REGISTRY, type TextKey } from './textRegistry';

/** The resolved text for every key. */
export type Texts = Readonly<Record<TextKey, string>>;

/** A stored override, as read from public.site_texts. */
export interface TextOverride {
  key: string;
  value: string;
}

/** Defaults merged with overrides. Overrides for keys the registry no longer has are ignored. */
export function resolveTexts(overrides: readonly TextOverride[]): Texts {
  const byKey = new Map(overrides.map((override) => [override.key, override.value]));
  return Object.fromEntries(TEXT_KEYS.map((key) => [key, byKey.get(key) ?? TEXT_REGISTRY[key].value])) as Texts;
}

/** The registry defaults alone; used before the database answers and when it cannot. */
export const DEFAULT_TEXTS: Texts = resolveTexts([]);
