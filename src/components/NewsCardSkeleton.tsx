/** Placeholder with the shape of a NewsCard, shown while news loads. */
import { Skeleton } from './ui/skeleton';

/** Same blocks and spacing as NewsCard (thumbnail, source line, title, summary, link). */
export function NewsCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-6 w-28" />
    </div>
  );
}
