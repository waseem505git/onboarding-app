import { describe, expect, it } from 'vitest';
import { normalizeRows, assignPhase } from './normalize';
import type { RawWorkbookRow } from '../types/curriculum';

function row(partial: Partial<RawWorkbookRow> & { rowNumber: number }): RawWorkbookRow {
  return {
    category: 'General',
    title: '',
    detail: '',
    ecd: '',
    note: '',
    linkLabel: '',
    linkUrl: undefined,
    extraInstruction: '',
    ...partial,
  };
}

describe('normalizeRows', () => {
  it('produces one task per meaningful row and never drops rows', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 2, category: 'General', title: 'adding to relavant lists/groups' }),
      row({ rowNumber: 3, category: 'General', title: 'AGS copy' }),
      row({ rowNumber: 4, category: 'General', title: 'PD Process flow and defects' }),
    ];
    const tasks = normalizeRows(rows);
    expect(tasks).toHaveLength(3);
    expect(tasks.map((t) => t.sourceRow)).toEqual([2, 3, 4]);
  });

  it('gives duplicate labels different stable ids', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 10, category: 'Systems installation & overview', title: 'RFC' }),
      row({ rowNumber: 20, category: 'Systems installation & overview', title: 'RFC' }),
    ];
    const tasks = normalizeRows(rows);
    expect(tasks[0].id).not.toBe(tasks[1].id);
    expect(tasks[1].id).toBe(`${tasks[0].id}-2`);
  });

  it('produces the same id for the same category+title across two parses (stability)', () => {
    const rows: RawWorkbookRow[] = [row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' })];
    const idsFirstPass = normalizeRows(rows).map((t) => t.id);
    const idsSecondPass = normalizeRows(rows).map((t) => t.id);
    expect(idsFirstPass).toEqual(idsSecondPass);
  });

  it('preserves original wording and flags unclear rows instead of dropping them', () => {
    const rows: RawWorkbookRow[] = [
      row({
        rowNumber: 2,
        category: 'General',
        title: 'adding to relavant lists/groups',
        extraInstruction: 'Switch to  by  "owner"  and look for:  manager',
      }),
    ];
    const tasks = normalizeRows(rows);
    expect(tasks[0].needsClarification).toBe(true);
    expect(tasks[0].sourceText).toContain('Switch to  by  "owner"');
  });

  it('falls back to detail/category as title when the row has no explicit title', () => {
    const rows: RawWorkbookRow[] = [row({ rowNumber: 44, category: 'WG Overview & tool menagerie', title: '', detail: '# of tools, Chambers' })];
    const tasks = normalizeRows(rows);
    expect(tasks[0].title).toBe('# of tools, Chambers');
  });
});

describe('assignPhase', () => {
  it('splits the General category into welcome/access vs process fundamentals', () => {
    expect(assignPhase('General', 'adding to relavant lists/groups')).toBe('welcome-access-communication');
    expect(assignPhase('General', 'AGS copy')).toBe('welcome-access-communication');
    expect(assignPhase('General', 'NCDD/ EDI calculation')).toBe('process-defect-fundamentals');
  });

  it('keeps all Systems installation & overview tools/procedures in one phase', () => {
    expect(assignPhase('Systems installation & overview', 'ICE')).toBe('systems-installation');
    expect(assignPhase('Systems installation & overview', 'Excursion')).toBe('systems-installation');
    expect(assignPhase('Systems installation & overview', 'Tracer report')).toBe('systems-installation');
  });

  it('maps POR layer, shift, WG, and inline categories directly', () => {
    expect(assignPhase('POR layers Practice \n(relevant to each layer)', 'STRFC')).toBe('por-layer-practice');
    expect(assignPhase('Shifts training', 'Shifts training')).toBe('shift-readiness-wg-exposure');
    expect(assignPhase('WG Overview & tool menagerie', '# of tools, Chambers')).toBe('shift-readiness-wg-exposure');
    expect(assignPhase('ENG- Inline layers Practice', 'Cassification/DOI')).toBe('eng-inline-final-readiness');
  });
});
