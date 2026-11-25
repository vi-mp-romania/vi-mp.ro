/** The short line shown after a vote: saved or failed. */
import { useTexts } from '@/hooks/useTexts';
import type { VoteOutcome } from '../hooks/useVotes';

/** Props of VoteOutcomeMessage. */
interface Props {
  outcome: VoteOutcome | undefined;
}

/** Announces the outcome politely to screen readers; nothing while idle or saving. */
export function VoteOutcomeMessage({ outcome }: Props) {
  const texts = useTexts();
  return (
    <p role="status" className="min-h-5 text-xs">
      {outcome === 'saved' && <span className="text-success">{texts['polls.thanks']}</span>}
      {outcome === 'failed' && <span className="text-danger">{texts['polls.error']}</span>}
    </p>
  );
}
