import type { Phase } from './curriculum';

/**
 * A "Module" is a training section within a phase (e.g. "General",
 * "Systems installation & overview"). Modules are curriculum METADATA only:
 * they are derived from existing CurriculumTask.phase + CurriculumTask.category
 * at read time and are never persisted. This guarantees:
 *  - existing task ids are untouched
 *  - re-import can never duplicate a module
 *  - moving a task between modules can never lose its progress, because
 *    progress is keyed only by taskId, never by module.
 * See src/curriculum/modules.ts for the derivation logic and
 * docs/data-model.md for the full rationale.
 */
export type ModuleIconKey =
  | 'access'
  | 'intro'
  | 'fundamentals'
  | 'systems'
  | 'operations'
  | 'layers'
  | 'shift'
  | 'engineering'
  | 'unknown';

export interface CurriculumModule {
  /** Stable id: hash of (phaseId, title). Survives re-import as long as both are unchanged. */
  moduleId: string;
  /** Module title — the workbook's own category/section header text, verbatim. */
  title: string;
  /** Same as title before any fallback substitution; empty string if the workbook had no category text. */
  originalSourceText: string;
  /** First workbook row number that contributed a task to this module. */
  originalWorkbookRow: number;
  phaseId: Phase;
  /** Position of this module among all modules, ordered by phase then row. */
  displayOrder: number;
  iconKey: ModuleIconKey;
  /** Ordered task ids belonging to this module (curriculum order). */
  taskIds: string[];
  /** True only for the safe-fallback "Uncategorized Training" module. */
  needsClarification: boolean;
  /** Present only if the workbook's category/section header cell itself carried a hyperlink. */
  sourceHyperlink?: string;
}
