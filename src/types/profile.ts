export interface EngineerProfile {
  id: string;
  fullName: string;
  startDate: string; // ISO date
  roleOrTrack?: string;
  layerOrArea?: string;
  manager?: string;
  buddyOrMentor?: string;
  targetCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewEngineerProfileInput = Omit<
  EngineerProfile,
  'id' | 'createdAt' | 'updatedAt'
>;
