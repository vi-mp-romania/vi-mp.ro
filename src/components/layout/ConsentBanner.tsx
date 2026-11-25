/** The analytics cookie question, pinned to the bottom of the screen until answered. */
// Components
import { Button } from '../ui/button';

// Logic
import { useTexts } from '@/hooks/useTexts';

/** Props of ConsentBanner. */
interface Props {
  onAccept: () => void;
  onRefuse: () => void;
}

/**
 * Fixed to the viewport, so it never moves the page. Both answers are equally easy (same size, side
 * by side), as EU consent rules expect; nothing from Google loads before Accept.
 */
export function ConsentBanner({ onAccept, onRefuse }: Props) {
  const texts = useTexts();
  return (
    <section
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-primary/40 bg-card/95 p-4 shadow-[0_0_40px_-12px] shadow-primary/50 backdrop-blur sm:flex-row sm:items-center sm:p-5"
    >
      <p className="flex-1 text-sm text-foreground/90">{texts['consent.message']}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefuse} className="flex-1 sm:flex-none">
          {texts['consent.refuse']}
        </Button>
        <Button onClick={onAccept} className="flex-1 sm:flex-none">
          {texts['consent.accept']}
        </Button>
      </div>
    </section>
  );
}
