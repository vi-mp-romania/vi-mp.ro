/** Tests for fitWithin. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitWithin } from './resizeImage';

test('scales wide images down to the maximum width, keeping the ratio', () => {
  assert.deepEqual(fitWithin(3072, 1728, 1920), { width: 1920, height: 1080 });
  assert.deepEqual(fitWithin(4000, 3000, 1280), { width: 1280, height: 960 });
});

test('never upscales and always returns whole positive pixels', () => {
  assert.deepEqual(fitWithin(800, 450, 1920), { width: 800, height: 450 });
  assert.deepEqual(fitWithin(5000, 1, 1000), { width: 1000, height: 1 });
});
