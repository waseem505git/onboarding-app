/**
 * Curriculum types describe the MASTER, workbook-derived data.
 * This data is read-only from the app's perspective (aside from re-import)
 * and must never be mutated with per-engineer progress.
 */

export type Phase =
  | 'welcome-access-communication'
  | 'intro-1274-defect-metrology'
  | 'process-defect-fundamentals'
  | 'systems-installation'
  | 'operational-procedures'
  | 'por-layer-practice'
  | 'shift-readiness-wg-exposure'
  | 'eng-inline-final-readiness';

export const PHASE_ORDER: Phase[] = [
  'welcome-access-communication',
  'intro-1274-defect-metrology',
  'process-defect-fundamentals',
  'systems-installation',
  'operational-procedures',
  'por-layer-practice',
  'shift-readiness-wg-exposure',
  'eng-inline-final-readiness',
];

export const PHASE_LABELS: Record<Phase, string> = {
  'welcome-access-communication': 'Welcome, Access & Communication',
  'intro-1274-defect-metrology': 'Introduction to 1274 Defect Metrology',
  'process-defect-fundamentals': 'Process Flow, Defect Fundamentals & Data Flow',
  'systems-installation': 'Systems Installation & Proficiency',
  'operational-procedures': 'Operational Procedures',
  'por-layer-practice': 'POR Layer Practice',
  'shift-readiness-wg-exposure': 'Shift Readiness & Working-Group Exposure',
  'eng-inline-final-readiness': 'Engineering Inline Practice & Final Readiness',
};

/** A single task derived from one meaningful workbook row. */
export interface CurriculumTask {
  /** Stable ID: survives re-import as long as category + title text are unchanged. */
  id: string;
  /** Original workbook row number this task was sourced from. */
  sourceRow: number;
  phase: Phase;
  /** Category as taken from the workbook's own section header (column A). */
  category: string;
  title: string;
  /** Raw, un-normalized text exactly as found in the workbook cell(s). */
  sourceText: string;
  description: string;
  required: boolean;
  owner?: string;
  /** Sanitized hyperlink discovered in the source workbook, if any. */
  sourceHyperlink?: string;
  prerequisites: string[];
  tags: string[];
  needsClarification: boolean;
  /** Free-form reason when needsClarification is true. */
  clarificationNote?: string;
}

export interface ImportMeta {
  /** ISO timestamp of the most recent successful import. */
  importedAt: string;
  /** Original workbook file name, for display only. */
  sourceFileName: string;
  /** Number of task rows discovered in that import. */
  taskCount: number;
  /** Simple content hash used to detect whether the workbook changed at all. */
  contentHash: string;
}

export interface RawWorkbookRow {
  rowNumber: number;
  category: string;
  title: string;
  detail: string;
  ecd: string;
  note: string;
  linkLabel: string;
  linkUrl?: string;
  extraInstruction: string;
}
