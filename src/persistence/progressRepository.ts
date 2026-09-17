import { getDb } from './db';
import type { TaskProgress } from '../types/progress';

export interface ProgressRepository {
  getAllForProfile(profileId: string): Promise<TaskProgress[]>;
  get(profileId: string, taskId: string): Promise<TaskProgress | null>;
  save(progress: TaskProgress): Promise<void>;
  deleteAllForProfile(profileId: string): Promise<void>;
  /** Reassigns a progress record to a new task id (used after a confirmed re-import rename). */
  remapTaskId(profileId: string, oldTaskId: string, newTaskId: string): Promise<void>;
}

export class IndexedDbProgressRepository implements ProgressRepository {
  async getAllForProfile(profileId: string): Promise<TaskProgress[]> {
    const db = await getDb();
    const all = await db.getAll('progress');
    return all.filter((p) => p.profileId === profileId);
  }

  async get(profileId: string, taskId: string): Promise<TaskProgress | null> {
    const db = await getDb();
    return (await db.get('progress', `${profileId}::${taskId}`)) ?? null;
  }

  async save(progress: TaskProgress): Promise<void> {
    const db = await getDb();
    await db.put('progress', progress);
  }

  async deleteAllForProfile(profileId: string): Promise<void> {
    const db = await getDb();
    const all = await this.getAllForProfile(profileId);
    const tx = db.transaction('progress', 'readwrite');
    await Promise.all(all.map((p) => tx.store.delete(p.key)));
    await tx.done;
  }

  async remapTaskId(profileId: string, oldTaskId: string, newTaskId: string): Promise<void> {
    const db = await getDb();
    const existing = await this.get(profileId, oldTaskId);
    if (!existing) return;
    const remapped: TaskProgress = {
      ...existing,
      taskId: newTaskId,
      key: `${profileId}::${newTaskId}`,
      updatedAt: new Date().toISOString(),
    };
    const tx = db.transaction('progress', 'readwrite');
    await tx.store.delete(existing.key);
    await tx.store.put(remapped);
    await tx.done;
  }
}
