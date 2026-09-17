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

  it('imports "General" as a module (not a task) whose specific missions appear inside it', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 4, category: 'General', title: 'PD Process flow and defects' }),
      row({ rowNumber: 5, category: 'General', title: 'Data flow & Database' }),
      row({ rowNumber: 6, category: 'General', title: 'NCDD/EDI calculation' }),
    ];
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    // No task literally titled "General" — the category becomes a module, not a task.
    expect(tasks.some((t) => t.title.trim().toLowerCase() === 'general')).toBe(false);
    const generalModule = modules.find((m) => m.title === 'General');
    expect(generalModule).toBeDefined();
    expect(generalModule!.taskIds).toHaveLength(3);
    const titles = generalModule!.taskIds.map((id) => tasks.find((t) => t.id === id)!.title);
    expect(titles).toEqual(['PD Process flow and defects', 'Data flow & Database', 'NCDD/EDI calculation']);
  });

  it('imports "Systems installation & overview" as a single module containing every system/tool mission', () => {
    const systemNames = [
      'ICE',
      'EDI.com',
      'KLARITY',
      'DETS',
      'DART',
      '1-Click',
      'JMP',
      'YodaCreek',
      'DAGRS',
      'GAJT',
      'Query',
      'I MATCH',
      'CLUI',
      'Tracer report',
      '1NOTE',
      'TEAMs',
      'Auto dispo',
      'Pilot management',
      'Lime Light',
    ];
    const rows: RawWorkbookRow[] = systemNames.map((title, i) =>
      row({ rowNumber: 7 + i, category: 'Systems installation & overview', title }),
    );
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    const systemsModules = modules.filter((m) => m.title === 'Systems installation & overview');
    // Everything lands in exactly one module (no split into a second phase).
    expect(systemsModules).toHaveLength(1);
    expect(systemsModules[0].taskIds).toHaveLength(systemNames.length);
    expect(systemsModules[0].phaseId).toBe('systems-installation');
  });

  it('imports "WG Overview & tool menagerie" as its own module', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 44, category: 'WG Overview & tool menagerie', title: '# of tools, Chambers' }),
      row({ rowNumber: 45, category: 'WG Overview & tool menagerie', title: 'Wafer flow' }),
      row({ rowNumber: 46, category: 'WG Overview & tool menagerie', title: 'Touch points' }),
    ];
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    const wgModule = modules.find((m) => m.title === 'WG Overview & tool menagerie');
    expect(wgModule).toBeDefined();
    expect(wgModule!.taskIds).toHaveLength(3);
    expect(wgModule!.phaseId).toBe('shift-readiness-wg-exposure');
  });

  it('imports "ENG- Inline layers Practice" as its own module', () => {
    const rows: RawWorkbookRow[] = [
      row({ rowNumber: 51, category: 'ENG- Inline layers Practice', title: 'Cassification/DOI' }),
      row({ rowNumber: 52, category: 'ENG- Inline layers Practice', title: 'dispo/RFC/RT' }),
      row({ rowNumber: 53, category: 'ENG- Inline layers Practice', title: 'IMT' }),
    ];
    const tasks = normalizeRows(rows);
    const modules = buildModules(tasks);
    const engModule = modules.find((m) => m.title === 'ENG- Inline layers Practice');
    expect(engModule).toBeDefined();
    expect(engModule!.taskIds).toHaveLength(3);
    expect(engModule!.phaseId).toBe('eng-inline-final-readiness');
  });
});
