/** The landing page, section by section as in the mockup. */
// Libs
import { useEffect, useRef, useState } from 'react';

// Components
import { HeroSection } from './components/HeroSection';
import { NewsSection } from './components/NewsSection';
import { PollSection } from './components/PollSection';
import { ForumSection } from './components/ForumSection';
import { StatusSection } from './components/StatusSection';
import { DiscordSection } from './components/DiscordSection';
import { VoteResultsDialog } from './dialogs/VoteResultsDialog';

// Hooks
import { useVotes } from './hooks/useVotes';
import { useNews } from '@/hooks/useNews';
import { useAnalytics } from '@/hooks/useAnalytics';

// Types
import type { SiteData } from '@/hooks/useSiteData';

// Constants
const HOME_NEWS_LIMIT = 2; // the full list is on #/noutati

/** Props of HomePage. */
interface Props {
  site: SiteData;
}

/** Owns the poll answers and the results dialog; sections only render. */
export function HomePage({ site }: Props) {
  // State
  const votes = useVotes();
  const analytics = useAnalytics();
  const news = useNews(HOME_NEWS_LIMIT);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const hasScrolledToAnchor = useRef(false); // the initial anchor jump happens once per visit

  // Lifecycle: honour an anchor in the opening URL (#comunitate). The browser tries before React
  // has drawn the sections, so jump once the news (the section that changes height) has loaded.
  useEffect(() => {
    if (news.isPending || hasScrolledToAnchor.current) return;
    hasScrolledToAnchor.current = true;
    const anchor = window.location.hash.slice(1);
    if (anchor && !anchor.startsWith('/')) document.getElementById(anchor)?.scrollIntoView();
  }, [news.isPending]);

  const discordUrl = site.settings?.discord_url;

  return (
    <>
      <HeroSection discordUrl={discordUrl} heroImageUrl={site.settings?.hero_image_url} isPending={site.isPending} />
      <StatusSection
        stages={site.stages}
        currentStage={site.settings?.current_stage ?? 0}
        isPending={site.isPending}
        error={site.error}
      />
      <NewsSection news={news} placeholderCount={HOME_NEWS_LIMIT} />
      <PollSection votes={votes} onShowResults={() => {
          setIsResultsOpen(true);
          analytics.track({ name: 'poll_results_open' });
        }} />
      <ForumSection votes={votes} />
      <DiscordSection discordUrl={discordUrl} isPending={site.isPending} />
      <VoteResultsDialog isOpen={isResultsOpen} onClose={() => setIsResultsOpen(false)} />
    </>
  );
}
