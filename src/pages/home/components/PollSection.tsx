/** "Te bagi când apare multiplayerul?": the play and develop polls. */
// Libs
import { ChartNoAxesColumn, CodeXml, Gamepad2, ArrowUpRight, type LucideIcon } from 'lucide-react';

// Components
import { Eyebrow } from './Eyebrow';
import { Button } from '@/components/ui/button';
import { VoteOutcomeMessage } from './VoteOutcomeMessage';

// Logic
import { useTexts } from '@/hooks/useTexts';
import { POLL_ANSWERS, type PollKey } from '@/lib/polls';

// Types
import type { Votes } from '../hooks/useVotes';
import type { TextKey } from '@/lib/textRegistry';

// Constants
/** The two rows of this section. */
const ROWS: readonly { poll: PollKey; icon: LucideIcon; question: TextKey; hint: TextKey }[] = [
  { poll: 'play', icon: Gamepad2, question: 'polls.playQuestion', hint: 'polls.playHint' },
  { poll: 'develop', icon: CodeXml, question: 'polls.developQuestion', hint: 'polls.developHint' },
];

/** Props of PollSection. */
interface Props {
  votes: Votes;
  onShowResults: () => void;
}

/** Poll rows with Da/Nu toggles; the chosen answer is filled and marked aria-pressed. */
export function PollSection({ votes, onShowResults }: Props) {
  const texts = useTexts();

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <Eyebrow>{texts['polls.eyebrow']}</Eyebrow>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{texts['polls.title']}</h2>
        <p className="text-muted-foreground">{texts['polls.subtitle']}</p>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {ROWS.map(({ poll, icon: Icon, question, hint }) => (
          <div key={poll} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-5">
              <Icon className="size-10 shrink-0 text-primary" aria-hidden="true" />
              <span className="h-10 w-px bg-border" aria-hidden="true" />
              <div className="flex flex-col">
                <h3 className="font-bold sm:text-lg">{texts[question]}</h3>
                <p className="text-sm text-muted-foreground">{texts[hint]}</p>
                <VoteOutcomeMessage outcome={votes.outcomes[poll]} />
              </div>
            </div>
            <div className="flex gap-3" role="group" aria-label={texts[question]}>
              {POLL_ANSWERS.map((answer) => {
                const isChosen = votes.answers[poll] === answer;
                return (
                  <Button
                    key={answer}
                    variant={isChosen ? 'primary' : 'outline'}
                    aria-pressed={isChosen}
                    disabled={votes.outcomes[poll] === 'saving'}
                    onClick={() => votes.vote(poll, answer)}
                    className="w-24"
                  >
                    {texts[answer === 'yes' ? 'polls.yes' : 'polls.no']}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-xs italic text-muted-foreground">{texts['polls.note']}</p>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button variant="accent" size="lg" onClick={onShowResults}>
            <ChartNoAxesColumn className="size-5" aria-hidden="true" />
            {texts['polls.resultsButton']}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
          <p className="text-xs italic text-muted-foreground">{texts['polls.resultsNote']}</p>
        </div>
      </div>
    </section>
  );
}
