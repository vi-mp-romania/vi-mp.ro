/** Button primitive and the matching class builder for links that look like buttons. */
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

// Constants
const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-strong shadow-[0_0_24px_-6px] shadow-primary/60',
  accent: 'border-2 border-accent text-accent hover:bg-accent/10',
  outline: 'border border-border text-foreground hover:border-foreground/40 hover:bg-white/5',
  ghost: 'text-foreground hover:bg-white/5',
  danger: 'border border-danger/60 text-danger hover:bg-danger/10',
} as const;

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
} as const;

/** Visual style of a button. */
export type ButtonVariant = keyof typeof VARIANTS;

/** Size of a button. */
export type ButtonSize = keyof typeof SIZES;

/** Classes for a button-looking element; use it on <a> elements. */
export function buttonVariants(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

/** Props of Button. */
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A real <button>, type="button" unless stated otherwise. */
export function Button({ variant, size, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={buttonVariants(variant, size, className)} {...rest} />;
}
