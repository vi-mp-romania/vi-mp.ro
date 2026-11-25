/** This browser's poll answers and the action that saves one. */
// Libs
import { useCallback, useState } from 'react';

// Logic
import { useApi } from '@/api/ApiContext';
import { getVoterId, readOwnAnswers, writeOwnAnswer } from '@/lib/voterId';

// Types
import type { PollAnswer, PollKey } from '@/lib/polls';

/** Outcome of the last vote on a poll, for the message under it. */
export type VoteOutcome = 'saving' | 'saved' | 'failed';

/** Poll answers state shared by the poll and forum sections. */
export interface Votes {
  answers: Partial<Record<PollKey, PollAnswer>>;
  outcomes: Partial<Record<PollKey, VoteOutcome>>;
  vote: (poll: PollKey, answer: PollAnswer) => void;
}

/**
 * Keeps the visitor's answers (remembered in localStorage) and saves a new one through cast_vote.
 * The answer is shown at once and remembered only after the database accepted it; on failure the
 * previous answer comes back.
 */
export function useVotes(): Votes {
  const api = useApi();

  // State
  const [answers, setAnswers] = useState(readOwnAnswers);
  const [outcomes, setOutcomes] = useState<Partial<Record<PollKey, VoteOutcome>>>({});

  // Actions
  const vote = useCallback(
    (poll: PollKey, answer: PollAnswer) => {
      const previous = readOwnAnswers()[poll];
      setAnswers((current) => ({ ...current, [poll]: answer }));
      setOutcomes((current) => ({ ...current, [poll]: 'saving' }));
      api
        .castVote(getVoterId(), poll, answer)
        .then(() => {
          writeOwnAnswer(poll, answer);
          setOutcomes((current) => ({ ...current, [poll]: 'saved' }));
        })
        .catch(() => {
          // Restore what was saved before; the error itself was logged by the api layer.
          setAnswers((current) => ({ ...current, [poll]: previous }));
          setOutcomes((current) => ({ ...current, [poll]: 'failed' }));
        });
    },
    [api],
  );

  return { answers, outcomes, vote };
}
