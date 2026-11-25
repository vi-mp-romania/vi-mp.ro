/** Tracks which home page section is in view, for the header navigation. */
// Libs
import { useEffect, useState } from 'react';

// Logic
import { pickActiveSection } from '@/lib/activeSection';

// Constants
const THRESHOLD_RATIO = 0.35; // a section is active once its top passes 35% of the viewport height
const BOTTOM_TOLERANCE = 4; // pixels from the end of the page that count as "at the bottom"

/**
 * Returns the id of the section in view among `ids`, updated on scroll and resize (once per frame).
 * Returns null while disabled (on other pages) or when none of the sections exist.
 */
export function useActiveSection(ids: readonly string[], isEnabled: boolean): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = ids.join(' '); // stable dependency for a list rebuilt on each render

  // Lifecycle: measure on mount, then on every scroll or resize.
  useEffect(() => {
    if (!isEnabled) {
      setActiveId(null);
      return;
    }
    let frame = 0;

    /** Measures the sections and stores the active one. */
    const measure = () => {
      frame = 0;
      const sections = idsKey
        .split(' ')
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null)
        .map((element) => ({ id: element.id, top: element.getBoundingClientRect().top }));
      const scrolledTo = window.scrollY + window.innerHeight;
      const isAtBottom = scrolledTo >= document.documentElement.scrollHeight - BOTTOM_TOLERANCE;
      setActiveId(pickActiveSection(sections, window.innerHeight * THRESHOLD_RATIO, isAtBottom));
    };
    /** Coalesces bursts of scroll events into one measurement per frame. */
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [idsKey, isEnabled]);

  return activeId;
}
