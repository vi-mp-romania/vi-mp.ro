/** Turns the vote_results() rows into per-poll totals and percentages. */
import { POLL_KEYS, type PollAnswer, type PollKey } from './polls';

/** One row of vote_results(). */
export interface VoteCount {
  poll: string;
  answer: string;
  total: number;
}

/** Totals for one poll. */
export interface PollTally {
  yes: number;
  no: number;
  total: number;
  /** Share of "yes" answers, 0–100, rounded; 0 when nobody voted. */
  yesPercent: number;
}

/** Builds a tally for every known poll; rows for unknown polls or answers are ignored. */
export function tallyVotes(rows: readonly VoteCount[]): Record<PollKey, PollTally> {
  const counts = Object.fromEntries(POLL_KEYS.map((poll) => [poll, { yes: 0, no: 0 }])) as Record<
    PollKey,
    Record<PollAnswer, number>
  >;
  for (const row of rows) {
    const poll = counts[row.poll as PollKey];
    if (poll && (row.answer === 'yes' || row.answer === 'no')) poll[row.answer] += row.total;
  }
  return Object.fromEntries(
    POLL_KEYS.map((key) => {
      const { yes, no } = counts[key];
      const total = yes + no;
      return [key, { yes, no, total, yesPercent: total === 0 ? 0 : Math.round((yes / total) * 100) }];
    }),
  ) as Record<PollKey, PollTally>;
}
