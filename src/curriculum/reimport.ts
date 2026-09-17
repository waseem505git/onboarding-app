import type { CurriculumTask } from '../types/curriculum';
import { buildModules } from './modules';

export interface ChangedTask {
  taskId: string;
  before: CurriculumTask;
  after: CurriculumTask;
  changedFields: string[];
}

export interface AmbiguousMatch {
  removed: CurriculumTask;
  addedCandidates: CurriculumTask[];
}

export interface ReimportDiff {
  added: CurriculumTask[];
  changed: ChangedTask[];
  removed: CurriculumTask[];
  unchanged: CurriculumTask[];
  ambiguous: AmbiguousMatch[];
  /** Defensive check: task ids that collide within newTasks (should never happen
   * given disambiguateIds(), but reported explicitly rather than silently ignored). */
  idConflicts: string[];
}

export interface ModuleMoveEntry {
  taskId: string;
  title: string;
  fromModuleTitle: string;
  toModuleTitle: string;
}

export interface ModuleReimportDiff {
  modulesAdded: string[];
  modulesRemoved: string[];
  modulesRenamed: { fromTitle: string; toTitle: string; phase: string }[];
  tasksMovedBetweenModules: ModuleMoveEntry[];
}

function normalizeWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  );
}

/** Jaccard similarity over normalized words — simple, dependency-free, and
 * transparent enough to explain to a human reviewer. */
