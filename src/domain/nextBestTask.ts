import type { CurriculumTask } from '../types/curriculum';
import { PHASE_ORDER } from '../types/curriculum';
import type { TaskProgress, TaskStatus } from '../types/progress';

const ACTIONABLE_STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Blocked', 'Waiting for Trainer'];

function isUnlocked(task: CurriculumTask, progressByTaskId: Map<string, TaskProgress>): boolean {
  if (task.prerequisites.length === 0) return true;
  return task.prerequisites.every((prereqId) => progressByTaskId.get(prereqId)?.status === 'Completed');
}

/**
 * Recommends the next task to work on using only curriculum phase order,
 * declared prerequisites, and current status — never an AI competence
 * judgement. Preference order: an already-started task, then the earliest
 * not-started unlocked task, walking phases in curriculum order.
 */
export function computeNextBestTask(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
): CurriculumTask | null {
  const byPhase = new Map<string, CurriculumTask[]>();
  for (const phase of PHASE_ORDER) {
    byPhase.set(
      phase,
      tasks.filter((t) => t.phase === phase).sort((a, b) => a.sourceRow - b.sourceRow),
    );
  }

  // Prefer resuming an in-progress task, in phase order.
  for (const phase of PHASE_ORDER) {
    const inProgress = (byPhase.get(phase) ?? []).find(
      (t) => progressByTaskId.get(t.id)?.status === 'In Progress',
    );
    if (inProgress) return inProgress;
  }

  // Otherwise the earliest unlocked, not-yet-completed required task.
  for (const phase of PHASE_ORDER) {
    const candidate = (byPhase.get(phase) ?? []).find((t) => {
      const status = progressByTaskId.get(t.id)?.status ?? 'Not Started';
      if (status === 'Completed' || status === 'Not Applicable') return false;
      if (!ACTIONABLE_STATUSES.includes(status)) return false;
      return isUnlocked(t, progressByTaskId);
    });
    if (candidate) return candidate;
  }

  return null;
}
