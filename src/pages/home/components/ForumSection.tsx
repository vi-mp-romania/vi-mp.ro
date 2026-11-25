/** "Facem și un forum?": the forum poll beside a small concept preview. */
// Libs
import { ArrowRight, Check, GraduationCap, Layers, MessageCircle, Server } from 'lucide-react';

// Components
import { Eyebrow } from './Eyebrow';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/BrandMark';
import { VoteOutcomeMessage } from './VoteOutcomeMessage';

// Logic
import { cn } from '@/lib/cn';
import { useTexts } from '@/hooks/useTexts';

// Types
import type { Votes } from '../hooks/useVotes';

/** Props of ForumSection. */
interface Props {
  votes: Votes;
}

/** Yes is the outlined orange button, no is the quiet link-style button; both vote on "forum". */
export function ForumSection({ votes }: Props) {
  const texts = useTexts();
  const answer = votes.answers.forum;
  const isSaving = votes.outcomes.forum === 'saving';
  const previewRows = [
    { icon: GraduationCap, label: texts['forum.previewTutorials'] },
    { icon: Layers, label: texts['forum.previewProjects'] },
    { icon: Server, label: texts['forum.previewServers'] },
  ];

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="size-8 text-accent" aria-hidden="true" />
          <Eyebrow>{texts['forum.eyebrow']}</Eyebrow>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight">{texts['forum.title']}</h2>
        <p className="max-w-md text-lg text-foreground/85">{texts['forum.description']}</p>
        <div className="flex flex-col items-start gap-3 pt-2">
          <Button
            variant={answer === 'yes' ? 'primary' : 'accent'}
            size="lg"
            aria-pressed={answer === 'yes'}
            disabled={isSaving}
            onClick={() => votes.vote('forum', 'yes')}
            className="min-w-64"
          >
            {answer === 'yes' && <Check className="size-5" aria-hidden="true" />}
            {texts['forum.yes']}
          </Button>
          <button
            type="button"
            aria-pressed={answer === 'no'}
            disabled={isSaving}
            onClick={() => votes.vote('forum', 'no')}
            className={cn('inline-flex items-center gap-1.5 text-sm underline underline-offset-4', answer === 'no' ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground')}
          >
            {answer === 'no' && <Check className="size-4" aria-hidden="true" />}
            {texts['forum.no']}
          </button>
          <VoteOutcomeMessage outcome={votes.outcomes.forum} />
        </div>
      </div>

      <div aria-hidden="true" className="mx-auto w-full max-w-md -rotate-3 rounded-2xl border border-primary/60 bg-card p-5 shadow-[0_0_40px_-10px] shadow-primary/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark className="h-6 w-9" />
            <span className="h-5 w-px bg-border" />
            <span className="font-semibold">{texts['forum.previewTitle']}</span>
          </div>
          <span className="rounded-md border border-accent px-2 py-0.5 text-xs text-accent">{texts['forum.previewBadge']}</span>
        </div>
        <ul className="flex flex-col gap-3">
          {previewRows.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card-strong px-4 py-3">
              <Icon className="size-5 text-primary" />
              <span className="flex-1 font-medium">{label}</span>
              <ArrowRight className="size-4" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
