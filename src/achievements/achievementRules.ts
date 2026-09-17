import type { Phase } from '../types/curriculum';
import type { PhaseProgressSummary } from '../domain/progressCalculations';

/**
 * Presentation-layer "achievements" derived purely from existing phase
 * progress numbers. This does NOT change progress calculation, the data
 * model, or persistence — it only decorates already-computed phase summaries
 * for display. An achievement is earned automatically once every required
 * task in its associated phase is Completed (Not Applicable tasks already
 * excluded upstream by computeProgressByPhase).
 *
 * Five phases were chosen to receive a named achievement, matching the
 * badges requested for the onboarding experience; the remaining phases still
 * show progress everywhere else (phase cards, timeline) but do not have a
 * dedicated badge.
 *
 * "operational-procedures" no longer has tasks (its 11 items were merged
 * into "systems-installation" — see docs/import-rules.md), so
 * "Process Flow Explorer" was retargeted to "systems-installation" rather
 * than being tied to a phase that can never earn it again.
 */
export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  phase: Phase;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'access-master',
    title: 'Access Master',
    description: 'Completed all Welcome, Access & Communication tasks.',
    phase: 'welcome-access-communication',
  },
  {
    id: 'defect-foundations',
    title: 'Defect Foundations',
    description: 'Completed all Process Flow, Defect Fundamentals & Data Flow tasks.',
    phase: 'process-defect-fundamentals',
  },
  {
    id: 'systems-explorer',
    title: 'Systems Explorer',
    description: 'Completed all Systems Installation & Proficiency tasks.',
    phase: 'systems-installation',
  },
  {
    id: 'process-flow-explorer',
    title: 'Process Flow Explorer',
    description: 'Completed all Systems Installation & Proficiency tasks.',
    // Retargeted from the now-empty "operational-procedures" phase (its 11
    // tasks were merged into systems-installation on 2026-09-17 so an
    // engineer sees every "Systems installation & overview" item together
    // — see docs/import-rules.md). Kept as a distinct badge id/title per
    // product decision, even though it currently shares a phase with
    // "Systems Explorer".
    phase: 'systems-installation',
  },
  {
    id: 'engineering-ready',
    title: 'Engineering Ready',
    description: 'Completed all Engineering Inline Practice & Final Readiness tasks.',
    phase: 'eng-inline-final-readiness',
  },
];

export interface AchievementStatus extends AchievementDefinition {
  earned: boolean;
}

export function computeAchievements(byPhase: PhaseProgressSummary[]): AchievementStatus[] {
  const summaryByPhase = new Map(byPhase.map((p) => [p.phase, p]));
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const summary = summaryByPhase.get(def.phase);
    const earned = Boolean(summary && summary.totalRequired > 0 && summary.completedRequired === summary.totalRequired);
    return { ...def, earned };
  });
}
