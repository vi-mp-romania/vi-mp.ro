/**
 * Build-time entry (never shipped to the browser). It loads the live data from Supabase and renders
 * every public page to HTML with it, so search engines and link previews read real content, titles
 * and descriptions without running JavaScript. scripts/prerender.ts calls these functions and writes
 * the files; in the browser main.tsx then takes over with the same data.
 */
// Libs
import { renderToString } from 'react-dom/server';

// Logic
import { App } from './App';
import { createApi } from './api/endpoints';
import { ApiProvider } from './api/ApiContext';
import { readSettings } from './lib/settings';
import { resolveTexts } from './lib/texts';
import { BootstrapContext } from './hooks/useBootstrap';
import { createSupabaseClient } from './api/supabaseClient';
import { bootstrapElement, loadBootstrap, type Bootstrap } from './api/bootstrap';
import { headTags, pageMeta, escapeAttribute, type PageMeta } from './lib/pageMeta';
import type { Route } from './lib/routes';
import { DEFAULT_TEXTS } from './lib/texts';
import { newsSlug } from './api/types';

/** Settings baked into this bundle at build time (the same VITE_ variables as the site). */
export const settings = readSettings(import.meta.env);

/** One file the build writes. */
export interface PrerenderedPage {
  route: Route;
  /** Path relative to dist/ ("index.html", "noutati/index.html", "404.html"). */
  file: string;
  meta: PageMeta;
  /** Rendered markup for inside #root. */
  body: string;
  /** Extra tags for <head> (description, canonical, previews, structured data), title excluded. */
  head: string;
  /** The <script> element with the bootstrap data, or "" without data. */
  bootstrapScript: string;
  /** Escaped <title> text. */
  title: string;
  /** Last change date for the sitemap (ISO date), when known. */
  lastModified?: string;
}

/**
 * Loads the bootstrap data, or null when the build has no database configured. A failing database
 * throws: publishing a site built without its content would silently replace the live one.
 */
export async function loadSiteBootstrap(): Promise<Bootstrap | null> {
  const client = createSupabaseClient(settings);
  return client ? loadBootstrap(createApi(client)) : null;
}

/** Every page to write: home, news list, one page per published news item, control panel, 404. */
export function prerenderPages(bootstrap: Bootstrap | null): PrerenderedPage[] {
  const news = bootstrap?.news ?? [];
  const pages: { route: Route; file: string; lastModified?: string }[] = [
    { route: { page: 'home' }, file: 'index.html' },
    { route: { page: 'news' }, file: 'noutati/index.html', lastModified: news[0]?.created_at },
    ...news.map((item) => ({
      route: { page: 'article' as const, slug: newsSlug(item) },
      file: `noutati/${newsSlug(item)}/index.html`,
      lastModified: item.created_at,
    })),
    { route: { page: 'admin' }, file: 'admin/index.html' },
    { route: { page: 'notFound' }, file: '404.html' },
  ];
  const data = {
    texts: bootstrap ? resolveTexts(bootstrap.overrides) : DEFAULT_TEXTS,
    news,
    faq: bootstrap?.faq ?? [],
    discordUrl: bootstrap?.settings.discord_url ?? '',
  };
  return pages.map(({ route, file, lastModified }) => {
    const meta = pageMeta(route, data, settings.siteUrl);
    return {
      route,
      file,
      meta,
      lastModified: lastModified?.slice(0, 10),
      title: escapeAttribute(meta.title),
      head: headTags(meta),
      bootstrapScript: bootstrap ? bootstrapElement(bootstrap) : '',
      body: renderPage(route, bootstrap),
    };
  });
}

// Internals

/** HTML of one page drawn from the bootstrap data (effects do not run on the server). */
function renderPage(route: Route, bootstrap: Bootstrap | null): string {
  // No database client: nothing is fetched while rendering; the hooks read the bootstrap data.
  return renderToString(
    <ApiProvider api={createApi(null)}>
      <BootstrapContext.Provider value={bootstrap}>
        <App siteUrl={settings.siteUrl} initialRoute={route} />
      </BootstrapContext.Provider>
    </ApiProvider>,
  );
}
