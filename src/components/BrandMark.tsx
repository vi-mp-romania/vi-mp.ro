/** The "VI" logo mark. */
import { useId } from 'react';
import { cn } from '@/lib/cn';

/** Props of BrandMark. */
interface Props {
  className?: string;
}

/** Outlined "VI" letters in the sunset gradient; decorative (the site name is written beside it). */
export function BrandMark({ className }: Props) {
  const gradientId = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}brand`; // unique per instance

  return (
    <svg viewBox="0 0 48 32" aria-hidden="true" className={cn('h-8 w-12', className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7a24f" />
          <stop offset="1" stopColor="#ff86b8" />
        </linearGradient>
      </defs>
      <path
        d="M3 4h7l6 17 6-17h7L19 28h-6zM34 4h7v24h-7z"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
