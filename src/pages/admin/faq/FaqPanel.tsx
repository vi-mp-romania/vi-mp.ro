/** Lists every FAQ entry (drafts included) with create, edit, publish and delete. */
// Libs
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Components
import { FaqItemForm } from './FaqItemForm';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PanelCard } from '../components/PanelCard';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';
import { errorMessage } from '@/lib/errorMessage';
import { toFaqDraft, type FaqItem } from '@/api/types';

/** What the edit dialog shows: nothing, a new entry, or an existing one. */
type Editing = { kind: 'closed' } | { kind: 'new' } | { kind: 'edit'; item: FaqItem };

/** The FAQ list; the form opens in a dialog. */
export function FaqPanel() {
  const api = useApi();
  const action = useAction();

  // State
  const [items, setItems] = useState<FaqItem[]>([]);
  const [editing, setEditing] = useState<Editing>({ kind: 'closed' });
  const [loadError, setLoadError] = useState<string | null>(null);

  // Actions
  const load = useCallback(() => {
    api
      .listFaq({ publishedOnly: false })
      .then((loaded) => {
        setItems(loaded);
        setLoadError(null);
      })
      .catch((failure: unknown) => setLoadError(errorMessage(failure)));
  }, [api]);
  const togglePublished = (item: FaqItem) =>
    void action
      .run(() => api.saveFaqItem({ ...toFaqDraft(item), is_published: !item.is_published }, item.id), 'Actualizat.')
      .then((isDone) => isDone && load());
  const remove = (item: FaqItem) => {
    if (!window.confirm(`Ștergi întrebarea „${item.question}”?`)) return;
    void action.run(() => api.deleteFaqItem(item.id), 'Șters.').then((isDone) => isDone && load());
  };
  const closeEditor = () => setEditing({ kind: 'closed' });

  // Lifecycle
  useEffect(load, [load]);

  const nextPosition = items.reduce((max, item) => Math.max(max, item.position), 0) + 1;
  return (
    <PanelCard
      title="Întrebări frecvente"
      description="Apar pe prima pagină și ca rezultate îmbogățite pentru Google. Răspunde la ce caută oamenii."
    >
      <Button size="sm" className="w-fit" onClick={() => setEditing({ kind: 'new' })}>
        <Plus className="size-4" aria-hidden="true" /> Adaugă întrebare
      </Button>

      <ul className="flex flex-col divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-semibold">{item.question}</p>
              <p className="text-xs text-muted-foreground">
                #{item.position} · {item.is_published ? 'publicată' : 'ciornă'}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => togglePublished(item)} aria-label={item.is_published ? 'Ascunde' : 'Publică'} title={item.is_published ? 'Ascunde' : 'Publică'}>
                {item.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing({ kind: 'edit', item })} aria-label="Editează" title="Editează">
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove(item)} aria-label="Șterge" title="Șterge">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {loadError && <p className="text-sm text-danger">{loadError}</p>}
      <ActionMessage outcome={action.outcome} />

      <Dialog isOpen={editing.kind !== 'closed'} title={editing.kind === 'edit' ? 'Editează întrebarea' : 'Întrebare nouă'} onClose={closeEditor}>
        {editing.kind !== 'closed' && (
          <FaqItemForm
            key={editing.kind === 'edit' ? editing.item.id : 'new'}
            item={editing.kind === 'edit' ? editing.item : null}
            nextPosition={nextPosition}
            onSaved={() => {
              closeEditor();
              load();
            }}
          />
        )}
      </Dialog>
    </PanelCard>
  );
}
