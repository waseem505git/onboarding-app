import { describe, expect, it } from 'vitest';
import { computeAchievements } from './achievementRules';
import type { PhaseProgressSummary } from '../domain/progressCalculations';
import { PHASE_ORDER } from '../types/curriculum';

function summaryFor(phase: (typeof PHASE_ORDER)[number], total: number, completed: number): PhaseProgressSummary {
  return {
    phase,
    totalRequired: total,
    completedRequired: completed,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

describe('computeAchievements', () => {
  it('marks an achievement earned only when its phase is fully complete', () => {
    const byPhase: PhaseProgressSummary[] = PHASE_ORDER.map((phase) => summaryFor(phase, 4, 4));
    const achievements = computeAchievements(byPhase);
    expect(achievements.every((a) => a.earned)).toBe(true);
  });

  it('does not award an achievement for a phase with no tasks', () => {
    const byPhase: PhaseProgressSummary[] = PHASE_ORDER.map((phase) => summaryFor(phase, 0, 0));
    const achievements = computeAchievements(byPhase);
    expect(achievements.every((a) => !a.earned)).toBe(true);
  });

  it('does not award an achievement for a partially complete phase', () => {
    const byPhase: PhaseProgressSummary[] = PHASE_ORDER.map((phase) => summaryFor(phase, 4, 2));
    const achievements = computeAchievements(byPhase);
    expect(achievements.every((a) => !a.earned)).toBe(true);
  });
});
