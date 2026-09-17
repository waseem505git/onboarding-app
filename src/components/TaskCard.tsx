import type { CurriculumTask } from '../types/curriculum';
import type { TaskProgress } from '../types/progress';
import { StatusBadge } from './StatusBadge';
import { IconAlertTriangle, IconCheckCircle } from './icons';

interface TaskCardProps {
  task: CurriculumTask;
  progress: TaskProgress;
  onOpen: () => void;
}

export function TaskCard({ task, progress, onOpen }: TaskCardProps) {
  const isCompleted = progress.status === 'Completed';
  return (
    <button
      type="button"
      className={`task-card ${isCompleted ? 'completed' : ''}`}
      onClick={onOpen}
      aria-label={`${task.title}, status ${progress.status}${task.needsClarification ? ', needs clarification' : ''}`}
    >
      <div className="task-main">
        <div className="task-title">
          {isCompleted && (
            <span className="task-title-check" aria-hidden="true">
              <IconCheckCircle size={16} />
            </span>
          )}
          {task.title}
        </div>
        <div className="task-meta">
          <span className="task-meta-category">{task.category}</span>
          <span className="task-meta-dot" aria-hidden="true">
            •
          </span>
          <span>{task.required ? 'Required' : 'Optional'}</span>
          {task.needsClarification && (
            <span className="clarify-flag">
              <IconAlertTriangle size={13} /> Needs clarification
            </span>
          )}
        </div>
      </div>
      <StatusBadge status={progress.status} />
    </button>
  );
}
