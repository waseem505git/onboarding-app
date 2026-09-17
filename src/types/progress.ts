export type TaskStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Blocked'
  | 'Waiting for Trainer'
  | 'Ready for Review'
  | 'Completed'
  | 'Not Applicable';

export const TASK_STATUSES: TaskStatus[] = [
  'Not Started',
  'In Progress',
  'Blocked',
  'Waiting for Trainer',
  'Ready for Review',
  'Completed',
  'Not Applicable',
];

/** Per-engineer, per-task progress record. Stored separately from curriculum data. */
export interface TaskProgress {
  /** profileId + taskId composite key, e.g. `${profileId}::${taskId}` */
  key: string;
  profileId: string;
  taskId: string;
  status: TaskStatus;
  notes: string;
  evidenceLink?: string;
  trainerOrOwner?: string;
  targetDate?: string;
  completionDate?: string;
  updatedAt: string;
  /** Reason supplied when a Completed task is reopened. */
  reopenReason?: string;
  history: ProgressHistoryEntry[];
}

export interface ProgressHistoryEntry {
  timestamp: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  note?: string;
}

export function createInitialProgress(profileId: string, taskId: string): TaskProgress {
  return {
    key: `${profileId}::${taskId}`,
    profileId,
    taskId,
    status: 'Not Started',
    notes: '',
    history: [],
    updatedAt: new Date().toISOString(),
  };
}
