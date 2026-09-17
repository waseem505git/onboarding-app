import type { TaskProgress, TaskStatus } from '../types/progress';

export interface TransitionResult {
  progress: TaskProgress;
}

/** Applies a status change, recording history and completion/reopen timestamps.
 * This never evaluates competence — it only records a workflow state change
 * the engineer or trainer explicitly requested. */
export function applyStatusChange(
  current: TaskProgress,
  nextStatus: TaskStatus,
  options: { reopenReason?: string; note?: string } = {},
): TransitionResult {
  const now = new Date().toISOString();
  const fromStatus = current.status;

  const updated: TaskProgress = {
    ...current,
    status: nextStatus,
    updatedAt: now,
    history: [
      ...current.history,
      { timestamp: now, fromStatus, toStatus: nextStatus, note: options.note },
    ],
  };

  if (nextStatus === 'Completed') {
    updated.completionDate = now;
  } else if (fromStatus === 'Completed') {
    // Reopening a completed task requires a reason and clears the completion date.
    updated.completionDate = undefined;
    updated.reopenReason = options.reopenReason;
  }

  return { progress: updated };
}

export function canReopen(progress: TaskProgress): boolean {
  return progress.status === 'Completed';
}

export function undoLastTransition(current: TaskProgress): TaskProgress {
  if (current.history.length === 0) return current;
  const history = current.history.slice(0, -1);
  const previous = history[history.length - 1];
  const restoredStatus: TaskStatus = previous ? previous.toStatus : 'Not Started';
  return {
    ...current,
    status: restoredStatus,
    completionDate: restoredStatus === 'Completed' ? current.completionDate : undefined,
    updatedAt: new Date().toISOString(),
    history,
  };
}
