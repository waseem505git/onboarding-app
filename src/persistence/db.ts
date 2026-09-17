import { openDB, type IDBPDatabase } from 'idb';
import type { CurriculumTask, ImportMeta } from '../types/curriculum';
import type { EngineerProfile } from '../types/profile';
import type { TaskProgress } from '../types/progress';

/**
 * All application data lives in the browser's IndexedDB, in a database local
 * to this machine/browser profile. Nothing is sent to a server. See
 * docs/privacy-and-security.md for details.
 */

const DB_NAME = 'defect-metrology-onboarding';
const DB_VERSION = 1;

export interface OnboardingSchema {
  curriculumTasks: CurriculumTask;
  importMeta: ImportMeta & { key: 'current' };
  profiles: EngineerProfile;
  progress: TaskProgress;
  appState: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('curriculumTasks')) {
          db.createObjectStore('curriculumTasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('importMeta')) {
          db.createObjectStore('importMeta', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/** Test/dev helper to fully reset the local database. */
export async function deleteDatabase(): Promise<void> {
  const existing = dbPromise;
  dbPromise = null;
  if (existing) {
    const db = await existing;
    db.close();
  }
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
