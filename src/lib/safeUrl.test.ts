/** Tests for safeUrl. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl } from './safeUrl';

test('accepts http and https URLs', () => {
  assert.equal(safeUrl('https://discord.gg/abc'), 'https://discord.gg/abc');
  assert.equal(safeUrl('  http://example.com  '), 'http://example.com/');
});

test('rejects empty, relative and script URLs', () => {
  for (const value of ['', '   ', null, undefined, '/admin', 'javascript:alert(1)', 'data:text/html,x']) {
    assert.equal(safeUrl(value), null, String(value));
  }
});
