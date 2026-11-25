/** Vite build for the static GitHub Pages site (pages, sitemap and robots.txt: scripts/prerender.ts). */
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    // "/" for a custom domain (vi-mp.ro); "/<repo>/" for a github.io project page.
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), fontPreloadPlugin()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  };
});

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
