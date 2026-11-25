/** Closing call to action: join the Discord server. */
// Components
import { DiscordIcon } from '@/components/DiscordIcon';
import { DiscordButton } from '@/components/DiscordButton';

// Logic
import { useTexts } from '@/hooks/useTexts';

/** Props of DiscordSection. */
interface Props {
  discordUrl: string | undefined;
}

/** Centered Discord block; the "Comunitate" navigation link points here. */
export function DiscordSection({ discordUrl }: Props) {
  const texts = useTexts();
  return (
    <section id="comunitate" className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-16 text-center sm:px-6">
      <DiscordIcon className="size-16 text-primary drop-shadow-[0_0_18px_rgba(255,134,184,0.6)]" />
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{texts['discord.title']}</h2>
      <p className="text-muted-foreground sm:text-lg">{texts['discord.subtitle']}</p>
      <DiscordButton url={discordUrl} label={texts['discord.button']} size="lg" hasIcon={false} className="mt-3 min-w-56" />
    </section>
  );
}
