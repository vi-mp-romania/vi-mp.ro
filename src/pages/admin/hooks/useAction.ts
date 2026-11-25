/** Runs one admin action at a time and keeps its outcome message. */
import { useCallback, useState } from 'react';
import { errorMessage } from '@/lib/errorMessage';

/** Outcome of the last action, for ActionMessage. */
export interface ActionOutcome {
  kind: 'success' | 'error';
  message: string;
}

/** Busy flag, last outcome and the runner. */
export interface Action {
  isBusy: boolean;
  outcome: ActionOutcome | null;
  /** Runs `work`; reports `successMessage` or the error's message. Returns true on success. */
  run: (work: () => Promise<void>, successMessage: string) => Promise<boolean>;
  /** Shows a validation error without running anything. */
  fail: (message: string) => void;
}

/** State for a panel's save/delete buttons. */
export function useAction(): Action {
  const [isBusy, setIsBusy] = useState(false);
  const [outcome, setOutcome] = useState<ActionOutcome | null>(null);

  const run = useCallback(async (work: () => Promise<void>, successMessage: string) => {
    setIsBusy(true);
    setOutcome(null);
    try {
      await work();
      setOutcome({ kind: 'success', message: successMessage });
      return true;
    } catch (failure) {
      setOutcome({ kind: 'error', message: errorMessage(failure) });
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const fail = useCallback((message: string) => setOutcome({ kind: 'error', message }), []);

  return { isBusy, outcome, run, fail };
}
