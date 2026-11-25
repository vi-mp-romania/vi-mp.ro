/**
 * Build-time entry (never shipped to the browser): renders the home page to HTML with the default
 * texts, so crawlers that do not run JavaScript still read the content. scripts/prerender.ts writes
 * the result into dist/index.html; in the browser main.tsx then replaces it with the live page.
 */
// Libs
import { renderToString } from 'react-dom/server';

// Logic
import { App } from './App';
import { createApi } from './api/endpoints';
import { ApiProvider } from './api/ApiContext';

/** HTML of the home page as a visitor first sees it, before any data loads. */
export function renderHomePage(): string {
  // No client: nothing is fetched while rendering, and effects do not run on the server.
  return renderToString(
    <ApiProvider api={createApi(null)}>
      <App />
    </ApiProvider>,
  );
}
