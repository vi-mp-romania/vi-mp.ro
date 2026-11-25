/** localStorage access that never throws (private mode, disabled storage, quota). */

/** Reads a stored string, or null when missing or unavailable. */
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Stores a string; silently does nothing when storage is unavailable. */
export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage is a convenience only; the site works without it.
  }
}
