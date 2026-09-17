import type { Phase } from '../types/curriculum';
import type { PhaseProgressSummary } from '../domain/progressCalculations';
import { IconCheckCircle } from './icons';

interface OnboardingTimelineProps {
  byPhase: PhaseProgressSummary[];
  labels: Record<Phase, string>;
  currentPhase: Phase | null;
}

/** Compact horizontal stepper showing every phase's completion state in order. */
export function OnboardingTimeline({ byPhase, labels, currentPhase }: OnboardingTimelineProps) {
  return (
    <div className="onboarding-timeline" role="list" aria-label="Onboarding timeline">
      {byPhase.map((p) => {
        const isDone = p.totalRequired > 0 && p.completedRequired === p.totalRequired;
        const isCurrent = p.phase === currentPhase;
        const state = isDone ? 'done' : isCurrent ? 'current' : 'upcoming';
        return (
          <div key={p.phase} role="listitem" className={`timeline-node ${state}`}>
            <div className="timeline-node-dot" aria-hidden="true">
              {isDone ? <IconCheckCircle size={14} /> : null}
            </div>
            <div className="timeline-node-label">{labels[p.phase]}</div>
            <div className="timeline-node-percent">{p.totalRequired > 0 ? `${p.percentComplete}%` : 'n/a'}</div>
          </div>
        );
      })}
    </div>
  );
}
