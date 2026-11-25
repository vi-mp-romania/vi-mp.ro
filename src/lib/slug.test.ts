/** Tests for slugify and isSlug. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSlug, slugify } from './slug';

test('makes readable ASCII slugs from Romanian titles', () => {
  assert.equal(slugify('GTA VI — Trailer 2 oficial'), 'gta-vi-trailer-2-oficial');
  assert.equal(slugify('Versiunea de PC, raportată pentru T1 2027'), 'versiunea-de-pc-raportata-pentru-t1-2027');
  assert.equal(slugify('Știri: ăâîșț ŞŢ (vechi)'), 'stiri-aaist-st-vechi');
  assert.equal(slugify('  ---  '), '');
});

test('cuts long titles at a word boundary within the limit', () => {
  const slug = slugify('cuvant '.repeat(30));
  assert.ok(slug.length <= 80 && isSlug(slug) && !slug.endsWith('-'));
});

test('isSlug accepts only the slug shape', () => {
  assert.ok(isSlug('gta-6-pc'));
  for (const value of ['', 'GTA', 'a--b', '-a', 'a-', 'a_b', 'ă']) assert.equal(isSlug(value), false, value);
});
