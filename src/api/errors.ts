/** The one error type the api layer throws, and the mapping from Supabase failures to it. */

/** A failure the visitor or admin can act on; `message` is ready to show (Romanian). */
export class ApiError extends Error {
  override name = 'ApiError';
}

/** Raised by every call when the build has no Supabase project configured. */
export class NotConfiguredError extends ApiError {
  override name = 'NotConfiguredError';
  constructor() {
    super('Site-ul nu este conectat încă la baza de date.');
  }
}

/** A failure shape shared by Postgrest and Auth errors. */
interface SupabaseFailure {
  message?: string;
  code?: string;
  status?: number;
}

/**
 * Converts a Supabase failure into an ApiError with a user-facing message. The original error is
 * kept as `cause` and logged, so the console still shows what went wrong.
 */
export function toApiError(failure: unknown): ApiError {
  if (failure instanceof ApiError) return failure;
  console.error('[api]', failure);
  const { code, status, message } = (typeof failure === 'object' && failure !== null ? failure : {}) as SupabaseFailure;
  if (code === 'invalid_credentials' || message === 'Invalid login credentials') {
    return new ApiError('Email sau parolă greșită.', { cause: failure });
  }
  if (code === '42501' || status === 401 || status === 403) {
    return new ApiError('Nu ai drepturi pentru această acțiune.', { cause: failure });
  }
  if (code === '23505') {
    return new ApiError('Există deja o înregistrare cu aceeași valoare (de ex. același link).', { cause: failure });
  }
  if (code === '23514' || code === '22023' || code === '22P02') {
    return new ApiError('Datele trimise nu sunt valide.', { cause: failure });
  }
  if (failure instanceof TypeError) {
    return new ApiError('Nu ne-am putut conecta la server. Verifică conexiunea.', { cause: failure });
  }
  return new ApiError('A apărut o eroare neașteptată. Încearcă din nou.', { cause: failure });
}
