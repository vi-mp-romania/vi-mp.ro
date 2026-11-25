/** Bottom bar: name, disclaimer and the Discord link. */
// Libs
import { ArrowUpRight } from 'lucide-react';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { useTexts } from '@/hooks/useTexts';
import { routePath } from '@/lib/routes';
import { useAnalytics } from '@/hooks/useAnalytics';

/** Props of Footer. */
interface Props {
  discordUrl: string | undefined;
  onOpenConsent?: () => void; // shows the cookie banner again; the link hides without analytics
}

/** The site footer; the admin and cookie links are deliberately quiet. */
export function Footer({ discordUrl, onOpenConsent }: Props) {
  const texts = useTexts();
  const analytics = useAnalytics();
  const discordHref = safeUrl(discordUrl);

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col items-center gap-3 border-t border-border py-6 text-sm sm:flex-row sm:justify-between">
        <a href={routePath({ page: 'home' })} className="font-bold">
          © {new Date().getFullYear()} {texts['footer.brand']}
        </a>
        <p className="text-center text-xs text-muted-foreground">{texts['footer.disclaimer']}</p>
        <div className="flex items-center gap-4">
          {onOpenConsent && (
            <button type="button" onClick={onOpenConsent} className="text-xs text-muted-foreground/60 hover:text-muted-foreground">
              {texts['consent.footerLink']}
            </button>
          )}
          <a href={routePath({ page: 'admin' })} rel="nofollow" className="text-xs text-muted-foreground/60 hover:text-muted-foreground">
            Admin
          </a>
          {discordHref && (
            <a
              href={discordHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.track({ name: 'discord_click', params: { placement: 'footer' } })}
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
