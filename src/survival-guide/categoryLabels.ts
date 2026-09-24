/**
 * Stage B, Step 4 — display labels for `GlossaryCategory`. Presentation-only:
 * does not change the underlying category values used for filtering/data.
 */
import type { GlossaryCategory } from './types';

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  'yield-defect': 'Yield & Defect Basics',
  'tracer-investigation': 'Tracer & Investigation',
  'recovery-tool-actions': 'Recovery & Tool Actions',
  'pd-daily-work': 'PD & Daily Work',
  'process-manufacturing': 'Manufacturing & Process',
  'measurement-analysis': 'Measurement & Analysis Flow',
  systems: 'Systems, Quality & Control',
};

export const CATEGORY_ORDER: GlossaryCategory[] = [
  'yield-defect',
  'tracer-investigation',
  'recovery-tool-actions',
  'pd-daily-work',
  'process-manufacturing',
  'measurement-analysis',
  'systems',
];
