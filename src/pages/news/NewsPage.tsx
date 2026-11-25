/** Every published news item ("Vezi toate"). */
// Libs
import { ArrowLeft } from 'lucide-react';

// Components
import { NewsCard } from '@/components/NewsCard';

// Logic
import { useNews } from '@/hooks/useNews';
import { useTexts } from '@/hooks/useTexts';
import { ROUTE_HASHES } from '@/lib/routes';

/** A grid of all published news, newest order as set in the control panel. */
export function NewsPage() {
  const texts = useTexts();
  const news = useNews();

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <a href={ROUTE_HASHES.home} className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {texts['news.backHome']}
      </a>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{texts['news.pageTitle']}</h1>
      {news.isLoading && <p className="text-sm text-muted-foreground">Se încarcă…</p>}
      {news.error && <p className="text-sm text-muted-foreground">{news.error}</p>}
      {!news.error && !news.isLoading && news.items.length === 0 && (
        <p className="text-sm text-muted-foreground">{texts['news.empty']}</p>
      )}
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {news.items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
