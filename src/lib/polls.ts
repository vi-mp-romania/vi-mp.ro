/** The polls the site asks. Keys match the check constraint on public.votes.poll. */

/** Identifier of a poll. */
export type PollKey = 'play' | 'develop' | 'forum';

/** An answer to a poll. */
export type PollAnswer = 'yes' | 'no';

/** Every poll, in display order. */
export const POLL_KEYS: readonly PollKey[] = ['play', 'develop', 'forum'];

/** Every answer, in display order. */
export const POLL_ANSWERS: readonly PollAnswer[] = ['yes', 'no'];
