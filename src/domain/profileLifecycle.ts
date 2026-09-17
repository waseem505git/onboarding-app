import { IndexedDbProfileRepository } from '../persistence/profileRepository';
import { IndexedDbProgressRepository } from '../persistence/progressRepository';
import type { EngineerProfile, NewEngineerProfileInput } from '../types/profile';

/**
 * Creates a brand-new engineer profile with a clean progress slate, without
 * touching the master curriculum. Used for both "Start New Engineer" and
 * "Reset current profile" (reset additionally clears the current profile's
 * own progress records first).
 */
export async function startNewEngineerProfile(
  input: NewEngineerProfileInput,
  profileRepo: ProfileRepositoryLike = new IndexedDbProfileRepository(),
): Promise<EngineerProfile> {
  const profile = await profileRepo.createProfile(input);
  await profileRepo.setActiveProfileId(profile.id);
  return profile;
}

export async function resetProfileProgress(
  profileId: string,
  progressRepo: ProgressRepositoryLike = new IndexedDbProgressRepository(),
): Promise<void> {
  await progressRepo.deleteAllForProfile(profileId);
}

// Narrow structural types so these functions stay easily testable without
// pulling in the full IndexedDB implementation.
interface ProfileRepositoryLike {
  createProfile: IndexedDbProfileRepository['createProfile'];
  setActiveProfileId: IndexedDbProfileRepository['setActiveProfileId'];
}
interface ProgressRepositoryLike {
  deleteAllForProfile: IndexedDbProgressRepository['deleteAllForProfile'];
}
