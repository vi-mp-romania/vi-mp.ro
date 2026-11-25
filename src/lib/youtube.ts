/** Recognises YouTube video URLs and builds the embedded player address for them. */

// Constants
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/; // YouTube video ids are 11 URL-safe characters
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com']);

/**
 * The video id in a YouTube URL (watch?v=, youtu.be/, /shorts/, /embed/, /live/), or null for any
 * other URL. Only the id is taken from the URL, so the player address is always built by us.
 */
export function youtubeVideoId(url: string | null): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  let candidate: string | null = null;
  if (parsed.hostname === 'youtu.be') {
    candidate = parsed.pathname.split('/')[1] ?? null;
  } else if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    const [, first, second] = parsed.pathname.split('/');
    candidate = first === 'watch' ? parsed.searchParams.get('v') : ['shorts', 'embed', 'live'].includes(first ?? '') ? (second ?? null) : null;
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

/** Address of the privacy-enhanced player for a video id, starting playback at once. */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}
