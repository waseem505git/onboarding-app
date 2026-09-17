import ExcelJS from 'exceljs';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import type { RawWorkbookRow } from '../types/curriculum';

/** Extracts plain, sanitized text from any ExcelJS cell value shape
 * (string, number, rich text, formula result, hyperlink object). Never
 * evaluates formulas or renders embedded HTML — always returns plain text. */
function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return sanitizeText(value);
  }
  if (value instanceof Date) return sanitizeText(value.toISOString());
  if (typeof value === 'object') {
    // Rich text: { richText: [{ text }, ...] }
    if ('richText' in value && Array.isArray((value as { richText?: unknown[] }).richText)) {
      const parts = (value as { richText: { text: string }[] }).richText;
      return sanitizeText(parts.map((p) => p.text).join(''));
    }
    // Hyperlink-with-text: { text, hyperlink }
    if ('text' in value) {
      const text = (value as { text: unknown }).text;
      return cellText(text as ExcelJS.CellValue);
    }
    // Formula result: { formula, result }
    if ('result' in value) {
      return cellText((value as { result: ExcelJS.CellValue }).result);
    }
  }
  return sanitizeText(String(value));
}

function cellHyperlink(cell: ExcelJS.Cell): string | undefined {
  if (cell.hyperlink) return sanitizeUrl(cell.hyperlink);
  const value = cell.value;
  if (value && typeof value === 'object' && 'hyperlink' in value) {
    return sanitizeUrl((value as { hyperlink: unknown }).hyperlink);
  }
  return undefined;
}

export interface ParsedWorkbook {
  sourceFileName: string;
  rows: RawWorkbookRow[];
  /** Simple content fingerprint to detect whether the workbook changed at all. */
  contentHash: string;
}

/**
 * Parses the onboarding workbook into raw rows. This is intentionally "dumb":
 * it does not decide phases or task meaning — see curriculum/normalize.ts for
 * that. It only reads cell text/links safely and carries forward merged
 * category headers (column A).
 */
export async function parseWorkbook(
  file: File | ArrayBuffer,
  sourceFileName: string,
): Promise<ParsedWorkbook> {
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('The workbook has no worksheets.');
  }

  const rows: RawWorkbookRow[] = [];
  let carriedCategory = '';
  const categoryFirstRow = new Map<string, number>();
  const categoriesWithContent = new Set<string>();

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const a = cellText(row.getCell(1).value);
    const b = cellText(row.getCell(2).value);
    const c = cellText(row.getCell(3).value);
    const d = cellText(row.getCell(4).value);
    const e = cellText(row.getCell(5).value);
    const fCell = row.getCell(6);
    const f = cellText(fCell.value);
    const fLink = cellHyperlink(fCell);
    const g = cellText(row.getCell(7).value);

    if (a) carriedCategory = a;

    // Row 1 is the document title row (category === title), not a task.
    const isTitleRow = rowNumber === 1 && a === b;
    if (isTitleRow) return;

    const category = carriedCategory || a || 'General';
    if (!categoryFirstRow.has(category)) categoryFirstRow.set(category, rowNumber);

    // A row with no title/detail/note/link/instruction anywhere carries no
    // meaningful stand-alone task content for THIS row (e.g. it only repeats
    // the merged category header). Such rows are skipped here, but if an
    // entire category never has a content row (see below), the category
    // header itself becomes a single synthetic task so it is never lost.
    const hasAnyContent = Boolean(b || c || d || e || f || g);
    if (!hasAnyContent) return;

    categoriesWithContent.add(category);
    rows.push({
      rowNumber,
      category,
      title: b,
      detail: c,
      ecd: d,
      note: e,
      linkLabel: f,
      linkUrl: fLink,
      extraInstruction: g,
    });
  });

  // Preserve category-header-only rows (e.g. "Shifts training") as their own task.
  for (const [category, rowNumber] of categoryFirstRow.entries()) {
    if (categoriesWithContent.has(category)) continue;
    rows.push({
      rowNumber,
      category,
      title: category,
      detail: '',
      ecd: '',
      note: '',
      linkLabel: '',
      linkUrl: undefined,
      extraInstruction: '',
    });
  }
  rows.sort((r1, r2) => r1.rowNumber - r2.rowNumber);

  const contentHash = await computeContentHash(rows);
  return { sourceFileName, rows, contentHash };
}

async function computeContentHash(rows: RawWorkbookRow[]): Promise<string> {
  const serialized = JSON.stringify(
    rows.map((r) => [r.rowNumber, r.category, r.title, r.detail, r.note, r.linkUrl, r.extraInstruction]),
  );
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(serialized);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback (non-browser test environments without WebCrypto).
  let h = 0;
  for (let i = 0; i < serialized.length; i++) {
    h = (Math.imul(31, h) + serialized.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16);
}
