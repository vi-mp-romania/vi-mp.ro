/** Loads the published FAQ entries for the home page. */
// Libs
import { useEffect, useState } from 'react';

// Logic
import { useApi } from '@/api/ApiContext';
import { useBootstrap } from './useBootstrap';

// Types
import type { FaqItem } from '@/api/types';

/**
 * Shows the bootstrap entries at once, then fetches fresh ones. A failure (for example before the
 * FAQ migration) keeps what is shown: the section simply stays empty and hidden.
 */
export function useFaq(): FaqItem[] {
  const api = useApi();
  const bootstrap = useBootstrap();

  // State
  const [items, setItems] = useState<FaqItem[]>(() => bootstrap?.faq ?? []);

  // Lifecycle
  useEffect(() => {
    let isCurrent = true; // ignore a late answer after unmount
    api
      .listFaq({ publishedOnly: true })
      .then((loaded) => isCurrent && setItems(loaded))
      .catch(() => undefined); // logged by the api layer; the section stays as it was
    return () => {
      isCurrent = false;
    };
  }, [api]);

  return items;
}
