/** Public results of the three polls. */
// Libs
import { useEffect } from 'react';

// Components
import { Dialog } from '@/components/ui/dialog';
import { VoteTallyList } from '@/components/VoteTallyList';

// Logic
import { useTexts } from '@/hooks/useTexts';
import { useVoteTally } from '@/hooks/useVoteTally';

/** Props of VoteResultsDialog. */
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Loads fresh totals each time it opens. */
export function VoteResultsDialog({ isOpen, onClose }: Props) {
  const texts = useTexts();
  const { tally, isLoading, error, load } = useVoteTally();

  // Lifecycle: refresh on every open, so a visitor sees their own vote counted.
  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  return (
    <Dialog isOpen={isOpen} title={texts['polls.resultsTitle']} onClose={onClose}>
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && !tally && isLoading && <p className="text-sm text-muted-foreground">Se încarcă…</p>}
      {tally && <VoteTallyList tally={tally} />}
    </Dialog>
  );
}
