/** One news item on its own page (/noutati/<slug>/): media, text, source link and other news. */
// Libs
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

// Components
import { NewsCard } from '@/components/NewsCard';
import { NewsMedia } from '@/components/NewsMedia';
import { NewsSourceLine } from '@/components/NewsSourceLine';
import { Skeleton } from '@/components/ui/skeleton';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { routePath } from '@/lib/routes';
import { useNews } from '@/hooks/useNews';
import { useTexts } from '@/hooks/useTexts';
import { newsSlug } from '@/api/types';
import { pageMeta } from '@/lib/pageMeta';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

// Constants
const OTHER_NEWS = 3; // cards under the article

/** Props of ArticlePage. */
interface Props {
  slug: string;
  siteUrl: string; // public address, for the canonical URL
}

/**
 * Finds the item among the published news. While news loads it shows a placeholder; an unknown
 * slug after loading shows a short not-found message (the build marks such URLs noindex).
 * The body is plain text: blank lines separate paragraphs, nothing is interpreted as HTML.
 */
export function ArticlePage({ slug, siteUrl }: Props) {
  const texts = useTexts();
  const analytics = useAnalytics();
  const bootstrap = useBootstrap();
  const news = useNews();
  const item = news.items.find((candidate) => newsSlug(candidate) === slug);
  const others = news.items.filter((candidate) => candidate !== item).slice(0, OTHER_NEWS);
  const sourceHref = item ? safeUrl(item.url) : null;

  // Title and description from the item; nothing until the news has loaded.
  useDocumentMeta(
    news.isPending
      ? null
      : pageMeta({ page: 'article', slug }, { texts, news: news.items, faq: [], discordUrl: bootstrap?.settings.discord_url ?? '' }, siteUrl),
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <a
        href={routePath({ page: 'news' })}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {texts['article.backToNews']}
      </a>

      {news.isPending && (
        <div aria-hidden="true" className="flex max-w-3xl flex-col gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
        </div>
      )}
      {!news.isPending && !item && <p className="text-muted-foreground">{news.error ?? texts['article.notFound']}</p>}

      {item && (
        <article className="flex max-w-3xl flex-col gap-5">
          <NewsSourceLine item={item} hasDate />
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{item.title}</h1>
          <NewsMedia item={item} pictureLink={sourceHref ? { href: sourceHref, isExternal: true } : undefined} isAboveFold />
          {item.summary && <p className="text-lg text-foreground/90">{item.summary}</p>}
          {paragraphs(item.body).map((paragraph, index) => (
            <p key={index} className="text-foreground/85">
              {paragraph}
            </p>
          ))}
          {sourceHref && (
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.track({ name: 'news_link_click', params: { news_title: item.title, link_url: sourceHref } })}
              className="inline-flex w-fit items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              {item.cta_label || 'Deschide sursa'}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          )}
        </article>
      )}

      {item && others.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-border pt-10">
          <h2 className="text-2xl font-extrabold">{texts['article.more']}</h2>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <NewsCard key={other.id} item={other} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Internals

/** Plain-text paragraphs: split on blank lines, single line breaks kept as spaces. */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}
