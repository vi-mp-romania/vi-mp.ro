/** Email and password sign-in for admins, with "Ai uitat parola?". */
// Libs
import { useState, type FormEvent } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';

/** Props of LoginForm. */
interface Props {
  notice?: string | null; // shown above the form, e.g. why an emailed link did not work
}

/** The sign-in card; the session hook notices a successful sign-in on its own. */
export function LoginForm({ notice }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotten, setIsForgotten] = useState(Boolean(notice)); // a failed link: offer a new one

  // Actions
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void action.run(() => api.signIn(email.trim(), password), 'Autentificat.');
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-2xl font-extrabold">{isForgotten ? 'Resetează parola' : 'Panou de control'}</h1>
      {notice && <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{notice}</p>}
      {isForgotten ? (
        <ForgotPasswordForm onBack={() => setIsForgotten(false)} />
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Email">
            <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Parolă">
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={action.isBusy}>
            {action.isBusy ? 'Se verifică…' : 'Intră'}
          </Button>
          <ActionMessage outcome={action.outcome?.kind === 'error' ? action.outcome : null} />
          <button
            type="button"
            onClick={() => setIsForgotten(true)}
            className="w-fit text-sm text-muted-foreground underline hover:text-foreground"
          >
            Ai uitat parola?
          </button>
        </form>
      )}
    </div>
  );
}
