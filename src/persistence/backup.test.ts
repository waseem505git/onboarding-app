import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup, buildProgressCsv } from './backup';
import { normalizeRows } from '../curriculum/normalize';
import { buildModules } from '../curriculum/modules';
import { computeModulesWithProgress } from '../domain/moduleProgress';
import { createInitialProgress } from '../types/progress';
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

describe('backup/restore with the module hierarchy layered on top', () => {
  it('keeps the backup format version unchanged, because modules are derived and never persisted', () => {
    const tasks = normalizeRows([row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' })]);
    const backup = buildBackup(tasks, null, [], []);
    expect(backup.formatVersion).toBe(1);
  });

  it('round-trips curriculum + progress through JSON and modules/progress can still be derived afterwards', () => {
    const tasks = normalizeRows([
      row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' }),
      row({ rowNumber: 8, category: 'Systems installation & overview', title: 'EDI.com' }),
    ]);
    const progress = [{ ...createInitialProgress('profile-1', tasks[0].id), status: 'Completed' as const }];
    const backup = buildBackup(tasks, null, [], progress);
    const restored = parseBackup(JSON.stringify(backup));

    const tasksById = new Map(restored.curriculumTasks.map((t) => [t.id, t]));
    const progressByTaskId = new Map(restored.progress.map((p) => [p.taskId, p]));
    const modules = buildModules(restored.curriculumTasks);
    const withProgress = computeModulesWithProgress(modules, tasksById, progressByTaskId);

    expect(restored.curriculumTasks).toHaveLength(2);
    expect(withProgress[0].progress.completedRequired).toBe(1);
  });

  it('rejects a backup with an unrecognized format version', () => {
    expect(() => parseBackup(JSON.stringify({ formatVersion: 99 }))).toThrow();
  });

  it('produces a progress CSV export that includes every task regardless of module grouping', () => {
    const tasks = normalizeRows([
      row({ rowNumber: 7, category: 'Systems installation & overview', title: 'ICE' }),
      row({ rowNumber: 31, category: 'POR layers Practice \n(relevant to each layer)', title: 'STRFC' }),
    ]);
    const csv = buildProgressCsv(tasks, new Map());
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 tasks
  });
});
