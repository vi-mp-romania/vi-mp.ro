/** Tests for parseRoute. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, ROUTE_HASHES } from './routes';

test('every route hash parses back to its route', () => {
  for (const [route, hash] of Object.entries(ROUTE_HASHES)) assert.equal(parseRoute(hash), route);
});

test('anchors, trailing slashes and unknown hashes', () => {
  assert.equal(parseRoute('#/admin/'), 'admin');
  assert.equal(parseRoute('#status'), 'home');
  assert.equal(parseRoute(''), 'home');
  assert.equal(parseRoute('#/nope'), 'home');
});
