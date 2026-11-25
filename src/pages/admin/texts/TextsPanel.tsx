/** Edits every text of the site, grouped by section. */
// Libs
import { useEffect, useState } from 'react';

// Components
import { TextRow } from './TextRow';
import { PanelCard } from '../components/PanelCard';

// Logic
import { errorMessage } from '@/lib/errorMessage';
import { useApi } from '@/api/ApiContext';
import { TEXT_KEYS, TEXT_REGISTRY, TEXT_SECTIONS, type TextSection } from '@/lib/textRegistry';

// Types
import type { SiteData } from '@/hooks/useSiteData';

/** Props of TextsPanel. */
interface Props {
  site: SiteData;
}

/**
 * The form is built from the text registry, so a new text appears here without panel changes.
 * It reads the overrides itself to know which texts differ from their default.
 */
export function TextsPanel({ site }: Props) {
  const api = useApi();

  // State
  const [overriddenKeys, setOverriddenKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Lifecycle: reload the override list whenever the site texts reload (after a save).
  useEffect(() => {
    api
      .listTextOverrides()
      .then((overrides) => setOverriddenKeys(new Set(overrides.map((override) => override.key))))
      .catch((failure: unknown) => setError(errorMessage(failure)));
  }, [api, site.texts]);

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {(Object.keys(TEXT_SECTIONS) as TextSection[]).map((section) => (
        <PanelCard key={section} title={TEXT_SECTIONS[section]}>
          {TEXT_KEYS.filter((key) => TEXT_REGISTRY[key].section === section).map((key) => (
            <TextRow
              key={key}
              textKey={key}
              value={site.texts[key]}
              isOverridden={overriddenKeys.has(key)}
              onSaved={site.reload}
            />
          ))}
        </PanelCard>
      ))}
    </div>
  );
}
