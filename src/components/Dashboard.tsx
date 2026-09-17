import type { CurriculumTask } from '../types/curriculum';
import { PHASE_LABELS, PHASE_ORDER } from '../types/curriculum';
import type { TaskProgress } from '../types/progress';
import type { EngineerProfile } from '../types/profile';
import {
  computeOverallProgress,
  computeProgressByPhase,
  computeCurrentPhase,
  getBlockedTasks,
  getTasksWaitingForTrainer,
  getRecentlyCompleted,
} from '../domain/progressCalculations';
import { computeNextBestTask } from '../domain/nextBestTask';
import { buildModules, groupModulesByPhase } from '../curriculum/modules';
import { computeModulesWithProgress, computeModuleNextTask } from '../domain/moduleProgress';
import { computeAchievements } from '../achievements/achievementRules';
import { HeroWelcome } from './HeroWelcome';
import { OnboardingTimeline } from './OnboardingTimeline';
import { PhaseCard } from './PhaseCard';
import { AchievementBadges } from './AchievementBadges';
import { IconArrowRight, IconBan, IconClock, IconCheckCircle } from './icons';

interface DashboardProps {
  profile: EngineerProfile;
  tasks: CurriculumTask[];
  progressByTaskId: Map<string, TaskProgress>;
  onOpenTask: (task: CurriculumTask) => void;
}

export function Dashboard({ profile, tasks, progressByTaskId, onOpenTask }: DashboardProps) {
  // Overall/phase progress is always computed directly from applicable
  // required tasks — never from module percentages — so introducing modules
  // can never double-count or shift these numbers.
  const overall = computeOverallProgress(tasks, progressByTaskId);
  const byPhase = computeProgressByPhase(tasks, progressByTaskId);
  const currentPhase = computeCurrentPhase(tasks, progressByTaskId);
  const blocked = getBlockedTasks(tasks, progressByTaskId);
  const waiting = getTasksWaitingForTrainer(tasks, progressByTaskId);
  const recent = getRecentlyCompleted(tasks, progressByTaskId);
  const nextTask = computeNextBestTask(tasks, progressByTaskId);
  const achievements = computeAchievements(byPhase);

  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  const modules = buildModules(tasks);
  const modulesByPhase = groupModulesByPhase(modules);
  const modulesWithProgress = computeModulesWithProgress(modules, tasksById, progressByTaskId);

  const currentModule =
    currentPhase != null
      ? (modulesByPhase.get(currentPhase) ?? [])
          .map((module) => modulesWithProgress.find((m) => m.module.moduleId === module.moduleId)!)
          .find((entry) => entry.progress.status !== 'Completed' && entry.progress.status !== 'Not Applicable')
      : undefined;
  const nextMission = currentModule
    ? computeModuleNextTask(currentModule.module, tasksById, progressByTaskId)
    : null;

  function firstOpenTaskInPhase(phase: (typeof PHASE_ORDER)[number]): CurriculumTask | null {
    const phaseModules = modulesByPhase.get(phase) ?? [];
    for (const module of phaseModules) {
      const next = computeModuleNextTask(module, tasksById, progressByTaskId);
      if (next) return next;
    }
    return null;
  }

  return (
    <div className="dashboard">
      <HeroWelcome
        profile={profile}
        overall={overall}
        currentPhaseLabel={currentPhase ? PHASE_LABELS[currentPhase] : 'Onboarding complete'}
        currentModuleTitle={currentModule?.module.title}
        nextMissionTitle={nextMission?.title}
      />

      <div className="stat-row">
        <div className="stat card">
          <div className="value">
            {overall.completedRequired} / {overall.totalRequired}
          </div>
          <div className="label">Required tasks completed</div>
        </div>
        <div className="stat card">
          <div className="value">{blocked.length}</div>
          <div className="label">Blocked tasks</div>
        </div>
        <div className="stat card">
          <div className="value">{waiting.length}</div>
          <div className="label">Waiting for trainer</div>
        </div>
        <div className="stat card">
          <div className="value">
            {achievements.filter((a) => a.earned).length} / {achievements.length}
          </div>
          <div className="label">Achievements earned</div>
        </div>
      </div>

      <div className="card">
        <h2>Onboarding timeline</h2>
        <OnboardingTimeline byPhase={byPhase} labels={PHASE_LABELS} currentPhase={currentPhase} />
      </div>

      <div className="card">
        <h2>Achievements</h2>
        <AchievementBadges achievements={achievements} />
      </div>

      <div className="card">
        <h2>Phases</h2>
        <div className="phase-cards-grid">
          {byPhase.map((p) => {
            const phaseModules = modulesByPhase.get(p.phase) ?? [];
            const completedModules = phaseModules.filter(
              (m) => modulesWithProgress.find((e) => e.module.moduleId === m.moduleId)?.progress.status === 'Completed',
            ).length;
            return (
              <PhaseCard
                key={p.phase}
                label={PHASE_LABELS[p.phase]}
                summary={p}
                isCurrent={p.phase === currentPhase}
                canContinue={p.totalRequired > 0 && p.completedRequired < p.totalRequired}
                moduleCount={phaseModules.length}
                completedModuleCount={completedModules}
                onContinue={() => {
                  const task = firstOpenTaskInPhase(p.phase);
                  if (task) onOpenTask(task);
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="card next-action-card">
            <h2>Next recommended action</h2>
            {nextTask ? (
              <>
                <p>
                  <strong>{nextTask.title}</strong> — {PHASE_LABELS[nextTask.phase]}
                </p>
                <button className="btn btn-primary" onClick={() => onOpenTask(nextTask)}>
                  Continue where I stopped <IconArrowRight size={15} />
                </button>
              </>
            ) : (
              <p>All required tasks are complete. Great work!</p>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h3>
              <IconBan size={16} /> Blocked tasks ({blocked.length})
            </h3>
            {blocked.length === 0 ? (
              <p>None right now.</p>
            ) : (
              <ul className="diff-list">
                {blocked.map((t) => (
                  <li key={t.id}>
                    <button className="btn-link" onClick={() => onOpenTask(t)}>
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3>
              <IconClock size={16} /> Waiting for trainer ({waiting.length})
            </h3>
            {waiting.length === 0 ? (
              <p>None right now.</p>
            ) : (
              <ul className="diff-list">
                {waiting.map((t) => (
                  <li key={t.id}>
                    <button className="btn-link" onClick={() => onOpenTask(t)}>
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3>
              <IconCheckCircle size={16} /> Recently completed
            </h3>
            {recent.length === 0 ? (
              <p>Nothing completed yet.</p>
            ) : (
              <ul className="diff-list">
                {recent.map(({ task, progress }) => (
                  <li key={task.id}>✔ {task.title} — {new Date(progress.completionDate!).toLocaleDateString()}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
