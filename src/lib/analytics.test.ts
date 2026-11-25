/** Tests for isMeasurementId and the disabled behaviour of createAnalytics. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, isMeasurementId } from './analytics';

test('accepts GA4 measurement ids only', () => {
  assert.ok(isMeasurementId('G-ABC123XYZ9'));
  for (const value of ['', 'UA-12345-1', 'g-abc123', 'G-', 'G-abc123', 'G-ABC123"><script>', ' G-ABC123']) {
    assert.equal(isMeasurementId(value), false, value);
  }
});

test('does nothing (and touches no browser API) until enabled', () => {
  const analytics = createAnalytics();
  assert.equal(analytics.isEnabled, false);
  analytics.pageView('home');
  analytics.track({ name: 'poll_results_open' });
  analytics.enable('not-an-id'); // invalid ids never load anything
  assert.equal(analytics.isEnabled, false);
});
