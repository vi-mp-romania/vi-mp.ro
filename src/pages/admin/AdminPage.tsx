/** The control panel: sign-in gate, then one tab per area. */
// Libs
import { LogOut } from 'lucide-react';
import { useState, type ReactNode } from 'react';

// Components
import { LoginForm } from './LoginForm';
import { NewsPanel } from './news/NewsPanel';
import { TextsPanel } from './texts/TextsPanel';
import { VotesPanel } from './votes/VotesPanel';
import { StatusPanel } from './status/StatusPanel';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from './settings/SettingsPanel';

// Logic
import { cn } from '@/lib/cn';
import { useApi } from '@/api/ApiContext';
import { useSession } from './hooks/useSession';

// Types
import type { SiteData } from '@/hooks/useSiteData';

// Constants
const TABS = [
  { id: 'status', label: 'Status' },
  { id: 'news', label: 'Noutăți' },
  { id: 'texts', label: 'Texte' },
  { id: 'settings', label: 'Setări' },
  { id: 'votes', label: 'Voturi' },
] as const;

/** A control panel tab. */
type Tab = (typeof TABS)[number]['id'];

/** Props of AdminPage. */
interface Props {
  site: SiteData; // app-wide data; panels reload it after saving so the site updates at once
}

/** Shows the right screen for the session state; the database enforces the same rights. */
export function AdminPage({ site }: Props) {
  const api = useApi();
  const session = useSession();
  const [tab, setTab] = useState<Tab>('status');

  if (!api.isConfigured) {
    return (
      <Notice>
        Site-ul nu are o bază de date configurată. Setează VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY (vezi README).
      </Notice>
    );
  }
  if (session.kind === 'loading') return <Notice>Se încarcă…</Notice>;
  if (session.kind === 'error') return <Notice>{session.message}</Notice>;
  if (session.kind === 'signedOut') {
    return (
      <div className="px-4 py-16">
        <LoginForm />
      </div>
    );
  }
  if (session.kind === 'notAdmin') {
    return (
      <Notice>
        Contul {session.email} nu are drepturi de administrator.{' '}
        <button type="button" className="underline" onClick={() => void api.signOut()}>
          Ieși
        </button>
      </Notice>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Panou de control</h1>
          <p className="text-sm text-muted-foreground">{session.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void api.signOut()}>
          <LogOut className="size-4" aria-hidden="true" /> Ieși
        </Button>
      </div>

      <div role="tablist" aria-label="Secțiuni" className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-semibold whitespace-nowrap',
              tab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'status' && <StatusPanel site={site} />}
        {tab === 'news' && <NewsPanel />}
        {tab === 'texts' && <TextsPanel site={site} />}
        {tab === 'settings' && <SettingsPanel site={site} />}
        {tab === 'votes' && <VotesPanel />}
      </div>
    </div>
  );
}

// Internals

/** A centered message instead of the panel. */
function Notice({ children }: { children: ReactNode }) {
  return <p className="mx-auto max-w-md px-4 py-20 text-center text-muted-foreground">{children}</p>;
}
