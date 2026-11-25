/** Edits the timeline stages and which of them are done. */
// Libs
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { PanelCard } from '../components/PanelCard';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';

// Types
import type { SiteData } from '@/hooks/useSiteData';

/** A stage being edited; `key` keeps React rows stable while positions change. */
interface DraftStage {
  key: number;
  title: string;
  caption: string;
}

/** Props of StatusPanel. */
interface Props {
  site: SiteData;
}

/**
 * Local copy of the stages, saved as a whole through save_status so visitors never see a
 * half-edited timeline. The status card texts are edited in the Texts tab.
 */
export function StatusPanel({ site }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [stages, setStages] = useState<DraftStage[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [nextKey, setNextKey] = useState(1000); // keys for added rows, above any loaded index

  // Lifecycle: start from the saved timeline whenever it (re)loads.
  useEffect(() => {
    setStages(site.stages.map((stage, index) => ({ key: index, title: stage.title, caption: stage.caption })));
    setDoneCount(site.settings?.current_stage ?? 0);
  }, [site.stages, site.settings]);

  // Actions
  const update = (key: number, change: Partial<DraftStage>) =>
    setStages((current) => current.map((stage) => (stage.key === key ? { ...stage, ...change } : stage)));
  const move = (index: number, offset: number) =>
    setStages((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      if (moved) next.splice(index + offset, 0, moved);
      return next;
    });
  const remove = (key: number) => {
    setStages((current) => current.filter((stage) => stage.key !== key));
    setDoneCount((count) => Math.min(count, stages.length - 1));
  };
  const add = () => {
    setStages((current) => [...current, { key: nextKey, title: '', caption: '' }]);
    setNextKey((key) => key + 1);
  };
  const save = async () => {
    const cleaned = stages.map(({ title, caption }) => ({ title: title.trim(), caption: caption.trim() }));
    if (cleaned.length === 0 || cleaned.some((stage) => !stage.title)) {
      action.fail('Fiecare etapă are nevoie de un titlu.');
      return;
    }
    if (await action.run(() => api.saveStatus(cleaned, doneCount), 'Statusul a fost salvat.')) site.reload();
  };

  return (
    <PanelCard title="Unde suntem acum" description="Etapele din cronologie și câte dintre ele sunt gata.">
      <ol className="flex flex-col gap-3">
        {stages.map((stage, index) => (
          <li key={stage.key} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-end">
            <span className="font-mono text-sm text-muted-foreground sm:pb-2">{String(index + 1).padStart(2, '0')}</span>
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <Field label="Titlu">
                <Input value={stage.title} maxLength={80} onChange={(e) => update(stage.key, { title: e.target.value })} />
              </Field>
              <Field label="Descriere">
                <Input value={stage.caption} maxLength={80} onChange={(e) => update(stage.key, { caption: e.target.value })} />
              </Field>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" aria-label="Mută mai sus" disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" aria-label="Mută mai jos" disabled={index === stages.length - 1} onClick={() => move(index, 1)}>
                <ArrowDown className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" aria-label="Șterge etapa" disabled={stages.length === 1} onClick={() => remove(stage.key)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button variant="outline" size="sm" className="w-fit" onClick={add}>
        <Plus className="size-4" aria-hidden="true" /> Adaugă etapă
      </Button>

      <Field label="Suntem aici" hint="Etapele până la cea aleasă apar bifate; marcajul „suntem aici” vine după ea.">
        <Select value={doneCount} onChange={(e) => setDoneCount(Number(e.target.value))}>
          <option value={0}>Nicio etapă gata</option>
          {stages.map((stage, index) => (
            <option key={stage.key} value={index + 1}>
              Gata până la {String(index + 1).padStart(2, '0')} / {stage.title || '(fără titlu)'}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-center gap-4">
        <Button onClick={() => void save()} disabled={action.isBusy}>
          Salvează statusul
        </Button>
        <ActionMessage outcome={action.outcome} />
      </div>
    </PanelCard>
  );
}
