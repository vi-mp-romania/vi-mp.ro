/** Validation for URLs that come from the database before they reach an href or src. */

/**
 * Returns the URL when it is an absolute http(s) URL, otherwise null. Blocks javascript:, data:
 * and relative values, so content stored in the database cannot run script or point inside the site.
 */
export function safeUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
