/** Vote totals with a reset per poll. */
// Libs
import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { PanelCard } from '../components/PanelCard';
import { ActionMessage } from '../components/ActionMessage';
import { VoteTallyList } from '@/components/VoteTallyList';

// Logic
import { useApi } from '@/api/ApiContext';
import { useAction } from '../hooks/useAction';
import { useVoteTally } from '@/hooks/useVoteTally';

// Types
import type { PollKey } from '@/lib/polls';

/** Loads totals on open; reset asks for confirmation, then reloads. */
export function VotesPanel() {
  const api = useApi();
  const action = useAction();
  const { tally, error, load } = useVoteTally();

  // Lifecycle
  useEffect(load, [load]);

  // Actions
  const reset = async (poll: PollKey) => {
    if (!window.confirm('Ștergi toate voturile pentru această întrebare? Acțiunea nu poate fi anulată.')) return;
    if (await action.run(() => api.resetVotes(poll), 'Voturile au fost șterse.')) load();
  };

  return (
    <PanelCard
      title="Voturi"
      description="Un vot pe browser și întrebare; cine își golește datele browserului poate vota din nou."
    >
      {error && <p className="text-sm text-danger">{error}</p>}
      {tally && (
        <VoteTallyList
          tally={tally}
          renderAction={(poll) => (
            <Button variant="danger" size="sm" disabled={action.isBusy} onClick={() => void reset(poll)}>
              <RotateCcw className="size-4" aria-hidden="true" /> Resetează
            </Button>
          )}
        />
      )}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={load}>
          Reîncarcă
        </Button>
        <ActionMessage outcome={action.outcome} />
      </div>
    </PanelCard>
  );
}
