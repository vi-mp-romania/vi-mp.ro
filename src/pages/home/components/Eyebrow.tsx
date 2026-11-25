/** Small orange uppercase line above a section title. */
import type { ReactNode } from 'react';

/** Props of Eyebrow. */
interface Props {
  children: ReactNode;
}

/** Section supra-title; renders nothing for an empty text. */
export function Eyebrow({ children }: Props) {
  if (!children) return null;
  return <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent sm:text-sm">{children}</p>;
}
