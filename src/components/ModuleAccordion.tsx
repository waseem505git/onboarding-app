import { useId, useState, type ReactElement } from 'react';
import type { CurriculumTask } from '../types/curriculum';
import type { CurriculumModule, ModuleIconKey } from '../types/module';
import type { ModuleProgressSummary } from '../domain/moduleProgress';
import type { TaskProgress } from '../types/progress';
import { TaskCard } from './TaskCard';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBan,
  IconBook,
  IconChevronDown,
  IconCheckCircle,
  IconCircle,
  IconClock,
  IconCpu,
  IconEye,
  IconKey,
  IconLayers,
  IconTool,
  IconUsers,
  IconWrench,
} from './icons';

const MODULE_ICONS: Record<ModuleIconKey, (props: { size?: number }) => ReactElement> = {
  access: IconKey,
  intro: IconBook,
  fundamentals: IconLayers,
  systems: IconCpu,
  operations: IconTool,
  layers: IconLayers,
  shift: IconUsers,
  engineering: IconWrench,
  unknown: IconAlertTriangle,
};

const STATUS_ICON: Record<ModuleProgressSummary['status'], (props: { size?: number }) => ReactElement> = {
  'Not Started': IconCircle,
  'In Progress': IconClock,
  Blocked: IconAlertTriangle,
  'Ready for Review': IconEye,
  Completed: IconCheckCircle,
  'Not Applicable': IconBan,
};

const STATUS_CLASS: Record<ModuleProgressSummary['status'], string> = {
  'Not Started': 'module-status-not-started',
  'In Progress': 'module-status-in-progress',
  Blocked: 'module-status-blocked',
  'Ready for Review': 'module-status-ready-for-review',
  Completed: 'module-status-completed',
  'Not Applicable': 'module-status-not-applicable',
};

interface ModuleAccordionProps {
  module: CurriculumModule;
  progress: ModuleProgressSummary;
  nextTask: CurriculumTask | null;
  tasks: CurriculumTask[];
  progressByTaskId: Map<string, TaskProgress>;
  onOpenTask: (task: CurriculumTask) => void;
  /** When true (e.g. an active search matched something inside), force-expand regardless of user toggle. */
  forceExpanded?: boolean;
}

export function ModuleAccordion({
  module,
  progress,
  nextTask,
  tasks,
  progressByTaskId,
  onOpenTask,
  forceExpanded = false,
}: ModuleAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const headingId = useId();

  const isExpanded = expanded || forceExpanded;
  const Icon = MODULE_ICONS[module.iconKey];
  const StatusIcon = STATUS_ICON[progress.status];

  const continueLabel = progress.status === 'Completed' ? 'Review Module' : 'Continue';

  return (
    <div className={`module-card ${STATUS_CLASS[progress.status]}`}>
      <div className="module-card-header">
        <button
          type="button"
          className="module-toggle"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          id={headingId}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="module-icon" aria-hidden="true">
            <Icon size={20} />
          </span>
          <span className="module-title-block">
            <span className="module-title">
              {module.title}
              {module.needsClarification && (
                <span className="badge badge-clarify" title="Needs clarification">
                  <IconAlertTriangle size={13} /> Needs clarification
                </span>
              )}
            </span>
            <span className="module-summary">
              {progress.totalApplicableRequired === 0
                ? 'No applicable required tasks'
                : `${progress.completedRequired} of ${progress.totalApplicableRequired} required tasks completed`}
            </span>
          </span>
          <span className="module-status-text">
            <StatusIcon size={16} />
            {progress.status}
          </span>
          <span className="module-chevron" data-expanded={isExpanded}>
            <IconChevronDown size={18} />
          </span>
        </button>
      </div>

      <div className="module-progress-bar" role="presentation">
        <div className="module-progress-fill" style={{ width: `${progress.percentComplete}%` }} />
      </div>

      <div className="module-meta-row">
        <span>{progress.percentComplete}%</span>
        {progress.blockedCount > 0 && <span className="module-meta-warn">{progress.blockedCount} blocked</span>}
        {progress.readyForReviewCount > 0 && (
          <span className="module-meta-info">{progress.readyForReviewCount} ready for review</span>
        )}
        {tasks.length === 0 ? (
          <span className="module-empty-note">No tasks match the current filters.</span>
        ) : nextTask ? (
          <button type="button" className="btn btn-small" onClick={() => onOpenTask(nextTask)}>
            {continueLabel} <IconArrowRight size={14} />
          </button>
        ) : (
          <span className="module-empty-note">No actionable task right now.</span>
        )}
      </div>

      {isExpanded && (
        <div id={panelId} role="region" aria-labelledby={headingId} className="module-task-list">
          {tasks.length === 0 ? (
            <div className="empty-state">This module has no tasks matching the current filters.</div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  progress={
                    progressByTaskId.get(task.id) ?? {
                      key: `pending::${task.id}`,
                      profileId: 'pending',
                      taskId: task.id,
                      status: 'Not Started',
                      notes: '',
                      history: [],
                      updatedAt: new Date().toISOString(),
                    }
                  }
                  onOpen={() => onOpenTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
