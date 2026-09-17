import type { CurriculumTask, Phase } from '../types/curriculum';
import { categoryDefaultPhase } from './normalize';

export type RowInterpretedType = 'task' | 'fallback-module-placeholder';
export type ClassificationRationale = 'Explicit' | 'Rule-based' | 'Ambiguous';

export interface RowClassificationEntry {
  workbookRow: number;
  sourceText: string;
  interpretedType: RowInterpretedType;
  phase: Phase;
  moduleTitle: string;
  rationale: ClassificationRationale;
  warning?: string;
}

/**
 * Produces a human-auditable classification of every imported row: which
 * phase/module it was assigned to and WHY.
 *
 * This does not re-derive phase/module assignment with new logic — it
 * reports the same deterministic decision normalizeRows()/assignPhase()
 * already made, using explicit labels instead of a probabilistic confidence
 * score, per the "no probabilistic confidence numbers" rule:
 *  - Explicit:   the category's default phase mapping applied directly.
 *  - Rule-based: a documented title-lookup override changed the phase
 *                (see WELCOME_ACCESS_TITLES / OPERATIONAL_PROCEDURE_TITLES).
 *  - Ambiguous:  the row was already flagged "Needs clarification".
 *
 * Note on scope: the workbook's document-title row (row 1) and pure
 * category-header carry-forward are handled deterministically inside
 * workbookParser.ts before rows ever reach this function (see
 * docs/import-rules.md) — this report covers every row that became a task,
 * which is exactly the layer the new module hierarchy operates on.
 */
export function classifyTasks(tasks: CurriculumTask[]): RowClassificationEntry[] {
  return [...tasks]
    .sort((a, b) => a.sourceRow - b.sourceRow)
    .map((task) => {
      const isFallbackPlaceholder =
        task.needsClarification && task.title.trim().toLowerCase() === task.category.trim().toLowerCase();
      const defaultPhase = categoryDefaultPhase(task.category);
      const rationale: ClassificationRationale = task.needsClarification
        ? 'Ambiguous'
        : task.phase === defaultPhase
          ? 'Explicit'
          : 'Rule-based';
      return {
        workbookRow: task.sourceRow,
        sourceText: task.sourceText,
        interpretedType: isFallbackPlaceholder ? 'fallback-module-placeholder' : 'task',
        phase: task.phase,
        moduleTitle: task.category,
        rationale,
        warning: task.needsClarification ? (task.clarificationNote ?? 'Needs human review.') : undefined,
      };
    });
}
