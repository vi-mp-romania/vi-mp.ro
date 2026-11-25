/** Loads the published news for a public page. */
// Libs
import { useEffect, useState } from 'react';

// Logic
import { useApi } from '@/api/ApiContext';
import { errorMessage } from '@/lib/errorMessage';
import { readCachedNews, writeCachedNews } from '@/api/siteDataCache';

// Types
import type { NewsItem } from '@/api/types';

/** Published news and its loading state. */
export interface NewsList {
  items: NewsItem[];
  /** True while nothing is known yet: show placeholders that hold the layout. */
  isPending: boolean;
  error: string | null;
}

/**
 * Shows the news cached from the last visit at once, then fetches published news and replaces it.
 * `limit` caps the count (home page); undefined lists all.
 */
export function useNews(limit?: number): NewsList {
  const api = useApi();

  // State
  const [items, setItems] = useState<NewsItem[] | null>(() => readCachedNews(limit));
  const [error, setError] = useState<string | null>(null);

  // Lifecycle
  useEffect(() => {
    let isCurrent = true; // ignore a late answer after unmount
    api
      .listNews({ publishedOnly: true, limit })
      .then((loaded) => {
        if (!isCurrent) return;
        setItems(loaded);
        writeCachedNews(limit, loaded);
      })
      .catch((failure: unknown) => isCurrent && setError(errorMessage(failure)));
    return () => {
      isCurrent = false;
    };
  }, [api, limit]);

  return { items: items ?? [], isPending: items === null && error === null, error };
}
