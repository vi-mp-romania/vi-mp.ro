/**
 * Writes every public page of the site as static HTML, plus sitemap.xml and robots.txt. Runs after
 * `vite build` (the browser bundle and dist/index.html, used here as the template) and
 * `vite build --ssr src/prerender.tsx --outDir .prerender` (the render functions); removes
 * .prerender when done. The data comes from Supabase at build time (see src/prerender.tsx). If the
 * database is configured but cannot be read, the script fails, so a broken build never replaces the
 * live site; without a configured database (local builds) the pages use the default texts.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// ---- Constants -------------------------------------------------------------------------------

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SSR_DIRECTORY = path.join(ROOT, '.prerender');
const TITLE = '<title>VI-MP.ro</title>'; // placeholders in index.html, each replaced per page
const META_MARKER = /<!-- page-meta:[^>]*-->/;
const ROOT_ELEMENT = '<div id="root"></div>';

/** The functions src/prerender.tsx exports (the bundle is untyped JavaScript). */
interface RenderModule {
  settings: { siteUrl: string };
  loadSiteBootstrap: () => Promise<unknown>;
  prerenderPages: (bootstrap: unknown) => Page[];
}

/** One prerendered page, as src/prerender.tsx describes it. */
interface Page {
  file: string;
  title: string;
  head: string;
  body: string;
  bootstrapScript: string;
  lastModified?: string;
  meta: { canonicalUrl: string; isIndexable: boolean };
}

// ---- Main ------------------------------------------------------------------------------------

try {
  await prerender();
} finally {
  // The render bundle is a build intermediate; never leave it behind, even on failure.
  await rm(SSR_DIRECTORY, { recursive: true, force: true });
}

// ---- Steps -----------------------------------------------------------------------------------

/** Loads the data, writes every page, then the sitemap and robots.txt. */
async function prerender(): Promise<void> {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  for (const marker of [TITLE, ROOT_ELEMENT]) {
    if (!template.includes(marker)) throw new Error(`dist/index.html lacks ${marker}; was it already prerendered?`);
  }
  if (!META_MARKER.test(template)) throw new Error('dist/index.html lacks the page-meta comment');

  // Load the render functions from the SSR bundle Vite just built.
  const entry = pathToFileURL(path.join(SSR_DIRECTORY, 'prerender.js')).href;
  const render = (await import(entry)) as RenderModule;

  const bootstrap = await render.loadSiteBootstrap();
  if (!bootstrap) console.warn('prerender: no Supabase configured, pages use the default texts');

  const pages = render.prerenderPages(bootstrap);
  for (const page of pages) await writePage(template, page);
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap(pages));
  await writeFile(path.join(DIST, 'robots.txt'), robots(render.settings.siteUrl));
  console.log(`prerender: wrote ${pages.length} pages, sitemap.xml (${pages.filter((page) => page.meta.isIndexable).length} URLs) and robots.txt`);
}

/** Fills the template with one page and writes it under dist/. */
async function writePage(template: string, page: Page): Promise<void> {
  const html = template
    .replace(TITLE, `<title>${page.title}</title>`)
    .replace(META_MARKER, page.head)
    .replace(ROOT_ELEMENT, `<div id="root">${page.body}</div>${page.bootstrapScript}`);
  const target = path.join(DIST, page.file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}

/** sitemap.xml listing every indexable page with its canonical URL. */
function sitemap(pages: Page[]): string {
  const urls = pages
    .filter((page) => page.meta.isIndexable)
    .map((page) => {
      const lastModified = page.lastModified ? `<lastmod>${page.lastModified}</lastmod>` : '';
      return `  <url><loc>${escapeXml(page.meta.canonicalUrl)}</loc>${lastModified}</url>`;
    });
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>', ''].join('\n');
}

/** robots.txt: everything may be crawled except the control panel; points at the sitemap. */
function robots(siteUrl: string): string {
  const base = new URL(`${siteUrl}/`).pathname;
  return `User-agent: *\nAllow: /\nDisallow: ${base}admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

/** Escapes text for an XML element. */
function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
