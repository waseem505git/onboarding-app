import type { CurriculumTask, Phase, RawWorkbookRow } from '../types/curriculum';
import { buildBaseTaskId, disambiguateIds } from '../utils/idGen';

/**
 * Maps a workbook row to a learning phase. Primary driver is the workbook's
 * own category (column A section header), since that stays stable across
 * re-imports even if row numbers shift. Where a single workbook category
 * clearly spans two of the requested phases (e.g. "General" mixes
 * access/communication items with process-fundamentals items), an explicit,
 * documented title lookup refines the phase.
 *
 * "Systems installation & overview" is intentionally kept as ONE phase
 * (`systems-installation`) rather than being split between systems
 * installation and operational procedures: all 24 tool/procedure names in
 * that category are shown together so an engineer sees the complete set of
 * required systems/tools in one place. See docs/import-rules.md for the
 * full rationale and history of this decision.
 */

const WELCOME_ACCESS_TITLES = new Set(
  ['adding to relavant lists/groups', 'AGS copy'].map((t) => t.trim().toLowerCase()),
);

export function categoryDefaultPhase(category: string): Phase {
  const normalized = category.trim().toLowerCase();
  if (normalized === 'general') return 'process-defect-fundamentals';
  if (normalized.startsWith('systems installation')) return 'systems-installation';
  if (normalized.startsWith('por layers practice')) return 'por-layer-practice';
  if (normalized.startsWith('shifts training')) return 'shift-readiness-wg-exposure';
  if (normalized.startsWith('wg overview')) return 'shift-readiness-wg-exposure';
  if (normalized.startsWith('eng-') || normalized.startsWith('eng ')) return 'eng-inline-final-readiness';
  return 'process-defect-fundamentals';
}

export function assignPhase(category: string, title: string): Phase {
  const normalizedCategory = category.trim().toLowerCase();
  const normalizedTitle = title.trim().toLowerCase();
  if (normalizedCategory === 'general' && WELCOME_ACCESS_TITLES.has(normalizedTitle)) {
    return 'welcome-access-communication';
  }
  return categoryDefaultPhase(category);
}

/** Rows whose wording is preserved verbatim but flagged for human follow-up. */
function detectClarification(row: RawWorkbookRow): { needsClarification: boolean; note?: string } {
  const title = row.title.trim().toLowerCase();
  if (row.extraInstruction && /switch to\s+by/i.test(row.extraInstruction)) {
    return {
      needsClarification: true,
      note: 'Source instruction text appears to be missing a placeholder value ("Switch to ___ by ___").',
    };
  }
  if (title === 'shifts training' && !row.detail && !row.note) {
    return {
      needsClarification: true,
      note: 'Workbook lists this only as a section heading with no further detail rows.',
    };
  }
  if (row.category.trim().toLowerCase().startsWith('wg overview')) {
    return {
      needsClarification: false,
    };
  }
  return { needsClarification: false };
}

function buildDescription(row: RawWorkbookRow): string {
  const parts: string[] = [];
  if (row.title && row.detail) parts.push(row.detail);
  if (!row.title && row.detail) {
    // Detail acts as the title in these rows; nothing extra to add here.
  }
  if (row.note) parts.push(`Note: ${row.note}`);
  if (row.linkLabel) parts.push(`Reference: ${row.linkLabel}`);
  if (row.extraInstruction) parts.push(row.extraInstruction);
  return parts.join('\n');
}

function buildSourceText(row: RawWorkbookRow): string {
  const parts = [row.category, row.title, row.detail, row.note, row.linkLabel, row.extraInstruction].filter(
    Boolean,
  );
  return parts.join(' | ');
}

export function normalizeRows(rows: RawWorkbookRow[]): CurriculumTask[] {
  const sorted = [...rows].sort((a, b) => a.rowNumber - b.rowNumber);
  const baseIds = sorted.map((row) => buildBaseTaskId(row.category, row.title || `row-${row.rowNumber}`));
  const finalIds = disambiguateIds(baseIds);

  return sorted.map((row, index) => {
    const title = row.title || row.detail || row.category;
    const { needsClarification, note } = detectClarification(row);
    const categoryTrimmed = row.category.replace(/\s+/g, ' ').trim();

    const task: CurriculumTask = {
      id: finalIds[index],
      sourceRow: row.rowNumber,
      phase: assignPhase(row.category, title),
      category: categoryTrimmed,
      title,
      sourceText: buildSourceText(row),
      description: buildDescription(row),
      required: true,
      sourceHyperlink: row.linkUrl,
      prerequisites: [],
      tags: [categoryTrimmed],
      needsClarification,
      clarificationNote: note,
    };
    return task;
  });
}
