/** The current page, and in-app navigation between the site's real URLs. */
// Libs
import { useEffect, useState } from 'react';

// Logic
import { parseAuthLink } from '@/lib/authLink';
import { BASE_PATH, legacyHashPath, parsePath, routePath, type Route } from '@/lib/routes';

/**
 * Returns the route for the current URL and keeps it in step with navigation. A plain left-click on
 * a link to another page of this site is handled here (history.pushState, no reload) and the new
 * page starts at the top; links with a target, a download attribute or a modifier key, other
 * origins, and in-page anchors ("#status" on the same page, scrolled by useSmoothScroll) are left
 * alone. Links from the old hash-routed site ("#/noutati") are rewritten to their path once, and a
 * Supabase email link (password reset, invitation) that landed on another page moves to the control
 * panel with its hash, where it is handled.
 * `initialRoute` is for the build-time prerender, where there is no window (and where the 404
 * page has no path of its own to parse).
 */
export function useRoute(initialRoute?: Route): Route {
  const [route, setRoute] = useState<Route>(() =>
    initialRoute ?? (typeof window === 'undefined' ? { page: 'home' } : parsePath(window.location.pathname)),
  );

  // Lifecycle: legacy hash links, link clicks, back/forward.
  useEffect(() => {
    const legacy = legacyHashPath(window.location.hash);
    const admin = routePath({ page: 'admin' });
    if (legacy) {
      window.history.replaceState(null, '', legacy);
      setRoute(parsePath(legacy));
    } else if (parseAuthLink(window.location.hash) && window.location.pathname !== admin) {
      window.history.replaceState(null, '', admin + window.location.hash);
      setRoute({ page: 'admin' });
    }

    /** Navigates in-app for a plain click on a link to another page of this site. */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || !`${url.pathname}/`.startsWith(BASE_PATH)) return;
      if (url.pathname === window.location.pathname && url.hash) return; // an anchor on this page
      event.preventDefault();
      window.history.pushState(null, '', url.pathname + url.search + url.hash);
      setRoute(parsePath(url.pathname));
      // A new page starts at the top; with an anchor ("/#status") the page scrolls to it itself.
      if (!url.hash) window.scrollTo(0, 0);
    };
    const onPopState = () => setRoute(parsePath(window.location.pathname));

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return route;
}
