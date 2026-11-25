/** Shown for any URL the site does not have (served as GitHub Pages' 404.html). */
// Components
import { buttonVariants } from '@/components/ui/button';

// Logic
import { routePath } from '@/lib/routes';
import { useTexts } from '@/hooks/useTexts';

/** A short message with links to the home page and the news. */
export function NotFoundPage() {
  const texts = useTexts();
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-4xl font-extrabold tracking-tight">{texts['notFound.title']}</h1>
      <p className="text-muted-foreground">{texts['notFound.message']}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={routePath({ page: 'home' })} className={buttonVariants('primary')}>
          {texts['notFound.home']}
        </a>
        <a href={routePath({ page: 'news' })} className={buttonVariants('outline')}>
          {texts['header.navNews']}
        </a>
      </div>
    </section>
  );
}
