/** "Ai uitat parola?": sends a password reset email that returns to the control panel. */
// Libs
import { useState, type FormEvent } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { routePath } from '@/lib/routes';
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';

/** Props of ForgotPasswordForm. */
interface Props {
  onBack: () => void; // back to the sign-in form
}

/**
 * The link returns to this site's control panel (on whichever host this runs: vi-mp.ro, or
 * localhost while developing; each must be listed under the Supabase project's Redirect URLs). The
 * same message is shown whether or not the address has an account.
 */
export function ForgotPasswordForm({ onBack }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [email, setEmail] = useState('');

  // Actions
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const redirectTo = window.location.origin + routePath({ page: 'admin' });
    void action.run(
      () => api.requestPasswordReset(email.trim(), redirectTo),
      'Dacă adresa are cont, ai primit un email cu linkul de resetare.',
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Email" hint="Îți trimitem un link pentru o parolă nouă.">
        <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Button type="submit" disabled={action.isBusy}>
        {action.isBusy ? 'Se trimite…' : 'Trimite linkul'}
      </Button>
      <ActionMessage outcome={action.outcome} />
      <button type="button" onClick={onBack} className="w-fit text-sm text-muted-foreground underline hover:text-foreground">
        Înapoi la autentificare
      </button>
    </form>
  );
}
