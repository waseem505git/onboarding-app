import type { CurriculumTask, Phase } from '../types/curriculum';
import { PHASE_ORDER } from '../types/curriculum';
import type { CurriculumModule, ModuleIconKey } from '../types/module';
import { buildModuleId } from '../utils/idGen';

/**
 * Safe-fallback module label used ONLY when a task truly has no category
 * text at all (e.g. a future workbook that omits section headers entirely).
 * In the current Training package_General_2026.xlsx every task already has
 * a category, so this fallback should not trigger for that file — it exists
 * so no task can ever be silently lost if a future workbook lacks headers.
 */
export const UNCATEGORIZED_MODULE_TITLE = 'Uncategorized Training';

const PHASE_ICON_KEYS: Record<Phase, ModuleIconKey> = {
  'welcome-access-communication': 'access',
  'intro-1274-defect-metrology': 'intro',
  'process-defect-fundamentals': 'fundamentals',
  'systems-installation': 'systems',
  'operational-procedures': 'operations',
  'por-layer-practice': 'layers',
  'shift-readiness-wg-exposure': 'shift',
  'eng-inline-final-readiness': 'engineering',
};

/**
 * Groups already-normalized curriculum tasks into training modules.
 *
 * Modules are derived on demand from CurriculumTask.phase + .category — they
 * are NOT a new persisted entity. This is deliberate: it means introducing
 * modules cannot desynchronize from existing engineer progress (which is
 * keyed purely by taskId), cannot duplicate on re-import (there is nothing
 * to duplicate — they're recomputed every time), and requires no database
 * migration at all.
 *
 * A single workbook category that legitimately spans two phases (currently
 * only "General" — see docs/import-rules.md) becomes two distinct modules,
 * one per phase, each keeping the original category text as its title.
 * This keeps "module belongs to exactly one phase" true while reusing the
 * already-reviewed, tested phase-assignment rules in normalize.ts — no new
 * fuzzy classification is introduced.
 */
export function buildModules(tasks: CurriculumTask[]): CurriculumModule[] {
  const bySourceOrder = [...tasks].sort((a, b) => a.sourceRow - b.sourceRow);
  const modules = new Map<string, CurriculumModule>();

  for (const task of bySourceOrder) {
    const rawTitle = task.category.trim();
    const moduleTitle = rawTitle.length > 0 ? rawTitle : UNCATEGORIZED_MODULE_TITLE;
    const moduleId = buildModuleId(task.phase, moduleTitle);
    let module = modules.get(moduleId);
    if (!module) {
      module = {
        moduleId,
        title: moduleTitle,
        originalSourceText: rawTitle,
        originalWorkbookRow: task.sourceRow,
        phaseId: task.phase,
        displayOrder: 0,
        iconKey: moduleTitle === UNCATEGORIZED_MODULE_TITLE ? 'unknown' : PHASE_ICON_KEYS[task.phase],
        taskIds: [],
        needsClarification: moduleTitle === UNCATEGORIZED_MODULE_TITLE,
      };
      modules.set(moduleId, module);
    }
    module.taskIds.push(task.id);
  }

  const ordered = Array.from(modules.values()).sort((a, b) => {
    const phaseDelta = PHASE_ORDER.indexOf(a.phaseId) - PHASE_ORDER.indexOf(b.phaseId);
    if (phaseDelta !== 0) return phaseDelta;
    return a.originalWorkbookRow - b.originalWorkbookRow;
  });
  ordered.forEach((module, index) => {
    module.displayOrder = index;
  });
  return ordered;
}

export function groupModulesByPhase(modules: CurriculumModule[]): Map<Phase, CurriculumModule[]> {
  const map = new Map<Phase, CurriculumModule[]>();
  for (const phase of PHASE_ORDER) map.set(phase, []);
  for (const module of modules) map.get(module.phaseId)?.push(module);
  return map;
}
