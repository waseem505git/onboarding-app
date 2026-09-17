import { useRef, useState } from 'react';
import type { EngineerProfile } from '../types/profile';
import { ConfirmDialog } from './ConfirmDialog';

interface DataManagementPanelProps {
  profiles: EngineerProfile[];
  activeProfileId: string;
  importInfo: { importedAt: string; sourceFileName: string; taskCount: number } | null;
  onSwitchProfile: (profileId: string) => void;
  onStartNewEngineer: () => void;
  onResetProfile: () => void;
  onExportBackup: () => void;
  onRestoreBackup: (file: File) => void;
  onExportCsv: () => void;
  onPrintSummary: () => void;
  onRefreshCurriculum: () => void;
}

export function DataManagementPanel({
  profiles,
  activeProfileId,
  importInfo,
  onSwitchProfile,
  onStartNewEngineer,
  onResetProfile,
  onExportBackup,
  onRestoreBackup,
  onExportCsv,
  onPrintSummary,
  onRefreshCurriculum,
}: DataManagementPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="card">
      <h2>Data &amp; Profile Management</h2>

      <div className="field">
        <label htmlFor="profile-switch">Active engineer profile</label>
        <select id="profile-switch" value={activeProfileId} onChange={(e) => onSwitchProfile(e.target.value)}>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName} ({p.startDate})
            </option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: 13 }}>
        Curriculum last imported: {importInfo ? new Date(importInfo.importedAt).toLocaleString() : 'never'}
        {importInfo ? ` — ${importInfo.taskCount} tasks from "${importInfo.sourceFileName}"` : ''}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn" onClick={onRefreshCurriculum}>
          Refresh Master Curriculum…
        </button>
        <button className="btn" onClick={onStartNewEngineer}>
          Start New Engineer
        </button>
        <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>
          Reset Current Profile
        </button>
      </div>

      <h3>Backup &amp; Export</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={onExportBackup}>
          Export JSON Backup
        </button>
        <button className="btn" onClick={() => restoreInputRef.current?.click()}>
          Restore from Backup…
        </button>
        <input
          ref={restoreInputRef}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onRestoreBackup(file);
          }}
        />
        <button className="btn" onClick={onExportCsv}>
          Export Progress CSV
        </button>
        <button className="btn" onClick={onPrintSummary}>
          Print-Friendly Summary
        </button>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset current profile?"
          message="This permanently deletes all progress, notes, and evidence links for the current engineer. The master curriculum is not affected. This cannot be undone."
          confirmLabel="Reset Profile"
          danger
          onConfirm={() => {
            setConfirmReset(false);
            onResetProfile();
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
