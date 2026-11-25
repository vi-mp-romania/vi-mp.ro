/** Tests for pickActiveSection. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickActiveSection } from './activeSection';

const at = (status: number, news: number, community: number) => [
  { id: 'status', top: status },
  { id: 'noutati', top: news },
  { id: 'comunitate', top: community },
];

test('the first section is active above it (hero in view)', () => {
  assert.equal(pickActiveSection(at(600, 1400, 3000), 300, false), 'status');
});

test('the last section whose top passed the threshold is active', () => {
  assert.equal(pickActiveSection(at(-900, 200, 1800), 300, false), 'noutati');
  assert.equal(pickActiveSection(at(-900, -100, 900), 300, false), 'noutati');
});

test('the last section wins at the bottom of the page', () => {
  assert.equal(pickActiveSection(at(-3000, -2000, 500), 300, true), 'comunitate');
});

test('no sections, no active one', () => {
  assert.equal(pickActiveSection([], 300, false), null);
});
