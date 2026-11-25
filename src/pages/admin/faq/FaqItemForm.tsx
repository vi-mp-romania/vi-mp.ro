/** Form for creating or editing one FAQ entry. */
// Libs
import { useState, type FormEvent } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';
import { toFaqDraft, type FaqItem, type FaqItemDraft } from '@/api/types';

/** Props of FaqItemForm. */
interface Props {
  item: FaqItem | null; // null creates a new entry
  nextPosition: number; // position for a new entry
  onSaved: () => void;
}

/** Question and answer are required; the database checks the same limits. */
export function FaqItemForm({ item, nextPosition, onSaved }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [draft, setDraft] = useState<FaqItemDraft>(() =>
    item ? toFaqDraft(item) : { question: '', answer: '', is_published: true, position: nextPosition },
  );

  // Actions
  const set = <K extends keyof FaqItemDraft>(field: K, value: FaqItemDraft[K]) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cleaned = { ...draft, question: draft.question.trim(), answer: draft.answer.trim() };
    if (!cleaned.question || !cleaned.answer) return action.fail('Întrebarea și răspunsul sunt obligatorii.');
    if (await action.run(() => api.saveFaqItem(cleaned, item?.id), 'Salvat.')) onSaved();
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      <Field label="Întrebare" hint="Scrie-o cum ar căuta-o cineva pe Google (ex. „Când apare GTA 6 pe PC?”).">
        <Input value={draft.question} maxLength={200} required onChange={(e) => set('question', e.target.value)} />
      </Field>
      <Field label="Răspuns">
        <Textarea value={draft.answer} rows={5} maxLength={2000} required onChange={(e) => set('answer', e.target.value)} />
      </Field>
      <Field label="Ordine" hint="Mai mic = mai sus.">
        <Input type="number" value={draft.position} onChange={(e) => set('position', Math.trunc(Number(e.target.value)) || 0)} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={draft.is_published} onChange={(e) => set('is_published', e.target.checked)} className="size-4 accent-primary" />
        Publicat (vizibil pe site)
      </label>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={action.isBusy}>
          Salvează
        </Button>
        <ActionMessage outcome={action.outcome} />
      </div>
    </form>
  );
}