function titleSimilarity(a: string, b: string): number {
  const wa = normalizeWords(a);
  const wb = normalizeWords(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let intersection = 0;
  for (const w of wa) if (wb.has(w)) intersection += 1;
  const union = new Set([...wa, ...wb]).size;
  return union === 0 ? 0 : intersection / union;
}

const AMBIGUOUS_SIMILARITY_THRESHOLD = 0.4;

const COMPARABLE_FIELDS: (keyof CurriculumTask)[] = [
  'title',
  'description',
  'sourceText',
  'category',
  'phase',
  'sourceHyperlink',
  'required',
];

/**
 * Computes what would change if `newTasks` replaced `oldTasks` as the master
 * curriculum. Nothing is applied here — this is a pure diff for review.
 */
export function computeReimportDiff(oldTasks: CurriculumTask[], newTasks: CurriculumTask[]): ReimportDiff {
  const oldById = new Map(oldTasks.map((t) => [t.id, t]));
  const newById = new Map(newTasks.map((t) => [t.id, t]));

  const added: CurriculumTask[] = [];
  const changed: ChangedTask[] = [];
  const unchanged: CurriculumTask[] = [];

  for (const newTask of newTasks) {
    const oldTask = oldById.get(newTask.id);
    if (!oldTask) {
      added.push(newTask);
      continue;
    }
    const changedFields = COMPARABLE_FIELDS.filter((field) => oldTask[field] !== newTask[field]);
    if (changedFields.length > 0) {
      changed.push({ taskId: newTask.id, before: oldTask, after: newTask, changedFields });
    } else {
      unchanged.push(newTask);
    }
  }

  const removed = oldTasks.filter((t) => !newById.has(t.id));

  const idConflicts: string[] = [];
  const seenNewIds = new Set<string>();
  for (const task of newTasks) {
    if (seenNewIds.has(task.id)) idConflicts.push(task.id);
    seenNewIds.add(task.id);
  }

  // Among truly added/removed (not matched by id), flag likely renames/moves
  // so a human can confirm before progress is silently dropped or duplicated.
  const addedForAmbiguity = new Set(added.map((t) => t.id));
  const ambiguous: AmbiguousMatch[] = [];
  for (const removedTask of removed) {
    const candidates = added
      .filter((a) => addedForAmbiguity.has(a.id))
      .map((a) => ({ task: a, score: titleSimilarity(a.title, removedTask.title) }))
      .filter((c) => c.score >= AMBIGUOUS_SIMILARITY_THRESHOLD)
      .sort((x, y) => y.score - x.score);
    if (candidates.length > 0) {
      ambiguous.push({ removed: removedTask, addedCandidates: candidates.map((c) => c.task) });
    }
  }

  return { added, changed, removed, unchanged, ambiguous, idConflicts };
}

/**
 * Computes what would change at the MODULE level between two curriculum
 * snapshots. Modules are never persisted, so this is purely informational —
 * it exists so a reviewer can see structural changes (a module renamed, a
 * task moved into a different module) before approving a re-import.
 *
 * Rename detection: a module rename changes its hash-based moduleId, so we
 * detect renames by matching old/new modules (within the same phase) that
 * carry the exact same set of task ids — anything else is a genuine
 * add/remove.
 */
export function computeModuleReimportDiff(
  oldTasks: CurriculumTask[],
  newTasks: CurriculumTask[],
): ModuleReimportDiff {
  const oldModules = buildModules(oldTasks);
  const newModules = buildModules(newTasks);

  const oldById = new Map(oldModules.map((m) => [m.moduleId, m]));
  const newById = new Map(newModules.map((m) => [m.moduleId, m]));

  const unmatchedOld = oldModules.filter((m) => !newById.has(m.moduleId));
  const unmatchedNew = newModules.filter((m) => !oldById.has(m.moduleId));

  const renamed: { fromTitle: string; toTitle: string; phase: string }[] = [];
  const renamedOldIds = new Set<string>();
  const renamedNewIds = new Set<string>();

  const taskIdSetKey = (ids: string[]) => [...ids].sort().join('|');
  for (const oldModule of unmatchedOld) {
    const oldKey = taskIdSetKey(oldModule.taskIds);
    const match = unmatchedNew.find(
      (m) => m.phaseId === oldModule.phaseId && taskIdSetKey(m.taskIds) === oldKey && !renamedNewIds.has(m.moduleId),
    );
    if (match) {
      renamed.push({ fromTitle: oldModule.title, toTitle: match.title, phase: oldModule.phaseId });
      renamedOldIds.add(oldModule.moduleId);
      renamedNewIds.add(match.moduleId);
    }
  }

  const modulesRemoved = unmatchedOld.filter((m) => !renamedOldIds.has(m.moduleId)).map((m) => m.title);
  const modulesAdded = unmatchedNew.filter((m) => !renamedNewIds.has(m.moduleId)).map((m) => m.title);

  // A task that persists (same id) but resolves to a different module is a
  // structural move. Skip moves that are purely a rename of the same module.
  const oldModuleForTask = new Map<string, string>();
  for (const module of oldModules) for (const taskId of module.taskIds) oldModuleForTask.set(taskId, module.moduleId);
  const newTaskById = new Map(newTasks.map((t) => [t.id, t]));

  const tasksMovedBetweenModules: ModuleMoveEntry[] = [];
  for (const module of newModules) {
    for (const taskId of module.taskIds) {
      const oldModuleId = oldModuleForTask.get(taskId);
      if (!oldModuleId || oldModuleId === module.moduleId) continue;
      if (renamedOldIds.has(oldModuleId) && renamedNewIds.has(module.moduleId)) continue;
      const oldModule = oldById.get(oldModuleId);
      const task = newTaskById.get(taskId);
      if (!oldModule || !task) continue;
      tasksMovedBetweenModules.push({
        taskId,
        title: task.title,
        fromModuleTitle: oldModule.title,
        toModuleTitle: module.title,
      });
    }
  }

  return { modulesAdded, modulesRemoved, modulesRenamed: renamed, tasksMovedBetweenModules };
}

/**
 * Remaps a progress key's task id when a human reviewer confirms an ambiguous
 * match refers to the same underlying task (e.g. after a workbook edit).
 */
export function resolveAmbiguousAsSameTask(
  progressTaskIds: Map<string, string>,
  removedTaskId: string,
  matchedNewTaskId: string,
): Map<string, string> {
  const next = new Map(progressTaskIds);
  next.set(removedTaskId, matchedNewTaskId);
  return next;
}
