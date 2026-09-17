import type { CurriculumTask, ImportMeta } from '../types/curriculum';
import type { EngineerProfile } from '../types/profile';
import type { TaskProgress } from '../types/progress';

export interface BackupBundle {
  formatVersion: 1;
  exportedAt: string;
  curriculumTasks: CurriculumTask[];
  importMeta: ImportMeta | null;
  profiles: EngineerProfile[];
  progress: TaskProgress[];
}

export function buildBackup(
  curriculumTasks: CurriculumTask[],
  importMeta: ImportMeta | null,
  profiles: EngineerProfile[],
  progress: TaskProgress[],
): BackupBundle {
  return {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    curriculumTasks,
    importMeta,
    profiles,
    progress,
  };
}

export function parseBackup(json: string): BackupBundle {
  const parsed = JSON.parse(json);
  if (!parsed || parsed.formatVersion !== 1) {
    throw new Error('Unrecognized backup file format.');
  }
  return parsed as BackupBundle;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildProgressCsv(
  tasks: CurriculumTask[],
  progressByTaskId: Map<string, TaskProgress>,
): string {
  const header = [
    'Phase',
    'Category',
    'Title',
    'Required',
    'Status',
    'TargetDate',
    'CompletionDate',
    'TrainerOrOwner',
    'Notes',
    'EvidenceLink',
    'SourceHyperlink',
    'NeedsClarification',
  ];
  const rows = tasks.map((task) => {
    const progress = progressByTaskId.get(task.id);
    return [
      task.phase,
      task.category,
      task.title,
      task.required ? 'Required' : 'Optional',
      progress?.status ?? 'Not Started',
      progress?.targetDate ?? '',
      progress?.completionDate ?? '',
      progress?.trainerOrOwner ?? '',
      progress?.notes ?? '',
      progress?.evidenceLink ?? '',
      task.sourceHyperlink ?? '',
      task.needsClarification ? 'Yes' : 'No',
    ]
      .map((v) => csvEscape(String(v)))
      .join(',');
  });
  return [header.join(','), ...rows].join('\n');
}
