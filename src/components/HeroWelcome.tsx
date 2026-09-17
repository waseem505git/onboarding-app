import type { EngineerProfile } from '../types/profile';
import type { ProgressSummary } from '../domain/progressCalculations';
import { ProgressRing } from './ProgressRing';
import { IconCalendar, IconFlag, IconLayers, IconArrowRight } from './icons';

interface HeroWelcomeProps {
  profile: EngineerProfile;
  overall: ProgressSummary;
  currentPhaseLabel: string;
  currentModuleTitle?: string | null;
  nextMissionTitle?: string | null;
}

function formatDate(iso?: string): string {
  if (!iso) return 'Not set';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function HeroWelcome({
  profile,
  overall,
  currentPhaseLabel,
  currentModuleTitle,
  nextMissionTitle,
}: HeroWelcomeProps) {
  return (
    <section className="hero-welcome" aria-label="Onboarding overview">
      <div className="hero-text">
        <p className="hero-eyebrow">DEFECT METROLOGY Onboarding</p>
        <h1>Welcome back, {profile.fullName}</h1>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-icon" aria-hidden="true">
              <IconFlag size={16} />
            </span>
            <div>
              <div className="hero-stat-label">Current phase</div>
              <div className="hero-stat-value">{currentPhaseLabel}</div>
            </div>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-icon" aria-hidden="true">
              <IconCalendar size={16} />
            </span>
            <div>
              <div className="hero-stat-label">Start date</div>
              <div className="hero-stat-value">{formatDate(profile.startDate)}</div>
            </div>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-icon" aria-hidden="true">
              <IconCalendar size={16} />
            </span>
            <div>
              <div className="hero-stat-label">Target completion</div>
              <div className="hero-stat-value">{formatDate(profile.targetCompletionDate)}</div>
            </div>
          </div>
        </div>
        {(currentModuleTitle || nextMissionTitle) && (
          <div className="hero-current-module">
            {currentModuleTitle && (
              <div className="hero-stat">
                <span className="hero-stat-icon" aria-hidden="true">
                  <IconLayers size={16} />
                </span>
                <div>
                  <div className="hero-stat-label">Current Training Module</div>
                  <div className="hero-stat-value">{currentModuleTitle}</div>
                </div>
              </div>
            )}
            {nextMissionTitle && (
              <div className="hero-stat">
                <span className="hero-stat-icon" aria-hidden="true">
                  <IconArrowRight size={16} />
                </span>
                <div>
                  <div className="hero-stat-label">Next Mission</div>
                  <div className="hero-stat-value">{nextMissionTitle}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="hero-ring">
        <ProgressRing percent={overall.percentComplete} label="Overall progress" sublabel="Overall progress" />
      </div>
    </section>
  );
}

