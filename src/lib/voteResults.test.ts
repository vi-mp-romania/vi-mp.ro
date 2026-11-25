/** Tests for tallyVotes. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tallyVotes } from './voteResults';

test('sums answers per poll and computes the yes share', () => {
  const tally = tallyVotes([
    { poll: 'play', answer: 'yes', total: 3 },
    { poll: 'play', answer: 'no', total: 1 },
    { poll: 'forum', answer: 'no', total: 2 },
  ]);
  assert.deepEqual(tally.play, { yes: 3, no: 1, total: 4, yesPercent: 75 });
  assert.deepEqual(tally.forum, { yes: 0, no: 2, total: 2, yesPercent: 0 });
  assert.deepEqual(tally.develop, { yes: 0, no: 0, total: 0, yesPercent: 0 });
});

test('ignores unknown polls and answers', () => {
  const tally = tallyVotes([
    { poll: 'other', answer: 'yes', total: 5 },
    { poll: 'play', answer: 'maybe', total: 5 },
  ]);
  assert.equal(tally.play.total, 0);
});
