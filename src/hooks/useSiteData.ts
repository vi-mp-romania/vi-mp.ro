/** Loads the app-wide data once: settings, timeline stages and text overrides. */
// Libs
import { useCallback, useEffect, useState } from 'react';

// Logic
import { errorMessage } from '@/lib/errorMessage';
import { useApi } from '@/api/ApiContext';
import { DEFAULT_TEXTS, resolveTexts, type Texts } from '@/lib/texts';

// Types
import type { SiteSettings } from '@/api/types';
import type { StatusStage } from '@/lib/statusProgress';

/** App-wide data and its loading state. */
export interface SiteData {
  texts: Texts;
  /** Null while loading or when the database could not be read. */
  settings: SiteSettings | null;
  stages: StatusStage[];
  isLoading: boolean;
  /** User-facing message when loading failed. */
  error: string | null;
  /** Loads everything again (after an admin saves). */
  reload: () => void;
}

/**
 * Fetches settings, stages and texts in parallel. Texts fall back to the registry defaults on
 * failure, so the page always has words to show.
 */
export function useSiteData(): SiteData {
  const api = useApi();

  // State
  const [texts, setTexts] = useState<Texts>(DEFAULT_TEXTS);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [stages, setStages] = useState<StatusStage[]>([]);
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

  return { texts, settings, stages, isLoading, error, reload };
}
