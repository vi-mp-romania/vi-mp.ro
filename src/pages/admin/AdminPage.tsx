/** The control panel: sign-in gate, then one tab per area. */
// Libs
import { KeyRound, LogOut } from 'lucide-react';
import { useState, type ReactNode } from 'react';

// Components
import { LoginForm } from './account/LoginForm';
import { Dialog } from '@/components/ui/dialog';
import { SetPasswordForm } from './account/SetPasswordForm';
import { FaqPanel } from './faq/FaqPanel';
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
import { useAuthLink } from './account/useAuthLink';

// Types
import type { SiteData } from '@/hooks/useSiteData';

// Constants
const TABS = [
  { id: 'status', label: 'Status' },
  { id: 'news', label: 'Noutăți' },
  { id: 'faq', label: 'Întrebări' },
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

/**
 * Shows the right screen for the session state; the database enforces the same rights. An emailed
 * reset or invitation link comes first: its holder must choose a password before anything else.
 */
export function AdminPage({ site }: Props) {
  const api = useApi();
  const session = useSession();
  const authLink = useAuthLink();
  const [tab, setTab] = useState<Tab>('status');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!api.isConfigured) {
    return (
      <Notice>
        Site-ul nu are o bază de date configurată. Setează VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY (vezi README).
      </Notice>
    );
  }
  if (authLink.state.kind === 'verifying') return <Notice>Se verifică linkul…</Notice>;
  if (authLink.state.kind === 'setPassword') {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-extrabold">Alege o parolă nouă</h1>
        <SetPasswordForm onDone={authLink.finish} />
      </div>
    );
  }
  if (session.kind === 'loading') return <Notice>Se încarcă…</Notice>;
  if (session.kind === 'error') return <Notice>{session.message}</Notice>;
  if (session.kind === 'signedOut') {
    return (
      <div className="px-4 py-16">
        <LoginForm notice={authLink.state.kind === 'error' ? authLink.state.message : null} />
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
            <KeyRound className="size-4" aria-hidden="true" /> Schimbă parola
          </Button>
          <Button variant="outline" size="sm" onClick={() => void api.signOut()}>
            <LogOut className="size-4" aria-hidden="true" /> Ieși
          </Button>
        </div>
      </div>
      <Dialog isOpen={isChangingPassword} title="Schimbă parola" onClose={() => setIsChangingPassword(false)}>
        {isChangingPassword && <SetPasswordForm onDone={() => setIsChangingPassword(false)} />}
      </Dialog>

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
        {tab === 'faq' && <FaqPanel />}
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
