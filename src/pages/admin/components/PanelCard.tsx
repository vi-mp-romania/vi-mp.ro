/** Framed block with a heading, used by every admin tab. */
import type { ReactNode } from 'react';

/** Props of PanelCard. */
interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

/** A card with title, optional description and content. */
export function PanelCard({ title, description, children }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
