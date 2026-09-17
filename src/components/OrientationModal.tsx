import { IconArrowRight, IconFlag, IconLayers, IconList } from './icons';

const ORIENTATION_SEEN_PREFIX = 'defmet.orientationSeen.';

/** True if this profile has already dismissed the first-run orientation screen. */
export function hasSeenOrientation(profileId: string): boolean {
  try {
    return window.localStorage.getItem(ORIENTATION_SEEN_PREFIX + profileId) === '1';
  } catch {
    // Storage unavailable — treat as not seen so the user isn't blocked; it
    // just won't persist across reloads in that environment.
    return false;
  }
}

export function markOrientationSeen(profileId: string): void {
  try {
    window.localStorage.setItem(ORIENTATION_SEEN_PREFIX + profileId, '1');
  } catch {
    // Nothing to do — the modal will simply reappear next load in
    // environments without usable storage (e.g. private browsing).
  }
}

interface OrientationModalProps {
  engineerFirstName: string;
  totalPhases: number;
  totalModules: number;
  totalMissions: number;
  targetCompletionDate?: string;
  firstPhaseLabel: string;
  onStart: () => void;
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * One-time first-run orientation shown right after profile creation, before
 * the engineer sees the (data-heavy) Dashboard for the first time. Dismissal
 * is persisted per-profile in localStorage via markOrientationSeen — it is a
 * UI preference only and never touches curriculum/progress data.
 */
export function OrientationModal({
  engineerFirstName,
  totalPhases,
  totalModules,
  totalMissions,
  targetCompletionDate,
  firstPhaseLabel,
  onStart,
}: OrientationModalProps) {
  const formattedTarget = formatDate(targetCompletionDate);

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal orientation-modal" role="dialog" aria-modal="true" aria-labelledby="orientation-title">
        <h1 id="orientation-title">Welcome to DEFECT METROLOGY Onboarding</h1>
        <p>
          Hi {engineerFirstName}, here&apos;s a quick look at how your onboarding journey is organized before you dive
          in.
        </p>

        <div className="orientation-stats">
          <div className="orientation-stat">
            <IconFlag size={18} aria-hidden="true" />
            <div>
              <div className="orientation-stat-value">{totalPhases}</div>
              <div className="orientation-stat-label">Phases</div>
            </div>
          </div>
          <div className="orientation-stat">
            <IconLayers size={18} aria-hidden="true" />
            <div>
              <div className="orientation-stat-value">{totalModules}</div>
              <div className="orientation-stat-label">Modules</div>
            </div>
          </div>
          <div className="orientation-stat">
            <IconList size={18} aria-hidden="true" />
            <div>
              <div className="orientation-stat-value">{totalMissions}</div>
              <div className="orientation-stat-label">Missions</div>
            </div>
          </div>
        </div>

        {formattedTarget && (
          <p className="orientation-target">
            Your target completion date: <strong>{formattedTarget}</strong>
          </p>
        )}

        <div className="orientation-hierarchy">
          <div className="orientation-hierarchy-row">
            <span className="orientation-hierarchy-label">Phase</span>
          </div>
          <div className="orientation-hierarchy-row orientation-hierarchy-indent-1">
            <IconArrowRight size={14} aria-hidden="true" />
            <span className="orientation-hierarchy-label">Module</span>
          </div>
          <div className="orientation-hierarchy-row orientation-hierarchy-indent-2">
            <IconArrowRight size={14} aria-hidden="true" />
            <span className="orientation-hierarchy-label">Mission</span>
          </div>
        </div>

        <p>
          Your journey starts with <strong>{firstPhaseLabel}</strong>.
        </p>

        <button type="button" className="btn btn-primary orientation-start-btn" onClick={onStart}>
          Start My Journey
        </button>
      </div>
    </div>
  );
}
