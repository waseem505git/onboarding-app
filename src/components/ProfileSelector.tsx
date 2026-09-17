import type { EngineerProfile } from '../types/profile';


interface ProfileSelectorProps {
  profiles: EngineerProfile[];
  onSelectProfile: (profileId: string) => void;
  onStartNewEngineer: () => void;
}

/**
 * Landing screen shown on every fresh visit so the app never silently
 * resumes the last person's session. Each engineer must explicitly pick
 * their own profile (or create a new one) before seeing any dashboard data.
 */
export function ProfileSelector({ profiles, onSelectProfile, onStartNewEngineer }: ProfileSelectorProps) {
  return (
    <div className="card" style={{ maxWidth: 560, margin: '40px auto' }}>
      <h1>Who&apos;s onboarding?</h1>
      <p>DEFECT METROLOGY New Engineer Journey — select your profile to continue, or start a new one.</p>

      {profiles.length > 0 && (
        <div className="profile-select-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              className="btn"
              style={{ textAlign: 'left', width: '100%' }}
              onClick={() => onSelectProfile(p.id)}
            >
              <strong>{p.fullName}</strong>
              <span style={{ marginLeft: 8, fontSize: 13, opacity: 0.75 }}>
                Started {p.startDate}
                {p.roleOrTrack ? ` · ${p.roleOrTrack}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={onStartNewEngineer}>
        Start New Engineer
      </button>
    </div>
  );
}
