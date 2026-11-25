/** Form for creating or editing one news item. */
// Libs
import { useState, type FormEvent } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageField } from '../components/ImageField';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';
import { NEWS_SOURCES, toNewsDraft, type NewsItem, type NewsItemDraft } from '@/api/types';

// Constants
/** A new item: a link, unpublished, at the end. */
const EMPTY_DRAFT: NewsItemDraft = {
  source: 'link',
  kind_label: '',
  title: '',
  summary: '',
  url: '',
  image_url: '',
  cta_label: '',
  is_published: false,
  position: 0,
};

/** Props of NewsItemForm. */
interface Props {
  item: NewsItem | null; // null creates a new item
  nextPosition: number; // position for a new item
  onSaved: () => void;
}

/** Validates title and URLs before saving; the database checks the same rules. */
export function NewsItemForm({ item, nextPosition, onSaved }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [draft, setDraft] = useState<NewsItemDraft>(() =>
    item ? toNewsDraft(item) : { ...EMPTY_DRAFT, position: nextPosition },
  );

  // Actions
  const set = <K extends keyof NewsItemDraft>(field: K, value: NewsItemDraft[K]) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cleaned = { ...draft, title: draft.title.trim(), url: draft.url.trim(), image_url: draft.image_url.trim() };
    if (!cleaned.title) return action.fail('Titlul este obligatoriu.');
    if ([cleaned.url, cleaned.image_url].some((value) => value !== '' && !safeUrl(value))) {
      return action.fail('Linkurile trebuie să înceapă cu https://');
    }
    if (await action.run(() => api.saveNewsItem(cleaned, item?.id), 'Salvat.')) onSaved();
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sursă">
          <Select value={draft.source} onChange={(e) => set('source', e.target.value as NewsItemDraft['source'])}>
            {NEWS_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tip (ex. Video, Discuție)">
          <Input value={draft.kind_label} maxLength={40} onChange={(e) => set('kind_label', e.target.value)} />
        </Field>
      </div>
      <Field label="Titlu">
        <Input value={draft.title} maxLength={160} required onChange={(e) => set('title', e.target.value)} />
      </Field>
      <Field label="Rezumat">
        <Textarea value={draft.summary} maxLength={500} onChange={(e) => set('summary', e.target.value)} />
      </Field>
      <Field label="Link">
        <Input type="url" value={draft.url} onChange={(e) => set('url', e.target.value)} placeholder="https://…" />
      </Field>
      <ImageField
        label="Imagine"
        hint="Gol = ilustrația implicită. Pentru YouTube poți lăsa thumbnail-ul clipului."
        value={draft.image_url}
        onChange={(url) => set('image_url', url)}
        folder="news"
        maxWidth={1280}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Text link (ex. Vezi clipul)">
          <Input value={draft.cta_label} maxLength={40} onChange={(e) => set('cta_label', e.target.value)} />
        </Field>
        <Field label="Ordine" hint="Mai mic = mai sus.">
          <Input type="number" value={draft.position} onChange={(e) => set('position', Math.trunc(Number(e.target.value)) || 0)} />
        </Field>
      </div>
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

