/** Loads the published news for a public page. */
// Libs
import { useEffect, useState } from 'react';

// Logic
import { errorMessage } from '@/lib/errorMessage';
import { useApi } from '@/api/ApiContext';

// Types
import type { NewsItem } from '@/api/types';

/** Published news and its loading state. */
export interface NewsList {
  items: NewsItem[];
  isLoading: boolean;
  error: string | null;
}

/** Fetches published news once; `limit` caps the count (home page), undefined lists all. */
export function useNews(limit?: number): NewsList {
  const api = useApi();

  // State
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lifecycle
  useEffect(() => {
    let isCurrent = true; // ignore a late answer after unmount
    api
      .listNews({ publishedOnly: true, limit })
      .then((loaded) => isCurrent && setItems(loaded))
      .catch((failure: unknown) => isCurrent && setError(errorMessage(failure)))
      .finally(() => isCurrent && setIsLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [api, limit]);

  return { items, isLoading, error };
}
