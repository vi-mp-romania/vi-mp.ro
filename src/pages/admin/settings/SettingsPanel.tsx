/** Edits the Discord invite and the hero picture URL. */
// Libs
import { useEffect, useState } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PanelCard } from '../components/PanelCard';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';

// Types
import type { SiteData } from '@/hooks/useSiteData';

/** Props of SettingsPanel. */
interface Props {
  site: SiteData;
}

/** Both URLs may be empty: an empty Discord URL hides every Discord button. */
export function SettingsPanel({ site }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [discordUrl, setDiscordUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');

  // Lifecycle: start from the saved values.
  useEffect(() => {
    setDiscordUrl(site.settings?.discord_url ?? '');
    setHeroImageUrl(site.settings?.hero_image_url ?? '');
  }, [site.settings]);

  // Actions
  const save = async () => {
    const links = { discord_url: discordUrl.trim(), hero_image_url: heroImageUrl.trim() };
    const isValid = Object.values(links).every((value) => value === '' || safeUrl(value));
    if (!isValid) {
      action.fail('Linkurile trebuie să înceapă cu https://');
      return;
    }
    if (await action.run(() => api.saveLinks(links), 'Setările au fost salvate.')) site.reload();
  };

  return (
    <PanelCard title="Setări" description="Linkuri folosite pe tot site-ul.">
      <Field label="Link invitație Discord" hint="Ex. https://discord.gg/codul-vostru. Gol = butoanele Discord sunt ascunse.">
        <Input type="url" value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.gg/…" />
      </Field>
      <Field label="Imagine hero (URL)" hint="Gol = ilustrația implicită cu orașul la apus.">
        <Input type="url" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://…" />
      </Field>
      <div className="flex items-center gap-4">
        <Button onClick={() => void save()} disabled={action.isBusy}>
          Salvează
        </Button>
        <ActionMessage outcome={action.outcome} />
      </div>
    </PanelCard>
  );
}
