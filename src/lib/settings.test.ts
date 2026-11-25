/** Tests for readSettings. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSettings } from './settings';

test('reads a configured Supabase project and site address', () => {
  const settings = readSettings({
    VITE_SUPABASE_URL: 'https://x.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'k',
    VITE_SITE_URL: 'https://example.github.io/repo/',
  });
  assert.deepEqual(settings, {
    supabaseUrl: 'https://x.supabase.co',
    supabaseAnonKey: 'k',
    siteUrl: 'https://example.github.io/repo',
  });
  assert.ok(Object.isFrozen(settings));
});

test('treats a partial or invalid configuration as not configured', () => {
  assert.equal(readSettings({ VITE_SUPABASE_URL: 'https://x.supabase.co' }).supabaseUrl, null);
  assert.equal(readSettings({ VITE_SUPABASE_URL: 'x', VITE_SUPABASE_ANON_KEY: 'k' }).supabaseUrl, null);
  assert.equal(readSettings({}).supabaseAnonKey, null);
});

test('falls back to https://vi-mp.ro for a missing or invalid site address', () => {
  assert.equal(readSettings({}).siteUrl, 'https://vi-mp.ro');
  assert.equal(readSettings({ VITE_SITE_URL: 'vi-mp.ro' }).siteUrl, 'https://vi-mp.ro');
});
