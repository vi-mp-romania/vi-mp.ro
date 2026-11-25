/** Turns a title into the URL slug of its page ("GTA VI — Trailer 2" → "gta-vi-trailer-2"). */

// Constants
const MAX_LENGTH = 80; // same limit as the check on news_items.slug

/** True for a valid slug: lowercase letters and digits in words joined by single hyphens. */
export function isSlug(value: string): boolean {
  return value.length <= MAX_LENGTH && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/**
 * Lowercase ASCII slug of `text`: Romanian (and other) diacritics are dropped, every run of other
 * characters becomes one hyphen, and the result is cut at a word boundary within 80 characters.
 * Returns "" when nothing usable is left.
 */
export function slugify(text: string): string {
  const words = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks: ă → a, ș → s, ț → t, î → i
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (words.length <= MAX_LENGTH) return words;
  const cut = words.slice(0, MAX_LENGTH);
  return cut.includes('-') ? cut.slice(0, cut.lastIndexOf('-')) : cut;
}
