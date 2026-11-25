/**
 * Reads what a Supabase Auth email link (password reset, admin invitation) leaves in the page's
 * address after Supabase has checked it: either a session to set a password with, or an error
 * (typically an expired or already used link). Supabase sends these in the hash fragment.
 */

/** What an auth email link carried. */
export type AuthLink =
  | { kind: 'setPassword'; accessToken: string; refreshToken: string }
  | { kind: 'error'; message: string };

// Constants
/** Link types that end with the person choosing a password. */
const PASSWORD_LINK_TYPES = new Set(['recovery', 'invite']);

/** The auth link in a location hash, or null when the hash is something else (or empty). */
export function parseAuthLink(hash: string): AuthLink | null {
  if (!hash.startsWith('#') || hash.startsWith('#/')) return null;
  const params = new URLSearchParams(hash.slice(1));
  if (params.has('error') || params.has('error_code')) {
    const isExpired = params.get('error_code') === 'otp_expired';
    return {
      kind: 'error',
      message: isExpired
        ? 'Linkul a expirat sau a fost deja folosit. Cere unul nou.'
        : (params.get('error_description') ?? 'Linkul nu este valid. Cere unul nou.'),
    };
  }
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken && PASSWORD_LINK_TYPES.has(params.get('type') ?? '')) {
    return { kind: 'setPassword', accessToken, refreshToken };
  }
  return null;
}

/** Why a new password cannot be used, or null when it is fine. */
export function newPasswordProblem(password: string, confirmation: string): string | null {
  if (password.length < 8) return 'Parola trebuie să aibă cel puțin 8 caractere.';
  if (password !== confirmation) return 'Parolele nu coincid.';
  return null;
}
