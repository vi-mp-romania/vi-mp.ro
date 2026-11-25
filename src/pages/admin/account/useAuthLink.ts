/** Handles a Supabase email link (password reset, admin invitation) that opened the control panel. */
// Libs
import { useCallback, useEffect, useState } from 'react';

// Logic
import { useApi } from '@/api/ApiContext';
import { parseAuthLink } from '@/lib/authLink';

/** Where the link handling stands. */
export type AuthLinkState =
  | { kind: 'none' } // no link: the normal sign-in / panel flow
  | { kind: 'verifying' } // signing in with the link's session
  | { kind: 'setPassword' } // signed in by the link: a new password must be chosen
  | { kind: 'error'; message: string }; // expired, used or otherwise invalid link

/**
 * Reads the link from the address once, removes it from the address bar and history straight away
 * (it carries a session), signs in with it, and asks for a new password before anything else.
 * `finish` ends the password step.
 */
export function useAuthLink(): { state: AuthLinkState; finish: () => void } {
  const api = useApi();
  const [state, setState] = useState<AuthLinkState>({ kind: 'none' });

  // Lifecycle: once, on opening the panel.
  useEffect(() => {
    const link = parseAuthLink(window.location.hash);
    if (!link) return;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    if (link.kind === 'error') {
      setState(link);
      return;
    }
    setState({ kind: 'verifying' });
    api
      .setSessionFromLink(link.accessToken, link.refreshToken)
      .then(() => setState({ kind: 'setPassword' }))
      // Whatever went wrong (bad or expired session, network), this link cannot be used: say so.
      .catch(() => setState({ kind: 'error', message: 'Linkul nu mai este valid sau nu a putut fi verificat. Cere unul nou.' }));
  }, [api]);

  // Actions
  const finish = useCallback(() => setState({ kind: 'none' }), []);

  return { state, finish };
}
