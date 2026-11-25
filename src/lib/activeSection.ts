/** Decides which home page section the navigation highlights while scrolling. */

/** A section's id and the distance from the viewport top to the section top, in pixels. */
export interface SectionPosition {
  id: string;
  top: number;
}

/**
 * The active section is the last one whose top has scrolled above `threshold`. At the very bottom
 * of the page the last section wins, because a short final section never reaches the threshold.
 * Above the first section (the hero) the first one is active. Returns null without sections.
 */
export function pickActiveSection(
  sections: readonly SectionPosition[],
  threshold: number,
  isAtBottom: boolean,
): string | null {
  if (sections.length === 0) return null;
  if (isAtBottom) return sections[sections.length - 1]!.id;
  let active = sections[0]!.id;
  for (const section of sections) {
    if (section.top <= threshold) active = section.id;
  }
  return active;
}
