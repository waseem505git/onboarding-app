import { describe, expect, it } from 'vitest';
import { normalizeRows } from './normalize';
import { buildModules, groupModulesByPhase, UNCATEGORIZED_MODULE_TITLE } from './modules';
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

describe('buildModules', () => {
  it('does not import module-header category text itself as a task', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 2, category: 'General', title: 'adding to relavant lists/groups' }),
      row({ rowNumber: 4, category: 'General', title: 'PD Process flow and defects' }),
    ];
    const tasks = normalizeRows(rows);
    // No task's own title is literally the category/module header text.
    expect(tasks.every((t) => t.title.trim().toLowerCase() !== 'general')).toBe(true);
  });

  it('splits a category that spans two phases into two distinct modules, one per phase', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 2, category: 'General', title: 'adding to relavant lists/groups' }),
      row({ rowNumber: 4, category: 'General', title: 'PD Process flow and defects' }),
    ];
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    const generalModules = modules.filter((m) => m.title === 'General');
    expect(generalModules).toHaveLength(2);
    expect(new Set(generalModules.map((m) => m.phaseId)).size).toBe(2);
    // Each task lands in exactly one module.
    const allTaskIds = generalModules.flatMap((m) => m.taskIds);
    expect(new Set(allTaskIds).size).toBe(tasks.length);
  });

  it('assigns tasks to modules following workbook row order within a phase', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' }),
      row({ rowNumber: 8, category: 'Systems installation & overview', title: 'EDI.com' }),
      row({ rowNumber: 31, category: 'POR layers Practice \n(relevant to each layer)', title: 'STRFC' }),
    ];
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    const systemsModule = modules.find((m) => m.title === 'Systems installation & overview')!;
    expect(systemsModule.taskIds).toHaveLength(2);
    expect(systemsModule.phaseId).toBe('systems-installation');
    const porModule = modules.find((m) => m.title.startsWith('POR layers Practice'))!;
    expect(porModule.phaseId).toBe('por-layer-practice');
  });

  it('keeps duplicate task titles inside different modules with unique stable ids', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 10, category: 'Systems installation & overview', title: 'Query' }),
      row({ rowNumber: 40, category: 'POR layers Practice \n(relevant to each layer)', title: 'Query' }),
    ];
    const tasks = normalizeRows(rows);
    expect(tasks[0].id).not.toBe(tasks[1].id);
    const modules = buildModules(tasks);
    expect(modules.flatMap((m) => m.taskIds)).toHaveLength(2);
  });

  it('is idempotent: building modules twice from the same tasks yields identical module ids (no duplication on re-import)', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' }),
      row({ rowNumber: 8, category: 'Systems installation & overview', title: 'EDI.com' }),
    ];
    const tasks = normalizeRows(rows);
    const first = buildModules(tasks).map((m) => m.moduleId);
    const second = buildModules(tasks).map((m) => m.moduleId);
    expect(first).toEqual(second);
  });

  it('does not change existing task ids when modules are introduced', () => {
    const rows: RawWorkbookRow[] = [row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' })];
    const tasks = normalizeRows(rows);
    const idBefore = tasks[0].id;
    buildModules(tasks);
    expect(tasks[0].id).toBe(idBefore);
  });

  it('falls back to "Uncategorized Training" and flags for review when a task has no category text', () => {
    const rows: RawWorkbookRow[] = [row({ rowNumber: 99, category: '', title: 'Mystery task' })];
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    const fallback = modules.find((m) => m.title === UNCATEGORIZED_MODULE_TITLE);
    expect(fallback).toBeDefined();
    expect(fallback!.needsClarification).toBe(true);
    expect(fallback!.taskIds).toContain(tasks[0].id);
  });

  it('groupModulesByPhase places every module under its phase and preserves phase order', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 2, category: 'General', title: 'adding to relavant lists/groups' }),
      row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' }),
    ];
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    const byPhase = groupModulesByPhase(modules);
    expect(byPhase.get('welcome-access-communication')?.length).toBe(1);
    expect(byPhase.get('systems-installation')?.length).toBe(1);
  });
});
