/** Native select primitive. */
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_CLASS } from './input';

/** A styled native <select>; options are passed as children. */
export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD_CLASS, 'h-10', className)} {...rest} />;
}
