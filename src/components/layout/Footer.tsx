/** Bottom bar: name, disclaimer and the Discord link. */
// Libs
import { ArrowUpRight } from 'lucide-react';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { useTexts } from '@/hooks/useTexts';
import { ROUTE_HASHES } from '@/lib/routes';

/** Props of Footer. */
interface Props {
  discordUrl: string | undefined;
}

/** The site footer; the admin link is deliberately quiet. */
export function Footer({ discordUrl }: Props) {
  const texts = useTexts();
  const discordHref = safeUrl(discordUrl);

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col items-center gap-3 border-t border-border py-6 text-sm sm:flex-row sm:justify-between">
        <a href={ROUTE_HASHES.home} className="font-bold">
          {texts['footer.brand']}
        </a>
        <p className="text-center text-xs text-muted-foreground">{texts['footer.disclaimer']}</p>
        <div className="flex items-center gap-4">
          <a href={ROUTE_HASHES.admin} className="text-xs text-muted-foreground/60 hover:text-muted-foreground">
            Admin
          </a>
          {discordHref && (
            <a
              href={discordHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold hover:text-primary"
            >
              {texts['footer.discordLink']}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
