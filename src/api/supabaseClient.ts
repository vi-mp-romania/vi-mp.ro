/** Construction of the Supabase client: the only place one is created. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Settings } from '@/lib/settings';

/**
 * Creates the Supabase client for these settings, or null when the build has no project
 * configured. The admin session is persisted by supabase-js in localStorage.
 */
export function createSupabaseClient(settings: Settings): SupabaseClient | null {
  if (!settings.supabaseUrl || !settings.supabaseAnonKey) return null;
  return createClient(settings.supabaseUrl, settings.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
}
