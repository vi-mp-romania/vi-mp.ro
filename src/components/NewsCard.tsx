/** One news item as a card: thumbnail, source line, title, summary and link. */
// Libs
import { useState, type ReactNode } from 'react';
import { ArrowUpRight, CirclePlay, Link as LinkIcon, MessagesSquare, Play } from 'lucide-react';

// Components
import { DiscordIcon } from './DiscordIcon';
import { SkylineIllustration } from './SkylineIllustration';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { useAnalytics } from '@/hooks/useAnalytics';
import { youtubeEmbedUrl, youtubeVideoId } from '@/lib/youtube';

// Types
import type { NewsItem, NewsSource } from '@/api/types';

// Constants
const SOURCE_NAMES: Readonly<Record<NewsSource, string>> = {
  youtube: 'YouTube',
  reddit: 'Reddit',
  discord: 'Discord',
  link: 'Link',
};

/** Props of NewsCard. */
interface Props {
  item: NewsItem;
}

/**
 * A news card. A YouTube link plays in place: the thumbnail is a play button that swaps itself for
 * the player (same 16:9 box, so nothing moves), loaded only on that click. Any other link makes the
 * picture a second link to the same place, kept out of the tab order and from screen readers because
 * the text link already announces it. Without an image the skyline shows; without a valid URL the
 * links hide.
 */
export function NewsCard({ item }: Props) {
  const href = safeUrl(item.url);
  const imageSrc = safeUrl(item.image_url);
  const videoId = youtubeVideoId(href);
  const analytics = useAnalytics();

  // State
  const [isPlaying, setIsPlaying] = useState(false);

  // Actions
  const play = () => {
    setIsPlaying(true);
    analytics.track({ name: 'news_video_play', params: { news_title: item.title } });
  };
  const trackLinkClick = () => {
    if (href) analytics.track({ name: 'news_link_click', params: { news_title: item.title, link_url: href } });
  };

  const picture = (
    <>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <SkylineIllustration hasSun={false} />
      )}
      {videoId && <PlayBadge />}
    </>
  );

  return (
    <article className="flex flex-col gap-3">
      {videoId && isPlaying && (
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
      )}
      {videoId && !isPlaying && (
        <MediaFrame>
          <button type="button" onClick={play} aria-label={`Redă video: ${item.title}`} className="group block h-full w-full">
            {picture}
          </button>
        </MediaFrame>
      )}
      {!videoId && href && (
        <MediaFrame>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            onClick={trackLinkClick}
            className="group block h-full w-full"
          >
            {picture}
          </a>
        </MediaFrame>
      )}
      {!videoId && !href && <MediaFrame>{picture}</MediaFrame>}

      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <SourceIcon source={item.source} />
        {SOURCE_NAMES[item.source]}
        {item.kind_label && <span>· {item.kind_label}</span>}
      </p>
      <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
      {item.summary && <p className="text-sm text-muted-foreground">{item.summary}</p>}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackLinkClick}
          className="inline-flex w-fit items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          {item.cta_label || 'Deschide'}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

// Internals

/** The 16:9 rounded box every thumbnail state (picture, link, player) is drawn in. */
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

/** Small icon for the news source. */
function SourceIcon({ source }: { source: NewsSource }) {
  const className = 'size-4 text-foreground';
  if (source === 'youtube') return <CirclePlay className={className} aria-hidden="true" />;
  if (source === 'reddit') return <MessagesSquare className={className} aria-hidden="true" />;
  if (source === 'discord') return <DiscordIcon className={className} />;
  return <LinkIcon className={className} aria-hidden="true" />;
}
