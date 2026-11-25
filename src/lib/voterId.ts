/** The anonymous voter id and the answers this browser gave, kept in localStorage. */
import { readStored, writeStored } from './browserStorage';
import { POLL_KEYS, type PollAnswer, type PollKey } from './polls';

const VOTER_ID_KEY = 'vimp.voterId'; // stable random id sent with each vote
const ANSWERS_KEY = 'vimp.answers'; // { [poll]: answer } so buttons show the own answer

/**
 * Returns this browser's voter id, creating it on first use. Without storage a new id is made per
 * page load, which only means the visitor's answer is not remembered.
 */
export function getVoterId(): string {
  const stored = readStored(VOTER_ID_KEY);
  if (stored && /^[0-9a-f-]{36}$/i.test(stored)) return stored;
  const created = crypto.randomUUID();
  writeStored(VOTER_ID_KEY, created);
  return created;
}

/** Answers this browser has given, by poll. Unknown or corrupt entries are ignored. */
export function readOwnAnswers(): Partial<Record<PollKey, PollAnswer>> {
  const answers: Partial<Record<PollKey, PollAnswer>> = {};
  try {
    const parsed: unknown = JSON.parse(readStored(ANSWERS_KEY) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) return answers;
    for (const poll of POLL_KEYS) {
      const value: unknown = (parsed as Record<string, unknown>)[poll];
      if (value === 'yes' || value === 'no') answers[poll] = value;
    }
  } catch {
    // Corrupt storage behaves like no stored answers.
  }
  return answers;
}

/** Remembers the answer this browser gave to one poll. */
export function writeOwnAnswer(poll: PollKey, answer: PollAnswer): void {
  writeStored(ANSWERS_KEY, JSON.stringify({ ...readOwnAnswers(), [poll]: answer }));
}
