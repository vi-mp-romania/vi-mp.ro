/**
 * Writes the prerendered home page into dist/index.html. Runs after `vite build` (the browser
 * bundle) and `vite build --ssr src/prerender.tsx --outDir .prerender` (the render function);
 * removes .prerender when done. See src/prerender.tsx for what is rendered and why.
 */
import { rm, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// ---- Constants -------------------------------------------------------------------------------

const ROOT = path.resolve(import.meta.dirname, '..');
const INDEX_HTML = path.join(ROOT, 'dist', 'index.html');
const SSR_DIRECTORY = path.join(ROOT, '.prerender');
const ROOT_ELEMENT = '<div id="root"></div>'; // the empty mount point in index.html

// ---- Main ------------------------------------------------------------------------------------

try {
  await prerender();
} finally {
  // The render bundle is a build intermediate; never leave it behind, even on failure.
  await rm(SSR_DIRECTORY, { recursive: true, force: true });
}

// ---- Steps -----------------------------------------------------------------------------------

/** Renders the home page and places it inside the mount point of the built index.html. */
async function prerender(): Promise<void> {
  const html = await readFile(INDEX_HTML, 'utf8');
  if (!html.includes(ROOT_ELEMENT)) {
    throw new Error(`${INDEX_HTML} has no empty ${ROOT_ELEMENT}; was it already prerendered?`);
  }
  // Load the render function from the SSR bundle Vite just built.
  const entry = path.join(SSR_DIRECTORY, 'prerender.js');
  const { renderHomePage } = (await import(pathToFileURL(entry).href)) as { renderHomePage: () => string };

  const body = renderHomePage();
  await writeFile(INDEX_HTML, html.replace(ROOT_ELEMENT, `<div id="root">${body}</div>`));
  console.log(`prerender: wrote ${(body.length / 1024).toFixed(1)} KiB of home page HTML into dist/index.html`);
}
