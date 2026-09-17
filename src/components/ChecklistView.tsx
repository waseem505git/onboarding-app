import { useMemo, useState } from 'react';
import type { CurriculumTask, Phase } from '../types/curriculum';
import { PHASE_ORDER, PHASE_LABELS } from '../types/curriculum';
import type { TaskProgress, TaskStatus } from '../types/progress';
import { TASK_STATUSES } from '../types/progress';
import { buildModules, groupModulesByPhase } from '../curriculum/modules';
import { computeModulesWithProgress } from '../domain/moduleProgress';
import { ModuleAccordion } from './ModuleAccordion';

interface ChecklistViewProps {
  tasks: CurriculumTask[];
  progressByTaskId: Map<string, TaskProgress>;
  onOpenTask: (task: CurriculumTask) => void;
}

export function ChecklistView({ tasks, progressByTaskId, onOpenTask }: ChecklistViewProps) {
  const [query, setQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<Phase | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [requiredFilter, setRequiredFilter] = useState<'all' | 'required' | 'optional'>('all');
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [onlyClarification, setOnlyClarification] = useState(false);

  const categories = useMemo(() => Array.from(new Set(tasks.map((t) => t.category))), [tasks]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modules are always derived from the FULL task set (never the filtered
  // one) so module identity, ordering and totals never shift because of an
  // active filter — only which tasks are *visible* inside a module changes.
  const allTasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const modules = useMemo(() => buildModules(tasks), [tasks]);
  const modulesWithProgress = useMemo(
    () => computeModulesWithProgress(modules, allTasksById, progressByTaskId),
    [modules, allTasksById, progressByTaskId],
  );
  const modulesByPhase = useMemo(() => groupModulesByPhase(modules), [modules]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const status = progressByTaskId.get(task.id)?.status ?? 'Not Started';
      if (phaseFilter !== 'all' && task.phase !== phaseFilter) return false;
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (requiredFilter === 'required' && !task.required) return false;
      if (requiredFilter === 'optional' && task.required) return false;
      if (onlyBlocked && status !== 'Blocked') return false;
      if (onlyClarification && !task.needsClarification) return false;
      if (q) {
        const haystack = `${task.title} ${task.description} ${task.sourceText} ${task.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, progressByTaskId, query, phaseFilter, categoryFilter, statusFilter, requiredFilter, onlyBlocked, onlyClarification]);

  const filteredTaskIds = useMemo(() => new Set(filtered.map((t) => t.id)), [filtered]);
  const hasActiveFilter =
    query.trim() !== '' ||
    phaseFilter !== 'all' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    requiredFilter !== 'all' ||
    onlyBlocked ||
    onlyClarification;

  const phasesWithVisibleModules = PHASE_ORDER.filter((phase) =>
    (modulesByPhase.get(phase) ?? []).some((m) => m.taskIds.some((id) => filteredTaskIds.has(id))),
  );

  return (
    <div>
      <div className="filters-bar" role="search">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, source text…"
          />
        </div>
        <div className="field">
          <label htmlFor="phase-filter">Phase</label>
          <select id="phase-filter" value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value as Phase | 'all')}>
            <option value="all">All phases</option>
            {PHASE_ORDER.map((p) => (
              <option key={p} value={p}>
                {PHASE_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="category-filter">Category</label>
          <select id="category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}>
            <option value="all">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="required-filter">Required / Optional</label>
          <select
            id="required-filter"
            value={requiredFilter}
            onChange={(e) => setRequiredFilter(e.target.value as 'all' | 'required' | 'optional')}
          >
            <option value="all">All</option>
            <option value="required">Required only</option>
            <option value="optional">Optional only</option>
          </select>
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 'auto' }}>
          <input id="blocked-only" type="checkbox" style={{ width: 'auto' }} checked={onlyBlocked} onChange={(e) => setOnlyBlocked(e.target.checked)} />
          <label htmlFor="blocked-only" style={{ marginBottom: 0 }}>
            Blocked only
          </label>
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 'auto' }}>
          <input
            id="clarify-only"
            type="checkbox"
            style={{ width: 'auto' }}
            checked={onlyClarification}
            onChange={(e) => setOnlyClarification(e.target.checked)}
          />
          <label htmlFor="clarify-only" style={{ marginBottom: 0 }}>
            Needs clarification only
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No tasks match the current filters.</div>
      ) : (
        phasesWithVisibleModules.map((phase) => (
          <section key={phase} aria-labelledby={`phase-heading-${phase}`} style={{ marginTop: 20 }}>
            <h2 id={`phase-heading-${phase}`}>{PHASE_LABELS[phase]}</h2>
            <div className="module-grid">
              {(modulesByPhase.get(phase) ?? [])
                .filter((module) => module.taskIds.some((id) => filteredTaskIds.has(id)))
                .map((module) => {
                  const entry = modulesWithProgress.find((m) => m.module.moduleId === module.moduleId)!;
                  const visibleTasks = module.taskIds
                    .filter((id) => filteredTaskIds.has(id))
                    .map((id) => allTasksById.get(id))
                    .filter((t): t is CurriculumTask => Boolean(t));
                  return (
                    <ModuleAccordion
                      key={module.moduleId}
                      module={module}
                      progress={entry.progress}
                      nextTask={entry.nextTask}
                      tasks={visibleTasks}
                      progressByTaskId={progressByTaskId}
                      onOpenTask={onOpenTask}
                      forceExpanded={hasActiveFilter}
                    />
                  );
                })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
