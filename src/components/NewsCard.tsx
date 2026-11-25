/** One news item as a card: picture or video, source line, title, summary and links. */
// Libs
import { ArrowRight, ArrowUpRight } from 'lucide-react';

// Components
import { NewsMedia } from './NewsMedia';
import { NewsSourceLine } from './NewsSourceLine';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { routePath } from '@/lib/routes';
import { useTexts } from '@/hooks/useTexts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { newsSlug, type NewsItem } from '@/api/types';

/** Props of NewsCard. */
interface Props {
  item: NewsItem;
}

/**
 * A news card. The title and "Citește" lead to the item's own page on this site (good for readers
 * and for search engines); the call-to-action opens the original source in a new tab.
 */
export function NewsCard({ item }: Props) {
  const texts = useTexts();
  const analytics = useAnalytics();
  const href = safeUrl(item.url);
  const pagePath = routePath({ page: 'article', slug: newsSlug(item) });

  return (
    <article className="flex flex-col gap-3">
      <NewsMedia item={item} pictureLink={{ href: pagePath, isExternal: false }} />
      <NewsSourceLine item={item} />
      <h3 className="text-xl font-bold leading-tight">
        <a href={pagePath} className="hover:text-primary">
          {item.title}
        </a>
      </h3>
      {item.summary && <p className="text-sm text-muted-foreground">{item.summary}</p>}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a href={pagePath} className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-primary">
          {texts['news.readMore']}
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.track({ name: 'news_link_click', params: { news_title: item.title, link_url: href } })}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            {item.cta_label || 'Deschide'}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
