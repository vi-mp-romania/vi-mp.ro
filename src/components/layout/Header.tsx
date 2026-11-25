/** Top bar: logo, in-page navigation and the Discord button. */
// Components
import { BrandMark } from '../BrandMark';
import { DiscordButton } from '../DiscordButton';

// Hooks
import { useTexts } from '@/hooks/useTexts';
import { useActiveSection } from './useActiveSection';

// Logic
import { cn } from '@/lib/cn';
import { routePath, type Route } from '@/lib/routes';

// Constants
/** Home page sections the navigation points at, in page order (ids set in the section components). */
const SECTION_IDS = ['status', 'noutati', 'comunitate'] as const;

/** Props of Header. */
interface Props {
  route: Route; // the current page, to highlight its link
  discordUrl: string | undefined;
  isPending: boolean; // settings still loading: keep the Discord button's space
}

/**
 * The sticky site header. On the home page the link of the section in view is highlighted as you
 * scroll; on the news pages "Noutăți" is. From another page the section links lead to that section
 * of the home page ("/#status"), and "Noutăți" to the news page.
 */
export function Header({ route, discordUrl, isPending }: Props) {
  const texts = useTexts();
  const isHome = route.page === 'home';
  const activeSection = useActiveSection(SECTION_IDS, isHome);
  const home = routePath({ page: 'home' });
  const links = [
    { href: isHome ? '#status' : `${home}#status`, label: texts['header.navStatus'], isActive: activeSection === 'status' },
    {
      href: isHome ? '#noutati' : routePath({ page: 'news' }),
      label: texts['header.navNews'],
      isActive: activeSection === 'noutati' || route.page === 'news' || route.page === 'article',
    },
    {
      href: isHome ? '#comunitate' : `${home}#comunitate`,
      label: texts['header.navCommunity'],
      isActive: activeSection === 'comunitate',
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={home} className="flex items-center gap-3 font-bold" aria-label="VI-MP.ro, acasă">
          <BrandMark />
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          <span className="text-lg">VI-MP.ro</span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={link.isActive ? 'location' : undefined}
              className={cn(
                'border-b-2 py-1 text-sm font-medium transition-colors',
                link.isActive ? 'border-primary text-primary' : 'border-transparent hover:text-primary',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <DiscordButton url={discordUrl} label={texts['header.discordButton']} placement="header" size="sm" isPending={isPending} />
      </div>
    </header>
  );
}
