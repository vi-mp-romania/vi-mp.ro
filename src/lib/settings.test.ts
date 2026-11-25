/** Tests for readSettings. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSettings } from './settings';

test('reads a configured Supabase project', () => {
  const settings = readSettings({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'k' });
  assert.deepEqual(settings, { supabaseUrl: 'https://x.supabase.co', supabaseAnonKey: 'k' });
  assert.ok(Object.isFrozen(settings));
});

test('treats a partial or invalid configuration as not configured', () => {
  assert.equal(readSettings({ VITE_SUPABASE_URL: 'https://x.supabase.co' }).supabaseUrl, null);
  assert.equal(readSettings({ VITE_SUPABASE_URL: 'x', VITE_SUPABASE_ANON_KEY: 'k' }).supabaseUrl, null);
  assert.equal(readSettings({}).supabaseAnonKey, null);
});
