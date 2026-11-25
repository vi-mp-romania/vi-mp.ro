/** Context carrying the page's bootstrap data (see api/bootstrap.ts) to the data hooks. */
import { createContext, useContext } from 'react';
import type { Bootstrap } from '@/api/bootstrap';

/** The bootstrap data; null in development and when the build had no database. */
export const BootstrapContext = createContext<Bootstrap | null>(null);

/** The page's bootstrap data, or null. */
export function useBootstrap(): Bootstrap | null {
  return useContext(BootstrapContext);
}
