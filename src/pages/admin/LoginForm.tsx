/** Email and password sign-in for admins. */
// Libs
import { useState, type FormEvent } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionMessage } from './components/ActionMessage';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from './hooks/useAction';

/** The sign-in card; the session hook notices a successful sign-in on its own. */
export function LoginForm() {
  const api = useApi();
  const action = useAction();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Actions
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void action.run(() => api.signIn(email.trim(), password), 'Autentificat.');
  };

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-2xl font-extrabold">Panou de control</h1>
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
    </form>
  );
}
