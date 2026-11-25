/** Edits the Discord invite and the hero picture URL. */
// Libs
import { useEffect, useState } from 'react';

// Components
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PanelCard } from '../components/PanelCard';
import { ImageField } from '../components/ImageField';
import { ActionMessage } from '../components/ActionMessage';

// Logic
import { safeUrl } from '@/lib/safeUrl';
import { isMeasurementId } from '@/lib/analytics';
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';

// Types
import type { SiteData } from '@/hooks/useSiteData';

/** Props of SettingsPanel. */
interface Props {
  site: SiteData;
}

/**
 * Every value may be empty: an empty Discord URL hides every Discord button, an empty measurement id
 * turns Google Analytics (and its consent banner) off.
 */
export function SettingsPanel({ site }: Props) {
  const api = useApi();
  const action = useAction();

  // State
  const [discordUrl, setDiscordUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [measurementId, setMeasurementId] = useState('');

  // Lifecycle: start from the saved values.
  useEffect(() => {
    setDiscordUrl(site.settings?.discord_url ?? '');
    setHeroImageUrl(site.settings?.hero_image_url ?? '');
    setMeasurementId(site.settings?.ga_measurement_id ?? '');
  }, [site.settings]);

  // Actions
  const save = async () => {
    const values = {
      discord_url: discordUrl.trim(),
      hero_image_url: heroImageUrl.trim(),
      ga_measurement_id: measurementId.trim().toUpperCase(),
    };
    if (![values.discord_url, values.hero_image_url].every((value) => value === '' || safeUrl(value))) {
      action.fail('Linkurile trebuie să înceapă cu https://');
      return;
    }
    if (values.ga_measurement_id !== '' && !isMeasurementId(values.ga_measurement_id)) {
      action.fail('ID-ul Google Analytics arată ca G-XXXXXXXXXX.');
      return;
    }
    if (await action.run(() => api.saveSiteSettings(values), 'Setările au fost salvate.')) site.reload();
  };

  return (
    <PanelCard title="Setări" description="Linkuri folosite pe tot site-ul.">
      <Field label="Link invitație Discord" hint="Ex. https://discord.gg/codul-vostru. Gol = butoanele Discord sunt ascunse.">
        <Input type="url" value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.gg/…" />
      </Field>
      <ImageField
        label="Imagine hero"
        hint="Gol = ilustrația implicită cu orașul la apus. Nu folosi linkuri de pe Discord: expiră."
        value={heroImageUrl}
        onChange={setHeroImageUrl}
        folder="hero"
        maxWidth={1920}
      />
      <Field
        label="Google Analytics (Measurement ID)"
        hint="Din GA: Admin → Data streams → stream-ul site-ului. Gol = fără analytics și fără banner de cookie-uri."
      >
        <Input value={measurementId} onChange={(e) => setMeasurementId(e.target.value)} placeholder="G-XXXXXXXXXX" />
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
