/** New password form, for a reset or invitation link and for "Schimbă parola" in the panel. */
// Libs
import { useState, type FormEvent } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';
import { newPasswordProblem } from '@/lib/authLink';

/** Props of SetPasswordForm. */
interface Props {
  onDone: () => void; // called once the new password is saved
}

/** Password and confirmation, checked here (8+ characters, matching) and by Supabase. */
export function SetPasswordForm({ onDone }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  // Actions
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = newPasswordProblem(password, confirmation);
    if (problem) return action.fail(problem);
    if (await action.run(() => api.updatePassword(password), 'Parola a fost schimbată.')) onDone();
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      <Field label="Parolă nouă" hint="Cel puțin 8 caractere.">
        <Input type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Repetă parola">
        <Input
          type="password"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </Field>
      <Button type="submit" disabled={action.isBusy}>
        {action.isBusy ? 'Se salvează…' : 'Salvează parola'}
      </Button>
      <ActionMessage outcome={action.outcome} />
    </form>
  );
}
