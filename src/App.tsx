import { useEffect, useMemo, useState } from 'react';
import type { CurriculumTask, ImportMeta } from './types/curriculum';
import type { EngineerProfile, NewEngineerProfileInput } from './types/profile';
import type { TaskProgress, TaskStatus } from './types/progress';
import { createInitialProgress } from './types/progress';
import { parseWorkbook } from './parsing/workbookParser';
import { normalizeRows } from './curriculum/normalize';
import { computeReimportDiff, type ReimportDiff } from './curriculum/reimport';
import { buildModules } from './curriculum/modules';
import { PHASE_LABELS, PHASE_ORDER } from './types/curriculum';
import { applyStatusChange, undoLastTransition } from './domain/statusTransitions';
import { IndexedDbCurriculumRepository } from './persistence/curriculumRepository';
import { IndexedDbProfileRepository } from './persistence/profileRepository';
import { IndexedDbProgressRepository } from './persistence/progressRepository';
import { buildBackup, buildProgressCsv, parseBackup } from './persistence/backup';
import { startNewEngineerProfile, resetProfileProgress } from './domain/profileLifecycle';
import { ProfileSetupForm } from './components/ProfileSetupForm';
import { ProfileSelector } from './components/ProfileSelector';
import { ImportWorkbookScreen } from './components/ImportWorkbookScreen';
import { ImportReviewModal } from './components/ImportReviewModal';
import { Dashboard } from './components/Dashboard';
import { ChecklistView } from './components/ChecklistView';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { DataManagementPanel } from './components/DataManagementPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { OrientationModal, hasSeenOrientation, markOrientationSeen } from './components/OrientationModal';
import { IconGrid, IconList, IconSettingsGear, IconBook } from './components/icons';
import { SurvivalGuideView } from './components/SurvivalGuideView';
import { SME_CURATED_GLOSSARY_ENTRIES } from './survival-guide/glossary-data';

const curriculumRepo = new IndexedDbCurriculumRepository();
const profileRepo = new IndexedDbProfileRepository();
const progressRepo = new IndexedDbProgressRepository();

