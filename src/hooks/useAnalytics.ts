/** Context carrying the one Analytics instance (built in main.tsx) to the components. */
import { createContext, useContext } from 'react';
import { createAnalytics, type Analytics } from '@/lib/analytics';

/** The app's analytics; the default is a disabled instance (prerender, tests). */
export const AnalyticsContext = createContext<Analytics>(createAnalytics());

/** The analytics of the nearest provider; calls are no-ops until the visitor consents. */
export function useAnalytics(): Analytics {
  return useContext(AnalyticsContext);
}
