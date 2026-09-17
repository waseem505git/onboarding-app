import type { AchievementStatus } from '../achievements/achievementRules';
import { IconAward, IconLock } from './icons';

export function AchievementBadges({ achievements }: { achievements: AchievementStatus[] }) {
  return (
    <div className="achievements-grid" role="list" aria-label="Onboarding achievements">
      {achievements.map((a) => (
        <div key={a.id} role="listitem" className={`achievement-badge ${a.earned ? 'earned' : 'locked'}`}>
          <span className="achievement-icon" aria-hidden="true">
            {a.earned ? <IconAward size={22} /> : <IconLock size={22} />}
          </span>
          <div className="achievement-title">{a.title}</div>
          <div className="achievement-desc">{a.description}</div>
          <div className="achievement-state">{a.earned ? 'Earned' : 'Locked'}</div>
        </div>
      ))}
    </div>
  );
}
