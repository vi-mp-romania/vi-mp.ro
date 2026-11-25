/** Loading placeholder primitive: a softly pulsing block that holds the space of what will load. */
import { cn } from '@/lib/cn';

/** Props of Skeleton. */
interface Props {
  className?: string; // size and shape; give it the dimensions of the content it stands in for
}

/** A decorative placeholder (hidden from screen readers). */
export function Skeleton({ className }: Props) {
  return <span aria-hidden="true" className={cn('block animate-pulse rounded-md bg-white/10', className)} />;
}
