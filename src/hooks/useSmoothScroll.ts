/** Smooth, eased page scrolling (Lenis) for the whole site, plus smooth jumps to section links. */
// Libs
import Lenis from 'lenis';
import { useEffect } from 'react';

/**
 * Owns one Lenis instance for the app's lifetime (created on mount, destroyed on unmount). Lenis
 * turns itself off for visitors who ask for reduced motion. Its built-in anchor handling is not
 * used, because it would treat hash routes such as "#/noutati" as element selectors; instead a click
 * on a link to a section on this page ("#status") is scrolled here, and every other link is left to
 * the browser. Scrolling inside an open <dialog> stays native.
 */
export function useSmoothScroll(): void {
  // Lifecycle
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, prevent: (node) => node.tagName === 'DIALOG' });

    /** Scrolls smoothly to the section a plain left-click on an in-page link points at. */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const id = link.hash.slice(1);
      if (!id || id.startsWith('/')) return; // a hash route: navigation, not scrolling
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      // Keep the address shareable (#status); pushState does not fire hashchange, so the route stays.
      history.pushState(null, '', `#${id}`);
      lenis.scrollTo(target); // Lenis honours the section's scroll-margin-top (room for the sticky header)
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);
}
