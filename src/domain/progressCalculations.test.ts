import { describe, expect, it } from 'vitest';
import {
  computeOverallProgress,
  computeProgressByPhase,
} from './progressCalculations';
import type { CurriculumTask } from '../types/curriculum';
import { createInitialProgress } from '../types/progress';
import type { TaskProgress } from '../types/progress';

function task(id: string, phase: CurriculumTask['phase'], required = true): CurriculumTask {
  return {
    id,
    sourceRow: 1,
    phase,
    category: 'General',
    title: id,
    sourceText: id,
    description: '',
    required,
    prerequisites: [],
    tags: [],
    needsClarification: false,
  };
}

function progress(profileId: string, taskId: string, status: TaskProgress['status']): TaskProgress {
  return { ...createInitialProgress(profileId, taskId), status };
}

describe('computeOverallProgress', () => {
  it('never exceeds 100 percent', () => {
    const tasks = [task('a', 'welcome-access-communication'), task('b', 'welcome-access-communication')];
    const progressByTaskId = new Map([
      ['a', progress('p1', 'a', 'Completed')],
      ['b', progress('p1', 'b', 'Completed')],
    ]);
    const summary = computeOverallProgress(tasks, progressByTaskId);
    expect(summary.percentComplete).toBe(100);
    expect(summary.percentComplete).toBeLessThanOrEqual(100);
  });

  it('excludes Not Applicable tasks from the denominator', () => {
    const tasks = [
      task('a', 'welcome-access-communication'),
      task('b', 'welcome-access-communication'),
      task('c', 'welcome-access-communication'),
    ];
    const progressByTaskId = new Map([
      ['a', progress('p1', 'a', 'Completed')],
      ['b', progress('p1', 'b', 'Not Applicable')],
      ['c', progress('p1', 'c', 'Not Started')],
    ]);
    const summary = computeOverallProgress(tasks, progressByTaskId);
    // Only 'a' and 'c' count: 1 of 2 completed = 50%.
    expect(summary.totalRequired).toBe(2);
    expect(summary.completedRequired).toBe(1);
    expect(summary.percentComplete).toBe(50);
  });

  it('treats tasks with no progress record yet as Not Started', () => {
    const tasks = [task('a', 'welcome-access-communication')];
    const summary = computeOverallProgress(tasks, new Map());
    expect(summary.totalRequired).toBe(1);
    expect(summary.completedRequired).toBe(0);
    expect(summary.percentComplete).toBe(0);
  });
});

describe('computeProgressByPhase', () => {
  it('buckets tasks by phase independently', () => {
    const tasks = [
      task('a', 'welcome-access-communication'),
      task('b', 'systems-installation'),
    ];
    const progressByTaskId = new Map([['a', progress('p1', 'a', 'Completed')]]);
    const byPhase = computeProgressByPhase(tasks, progressByTaskId);
    const welcome = byPhase.find((p) => p.phase === 'welcome-access-communication')!;
    const systems = byPhase.find((p) => p.phase === 'systems-installation')!;
    expect(welcome.percentComplete).toBe(100);
    expect(systems.percentComplete).toBe(0);
  });
});
