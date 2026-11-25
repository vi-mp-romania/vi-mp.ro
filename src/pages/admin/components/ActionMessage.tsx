/** One-line outcome of an admin action. */
import { cn } from '@/lib/cn';
import type { ActionOutcome } from '../hooks/useAction';

/** Props of ActionMessage. */
interface Props {
  outcome: ActionOutcome | null;
}

/** Success or error text, announced to screen readers. */
export function ActionMessage({ outcome }: Props) {
  return (
    <p role="status" className={cn('min-h-5 text-sm', outcome?.kind === 'error' ? 'text-danger' : 'text-success')}>
      {outcome?.message}
    </p>
  );
}
