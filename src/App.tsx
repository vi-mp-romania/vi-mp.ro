/** The shell: loads app-wide data, picks the page for the route, renders the frame around it. */
// Libs
import { lazy, Suspense } from 'react';

// Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { NewsPage } from './pages/news/NewsPage';
import { HomePage } from './pages/home/HomePage';
import { ArticlePage } from './pages/article/ArticlePage';
import { NotFoundPage } from './pages/notFound/NotFoundPage';
import { ConsentBanner } from './components/layout/ConsentBanner';

// Hooks
import { useRoute } from './hooks/useRoute';
import { TextsContext } from './hooks/useTexts';
import { useSiteData } from './hooks/useSiteData';
import { useBootstrap } from './hooks/useBootstrap';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useAnalyticsConsent } from './hooks/useAnalyticsConsent';

// Logic
import { pageMeta } from './lib/pageMeta';

// Types
import type { Route } from './lib/routes';

// Constants
/** The control panel is loaded only when someone opens /admin/. */
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((module) => ({ default: module.AdminPage })));

/** Props of App. */
interface Props {
  siteUrl: string; // public address, for canonical URLs
  initialRoute?: Route; // the page to render during the build-time prerender (no window there)
}

/** Root component. */
export function App({ siteUrl, initialRoute }: Props) {
  const route = useRoute(initialRoute);
  const site = useSiteData();
  const bootstrap = useBootstrap();
  useSmoothScroll();
  const consent = useAnalyticsConsent(site.settings?.ga_measurement_id, route);
  const discordUrl = site.settings?.discord_url;

  // Document title and description; an article page sets its own once it knows the item.
  const meta = pageMeta(
    route,
    { texts: site.texts, news: bootstrap?.news ?? [], faq: bootstrap?.faq ?? [], discordUrl: discordUrl ?? '' },
    siteUrl,
  );
  useDocumentMeta(route.page === 'article' ? null : meta);

  return (
    <TextsContext.Provider value={site.texts}>
      <div className="flex min-h-dvh flex-col">
        <Header route={route} discordUrl={discordUrl} isPending={site.isPending} />
        <main className="flex-1">
          {route.page === 'home' && <HomePage site={site} />}
          {route.page === 'news' && <NewsPage />}
          {route.page === 'article' && <ArticlePage slug={route.slug} siteUrl={siteUrl} />}
          {route.page === 'notFound' && <NotFoundPage />}
          {route.page === 'admin' && (
            <Suspense fallback={<p className="py-20 text-center text-muted-foreground">Se încarcă…</p>}>
              <AdminPage site={site} />
            </Suspense>
          )}
        </main>
        <Footer discordUrl={discordUrl} onOpenConsent={consent.isAvailable ? consent.reopen : undefined} />
        {consent.isBannerVisible && route.page !== 'admin' && (
          <ConsentBanner onAccept={consent.accept} onRefuse={consent.refuse} />
        )}
      </div>
    </TextsContext.Provider>
  );
}
