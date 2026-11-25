/** Link to the Discord server configured in the control panel. */
// Libs
import { ArrowUpRight } from 'lucide-react';

// Components
import { DiscordIcon } from './DiscordIcon';
import { buttonVariants, type ButtonSize } from './ui/button';

// Logic
import { safeUrl } from '@/lib/safeUrl';

/** Props of DiscordButton. */
interface Props {
  url: string | undefined; // from site settings; nothing renders when it is not a valid http(s) URL
  label: string;
  size?: ButtonSize;
  hasIcon?: boolean; // show the Discord glyph before the label (default true)
  className?: string;
}

/** A pink button that opens the Discord invite in a new tab; hidden while no invite is set. */
export function DiscordButton({ url, label, size = 'md', hasIcon = true, className }: Props) {
  const href = safeUrl(url);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonVariants('primary', size, className)}>
      {hasIcon && <DiscordIcon className="size-5" />}
      {label}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}
