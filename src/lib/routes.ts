/** Hash routes: the public URLs of the site. Renaming source folders never changes them. */

/** A page the site can show. */
export type Route = 'home' | 'news' | 'admin';

/** Hash for each route. */
export const ROUTE_HASHES: Readonly<Record<Route, string>> = {
  home: '#/',
  news: '#/noutati',
  admin: '#/admin',
};

/**
 * Maps a location hash to a route. In-page anchors on the home page ("#status", "#noutati-home")
 * and unknown hashes resolve to home.
 */
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '');
  if (path === '/noutati') return 'news';
  if (path === '/admin') return 'admin';
  return 'home';
}
