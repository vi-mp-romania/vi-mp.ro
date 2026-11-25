/** Tests for buildStageViews. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStageViews } from './statusProgress';

const STAGES = [
  { position: 3, title: 'Multiplayer', caption: '' },
  { position: 1, title: 'Consolă', caption: '' },
  { position: 2, title: 'PC', caption: '' },
];

test('orders by position and marks done stages and the here marker', () => {
  const views = buildStageViews(STAGES, 2);
  assert.deepEqual(views.map((v) => v.title), ['Consolă', 'PC', 'Multiplayer']);
  assert.deepEqual(views.map((v) => v.label), ['01', '02', '03']);
  assert.deepEqual(views.map((v) => v.isDone), [true, true, false]);
  assert.deepEqual(views.map((v) => v.isHereAfter), [false, true, false]);
});

test('no marker when nothing or everything is done, and clamps out-of-range values', () => {
  assert.ok(buildStageViews(STAGES, 0).every((v) => !v.isDone && !v.isHereAfter));
  assert.ok(buildStageViews(STAGES, 9).every((v) => v.isDone && !v.isHereAfter));
  assert.ok(buildStageViews(STAGES, -1).every((v) => !v.isDone));
});
