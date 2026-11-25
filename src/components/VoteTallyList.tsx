/** Bars with the yes/no totals of every poll; used by the public results dialog and the admin panel. */
// Logic
import { useTexts } from '@/hooks/useTexts';
import { POLL_KEYS, type PollKey } from '@/lib/polls';

// Types
import type { ReactNode } from 'react';
import type { TextKey } from '@/lib/textRegistry';
import type { PollTally } from '@/lib/voteResults';

// Constants
/** Text used as the heading of each poll's bar. */
const POLL_TITLES: Readonly<Record<PollKey, TextKey>> = {
  play: 'polls.playQuestion',
  develop: 'polls.developQuestion',
  forum: 'forum.title',
};

/** Props of VoteTallyList. */
interface Props {
  tally: Record<PollKey, PollTally>;
  renderAction?: (poll: PollKey) => ReactNode; // optional control after each poll (admin reset)
}

/** One bar per poll; numbers are written out, so the result never depends on color. */
export function VoteTallyList({ tally, renderAction }: Props) {
  const texts = useTexts();
  return (
    <ul className="flex flex-col gap-5">
      {POLL_KEYS.map((poll) => {
        const { yes, no, total, yesPercent } = tally[poll];
        return (
          <li key={poll} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{texts[POLL_TITLES[poll]]}</h3>
              {renderAction?.(poll)}
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-card-strong" aria-hidden="true">
              <div className="bg-primary" style={{ width: `${yesPercent}%` }} />
              <div className="flex-1 bg-border" />
            </div>
            <p className="text-xs text-muted-foreground">
              {texts['polls.yes']}: <strong className="text-foreground">{yes}</strong>
              {total > 0 && ` (${yesPercent}%)`} · {texts['polls.no']}: <strong className="text-foreground">{no}</strong>
              {' · '}Total: {total}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
