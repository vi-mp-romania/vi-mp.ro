/** Modal dialog primitive over the native <dialog> element (focus trap, Escape, backdrop). */
// Libs
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

/** Props of Dialog. */
interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void; // called on Escape, the close button and a backdrop click
  children: ReactNode;
}

/** A modal dialog; the browser traps focus while it is open. */
export function Dialog({ isOpen, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // Lifecycle: mirror isOpen onto the native modal state.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself, not on its content.
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-border bg-card p-0 text-foreground backdrop:bg-black/70"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Închide" className="rounded p-1 hover:bg-white/5">
          <X className="size-5" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
