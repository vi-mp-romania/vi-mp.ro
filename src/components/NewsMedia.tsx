/** The 16:9 picture of a news item: plays YouTube videos in place, otherwise an optional link. */
// Libs
import { Play } from 'lucide-react';
import { useState, type ReactNode } from 'react';

// Components
import { SkylineIllustration } from './SkylineIllustration';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { useAnalytics } from '@/hooks/useAnalytics';
import { youtubeEmbedUrl, youtubeVideoId } from '@/lib/youtube';

// Types
import type { NewsItem } from '@/api/types';

/** Props of NewsMedia. */
interface Props {
  item: NewsItem;
  /** Where clicking a non-video picture goes; omitted: the picture is not a link. */
  pictureLink?: { href: string; isExternal: boolean };
  isAboveFold?: boolean; // load the image eagerly (the article page's main picture)
}

/**
 * A YouTube link plays in place: the picture is a play button that swaps itself for the player (same
 * box, so nothing moves), loaded only on that click. Otherwise the picture can be a link; it is kept
 * out of the tab order and from screen readers because a text link next to it says the same.
 * Without an image the skyline shows.
 */
export function NewsMedia({ item, pictureLink, isAboveFold = false }: Props) {
  const analytics = useAnalytics();
  const imageSrc = safeUrl(item.image_url);
  const videoId = youtubeVideoId(safeUrl(item.url));

  // State
  const [isPlaying, setIsPlaying] = useState(false);

  // Actions
  const play = () => {
    setIsPlaying(true);
    analytics.track({ name: 'news_video_play', params: { news_title: item.title } });
  };
  const trackExternalClick = () => {
    if (pictureLink?.isExternal) analytics.track({ name: 'news_link_click', params: { news_title: item.title, link_url: pictureLink.href } });
  };

  const picture = (
    <>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading={isAboveFold ? 'eager' : 'lazy'}
          fetchPriority={isAboveFold ? 'high' : 'auto'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <SkylineIllustration hasSun={false} />
      )}
      {videoId && <PlayBadge />}
    </>
  );

  if (videoId && isPlaying) {
    return (
      <MediaFrame>
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title={item.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
        />
      </MediaFrame>
    );
  }
  if (videoId) {
    return (
      <MediaFrame>
        <button type="button" onClick={play} aria-label={`Redă video: ${item.title}`} className="group block h-full w-full">
          {picture}
        </button>
      </MediaFrame>
    );
  }
  if (pictureLink) {
    return (
      <MediaFrame>
        <a
          href={pictureLink.href}
          {...(pictureLink.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          tabIndex={-1}
          aria-hidden="true"
          onClick={trackExternalClick}
          className="group block h-full w-full"
        >
          {picture}
        </a>
      </MediaFrame>
    );
  }
  return <MediaFrame>{picture}</MediaFrame>;
}

// Internals

/** The 16:9 rounded box every state (picture, link, player) is drawn in. */
function MediaFrame({ children }: { children: ReactNode }) {
  return <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card">{children}</div>;
}

/** Round play button drawn over a video thumbnail; decorative, the surrounding button is labelled. */
function PlayBadge() {
  return (
    <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <span className="grid size-16 place-items-center rounded-full bg-black/60 text-white transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Play className="ml-1 size-7 fill-current" />
      </span>
    </span>
  );
}
