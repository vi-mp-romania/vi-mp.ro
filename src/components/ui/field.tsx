/** A labelled form field: label above, control, optional hint below. */
import type { ReactNode } from 'react';

/** Props of Field. */
interface Props {
  label: string;
  hint?: string; // short help under the control
  children: ReactNode; // the control
}

/** Wraps a control in a <label> so clicking the text focuses it. */
export function Field({ label, hint, children }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground/70">{hint}</span>}
    </label>
  );
}
