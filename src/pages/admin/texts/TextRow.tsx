/** One editable text with save and reset-to-default. */
// Libs
import { useEffect, useState } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';
import { TEXT_REGISTRY, type TextKey } from '@/lib/textRegistry';

/** Props of TextRow. */
interface Props {
  textKey: TextKey;
  value: string; // the text the site currently shows
  isOverridden: boolean; // true when the database holds a changed value
  onSaved: () => void;
}

/** Save stores an override; reset deletes it, so the registry default shows again. */
export function TextRow({ textKey, value, isOverridden, onSaved }: Props) {
  const api = useApi();
  const action = useAction();
  const entry: { label: string; value: string; isLong?: boolean } = TEXT_REGISTRY[textKey];

  // State
  const [draft, setDraft] = useState(value);

  // Lifecycle: follow the saved value when the site reloads.
  useEffect(() => setDraft(value), [value]);

  // Actions
  const save = async () => {
    if (await action.run(() => api.saveText(textKey, draft), 'Salvat.')) onSaved();
  };
  const reset = async () => {
    if (await action.run(() => api.resetText(textKey), 'Revenit la textul implicit.')) onSaved();
  };

  const isChanged = draft !== value;
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-4 last:border-b-0 last:pb-0">
      <Field label={isOverridden ? `${entry.label} · modificat` : entry.label}>
        {entry.isLong ? (
          <Textarea value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} />
        ) : (
          <Input value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} />
        )}
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!isChanged || action.isBusy} onClick={() => void save()}>
          Salvează
        </Button>
        {isOverridden && (
          <Button variant="outline" size="sm" disabled={action.isBusy} onClick={() => void reset()} title={entry.value}>
            Text implicit
          </Button>
        )}
        <ActionMessage outcome={action.outcome} />
      </div>
    </div>
  );
}
