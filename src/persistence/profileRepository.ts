import { getDb } from './db';
import type { EngineerProfile, NewEngineerProfileInput } from '../types/profile';

export interface ProfileRepository {
  getAllProfiles(): Promise<EngineerProfile[]>;
  getProfile(id: string): Promise<EngineerProfile | null>;
  createProfile(input: NewEngineerProfileInput): Promise<EngineerProfile>;
  updateProfile(profile: EngineerProfile): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  getActiveProfileId(): Promise<string | null>;
  setActiveProfileId(id: string | null): Promise<void>;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class IndexedDbProfileRepository implements ProfileRepository {
  async getAllProfiles(): Promise<EngineerProfile[]> {
    const db = await getDb();
    return db.getAll('profiles');
  }

  async getProfile(id: string): Promise<EngineerProfile | null> {
    const db = await getDb();
    return (await db.get('profiles', id)) ?? null;
  }

  async createProfile(input: NewEngineerProfileInput): Promise<EngineerProfile> {
    const db = await getDb();
    const now = new Date().toISOString();
    const profile: EngineerProfile = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.put('profiles', profile);
    return profile;
  }

  async updateProfile(profile: EngineerProfile): Promise<void> {
    const db = await getDb();
    await db.put('profiles', { ...profile, updatedAt: new Date().toISOString() });
  }

  async deleteProfile(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('profiles', id);
  }

  async getActiveProfileId(): Promise<string | null> {
    const db = await getDb();
    const record = await db.get('appState', 'activeProfileId');
    return (record?.value as string | undefined) ?? null;
  }

  async setActiveProfileId(id: string | null): Promise<void> {
    const db = await getDb();
    await db.put('appState', { key: 'activeProfileId', value: id });
  }
}
