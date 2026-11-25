/** Entry: reads settings and the page's bootstrap data once, builds the api, mounts React. */
// Libs
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Styles (order matters: fonts before the stylesheet that uses them)
import '@fontsource-variable/outfit';
import '@fontsource/jetbrains-mono/500.css';
import 'lenis/dist/lenis.css';
import './style.css';

// Logic
import { App } from './App';
import { ApiProvider } from './api/ApiContext';
import { createApi } from './api/endpoints';
import { readSettings } from './lib/settings';
import { readBootstrap } from './api/bootstrap';
import { createAnalytics } from './lib/analytics';
import { AnalyticsContext } from './hooks/useAnalytics';
import { BootstrapContext } from './hooks/useBootstrap';
import { createSupabaseClient } from './api/supabaseClient';

const settings = readSettings(import.meta.env);
const api = createApi(createSupabaseClient(settings));
const analytics = createAnalytics(); // disabled until the visitor accepts analytics cookies
const bootstrap = readBootstrap(); // the data this page was prerendered with, if any

// createRoot (not hydration) replaces the prerendered markup; drawn from the same bootstrap data,
// the first render looks identical, so nothing visibly changes.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiProvider api={api}>
      <AnalyticsContext.Provider value={analytics}>
        <BootstrapContext.Provider value={bootstrap}>
          <App siteUrl={settings.siteUrl} />
        </BootstrapContext.Provider>
      </AnalyticsContext.Provider>
    </ApiProvider>
  </StrictMode>,
);
