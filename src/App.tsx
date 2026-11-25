/** The shell: loads app-wide data, picks the page for the route, renders the frame around it. */
// Libs
import { lazy, Suspense, useEffect } from 'react';

// Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { NewsPage } from './pages/news/NewsPage';
import { HomePage } from './pages/home/HomePage';

// Hooks
import { useRoute } from './hooks/useRoute';
import { TextsContext } from './hooks/useTexts';
import { useSiteData } from './hooks/useSiteData';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useAnalyticsConsent } from './hooks/useAnalyticsConsent';

// Constants
/** The control panel is loaded only when someone opens #/admin. */
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((module) => ({ default: module.AdminPage })));

/** Root component. */
export function App() {
  const route = useRoute();
  const site = useSiteData();
  useSmoothScroll();
  const consent = useAnalyticsConsent(site.settings?.ga_measurement_id, route);
  const discordUrl = site.settings?.discord_url;

  // Lifecycle: a new page starts at the top (in-page anchors keep their own scrolling).
  useEffect(() => {
    if (window.location.hash.startsWith('#/')) window.scrollTo(0, 0);
  }, [route]);

  return (
    <TextsContext.Provider value={site.texts}>
      <div className="flex min-h-dvh flex-col">
        <Header route={route} discordUrl={discordUrl} isPending={site.isPending} />
        <main className="flex-1">
          {route === 'home' && <HomePage site={site} />}
          {route === 'news' && <NewsPage />}
          {route === 'admin' && (
            <Suspense fallback={<p className="py-20 text-center text-muted-foreground">Se încarcă…</p>}>
              <AdminPage site={site} />
            </Suspense>
          )}
        </main>
        <Footer discordUrl={discordUrl} onOpenConsent={consent.isAvailable ? consent.reopen : undefined} />
        {consent.isBannerVisible && route !== 'admin' && (
          <ConsentBanner onAccept={consent.accept} onRefuse={consent.refuse} />
        )}
      </div>
    </TextsContext.Provider>
  );
}
