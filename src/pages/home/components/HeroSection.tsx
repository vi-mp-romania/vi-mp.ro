/** First screen: title, description, Discord button and the skyline picture. */
// Libs
import { ArrowDown } from 'lucide-react';

// Components
import { Eyebrow } from './Eyebrow';
import { DiscordButton } from '@/components/DiscordButton';
import { SkylineIllustration } from '@/components/SkylineIllustration';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { useTexts } from '@/hooks/useTexts';

/** Props of HeroSection. */
interface Props {
  discordUrl: string | undefined;
  heroImageUrl: string | undefined; // configured picture; the built-in skyline shows without one
  isPending: boolean; // settings still loading: keep the Discord button's space
}

/** The hero: text on the left, picture fading in from the right (behind the text on phones). */
export function HeroSection({ discordUrl, heroImageUrl, isPending }: Props) {
  const texts = useTexts();
  const imageSrc = safeUrl(heroImageUrl);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-full opacity-40 [mask-image:linear-gradient(to_right,transparent,black_45%)] md:w-3/5 md:opacity-100">
        {imageSrc ? (
          // The largest thing above the fold: fetch it first.
          <img src={imageSrc} alt="" fetchPriority="high" className="h-full w-full object-cover" />
        ) : (
          <SkylineIllustration />
        )}
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 py-16 sm:px-6 md:py-24">
        <Eyebrow>{texts['hero.eyebrow']}</Eyebrow>
        <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
          {texts['hero.titleLine1']}
          <br />
          <span className="text-primary">{texts['hero.titleLine2']}</span>
        </h1>
        <p className="max-w-md text-base text-foreground/85 sm:text-lg">{texts['hero.description']}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <DiscordButton url={discordUrl} label={texts['hero.discordButton']} placement="hero" size="lg" isPending={isPending} />
          <a href="#noutati" className="inline-flex items-center gap-1.5 font-semibold hover:text-primary">
            {texts['hero.newsLink']}
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
