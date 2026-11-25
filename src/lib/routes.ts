/**
 * The public URLs of the site and how they map to pages. Every page path ends with a slash: GitHub
 * Pages serves each prerendered page as <path>/index.html and redirects the slash-less form, so
 * links and canonical URLs use the slash form to avoid that redirect. Renaming source folders never
 * changes these URLs.
 */

// Constants
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // also matches the uuid fallback used before slugs existed

/** A page of the site. */
export type Route =
  | { page: 'home' }
  | { page: 'news' }
  | { page: 'article'; slug: string }
  | { page: 'admin' }
  | { page: 'notFound' };

/** The base path the site is served from ("/" or "/<repo>/"), from Vite; "/" outside Vite. */
export const BASE_PATH: string = import.meta.env?.BASE_URL ?? '/';

/** Path of a page (with the base path and a trailing slash). notFound has no path of its own. */
export function routePath(route: Route, base: string = BASE_PATH): string {
  const root = base.endsWith('/') ? base : `${base}/`;
  switch (route.page) {
    case 'home':
    case 'notFound':
      return root;
    case 'news':
      return `${root}noutati/`;
    case 'article':
      return `${root}noutati/${route.slug}/`;
    case 'admin':
      return `${root}admin/`;
  }
}

/** The page for a pathname; anything unknown, or outside the base path, is notFound. */
export function parsePath(pathname: string, base: string = BASE_PATH): Route {
  const root = base.endsWith('/') ? base : `${base}/`;
  if (!`${pathname}/`.startsWith(root)) return { page: 'notFound' };
  const parts = pathname.slice(root.length).split('/').filter(Boolean);
  if (parts.length === 0) return { page: 'home' };
  if (parts[0] === 'noutati' && parts.length === 1) return { page: 'news' };
  if (parts[0] === 'noutati' && parts.length === 2 && SLUG.test(parts[1]!)) return { page: 'article', slug: parts[1]! };
  if (parts[0] === 'admin' && parts.length === 1) return { page: 'admin' };
  return { page: 'notFound' };
}

/** The path that replaces a link from the old hash-routed site ("#/noutati"), or null. */
export function legacyHashPath(hash: string, base: string = BASE_PATH): string | null {
  if (!hash.startsWith('#/')) return null;
  const route = parsePath(`/${hash.slice(2)}`, '/');
  return route.page === 'notFound' ? routePath({ page: 'home' }, base) : routePath(route, base);
}
