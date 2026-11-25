/** Entry: reads settings once, builds the api, mounts React. */
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
import { createSupabaseClient } from './api/supabaseClient';

const settings = readSettings(import.meta.env);
const api = createApi(createSupabaseClient(settings));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiProvider api={api}>
      <App />
    </ApiProvider>
  </StrictMode>,
);
