import { useState } from 'react';
import type { NewEngineerProfileInput } from '../types/profile';

interface ProfileSetupFormProps {
  onSubmit: (input: NewEngineerProfileInput) => void;
  title?: string;
}

/** First-launch (and "Start New Engineer") profile setup form. */
export function ProfileSetupForm({ onSubmit, title }: ProfileSetupFormProps) {
  const [fullName, setFullName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [roleOrTrack, setRoleOrTrack] = useState('');
  const [layerOrArea, setLayerOrArea] = useState('');
  const [manager, setManager] = useState('');
  const [buddyOrMentor, setBuddyOrMentor] = useState('');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !startDate) {
      setError('Full name and start date are required.');
      return;
    }
    onSubmit({
      fullName: fullName.trim(),
      startDate,
      roleOrTrack: roleOrTrack.trim() || undefined,
      layerOrArea: layerOrArea.trim() || undefined,
      manager: manager.trim() || undefined,
      buddyOrMentor: buddyOrMentor.trim() || undefined,
      targetCompletionDate: targetCompletionDate || undefined,
    });
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
      <h1>{title ?? 'New Engineer Setup'}</h1>
      <p>DEFECT METROLOGY New Engineer Journey — let&apos;s set up your profile.</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="fullName">Full name *</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <div className="field">
          <label htmlFor="startDate">Start date *</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <div className="field">
          <label htmlFor="roleOrTrack">Role or onboarding track</label>
          <input id="roleOrTrack" type="text" value={roleOrTrack} onChange={(e) => setRoleOrTrack(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="layerOrArea">Assigned layer or area</label>
          <input id="layerOrArea" type="text" value={layerOrArea} onChange={(e) => setLayerOrArea(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="manager">Manager</label>
          <input id="manager" type="text" value={manager} onChange={(e) => setManager(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="buddy">Buddy or mentor</label>
          <input id="buddy" type="text" value={buddyOrMentor} onChange={(e) => setBuddyOrMentor(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="targetDate">Target completion date (optional)</label>
          <input
            id="targetDate"
            type="date"
            value={targetCompletionDate}
            onChange={(e) => setTargetCompletionDate(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="needs-clarification-note">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Start My Onboarding Journey
        </button>
      </form>
    </div>
  );
}
