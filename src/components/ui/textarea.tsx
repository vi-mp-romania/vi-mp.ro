/** Multi-line text input primitive. */
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_CLASS } from './input';

/** A styled <textarea>. */
export function Textarea({ className, rows = 3, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(FIELD_CLASS, 'resize-y', className)} {...rest} />;
}
