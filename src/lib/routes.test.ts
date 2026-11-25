/** Tests for routePath, parsePath and legacyHashPath. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { legacyHashPath, parsePath, routePath, type Route } from './routes';

const ROUTES: Route[] = [{ page: 'home' }, { page: 'news' }, { page: 'article', slug: 'gta-vi-trailer-2' }, { page: 'admin' }];

test('every page path parses back to its route, at the root and under a base path', () => {
  for (const base of ['/', '/vi-mp.ro/']) {
    for (const route of ROUTES) assert.deepEqual(parsePath(routePath(route, base), base), route, `${base} ${route.page}`);
  }
});

test('paths end with a slash; the slash-less form still parses', () => {
  assert.equal(routePath({ page: 'news' }, '/'), '/noutati/');
  assert.deepEqual(parsePath('/noutati', '/'), { page: 'news' });
  assert.deepEqual(parsePath('/noutati/abc', '/'), { page: 'article', slug: 'abc' });
});

test('unknown paths, bad slugs and paths outside the base are notFound', () => {
  for (const path of ['/nope/', '/noutati/a/b/', '/noutati/Bad_Slug/', '/admin/x/']) {
    assert.deepEqual(parsePath(path, '/'), { page: 'notFound' }, path);
  }
  assert.deepEqual(parsePath('/other/', '/vi-mp.ro/'), { page: 'notFound' });
  assert.deepEqual(parsePath('/vi-mp.ro', '/vi-mp.ro/'), { page: 'home' });
});

test('old hash links map to the new paths', () => {
  assert.equal(legacyHashPath('#/noutati', '/'), '/noutati/');
  assert.equal(legacyHashPath('#/admin', '/'), '/admin/');
  assert.equal(legacyHashPath('#/', '/'), '/');
  assert.equal(legacyHashPath('#/whatever', '/'), '/');
  assert.equal(legacyHashPath('#status', '/'), null);
});
