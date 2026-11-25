/** Small orange uppercase line above a section title. */
import type { ReactNode } from 'react';

/** Props of Eyebrow. */
interface Props {
  children: ReactNode;
  as?: 'p' | 'h1'; // h1 for the hero, where the small line carries the page's main heading
}

/** Section supra-title; renders nothing for an empty text. */
export function Eyebrow({ children, as: Element = 'p' }: Props) {
  if (!children) return null;
  return <Element className="text-xs font-semibold uppercase tracking-[0.12em] text-accent sm:text-sm">{children}</Element>;
}
