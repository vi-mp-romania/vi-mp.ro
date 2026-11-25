/** Works out how the "Unde suntem acum" timeline draws each stage. */

/** A timeline stage as stored in public.status_stages. */
export interface StatusStage {
  position: number;
  title: string;
  caption: string;
}

/** A stage with its display state. */
export interface StageView extends StatusStage {
  /** Number shown before the title ("01"). */
  label: string;
  isDone: boolean;
  /** True for the connector after this stage that carries the "we are here" marker. */
  isHereAfter: boolean;
}

/**
 * Orders stages by position and marks the first `currentStage` of them done. The "we are here"
 * marker sits on the connector after the last done stage; with nothing done or everything done
 * there is no connector to mark, so no stage carries it.
 */
export function buildStageViews(stages: readonly StatusStage[], currentStage: number): StageView[] {
  const ordered = [...stages].sort((a, b) => a.position - b.position);
  const doneCount = Math.max(0, Math.min(currentStage, ordered.length));
  return ordered.map((stage, index) => ({
    ...stage,
    label: String(index + 1).padStart(2, '0'),
    isDone: index < doneCount,
    isHereAfter: doneCount > 0 && doneCount < ordered.length && index === doneCount - 1,
  }));
}
