/** Tests for resolveTexts. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TEXTS, resolveTexts } from './texts';
import { TEXT_KEYS, TEXT_REGISTRY } from './textRegistry';

test('defaults cover every registry key', () => {
  for (const key of TEXT_KEYS) assert.equal(DEFAULT_TEXTS[key], TEXT_REGISTRY[key].value);
});

test('overrides replace defaults, unknown keys are ignored, an empty override stays empty', () => {
  const texts = resolveTexts([
    { key: 'hero.titleLine1', value: 'Bine ai venit în' },
    { key: 'removed.key', value: 'x' },
    { key: 'status.cardEyebrow', value: '' },
  ]);
  assert.equal(texts['hero.titleLine1'], 'Bine ai venit în');
  assert.equal(texts['status.cardEyebrow'], '');
  assert.equal(texts['hero.titleLine2'], TEXT_REGISTRY['hero.titleLine2'].value);
  assert.ok(!('removed.key' in texts));
});

test('registry keys match the database key constraint', () => {
  for (const key of TEXT_KEYS) assert.match(key, /^[a-z][a-zA-Z0-9.]*$/);
});
