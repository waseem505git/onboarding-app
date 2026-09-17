import { describe, expect, it } from 'vitest';
import { applyStatusChange, canReopen, undoLastTransition } from './statusTransitions';
import { createInitialProgress } from '../types/progress';

describe('applyStatusChange', () => {
  it('records a completion timestamp when moving to Completed', () => {
    const initial = createInitialProgress('p1', 't1');
    const { progress } = applyStatusChange(initial, 'Completed');
    expect(progress.status).toBe('Completed');
    expect(progress.completionDate).toBeDefined();
    expect(new Date(progress.completionDate!).toString()).not.toBe('Invalid Date');
  });

  it('appends a history entry for every transition', () => {
    const initial = createInitialProgress('p1', 't1');
    const { progress: afterFirst } = applyStatusChange(initial, 'In Progress');
    const { progress: afterSecond } = applyStatusChange(afterFirst, 'Completed');
    expect(afterSecond.history).toHaveLength(2);
    expect(afterSecond.history[1].toStatus).toBe('Completed');
  });

  it('clears completion date and requires a reason when reopening a completed task', () => {
    const initial = createInitialProgress('p1', 't1');
    const { progress: completed } = applyStatusChange(initial, 'Completed');
    expect(canReopen(completed)).toBe(true);
    const { progress: reopened } = applyStatusChange(completed, 'In Progress', {
      reopenReason: 'Trainer requested additional practice',
    });
    expect(reopened.completionDate).toBeUndefined();
    expect(reopened.reopenReason).toBe('Trainer requested additional practice');
  });
});

describe('undoLastTransition', () => {
  it('reverts to the previous status', () => {
    const initial = createInitialProgress('p1', 't1');
    const { progress: inProgress } = applyStatusChange(initial, 'In Progress');
    const { progress: completed } = applyStatusChange(inProgress, 'Completed');
    const undone = undoLastTransition(completed);
    expect(undone.status).toBe('In Progress');
    expect(undone.completionDate).toBeUndefined();
  });
});
