import { describe, expect, it } from 'vitest';
import type { CurriculumTask } from '../types/curriculum';
import type { CurriculumModule } from '../types/module';
import type { TaskProgress } from '../types/progress';
import { createInitialProgress } from '../types/progress';
import { computeModuleProgress, computeModuleNextTask, computeModulesWithProgress } from './moduleProgress';

function makeTask(partial: Partial<CurriculumTask> & { id: string; sourceRow: number }): CurriculumTask {
  return {
    phase: 'systems-installation',
    category: 'Systems installation & overview',
    title: partial.id,
    sourceText: partial.id,
    description: '',
    required: true,
    prerequisites: [],
    tags: [],
    needsClarification: false,
    ...partial,
  };
}

function makeModule(taskIds: string[]): CurriculumModule {
  return {
    moduleId: 'module-test',
    title: 'Systems installation & overview',
    originalSourceText: 'Systems installation & overview',
    originalWorkbookRow: 7,
    phaseId: 'systems-installation',
    displayOrder: 0,
    iconKey: 'systems',
    taskIds,
    needsClarification: false,
  };
}

function progress(profileId: string, taskId: string, status: TaskProgress['status']): TaskProgress {
  return { ...createInitialProgress(profileId, taskId), status };
}

describe('computeModuleProgress', () => {
  it('is Not Applicable when the module has no applicable required tasks', () => {
    const tasks = [makeTask({ id: 't1', sourceRow: 1, required: false })];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1']);
    const result = computeModuleProgress(module, tasksById, new Map());
    expect(result.status).toBe('Not Applicable');
    expect(result.totalApplicableRequired).toBe(0);
  });

  it('excludes Not Applicable tasks from the denominator', () => {
    const tasks = [
      makeTask({ id: 't1', sourceRow: 1 }),
      makeTask({ id: 't2', sourceRow: 2 }),
    ];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1', 't2']);
    const progressByTaskId = new Map([
      ['t1', progress('p', 't1', 'Completed')],
      ['t2', progress('p', 't2', 'Not Applicable')],
    ]);
    const result = computeModuleProgress(module, tasksById, progressByTaskId);
    expect(result.totalApplicableRequired).toBe(1);
    expect(result.completedRequired).toBe(1);
    expect(result.percentComplete).toBe(100);
    expect(result.status).toBe('Completed');
  });

  it('is Completed only when every applicable required task is Completed', () => {
    const tasks = [makeTask({ id: 't1', sourceRow: 1 }), makeTask({ id: 't2', sourceRow: 2 })];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1', 't2']);
    const progressByTaskId = new Map([
      ['t1', progress('p', 't1', 'Completed')],
      ['t2', progress('p', 't2', 'Completed')],
    ]);
    const result = computeModuleProgress(module, tasksById, progressByTaskId);
    expect(result.status).toBe('Completed');
    expect(result.percentComplete).toBe(100);
  });

  it('reports Blocked when any child task is Blocked, and counts blocked tasks', () => {
    const tasks = [makeTask({ id: 't1', sourceRow: 1 }), makeTask({ id: 't2', sourceRow: 2 })];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1', 't2']);
    const progressByTaskId = new Map([
      ['t1', progress('p', 't1', 'Blocked')],
      ['t2', progress('p', 't2', 'Not Started')],
    ]);
    const result = computeModuleProgress(module, tasksById, progressByTaskId);
    expect(result.status).toBe('Blocked');
    expect(result.blockedCount).toBe(1);
  });

  it('never exceeds 100 percent even if inputs are inconsistent', () => {
    const tasks = [makeTask({ id: 't1', sourceRow: 1 })];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1']);
    const progressByTaskId = new Map([['t1', progress('p', 't1', 'Completed')]]);
    const result = computeModuleProgress(module, tasksById, progressByTaskId);
    expect(result.percentComplete).toBeLessThanOrEqual(100);
  });
});

describe('computeModuleNextTask', () => {
  it('prefers an In Progress task over everything else', () => {
    const tasks = [
      makeTask({ id: 't1', sourceRow: 1 }),
      makeTask({ id: 't2', sourceRow: 2 }),
    ];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1', 't2']);
    const progressByTaskId = new Map([
      ['t1', progress('p', 't1', 'Not Started')],
      ['t2', progress('p', 't2', 'In Progress')],
    ]);
    const next = computeModuleNextTask(module, tasksById, progressByTaskId);
    expect(next?.id).toBe('t2');
  });

  it('falls back to the first unblocked Not Started task, respecting curriculum order', () => {
    const tasks = [
      makeTask({ id: 't2', sourceRow: 2 }),
      makeTask({ id: 't1', sourceRow: 1 }),
    ];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t2', 't1']);
    const next = computeModuleNextTask(module, tasksById, new Map());
    expect(next?.id).toBe('t1');
  });

  it('only returns a Blocked task if no other actionable task exists', () => {
    const tasks = [makeTask({ id: 't1', sourceRow: 1 })];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1']);
    const progressByTaskId = new Map([['t1', progress('p', 't1', 'Blocked')]]);
    const next = computeModuleNextTask(module, tasksById, progressByTaskId);
    expect(next?.id).toBe('t1');
  });

  it('returns the first task (for "Review Module") when every task is already Completed', () => {
    const tasks = [makeTask({ id: 't1', sourceRow: 1 })];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1']);
    const progressByTaskId = new Map([['t1', progress('p', 't1', 'Completed')]]);
    const next = computeModuleNextTask(module, tasksById, progressByTaskId);
    expect(next?.id).toBe('t1');
  });

  it('returns null only when the module truly has no tasks at all', () => {
    const module = makeModule([]);
    const next = computeModuleNextTask(module, new Map(), new Map());
    expect(next).toBeNull();
  });
});

describe('computeModulesWithProgress', () => {
  it('shows completed-module state clearly, with a task available for "Review Module"', () => {
    const tasks = [makeTask({ id: 't1', sourceRow: 1 })];
    const tasksById = new Map(tasks.map((t) => [t.id, t]));
    const module = makeModule(['t1']);
    const progressByTaskId = new Map([['t1', progress('p', 't1', 'Completed')]]);
    const [entry] = computeModulesWithProgress([module], tasksById, progressByTaskId);
    expect(entry.progress.status).toBe('Completed');
    expect(entry.nextTask?.id).toBe('t1');
  });
});
