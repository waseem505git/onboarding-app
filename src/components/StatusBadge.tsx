import type { TaskStatus } from '../types/progress';

const STATUS_META: Record<TaskStatus, { className: string; icon: string }> = {
  'Not Started': { className: 'status-not-started', icon: '○' },
  'In Progress': { className: 'status-in-progress', icon: '►' },
  Blocked: { className: 'status-blocked', icon: '⛔' },
  'Waiting for Trainer': { className: 'status-waiting-for-trainer', icon: '⏳' },
  'Ready for Review': { className: 'status-ready-for-review', icon: '👁' },
  Completed: { className: 'status-completed', icon: '✔' },
  'Not Applicable': { className: 'status-not-applicable', icon: '—' },
};

/** Always renders an icon AND text, never color alone, per accessibility requirements. */
export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`status-badge ${meta.className}`}>
      <span className="badge-icon" aria-hidden="true">
        {meta.icon}
      </span>
      {status}
    </span>
  );
}
