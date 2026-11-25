/** One news item as a card: thumbnail, source line, title, summary and link. */
// Libs
import { ArrowUpRight, CirclePlay, Link as LinkIcon, MessagesSquare } from 'lucide-react';

// Components
import { DiscordIcon } from './DiscordIcon';
import { SkylineIllustration } from './SkylineIllustration';

// Logic
import { safeUrl } from '@/lib/safeUrl';

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

/** A news card; the thumbnail falls back to the skyline and the link hides without a valid URL. */
export function NewsCard({ item }: Props) {
  const href = safeUrl(item.url);
  const imageSrc = safeUrl(item.image_url);

  return (
    <article className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card">
        {imageSrc ? (
          <img src={imageSrc} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <SkylineIllustration hasSun={false} />
        )}
        {item.source === 'youtube' && (
          <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
            <span className="grid size-14 place-items-center rounded-full bg-black/60 text-white">
              <CirclePlay className="size-8" />
            </span>
          </span>
        )}
      </div>

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

/** Small icon for the news source. */
function SourceIcon({ source }: { source: NewsSource }) {
  const className = 'size-4 text-foreground';
  if (source === 'youtube') return <CirclePlay className={className} aria-hidden="true" />;
  if (source === 'reddit') return <MessagesSquare className={className} aria-hidden="true" />;
  if (source === 'discord') return <DiscordIcon className={className} />;
  return <LinkIcon className={className} aria-hidden="true" />;
}
