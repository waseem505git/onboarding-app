import { getDb } from './db';
import type { CurriculumTask, ImportMeta } from '../types/curriculum';

/**
 * Repository interface for curriculum (master workbook) data. Abstracted so
 * a future approved shared backend can implement the same interface without
 * any UI changes.
 */
export interface CurriculumRepository {
  getAllTasks(): Promise<CurriculumTask[]>;
  replaceAllTasks(tasks: CurriculumTask[]): Promise<void>;
  getImportMeta(): Promise<ImportMeta | null>;
  setImportMeta(meta: ImportMeta): Promise<void>;
}

export class IndexedDbCurriculumRepository implements CurriculumRepository {
  async getAllTasks(): Promise<CurriculumTask[]> {
    const db = await getDb();
    return db.getAll('curriculumTasks');
  }

  async replaceAllTasks(tasks: CurriculumTask[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('curriculumTasks', 'readwrite');
    await tx.store.clear();
    await Promise.all(tasks.map((task) => tx.store.put(task)));
    await tx.done;
  }

  async getImportMeta(): Promise<ImportMeta | null> {
    const db = await getDb();
    const record = await db.get('importMeta', 'current');
    if (!record) return null;
    const { key: _key, ...meta } = record;
    return meta;
  }

  async setImportMeta(meta: ImportMeta): Promise<void> {
    const db = await getDb();
    await db.put('importMeta', { ...meta, key: 'current' });
  }
}
