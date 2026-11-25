/** "Noutăți de urmărit": the latest published news. */
// Libs
import { ArrowUpRight, Images } from 'lucide-react';

// Components
import { NewsCard } from '@/components/NewsCard';
import { NewsCardSkeleton } from '@/components/NewsCardSkeleton';

// Logic
import { useTexts } from '@/hooks/useTexts';
import { ROUTE_HASHES } from '@/lib/routes';

// Types
import type { NewsList } from '@/hooks/useNews';

/** Props of NewsSection. */
interface Props {
  news: NewsList;
  placeholderCount: number; // cards drawn while loading (the number the page asked for)
}

/** Section header with the "see all" link, then a two-column grid of cards. */
export function NewsSection({ news, placeholderCount }: Props) {
  const texts = useTexts();

  return (
    <section id="noutati" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <Images className="size-9 text-primary" aria-hidden="true" />
            {texts['news.title']}
          </h2>
          <p className="text-muted-foreground sm:text-lg">{texts['news.subtitle']}</p>
        </div>
        <a href={ROUTE_HASHES.news} className="inline-flex shrink-0 items-center gap-1.5 pt-2 font-semibold text-primary hover:underline">
          {texts['news.seeAll']}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      {news.error && <p className="text-sm text-muted-foreground">{news.error}</p>}
      {!news.error && !news.isPending && news.items.length === 0 && (
        <p className="text-sm text-muted-foreground">{texts['news.empty']}</p>
      )}
      <div className="grid gap-8 md:grid-cols-2">
        {news.isPending && Array.from({ length: placeholderCount }, (_, index) => <NewsCardSkeleton key={index} />)}
        {news.items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
