import 'fake-indexeddb/auto';
import { describe, expect, it, beforeEach } from 'vitest';
import { deleteDatabase } from '../persistence/db';
import { IndexedDbProfileRepository } from '../persistence/profileRepository';
import { IndexedDbProgressRepository } from '../persistence/progressRepository';
import { startNewEngineerProfile, resetProfileProgress } from './profileLifecycle';
import { createInitialProgress } from '../types/progress';

describe('profileLifecycle', () => {
  beforeEach(async () => {
    await deleteDatabase();
  });

  it('reset creates a clean slate: progress is gone but the profile itself remains', async () => {
    const profileRepo = new IndexedDbProfileRepository();
    const progressRepo = new IndexedDbProgressRepository();

    const profile = await startNewEngineerProfile(
      { fullName: 'Ada Lovelace', startDate: '2026-01-05' },
      profileRepo,
    );
    await progressRepo.save({ ...createInitialProgress(profile.id, 'task-1'), status: 'Completed' });

    let progressList = await progressRepo.getAllForProfile(profile.id);
    expect(progressList).toHaveLength(1);

    await resetProfileProgress(profile.id, progressRepo);

    progressList = await progressRepo.getAllForProfile(profile.id);
    expect(progressList).toHaveLength(0);
    const stillThere = await profileRepo.getProfile(profile.id);
    expect(stillThere?.fullName).toBe('Ada Lovelace');
  });

  it('starting a new engineer creates an independent profile from any existing one', async () => {
    const profileRepo = new IndexedDbProfileRepository();
    const first = await startNewEngineerProfile({ fullName: 'Ada Lovelace', startDate: '2026-01-05' }, profileRepo);
    const second = await startNewEngineerProfile({ fullName: 'Grace Hopper', startDate: '2026-02-01' }, profileRepo);
    expect(first.id).not.toBe(second.id);
    const all = await profileRepo.getAllProfiles();
    expect(all).toHaveLength(2);
  });
});
