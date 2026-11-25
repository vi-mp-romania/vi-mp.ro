/** Context carrying the resolved texts to every component. */
import { createContext, useContext } from 'react';
import { DEFAULT_TEXTS, type Texts } from '@/lib/texts';

/** Resolved texts; defaults until the database answers. Provided by App. */
export const TextsContext = createContext<Texts>(DEFAULT_TEXTS);

/** The current texts, by key. */
export function useTexts(): Texts {
  return useContext(TextsContext);
}
