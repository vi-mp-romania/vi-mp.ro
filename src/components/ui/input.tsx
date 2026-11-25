/** Single-line text input primitive. */
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Classes shared by every text field (input, textarea, select). */
export const FIELD_CLASS =
  'w-full rounded-lg border border-border bg-card-strong px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none';

/** A styled <input>. */
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_CLASS, 'h-10', className)} {...rest} />;
}
