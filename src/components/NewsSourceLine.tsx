/** The small "YOUTUBE · VIDEO" line above a news title, with an optional date. */
// Libs
import { CirclePlay, Link as LinkIcon, MessagesSquare } from 'lucide-react';

// Components
import { DiscordIcon } from './DiscordIcon';

// Types
import type { NewsItem, NewsSource } from '@/api/types';

// Constants
const SOURCE_NAMES: Readonly<Record<NewsSource, string>> = {
  youtube: 'YouTube',
  reddit: 'Reddit',
  discord: 'Discord',
  link: 'Link',
};

/** Props of NewsSourceLine. */
interface Props {
  item: NewsItem;
  hasDate?: boolean; // also show when it was published (article page)
}

/** Source icon and name, the kind label, and optionally the publication date in Romanian. */
export function NewsSourceLine({ item, hasDate = false }: Props) {
  return (
    <p className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
      <SourceIcon source={item.source} />
      {SOURCE_NAMES[item.source]}
      {item.kind_label && <span>· {item.kind_label}</span>}
      {hasDate && (
        <time dateTime={item.created_at}>
          · {new Date(item.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
        </time>
      )}
    </p>
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
