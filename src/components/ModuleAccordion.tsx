import { useEffect, useId, useState, type ReactElement } from 'react';
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

const EXPANDED_STORAGE_PREFIX = 'defmet.moduleExpanded.';

/** Reads the user's last-chosen expand/collapse preference for this module
 * from localStorage. Defaults to collapsed (false) the first time a module
 * is ever seen, or if storage is unavailable (e.g. private browsing). */
function readStoredExpanded(moduleId: string): boolean {
  try {
    return window.localStorage.getItem(EXPANDED_STORAGE_PREFIX + moduleId) === '1';
  } catch {
    return false;
  }
}

function writeStoredExpanded(moduleId: string, value: boolean): void {
  try {
    window.localStorage.setItem(EXPANDED_STORAGE_PREFIX + moduleId, value ? '1' : '0');
  } catch {
    // Storage unavailable — expand/collapse still works for this session, it just won't persist.
  }
}

interface ModuleAccordionProps {
  module: CurriculumModule;
  progress: ModuleProgressSummary;
  nextTask: CurriculumTask | null;
  tasks: CurriculumTask[];
  progressByTaskId: Map<string, TaskProgress>;
  onOpenTask: (task: CurriculumTask) => void;
  /** When true (e.g. an active search matched something inside), force-expand regardless of user toggle. */
  forceExpanded?: boolean;
  /** True while the task drawer is open for a task that belongs to this module — auto-expands it once,
   * without fighting a subsequent manual collapse by the user. */
  containsOpenTask?: boolean;
}

export function ModuleAccordion({
  module,
  progress,
  nextTask,
  tasks,
  progressByTaskId,
  onOpenTask,
  forceExpanded = false,
  containsOpenTask = false,
}: ModuleAccordionProps) {
  const [expanded, setExpanded] = useState(() => readStoredExpanded(module.moduleId));
  const panelId = useId();
  const headingId = useId();

  // Auto-expand the module the moment it starts containing the open task
  // (e.g. the engineer opened a task from the dashboard's "Next Mission").
  // This only fires on that transition — it never re-forces the module open
  // after the user has explicitly collapsed it again while the same task
  // drawer is still open.
  useEffect(() => {
    if (containsOpenTask) setExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containsOpenTask]);

  function toggleExpanded() {
    setExpanded((v) => {
      const next = !v;
      writeStoredExpanded(module.moduleId, next);
      return next;
    });
  }

  const isExpanded = expanded || forceExpanded;
  const Icon = MODULE_ICONS[module.iconKey];
  const StatusIcon = STATUS_ICON[progress.status];

  const continueLabel = progress.status === 'Completed' ? 'Review Module' : 'Continue';
  // A module can have zero tasks at all (truly empty) vs. simply having none
  // of its tasks currently visible under an active filter — these need
  // different, non-alarming messaging rather than a disabled control.
  const moduleHasNoTasksAtAll = module.taskIds.length === 0;

  return (
    <div className={`module-card ${STATUS_CLASS[progress.status]}`}>
      <div className="module-card-header">
        <button
          type="button"
          className="module-toggle"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          id={headingId}
          onClick={toggleExpanded}
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
        {moduleHasNoTasksAtAll ? (
          <span className="module-empty-note">No missions are currently assigned to this module.</span>
        ) : tasks.length === 0 ? (
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
          {moduleHasNoTasksAtAll ? (
            <div className="empty-state">No missions are currently assigned to this module.</div>
          ) : tasks.length === 0 ? (
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
