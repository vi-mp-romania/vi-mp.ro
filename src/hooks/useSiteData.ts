/** Loads the app-wide data: settings, timeline stages and text overrides. */
// Libs
import { useCallback, useEffect, useState } from 'react';

// Logic
import { useApi } from '@/api/ApiContext';
import { errorMessage } from '@/lib/errorMessage';
import { DEFAULT_TEXTS, resolveTexts, type Texts } from '@/lib/texts';
import { readCachedSite, writeCachedSite } from '@/api/siteDataCache';

// Types
import type { SiteSettings } from '@/api/types';
import type { StatusStage } from '@/lib/statusProgress';

/** App-wide data and its loading state. */
export interface SiteData {
  texts: Texts;
  /** Null until the first load (or the cache) provides it, and when the database cannot be read. */
  settings: SiteSettings | null;
  stages: StatusStage[];
  /** True while a request is in flight; data may already be present from the cache. */
  isLoading: boolean;
  /** True while nothing is known yet: show placeholders that hold the layout. */
  isPending: boolean;
  /** User-facing message when loading failed. */
  error: string | null;
  /** Loads everything again (after an admin saves). */
  reload: () => void;
}

/**
 * Starts from the cached data of the last visit (if any), then fetches settings, stages and texts
 * in parallel and replaces it. Texts fall back to the registry defaults when there is neither, so
 * the page always has words to show.
 */
export function useSiteData(): SiteData {
  const api = useApi();

  // State: the cache is read once, for the first render.
  const [cached] = useState(readCachedSite);
  const [texts, setTexts] = useState<Texts>(() => (cached ? resolveTexts(cached.overrides) : DEFAULT_TEXTS));
  const [settings, setSettings] = useState<SiteSettings | null>(cached?.settings ?? null);
  const [stages, setStages] = useState<StatusStage[]>(cached?.stages ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0); // bumping it triggers a reload

  // Lifecycle
  useEffect(() => {
    let isCurrent = true; // ignore answers that arrive after a newer load started
    setIsLoading(true);
    Promise.all([api.getSettings(), api.listStages(), api.listTextOverrides()])
      .then(([loadedSettings, loadedStages, overrides]) => {
        if (!isCurrent) return;
        setSettings(loadedSettings);
        setStages(loadedStages);
        setTexts(resolveTexts(overrides));
        setError(null);
        // Remember it for the next visit's first paint.
        writeCachedSite({ settings: loadedSettings, stages: loadedStages, overrides });
      })
      .catch((failure: unknown) => {
        if (isCurrent) setError(errorMessage(failure));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [api, generation]);

  // Actions
  const reload = useCallback(() => setGeneration((value) => value + 1), []);

  const isPending = isLoading && settings === null;
  return { texts, settings, stages, isLoading, isPending, error, reload };
}
