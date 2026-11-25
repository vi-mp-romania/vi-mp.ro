/** Build-time settings: read once from the Vite environment into one frozen object. */
import { z } from 'zod';

/** Settings the application is built with. */
export interface Settings {
  /** Supabase project URL, or null when the build has no back-end configured. */
  readonly supabaseUrl: string | null;
  /** Supabase anon key; public by design, row level security protects the data. */
  readonly supabaseAnonKey: string | null;
}

const environmentSchema = z.object({
  VITE_SUPABASE_URL: z.string().trim().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().trim().optional(),
});

/**
 * Parses the environment into Settings. Missing or malformed Supabase values yield nulls, so the
 * site still renders (with default texts) instead of failing to start.
 */
export function readSettings(environment: Record<string, unknown>): Settings {
  const parsed = environmentSchema.parse(environment);
  const url = parsed.VITE_SUPABASE_URL ?? '';
  const key = parsed.VITE_SUPABASE_ANON_KEY ?? '';
  const isConfigured = /^https?:\/\//i.test(url) && key.length > 0;
  return Object.freeze({
    supabaseUrl: isConfigured ? url : null,
    supabaseAnonKey: isConfigured ? key : null,
  });
}
