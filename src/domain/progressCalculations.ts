import type { CurriculumTask, Phase } from '../types/curriculum';
import { PHASE_ORDER } from '../types/curriculum';
import type { TaskProgress, TaskStatus } from '../types/progress';

export interface ProgressSummary {
  totalRequired: number;
  completedRequired: number;
  percentComplete: number; // 0-100, rounded, never exceeds 100
}

export interface PhaseProgressSummary extends ProgressSummary {
  phase: Phase;
}

function statusFor(task: CurriculumTask, progressByTaskId: Map<string, TaskProgress>): TaskStatus {
  return progressByTaskId.get(task.id)?.status ?? 'Not Started';
}

/** Not Applicable tasks never count toward either side of the fraction. */
function isCountable(task: CurriculumTask, status: TaskStatus): boolean {
  return task.required && status !== 'Not Applicable';
}

export function computeOverallProgress(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
): ProgressSummary {
  let total = 0;
  let completed = 0;
  for (const task of tasks) {
    const status = statusFor(task, progressByTaskId);
    if (!isCountable(task, status)) continue;
    total += 1;
    if (status === 'Completed') completed += 1;
  }
  const percentComplete = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
  return { totalRequired: total, completedRequired: completed, percentComplete };
}

export function computeProgressByPhase(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
): PhaseProgressSummary[] {
  return PHASE_ORDER.map((phase) => {
    const phaseTasks = tasks.filter((t) => t.phase === phase);
    const summary = computeOverallProgress(phaseTasks, progressByTaskId);
    return { phase, ...summary };
  });
}

/** The first phase (in curriculum order) that still has incomplete required work. */
export function computeCurrentPhase(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
): Phase | null {
  const byPhase = computeProgressByPhase(tasks, progressByTaskId);
  const inProgress = byPhase.find((p) => p.totalRequired > 0 && p.completedRequired < p.totalRequired);
  if (inProgress) return inProgress.phase;
  const anyWithTasks = byPhase.find((p) => p.totalRequired > 0);
  return anyWithTasks ? anyWithTasks.phase : null;
}

export function getBlockedTasks(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
): CurriculumTask[] {
  return tasks.filter((t) => statusFor(t, progressByTaskId) === 'Blocked');
}

export function getTasksWaitingForTrainer(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
): CurriculumTask[] {
  return tasks.filter((t) => statusFor(t, progressByTaskId) === 'Waiting for Trainer');
}

export function getRecentlyCompleted(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
  limit = 5,
): { task: CurriculumTask; progress: TaskProgress }[] {
  const completed = tasks
    .map((task) => ({ task, progress: progressByTaskId.get(task.id) }))
    .filter((entry): entry is { task: CurriculumTask; progress: TaskProgress } =>
      Boolean(entry.progress && entry.progress.status === 'Completed' && entry.progress.completionDate),
    )
    .sort((a, b) => (b.progress.completionDate! > a.progress.completionDate! ? 1 : -1));
  return completed.slice(0, limit);
}
