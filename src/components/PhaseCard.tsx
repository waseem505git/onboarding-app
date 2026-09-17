import type { PhaseProgressSummary } from '../domain/progressCalculations';
import { ProgressBar } from './ProgressBar';
import { IconCheckCircle, IconFlag, IconClock, IconArrowRight } from './icons';

interface PhaseCardProps {
  label: string;
  summary: PhaseProgressSummary;
  isCurrent: boolean;
  onContinue: () => void;
  canContinue: boolean;
  /** Total modules in this phase, if known. */
  moduleCount?: number;
  /** Modules whose derived status is "Completed". */
  completedModuleCount?: number;
}

export function PhaseCard({
  label,
  summary,
  isCurrent,
  onContinue,
  canContinue,
  moduleCount,
  completedModuleCount,
}: PhaseCardProps) {
  const isDone = summary.totalRequired > 0 && summary.completedRequired === summary.totalRequired;
  const stateLabel = isDone ? 'Completed' : isCurrent ? 'In progress' : summary.totalRequired === 0 ? 'No missions' : 'Upcoming';

  return (
    <div className={`phase-card ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}>
      <div className="phase-card-header">
        <span className={`phase-card-icon ${isDone ? 'done' : isCurrent ? 'current' : ''}`} aria-hidden="true">
          {isDone ? <IconCheckCircle size={18} /> : isCurrent ? <IconFlag size={18} /> : <IconClock size={18} />}
        </span>
        <h3>{label}</h3>
      </div>
      <div className="phase-card-state">{stateLabel}</div>
      <ProgressBar percent={summary.percentComplete} label={`${label} progress`} />
      <div className="phase-card-meta">
        <span>
          {summary.completedRequired}/{summary.totalRequired} missions
        </span>
        <span>{summary.totalRequired > 0 ? `${summary.percentComplete}%` : 'N/A'}</span>
      </div>
      {typeof moduleCount === 'number' && moduleCount > 0 && (
        <div className="phase-card-meta">
          <span>
            {completedModuleCount ?? 0}/{moduleCount} modules completed
          </span>
        </div>
      )}
      <button type="button" className="btn phase-card-continue" onClick={onContinue} disabled={!canContinue}>
        Continue <IconArrowRight size={15} />
      </button>
    </div>
  );
}
