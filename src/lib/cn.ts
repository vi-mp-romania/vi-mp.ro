/** Class name merging for Tailwind: conditional classes with later utilities winning conflicts. */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins class values and resolves conflicting Tailwind utilities (the last one wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
