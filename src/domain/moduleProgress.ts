import type { CurriculumTask } from '../types/curriculum';
import type { CurriculumModule } from '../types/module';
import type { TaskProgress, TaskStatus } from '../types/progress';

export type ModuleStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Blocked'
  | 'Ready for Review'
  | 'Completed'
  | 'Not Applicable';

export interface ModuleProgressSummary {
  moduleId: string;
  status: ModuleStatus;
  /** Applicable = required AND status !== 'Not Applicable'. Matches computeOverallProgress's rule. */
  totalApplicableRequired: number;
  completedRequired: number;
  percentComplete: number; // 0-100, rounded, never exceeds 100
  blockedCount: number;
  readyForReviewCount: number;
}

function statusFor(task: CurriculumTask, progressByTaskId: Map<string, TaskProgress>): TaskStatus {
  return progressByTaskId.get(task.id)?.status ?? 'Not Started';
}

/** Same "countable" rule as computeOverallProgress: required + not "Not Applicable". */
function isApplicableRequired(task: CurriculumTask, status: TaskStatus): boolean {
  return task.required && status !== 'Not Applicable';
}

/**
 * Derives a module's status/progress purely from its child tasks' current
 * progress. Modules never store their own progress — this keeps task
 * progress as the single source of truth and prevents any double counting.
 */
export function computeModuleProgress(
  module: CurriculumModule,
  tasksById: Map<string, CurriculumTask>,
  progressByTaskId: Map<string, TaskProgress>,
): ModuleProgressSummary {
  const tasks = module.taskIds.map((id) => tasksById.get(id)).filter((t): t is CurriculumTask => Boolean(t));

  let totalApplicableRequired = 0;
  let completedRequired = 0;
  let blockedCount = 0;
  let readyForReviewCount = 0;
  let anyStarted = false;
  const applicableStatuses: TaskStatus[] = [];

  for (const task of tasks) {
    const status = statusFor(task, progressByTaskId);
    if (status === 'Blocked') blockedCount += 1;
    if (status === 'Ready for Review') readyForReviewCount += 1;
    if (status !== 'Not Started' && status !== 'Not Applicable') anyStarted = true;

    if (!isApplicableRequired(task, status)) continue;
    totalApplicableRequired += 1;
    applicableStatuses.push(status);
    if (status === 'Completed') completedRequired += 1;
  }

  const percentComplete =
    totalApplicableRequired === 0 ? 0 : Math.min(100, Math.round((completedRequired / totalApplicableRequired) * 100));

  let status: ModuleStatus;
  if (totalApplicableRequired === 0) {
    status = 'Not Applicable';
  } else if (completedRequired === totalApplicableRequired) {
    status = 'Completed';
  } else if (blockedCount > 0) {
    status = 'Blocked';
  } else if (applicableStatuses.every((s) => s === 'Completed' || s === 'Ready for Review')) {
    status = 'Ready for Review';
  } else if (anyStarted) {
    status = 'In Progress';
  } else {
    status = 'Not Started';
  }

  return {
    moduleId: module.moduleId,
    status,
    totalApplicableRequired,
    completedRequired,
    percentComplete,
    blockedCount,
    readyForReviewCount,
  };
}

/**
 * Picks the next actionable task inside a module using the exact
 * deterministic priority order from the spec:
 *  1. An In Progress task
 *  2. A Ready for Review task
 *  3. A Waiting for Trainer task
 *  4. The first unblocked Not Started task
 *  5. A Blocked task only if no other actionable task exists
 * Curriculum (workbook) order is respected within each priority tier.
 */
export function computeModuleNextTask(
  module: CurriculumModule,
  tasksById: Map<string, CurriculumTask>,
  progressByTaskId: Map<string, TaskProgress>,
): CurriculumTask | null {
  const tasks = module.taskIds
    .map((id) => tasksById.get(id))
    .filter((t): t is CurriculumTask => Boolean(t))
    .sort((a, b) => a.sourceRow - b.sourceRow);

  const isUnlocked = (task: CurriculumTask): boolean =>
    task.prerequisites.length === 0 ||
    task.prerequisites.every((prereqId) => progressByTaskId.get(prereqId)?.status === 'Completed');

  const byStatus = (target: TaskStatus): CurriculumTask | undefined =>
    tasks.find((t) => statusFor(t, progressByTaskId) === target);

  const inProgress = byStatus('In Progress');
  if (inProgress) return inProgress;

  const readyForReview = byStatus('Ready for Review');
  if (readyForReview) return readyForReview;

  const waitingForTrainer = byStatus('Waiting for Trainer');
  if (waitingForTrainer) return waitingForTrainer;

  const notStarted = tasks.find((t) => statusFor(t, progressByTaskId) === 'Not Started' && isUnlocked(t));
  if (notStarted) return notStarted;

  const blocked = byStatus('Blocked');
  if (blocked) return blocked;

  return null;
}

export interface ModuleWithProgress {
  module: CurriculumModule;
  progress: ModuleProgressSummary;
  nextTask: CurriculumTask | null;
}

export function computeModulesWithProgress(
  modules: CurriculumModule[],
  tasksById: Map<string, CurriculumTask>,
  progressByTaskId: Map<string, TaskProgress>,
): ModuleWithProgress[] {
  return modules.map((module) => ({
    module,
    progress: computeModuleProgress(module, tasksById, progressByTaskId),
    nextTask: computeModuleNextTask(module, tasksById, progressByTaskId),
  }));
}
