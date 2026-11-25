/** Loads the vote totals on demand. */
// Libs
import { useCallback, useState } from 'react';

// Logic
import { errorMessage } from '@/lib/errorMessage';
import { useApi } from '@/api/ApiContext';
import { tallyVotes, type PollTally } from '@/lib/voteResults';

// Types
import type { PollKey } from '@/lib/polls';

/** Totals, loading state and the loader. */
export interface VoteTally {
  tally: Record<PollKey, PollTally> | null;
  isLoading: boolean;
  error: string | null;
  load: () => void;
}

/** Fetches vote_results() whenever `load` is called (opening the dialog, after a reset). */
export function useVoteTally(): VoteTally {
  const api = useApi();

  // State
  const [tally, setTally] = useState<Record<PollKey, PollTally> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actions
  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .getVoteResults()
      .then((rows) => setTally(tallyVotes(rows)))
      .catch((failure: unknown) => setError(errorMessage(failure)))
      .finally(() => setIsLoading(false));
  }, [api]);

  return { tally, isLoading, error, load };
}
