/** The current hash route, kept in sync with the address bar. */
import { useEffect, useState } from 'react';
import { parseRoute, type Route } from '@/lib/routes';

/**
 * Returns the route for the current hash and re-renders when it changes. Without a window (the
 * build-time prerender) the route is home.
 */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? 'home' : parseRoute(window.location.hash),
  );

  // Lifecycle: follow hash changes (links, back/forward).
  useEffect(() => {
    const update = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return route;
}
