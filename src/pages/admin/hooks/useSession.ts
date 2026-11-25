/** The admin session: who is signed in and whether they are an admin. */
// Libs
import { useEffect, useState } from 'react';

// Logic
import { errorMessage } from '@/lib/errorMessage';
import { useApi } from '@/api/ApiContext';

/** Where the visitor stands with the control panel. */
export type SessionState =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'notAdmin'; email: string }
  | { kind: 'admin'; email: string }
  | { kind: 'error'; message: string };

/**
 * Follows the Supabase session and checks admin rights after each change. The check is only for
 * the interface: the database enforces the same rule on every write.
 */
export function useSession(): SessionState {
  const api = useApi();
  const [state, setState] = useState<SessionState>({ kind: 'loading' });

  // Lifecycle
  useEffect(() => {
    let isCurrent = true; // ignore checks that finish after a newer session change or unmount

    /** Resolves the state for a session (or none). */
    const resolve = (email: string | null) => {
      if (!email) {
        if (isCurrent) setState({ kind: 'signedOut' });
        return;
      }
      api
        .isAdmin()
        .then((isAdmin) => isCurrent && setState(isAdmin ? { kind: 'admin', email } : { kind: 'notAdmin', email }))
        .catch((failure: unknown) => isCurrent && setState({ kind: 'error', message: errorMessage(failure) }));
    };

    api
      .getSession()
      .then((session) => resolve(session?.user.email ?? null))
      .catch((failure: unknown) => isCurrent && setState({ kind: 'error', message: errorMessage(failure) }));
    // Defer the follow-up call: supabase-js must not be awaited inside its own auth callback.
    const unsubscribe = api.onSessionChange((session) => setTimeout(() => resolve(session?.user.email ?? null), 0));

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [api]);

  return state;
}
