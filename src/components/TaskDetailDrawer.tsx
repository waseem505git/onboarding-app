import { useEffect, useState } from 'react';
import type { CurriculumTask } from '../types/curriculum';
import type { TaskProgress, TaskStatus } from '../types/progress';
import { TASK_STATUSES } from '../types/progress';
import { StatusBadge } from './StatusBadge';
import { GlossaryHint } from './GlossaryHint';
import { sanitizeUrl } from '../utils/sanitize';

interface TaskDetailDrawerProps {
  task: CurriculumTask;
  progress: TaskProgress;
  /** Human-readable phase label, for the Phase > Module > Task breadcrumb. */
  phaseLabel?: string;
  /** The training module this task belongs to, for the breadcrumb. */
  moduleTitle?: string;
  onClose: () => void;
  onStatusChange: (status: TaskStatus, options?: { reopenReason?: string }) => void;
  onSaveNotes: (notes: string) => void;
  onSaveEvidenceLink: (link: string) => void;
  onUndo?: () => void;
  canUndo: boolean;
  /** Moves to the previous/next task within the current module, without closing the drawer. */
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  /** 1-based position of this task within its module, e.g. "3 of 24". */
  positionInModule?: { index: number; total: number };
}

export function TaskDetailDrawer({
  task,
  progress,
  phaseLabel,
  moduleTitle,
  onClose,
  onStatusChange,
  onSaveNotes,
  onSaveEvidenceLink,
  onUndo,
  canUndo,
  onNavigate,
  hasPrevious,
  hasNext,
  positionInModule,
}: TaskDetailDrawerProps) {
  const [notes, setNotes] = useState(progress.notes);
  const [evidenceLink, setEvidenceLink] = useState(progress.evidenceLink ?? '');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenPrompt, setShowReopenPrompt] = useState(false);

  // The drawer stays mounted while navigating between sibling tasks in the
  // same module, so local edit buffers must be reset whenever the task
  // identity changes (otherwise stale notes/links from the previous task
  // would briefly show, and unsaved edits could silently leak across tasks).
  useEffect(() => {
    setNotes(progress.notes);
    setEvidenceLink(progress.evidenceLink ?? '');
    setReopenReason('');
    setShowReopenPrompt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  const safeSourceLink = sanitizeUrl(task.sourceHyperlink);

  function goTo(direction: 'prev' | 'next') {
    // Persist any in-progress edits before moving away so nothing is lost.
    if (notes !== progress.notes) onSaveNotes(notes);
    if (evidenceLink !== (progress.evidenceLink ?? '')) onSaveEvidenceLink(evidenceLink);
    onNavigate?.(direction);
  }

  function handleStatusSelect(next: TaskStatus) {
    if (progress.status === 'Completed' && next !== 'Completed') {
      setShowReopenPrompt(true);
      return;
    }
    onStatusChange(next);
  }

  function confirmReopen(next: TaskStatus) {
    onStatusChange(next, { reopenReason: reopenReason.trim() || 'No reason provided' });
    setShowReopenPrompt(false);
    setReopenReason('');
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} role="presentation" />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="task-drawer-title">
        <div className="drawer-top-row">
          <button className="btn" onClick={onClose}>
            ← Back to checklist
          </button>
          {onNavigate && (hasPrevious || hasNext) && (
            <div className="drawer-nav" role="group" aria-label="Move between missions in this module">
              <button
                type="button"
                className="btn"
                onClick={() => goTo('prev')}
                disabled={!hasPrevious}
                aria-label="Previous mission in this module"
              >
                ← Previous
              </button>
              {positionInModule && (
                <span className="drawer-nav-position">
                  {positionInModule.index} of {positionInModule.total}
                </span>
              )}
              <button
                type="button"
                className="btn"
                onClick={() => goTo('next')}
                disabled={!hasNext}
                aria-label="Next mission in this module"
              >
                Next →
              </button>
            </div>
          )}
        </div>
        <h2 id="task-drawer-title">
          {task.title} <GlossaryHint text={task.title} />
        </h2>
        {(phaseLabel || moduleTitle) && (
          <nav aria-label="Breadcrumb" className="task-breadcrumb">
            {phaseLabel && <span>{phaseLabel}</span>}
            {moduleTitle && (
              <>
                <span aria-hidden="true"> &gt; </span>
                <span>{moduleTitle}</span>
              </>
            )}
            <span aria-hidden="true"> &gt; </span>
            <span className="task-breadcrumb-current">{task.title}</span>
          </nav>
        )}
        <p style={{ fontSize: 12 }}>{task.required ? 'Required' : 'Optional'}</p>
        <StatusBadge status={progress.status} />
        {task.needsClarification && (
          <p className="needs-clarification-note">
            <strong>Needs trainer clarification.</strong>{' '}
            {task.clarificationNote ??
              'This mission requires clarification from your trainer or onboarding buddy.'}
          </p>
        )}

        {task.description && (
          <div className="field">
            <label>Description</label>
            <p style={{ whiteSpace: 'pre-line', color: 'var(--text)' }}>{task.description}</p>
          </div>
        )}

        <details className="field source-text-details">
          <summary>Source information</summary>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Section: {task.category}
            <br />
            Workbook row: {task.sourceRow}
            <br />
            Original source text: {task.sourceText}
          </p>
        </details>

        {safeSourceLink && (
          <div className="field">
            <label>Source link</label>
            <a href={safeSourceLink} target="_blank" rel="noopener noreferrer">
              Open reference
            </a>
          </div>
        )}

        {task.prerequisites.length > 0 && (
          <div className="field">
            <label>Prerequisites</label>
            <ul>
              {task.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="field">
          <label htmlFor="status-select">Status</label>
          <select
            id="status-select"
            value={progress.status}
            onChange={(e) => handleStatusSelect(e.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {showReopenPrompt && (
          <div className="field">
            <label htmlFor="reopen-reason">Reason for reopening this completed mission</label>
            <textarea
              id="reopen-reason"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              rows={2}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="btn" onClick={() => setShowReopenPrompt(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => confirmReopen('In Progress')}>
                Reopen as In Progress
              </button>
            </div>
          </div>
        )}

        {progress.status === 'Completed' && canUndo && onUndo && (
          <button className="btn-link" onClick={onUndo}>
            Undo last change
          </button>
        )}

        <div className="field">
          <label htmlFor="task-notes">Notes</label>
          <textarea id="task-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          <button className="btn" style={{ marginTop: 6 }} onClick={() => onSaveNotes(notes)}>
            Save Notes
          </button>
        </div>

        <div className="field">
          <label htmlFor="evidence-link">Evidence link</label>
          <input
            id="evidence-link"
            type="url"
            value={evidenceLink}
            onChange={(e) => setEvidenceLink(e.target.value)}
            placeholder="https://…"
          />
          <button className="btn" style={{ marginTop: 6 }} onClick={() => onSaveEvidenceLink(evidenceLink)}>
            Save Evidence Link
          </button>
        </div>

        {progress.trainerOrOwner && (
          <div className="field">
            <label>Trainer / Owner</label>
            <p>{progress.trainerOrOwner}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => handleStatusSelect('Ready for Review')}
            disabled={progress.status === 'Ready for Review'}
          >
            Mark Ready for Review
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleStatusSelect('Completed')}
            disabled={progress.status === 'Completed'}
          >
            Complete Mission
          </button>
        </div>
      </div>
    </>
  );
}