type Tab = 'dashboard' | 'checklist' | 'survivalGuide' | 'settings';

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<CurriculumTask[]>([]);
  const [importMeta, setImportMeta] = useState<ImportMeta | null>(null);
  const [profiles, setProfiles] = useState<EngineerProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [progressList, setProgressList] = useState<TaskProgress[]>([]);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [pendingDiff, setPendingDiff] = useState<ReimportDiff | null>(null);
  const [pendingTasks, setPendingTasks] = useState<CurriculumTask[]>([]);
  const [pendingMeta, setPendingMeta] = useState<ImportMeta | null>(null);
  const [showImportScreen, setShowImportScreen] = useState(false);
  const [showNewEngineerForm, setShowNewEngineerForm] = useState(false);
  const [showOrientation, setShowOrientation] = useState(false);
  // Every fresh load must land on the profile picker rather than silently
  // resuming whoever used the app last. Only an explicit pick (or creating a
  // new profile) flips this to true.
  const [profileConfirmed, setProfileConfirmed] = useState(false);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      setLoading(true);
      const [loadedTasks, meta, allProfiles, activeId] = await Promise.all([
        curriculumRepo.getAllTasks(),
        curriculumRepo.getImportMeta(),
        profileRepo.getAllProfiles(),
        profileRepo.getActiveProfileId(),
      ]);
      setTasks(loadedTasks);
      setImportMeta(meta);
      setProfiles(allProfiles);
      const resolvedActiveId = activeId && allProfiles.some((p) => p.id === activeId) ? activeId : allProfiles[0]?.id ?? null;
      setActiveProfileId(resolvedActiveId);
      if (resolvedActiveId) {
        const progress = await progressRepo.getAllForProfile(resolvedActiveId);
        setProgressList(progress);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load onboarding data.');
    } finally {
      setLoading(false);
    }
  }

  const progressByTaskId = useMemo(() => new Map(progressList.map((p) => [p.taskId, p])), [progressList]);
  const activeProfile = useMemo(() => profiles.find((p) => p.id === activeProfileId) ?? null, [profiles, activeProfileId]);
  const openTask = useMemo(() => tasks.find((t) => t.id === openTaskId) ?? null, [tasks, openTaskId]);
  const modules = useMemo(() => buildModules(tasks), [tasks]);
  const openTaskModule = useMemo(
    () => (openTask ? modules.find((m) => m.taskIds.includes(openTask.id)) ?? null : null),
    [modules, openTask],
  );
  // Lets the drawer step through every task in the current module (e.g. all
  // 24 "Systems installation & overview" apps) without returning to the
  // full checklist between each one.
  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const openModuleTaskIds = openTaskModule?.taskIds ?? [];
  const openTaskIndex = openTaskId ? openModuleTaskIds.indexOf(openTaskId) : -1;
  const hasPreviousTask = openTaskIndex > 0;
  const hasNextTask = openTaskIndex >= 0 && openTaskIndex < openModuleTaskIds.length - 1;

  function handleNavigateTask(direction: 'prev' | 'next') {
    if (openTaskIndex < 0) return;
    const nextIndex = direction === 'prev' ? openTaskIndex - 1 : openTaskIndex + 1;
    const nextId = openModuleTaskIds[nextIndex];
    if (nextId && taskById.has(nextId)) setOpenTaskId(nextId);
  }

  // First-run orientation: show once per profile, right after the app has
  // an active profile with a curriculum loaded, then never again unless
  // localStorage is cleared. This is a UI preference only — it never
  // touches curriculum, progress, or profile data.
  useEffect(() => {
    if (!activeProfileId || tasks.length === 0) return;
    setShowOrientation(!hasSeenOrientation(activeProfileId));
  }, [activeProfileId, tasks.length]);

  function dismissOrientation() {
    if (activeProfileId) markOrientationSeen(activeProfileId);
    setShowOrientation(false);
  }

  const totalMissionCount = tasks.length;
  const totalModuleCount = modules.length;
  const totalPhaseCount = new Set(tasks.map((t) => t.phase)).size;
  const firstPhaseWithTasks = PHASE_ORDER.find((phase) => tasks.some((t) => t.phase === phase));
  const firstPhaseLabel = firstPhaseWithTasks ? PHASE_LABELS[firstPhaseWithTasks] : 'your first phase';

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }

  async function handleWorkbookImport(file: File) {
    setImportBusy(true);
    setImportError(undefined);
    try {
      const parsed = await parseWorkbook(file, file.name);
      const newTasks = normalizeRows(parsed.rows);
      const meta: ImportMeta = {
        importedAt: new Date().toISOString(),
        sourceFileName: file.name,
        taskCount: newTasks.length,
        contentHash: parsed.contentHash,
      };

      if (tasks.length === 0) {
        // First-ever import: nothing to diff against.
        await curriculumRepo.replaceAllTasks(newTasks);
        await curriculumRepo.setImportMeta(meta);
        setTasks(newTasks);
        setImportMeta(meta);
        setShowImportScreen(false);
      } else {
        const diff = computeReimportDiff(tasks, newTasks);
        setPendingDiff(diff);
        setPendingTasks(newTasks);
        setPendingMeta(meta);
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Could not read this workbook.');
    } finally {
      setImportBusy(false);
    }
  }

  async function applyReimport(resolutions: Map<string, string | null>) {
    if (!pendingDiff || !pendingMeta) return;
    // Carry over progress for every profile: remap ids for confirmed renames.
    for (const [removedId, newId] of resolutions.entries()) {
      if (!newId) continue;
      for (const profile of profiles) {
        await progressRepo.remapTaskId(profile.id, removedId, newId);
      }
    }
    await curriculumRepo.replaceAllTasks(pendingTasks);
    await curriculumRepo.setImportMeta(pendingMeta);
    setTasks(pendingTasks);
    setImportMeta(pendingMeta);
    setPendingDiff(null);
    setPendingTasks([]);
    setPendingMeta(null);
    setShowImportScreen(false);
    if (activeProfileId) setProgressList(await progressRepo.getAllForProfile(activeProfileId));
    showToast('Curriculum updated. Progress preserved for matched tasks.');
  }

  async function handleCreateProfile(input: NewEngineerProfileInput) {
    const profile = await startNewEngineerProfile(input, profileRepo);
    setProfiles((prev) => [...prev, profile]);
    setActiveProfileId(profile.id);
    setProgressList([]);
    setShowNewEngineerForm(false);
    setProfileConfirmed(true);
  }

  async function handleSelectProfile(profileId: string) {
    await handleSwitchProfile(profileId);
    setProfileConfirmed(true);
  }

  function handleSwitchProfileClick() {
    setProfileConfirmed(false);
    setTab('dashboard');
  }

  async function ensureProgress(taskId: string): Promise<TaskProgress> {
    if (!activeProfileId) throw new Error('No active profile.');
    const existing = progressByTaskId.get(taskId);
    if (existing) return existing;
    const fresh = createInitialProgress(activeProfileId, taskId);
    await progressRepo.save(fresh);
    setProgressList((prev) => [...prev, fresh]);
    return fresh;
  }

  async function handleStatusChange(taskId: string, status: TaskStatus, options?: { reopenReason?: string }) {
    const current = await ensureProgress(taskId);
    const { progress } = applyStatusChange(current, status, options);
    await progressRepo.save(progress);
    setProgressList((prev) => prev.map((p) => (p.key === progress.key ? progress : p)));
    if (status === 'Completed') showToast('Mission completed — nice work!');
  }

  async function handleUndo(taskId: string) {
    const current = progressByTaskId.get(taskId);
    if (!current) return;
    const reverted = undoLastTransition(current);
    await progressRepo.save(reverted);
    setProgressList((prev) => prev.map((p) => (p.key === reverted.key ? reverted : p)));
  }

  async function handleSaveNotes(taskId: string, notes: string) {
    const current = await ensureProgress(taskId);
    const updated: TaskProgress = { ...current, notes, updatedAt: new Date().toISOString() };
    await progressRepo.save(updated);
    setProgressList((prev) => prev.map((p) => (p.key === updated.key ? updated : p)));
  }

  async function handleSaveEvidenceLink(taskId: string, link: string) {
    const current = await ensureProgress(taskId);
    const updated: TaskProgress = { ...current, evidenceLink: link || undefined, updatedAt: new Date().toISOString() };
    await progressRepo.save(updated);
    setProgressList((prev) => prev.map((p) => (p.key === updated.key ? updated : p)));
  }

  async function handleSwitchProfile(profileId: string) {
    setActiveProfileId(profileId);
    await profileRepo.setActiveProfileId(profileId);
    setProgressList(await progressRepo.getAllForProfile(profileId));
  }

  async function handleResetProfile() {
    if (!activeProfileId) return;
    await resetProfileProgress(activeProfileId, progressRepo);
    setProgressList([]);
    showToast('Profile progress has been reset.');
  }

  async function handleExportBackup() {
    const allProgress: TaskProgress[] = [];
    for (const p of profiles) allProgress.push(...(await progressRepo.getAllForProfile(p.id)));
    const bundle = buildBackup(tasks, importMeta, profiles, allProgress);
    downloadFile(`onboarding-backup-${Date.now()}.json`, JSON.stringify(bundle, null, 2), 'application/json');
  }

  async function handleRestoreBackup(file: File) {
    const text = await file.text();
    const bundle = parseBackup(text);
    await curriculumRepo.replaceAllTasks(bundle.curriculumTasks);
    if (bundle.importMeta) await curriculumRepo.setImportMeta(bundle.importMeta);
    for (const profile of bundle.profiles) await profileRepo.updateProfile(profile);
    for (const progress of bundle.progress) await progressRepo.save(progress);
    await bootstrap();
    showToast('Backup restored.');
  }

  function handleExportCsv() {
    const csv = buildProgressCsv(tasks, progressByTaskId);
    downloadFile(`progress-${activeProfile?.fullName ?? 'engineer'}.csv`, csv, 'text/csv');
  }

  function handlePrintSummary() {
    window.print();
  }

  if (loading) {
    return <div className="loading-state">Loading your onboarding journey…</div>;
  }
  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (tasks.length === 0 && !showImportScreen) {
    return (
      <div className="app-shell">
        <ImportWorkbookScreen onFileSelected={handleWorkbookImport} busy={importBusy} error={importError} />
      </div>
    );
  }

  if (profiles.length > 0 && !profileConfirmed && !showNewEngineerForm) {
    return (
      <div className="app-shell">
        <ProfileSelector
          profiles={profiles}
          onSelectProfile={(id) => void handleSelectProfile(id)}
          onStartNewEngineer={() => setShowNewEngineerForm(true)}
        />
      </div>
    );
  }

  if (!activeProfile || showNewEngineerForm) {
    return (
      <div className="app-shell">
        <ProfileSetupForm
          onSubmit={handleCreateProfile}
          title={showNewEngineerForm ? 'Start New Engineer' : undefined}
        />
        {showNewEngineerForm && profiles.length > 0 && (
          <button
            type="button"
            className="btn"
            style={{ display: 'block', margin: '0 auto', maxWidth: 480 }}
            onClick={() => setShowNewEngineerForm(false)}
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            DM
          </span>
          <div className="titles">
            <h1>Welcome, {activeProfile.fullName}</h1>
            <div className="subtitle">DEFECT METROLOGY New Engineer Journey</div>
          </div>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button className="btn" onClick={handleSwitchProfileClick}>
            Switch Profile
          </button>
          <button className="btn" onClick={() => setTab('settings')}>
            <IconSettingsGear size={16} /> Data &amp; Profile Settings
          </button>
        </div>
      </header>

      {showOrientation && (
        <OrientationModal
          engineerFirstName={activeProfile.fullName.split(' ')[0] || activeProfile.fullName}
          totalPhases={totalPhaseCount}
          totalModules={totalModuleCount}
          totalMissions={totalMissionCount}
          targetCompletionDate={activeProfile.targetCompletionDate}
          firstPhaseLabel={firstPhaseLabel}
          onStart={dismissOrientation}
        />
      )}

      <nav className="tabs" role="tablist" aria-label="Sections">
        <button className="tab" role="tab" aria-selected={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
          <IconGrid size={16} /> Dashboard
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'checklist'} onClick={() => setTab('checklist')}>
          <IconList size={16} /> Checklist
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'survivalGuide'} onClick={() => setTab('survivalGuide')}>
          <IconBook size={16} /> Survival Guide
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'settings'} onClick={() => setTab('settings')}>
          <IconSettingsGear size={16} /> Settings
        </button>
      </nav>

      {tab === 'dashboard' && (
        <Dashboard
          profile={activeProfile}
          tasks={tasks}
          progressByTaskId={progressByTaskId}
          onOpenTask={(t) => setOpenTaskId(t.id)}
        />
      )}

      {tab === 'checklist' && (
        <ChecklistView
          tasks={tasks}
          progressByTaskId={progressByTaskId}
          onOpenTask={(t) => setOpenTaskId(t.id)}
          openTaskId={openTaskId}
        />
      )}

      {tab === 'survivalGuide' && <SurvivalGuideView entries={SME_CURATED_GLOSSARY_ENTRIES} />}

      {tab === 'settings' && (
        <DataManagementPanel
          profiles={profiles}
          activeProfileId={activeProfile.id}
          importInfo={importMeta}
          onSwitchProfile={(id) => void handleSwitchProfile(id)}
          onStartNewEngineer={() => setShowNewEngineerForm(true)}
          onResetProfile={() => void handleResetProfile()}
          onExportBackup={() => void handleExportBackup()}
          onRestoreBackup={(f) => void handleRestoreBackup(f)}
          onExportCsv={handleExportCsv}
          onPrintSummary={handlePrintSummary}
          onRefreshCurriculum={() => setShowImportScreen(true)}
        />
      )}

      {showImportScreen && (
        <div className="modal-overlay" role="presentation" onClick={() => setShowImportScreen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <ImportWorkbookScreen onFileSelected={handleWorkbookImport} busy={importBusy} error={importError} isReimport />
            <button className="btn" style={{ marginTop: 12 }} onClick={() => setShowImportScreen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {pendingDiff && (
        <ImportReviewModal
          diff={pendingDiff}
          oldTasks={tasks}
          newTasks={pendingTasks}
          onCancel={() => {
            setPendingDiff(null);
            setPendingTasks([]);
            setPendingMeta(null);
          }}
          onApply={(resolutions) => void applyReimport(resolutions)}
        />
      )}

      {openTask && activeProfile && (
        <TaskDetailDrawer
          task={openTask}
          progress={progressByTaskId.get(openTask.id) ?? createInitialProgress(activeProfile.id, openTask.id)}
          phaseLabel={PHASE_LABELS[openTask.phase]}
          moduleTitle={openTaskModule?.title}
          onClose={() => setOpenTaskId(null)}
          onStatusChange={(status, options) => void handleStatusChange(openTask.id, status, options)}
          onSaveNotes={(notes) => void handleSaveNotes(openTask.id, notes)}
          onSaveEvidenceLink={(link) => void handleSaveEvidenceLink(openTask.id, link)}
          onUndo={() => void handleUndo(openTask.id)}
          canUndo={(progressByTaskId.get(openTask.id)?.history.length ?? 0) > 0}
          onNavigate={handleNavigateTask}
          hasPrevious={hasPreviousTask}
          hasNext={hasNextTask}
          positionInModule={
            openTaskIndex >= 0 ? { index: openTaskIndex + 1, total: openModuleTaskIds.length } : undefined
          }
        />
      )}

      {toast && (
        <div role="status" className="success-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
