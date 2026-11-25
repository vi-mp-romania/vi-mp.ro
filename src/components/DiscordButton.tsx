/** Link to the Discord server configured in the control panel. */
// Libs
import { ArrowUpRight } from 'lucide-react';

// Components
import { DiscordIcon } from './DiscordIcon';
import { buttonVariants, type ButtonSize } from './ui/button';

// Logic
import { cn } from '@/lib/cn';
import { safeUrl } from '@/lib/safeUrl';
import { useAnalytics } from '@/hooks/useAnalytics';

// Types
import type { DiscordPlacement } from '@/lib/analytics';

/** Props of DiscordButton. */
interface Props {
  url: string | undefined; // from site settings; nothing renders when it is not a valid http(s) URL
  label: string;
  placement: DiscordPlacement; // where it sits, reported with the click
  size?: ButtonSize;
  hasIcon?: boolean; // show the Discord glyph before the label (default true)
  isPending?: boolean; // settings not loaded yet: hold the button's exact space with a placeholder
  className?: string;
}

/**
 * A pink button that opens the Discord invite in a new tab; hidden while no invite is set. While
 * pending it renders the same content invisibly, so the layout does not move when the URL arrives.
 */
export function DiscordButton({ url, label, placement, size = 'md', hasIcon = true, isPending = false, className }: Props) {
  const analytics = useAnalytics();
  const href = safeUrl(url);
  if (isPending) {
    return (
      <span
        aria-hidden="true"
        className={cn(buttonVariants('primary', size, className), 'animate-pulse bg-white/10 text-transparent shadow-none')}
      >
        {hasIcon && <DiscordIcon className="size-5" />}
        {label}
        <ArrowUpRight className="size-4" />
      </span>
    );
  }
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.track({ name: 'discord_click', params: { placement } })}
      className={buttonVariants('primary', size, className)}
    >
      {hasIcon && <DiscordIcon className="size-5" />}
      {label}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}
