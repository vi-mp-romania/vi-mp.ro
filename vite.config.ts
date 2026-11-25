/** Vite build for the static GitHub Pages site, plus the files search engines read. */
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Constants
const DEFAULT_SITE_URL = 'https://vi-mp.ro'; // public address when VITE_SITE_URL is not set

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
  return {
    // "/" for a custom domain (vi-mp.ro); "/<repo>/" for a github.io project page.
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), searchEnginePlugin(siteUrl), fontPreloadPlugin()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  };
});

/**
 * Puts the public site address into index.html (%SITE_URL%: canonical, link previews, structured
 * data) and emits robots.txt and sitemap.xml next to it. Only "/" is listed: hash routes (#/noutati)
 * are not separate pages to search engines, and the control panel should not be indexed anyway.
 */
function searchEnginePlugin(siteUrl: string): Plugin {
  return {
    name: 'vimp-search-engines',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url><loc>${siteUrl}/</loc><changefreq>weekly</changefreq></url>\n` +
          '</urlset>\n',
      });
    },
  };
}

/**
 * Adds <link rel="preload"> for the Latin subset of the main font, so it is fetched together with
 * the stylesheet instead of after it. That lets text paint in Outfit straight away rather than in a
 * fallback font that is then swapped (a small layout shift). Build only: the dev server has no hashed
 * asset names.
 */
function fontPreloadPlugin(): Plugin {
  let base = '/'; // public base path, known once the config is resolved
  return {
    name: 'vimp-font-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml(_html, context) {
      const font = Object.keys(context.bundle ?? {}).find((name) => /outfit-latin-wght-normal.*\.woff2$/.test(name));
      if (!font) return [];
      return [
        {
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `${base}${font}` },
          injectTo: 'head',
        },
      ];
    },
  };
}
