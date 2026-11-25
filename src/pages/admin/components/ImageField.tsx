/** An image URL field with an upload button: the picked file is resized, uploaded, and its URL set. */
// Libs
import { ImageUp } from 'lucide-react';
import { useId, type ChangeEvent } from 'react';

// Components
import { ActionMessage } from './ActionMessage';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';

// Logic
import { cn } from '@/lib/cn';
import { safeUrl } from '@/lib/safeUrl';
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';
import { resizeImage } from '@/lib/resizeImage';

/** Props of ImageField. */
interface Props {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  folder: 'hero' | 'news'; // where in the media bucket uploads go
  maxWidth: number; // uploads are scaled down to this width (px)
}

/**
 * The URL stays editable (paste any https image), the button uploads from the computer instead.
 * Upload only fills the field: the surrounding form's Save stores it, like a typed URL.
 */
export function ImageField({ label, hint, value, onChange, folder, maxWidth }: Props) {
  const api = useApi();
  const action = useAction();
  const inputId = useId();
  const previewSrc = safeUrl(value);

  // Actions
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow picking the same file again
    if (!file) return;
    if (!file.type.startsWith('image/')) return action.fail('Alege un fișier imagine (JPG, PNG, WebP).');
    await action.run(async () => {
      const resized = await resizeImage(file, maxWidth);
      onChange(await api.uploadImage(resized, folder));
    }, 'Imagine încărcată. Apasă Salvează ca să o folosești.');
  };

  return (
    <div className="flex flex-col gap-2">
      <Field label={label} hint={hint}>
        <Input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={inputId} className={cn(buttonVariants('outline', 'sm'), action.isBusy && 'pointer-events-none opacity-50')}>
          <ImageUp className="size-4" aria-hidden="true" />
          {action.isBusy ? 'Se încarcă…' : 'Încarcă imagine'}
        </label>
        <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={(e) => void upload(e)} />
        {previewSrc && <img src={previewSrc} alt="" className="h-12 w-20 rounded-md border border-border object-cover" />}
        <ActionMessage outcome={action.outcome} />
      </div>
    </div>
  );
}
