/** "Unde suntem acum": the stage timeline and the status card. */
// Libs
import { Fragment } from 'react';
import { Check, Clock } from 'lucide-react';

// Logic
import { cn } from '@/lib/cn';
import { useTexts } from '@/hooks/useTexts';
import { buildStageViews, type StageView, type StatusStage } from '@/lib/statusProgress';

/** Props of StatusSection. */
interface Props {
  stages: StatusStage[];
  currentStage: number;
  isLoading: boolean;
  error: string | null; // shown when the timeline could not be loaded
}

/** The timeline (horizontal on wide screens, vertical on phones) above the status card. */
export function StatusSection({ stages, currentStage, isLoading, error }: Props) {
  const texts = useTexts();
  const views = buildStageViews(stages, currentStage);

  return (
    <section id="status" className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{texts['status.title']}</h2>

      {views.length > 0 ? (
        <ol className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
          {views.map((stage, index) => (
            <Fragment key={stage.position}>
              <StageItem stage={stage} />
              {index < views.length - 1 && (
                <Connector
                  isDone={views[index + 1]?.isDone ?? false}
                  hereLabel={stage.isHereAfter ? texts['status.hereMarker'] : null}
                />
              )}
            </Fragment>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">{isLoading ? 'Se încarcă…' : error}</p>
      )}

      <div className="flex gap-5 rounded-2xl border border-border border-l-4 border-l-accent bg-card p-6 sm:p-8">
        <Clock className="mt-1 size-9 shrink-0 text-accent" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          {texts['status.cardEyebrow'] && (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{texts['status.cardEyebrow']}</p>
          )}
          <h3 className="text-2xl font-extrabold sm:text-3xl">{texts['status.cardTitle']}</h3>
          <p className="text-muted-foreground">{texts['status.cardMessage']}</p>
        </div>
      </div>
      {texts['status.note'] && <p className="-mt-6 text-xs italic text-muted-foreground">{texts['status.note']}</p>}
    </section>
  );
}

// Internals

/** One stage: icon plus "01 / Title" and its caption. State is shown by icon and text, not color. */
function StageItem({ stage }: { stage: StageView }) {
  return (
    <li className="flex items-center gap-4">
      <span
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-full',
          stage.isDone ? 'bg-success text-success-foreground' : 'border-2 border-accent text-accent',
        )}
      >
        {stage.isDone ? <Check className="size-6" strokeWidth={3} aria-label="Gata" /> : <Clock className="size-6" aria-label="În așteptare" />}
      </span>
      <span className="flex flex-col">
        <span className="font-semibold">
          {stage.label} / {stage.title}
        </span>
        {stage.caption && <span className="text-sm text-muted-foreground">{stage.caption}</span>}
      </span>
    </li>
  );
}

/** The line between two stages; dashed while the next stage is pending, with the marker if any. */
function Connector({ isDone, hereLabel }: { isDone: boolean; hereLabel: string | null }) {
  return (
    <li aria-hidden={hereLabel ? undefined : true} className="relative ml-6 flex h-10 items-center md:ml-0 md:h-auto md:flex-1 md:px-4">
      <span
        className={cn(
          'h-full border-l-2 md:h-0 md:w-full md:border-l-0 md:border-t-2',
          isDone ? 'border-success' : 'border-dashed border-muted-foreground/50',
        )}
      />
      {hereLabel && (
        <span className="ml-4 rounded-md bg-primary px-2 py-1 font-mono text-xs font-bold uppercase text-primary-foreground md:absolute md:-top-10 md:left-1/2 md:ml-0 md:-translate-x-1/2">
          {hereLabel}
        </span>
      )}
    </li>
  );
}
