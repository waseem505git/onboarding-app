import { useMemo, useState } from 'react';
import type { ReimportDiff } from '../curriculum/reimport';
import { computeModuleReimportDiff } from '../curriculum/reimport';
import { classifyTasks } from '../curriculum/classification';
import type { CurriculumTask } from '../types/curriculum';

interface ImportReviewModalProps {
  diff: ReimportDiff;
  oldTasks: CurriculumTask[];
  newTasks: CurriculumTask[];
  onCancel: () => void;
  onApply: (resolutions: Map<string, string | null>) => void;
}

/**
 * Shows added/changed/removed/ambiguous items from a re-import before
 * anything is applied. Ambiguous matches must be explicitly resolved by the
 * user (same task vs. genuinely different) so progress is never silently
 * dropped or misattributed. Also summarizes structural (module-level)
 * changes and the row-by-row classification report, and requires an
 * explicit confirmation before ambiguous structural changes are applied.
 */
export function ImportReviewModal({ diff, oldTasks, newTasks, onCancel, onApply }: ImportReviewModalProps) {
  // Map: removedTaskId -> chosen new task id, or null if "these are different tasks".
  const [resolutions, setResolutions] = useState<Map<string, string | null>>(
    () => new Map(diff.ambiguous.map((a) => [a.removed.id, null])),
  );
  const [showClassification, setShowClassification] = useState(false);
  const [structuralChangesConfirmed, setStructuralChangesConfirmed] = useState(false);

  const moduleDiff = useMemo(() => computeModuleReimportDiff(oldTasks, newTasks), [oldTasks, newTasks]);
  const classification = useMemo(() => classifyTasks(newTasks), [newTasks]);
  const ambiguousRows = classification.filter((row) => row.rationale === 'Ambiguous');

  const hasStructuralChanges =
    moduleDiff.modulesAdded.length > 0 ||
    moduleDiff.modulesRemoved.length > 0 ||
    moduleDiff.modulesRenamed.length > 0 ||
    moduleDiff.tasksMovedBetweenModules.length > 0;

  const unresolvedCount = diff.ambiguous.filter((a) => resolutions.get(a.removed.id) === undefined).length;
  const applyBlocked = unresolvedCount > 0 || (hasStructuralChanges && !structuralChangesConfirmed);

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="import-review-title">
        <h2 id="import-review-title">Review Curriculum Changes</h2>
        <p>
          {diff.added.length} added · {diff.changed.length} updated · {diff.removed.length} removed ·{' '}
          {diff.unchanged.length} unchanged. Your engineers&apos; progress on unchanged and matched tasks is
          preserved automatically.
        </p>

        {diff.idConflicts.length > 0 && (
          <div className="diff-section" role="alert">
            <h3>Task ID conflicts detected ({diff.idConflicts.length})</h3>
            <p>
              These generated task IDs are duplicated within the new workbook. This should not normally happen —
              please review the source rows before applying.
            </p>
            <ul className="diff-list">
              {diff.idConflicts.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        )}

        {hasStructuralChanges && (
          <div className="diff-section">
            <h3>Structural (module) changes</h3>
            {moduleDiff.modulesAdded.length > 0 && (
              <>
                <p style={{ margin: '4px 0', fontWeight: 600 }}>Modules added</p>
                <ul className="diff-list">
                  {moduleDiff.modulesAdded.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </>
            )}
            {moduleDiff.modulesRemoved.length > 0 && (
              <>
                <p style={{ margin: '4px 0', fontWeight: 600 }}>Modules removed</p>
                <ul className="diff-list">
                  {moduleDiff.modulesRemoved.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </>
            )}
            {moduleDiff.modulesRenamed.length > 0 && (
              <>
                <p style={{ margin: '4px 0', fontWeight: 600 }}>Modules renamed</p>
                <ul className="diff-list">
                  {moduleDiff.modulesRenamed.map((r) => (
                    <li key={`${r.fromTitle}->${r.toTitle}`}>
                      {r.fromTitle} → {r.toTitle}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {moduleDiff.tasksMovedBetweenModules.length > 0 && (
              <>
                <p style={{ margin: '4px 0', fontWeight: 600 }}>
                  Tasks moved between modules (progress is preserved)
                </p>
                <ul className="diff-list">
                  {moduleDiff.tasksMovedBetweenModules.map((m) => (
                    <li key={m.taskId}>
                      {m.title}: {m.fromModuleTitle} → {m.toModuleTitle}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={structuralChangesConfirmed}
                onChange={(e) => setStructuralChangesConfirmed(e.target.checked)}
              />
              I reviewed these structural changes and confirm they are correct.
            </label>
          </div>
        )}

        <div className="diff-section">
          <button
            type="button"
            className="btn"
            aria-expanded={showClassification}
            aria-controls="classification-report"
            onClick={() => setShowClassification((v) => !v)}
          >
            {showClassification ? 'Hide' : 'Show'} row classification report
            {ambiguousRows.length > 0 ? ` (${ambiguousRows.length} ambiguous)` : ''}
          </button>
          {showClassification && (
            <div id="classification-report" style={{ overflowX: 'auto', marginTop: 8 }}>
              <table className="diff-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Source text</th>
                    <th>Type</th>
                    <th>Phase</th>
                    <th>Module</th>
                    <th>Rationale</th>
                    <th>Warning</th>
                  </tr>
                </thead>
                <tbody>
                  {classification.map((row) => (
                    <tr key={row.workbookRow}>
                      <td>{row.workbookRow}</td>
                      <td>{row.sourceText}</td>
                      <td>{row.interpretedType}</td>
                      <td>{row.phase}</td>
                      <td>{row.moduleTitle}</td>
                      <td>{row.rationale}</td>
                      <td>{row.warning ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {diff.ambiguous.length > 0 && (
          <div className="diff-section">
            <h3>Possible renames — please confirm ({diff.ambiguous.length})</h3>
            {diff.ambiguous.map((a) => (
              <div key={a.removed.id} className="field" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <p style={{ margin: 0 }}>
                  Removed: <strong>{a.removed.title}</strong>
                </p>
                <fieldset style={{ border: 'none', padding: 0, margin: '4px 0' }}>
                  <legend className="visually-hidden">Resolution for {a.removed.title}</legend>
                  {a.addedCandidates.map((candidate) => (
                    <label key={candidate.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
                      <input
                        type="radio"
                        name={`resolve-${a.removed.id}`}
                        checked={resolutions.get(a.removed.id) === candidate.id}
                        onChange={() =>
                          setResolutions((prev) => new Map(prev).set(a.removed.id, candidate.id))
                        }
                      />
                      Same task, now: &quot;{candidate.title}&quot; (keep progress)
                    </label>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
                    <input
                      type="radio"
                      name={`resolve-${a.removed.id}`}
                      checked={resolutions.get(a.removed.id) === null}
                      onChange={() => setResolutions((prev) => new Map(prev).set(a.removed.id, null))}
                    />
                    These are different tasks (do not carry progress over)
                  </label>
                </fieldset>
              </div>
            ))}
          </div>
        )}

        {diff.removed.filter((r) => !diff.ambiguous.some((a) => a.removed.id === r.id)).length > 0 && (
          <div className="diff-section">
            <h3>Removed from workbook</h3>
            <ul className="diff-list">
              {diff.removed
                .filter((r) => !diff.ambiguous.some((a) => a.removed.id === r.id))
                .map((t) => (
                  <li key={t.id}>{t.title}</li>
                ))}
            </ul>
          </div>
        )}

        {diff.added.length > 0 && (
          <div className="diff-section">
            <h3>Added</h3>
            <ul className="diff-list">
              {diff.added.map((t) => (
                <li key={t.id}>{t.title}</li>
              ))}
            </ul>
          </div>
        )}

        {diff.changed.length > 0 && (
          <div className="diff-section">
            <h3>Changed</h3>
            <ul className="diff-list">
              {diff.changed.map((c) => (
                <li key={c.taskId}>
                  {c.after.title} — updated: {c.changedFields.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={applyBlocked}
            onClick={() => onApply(resolutions)}
          >
            Apply Changes
          </button>
        </div>
        {unresolvedCount > 0 && (
          <p role="alert" style={{ marginTop: 8 }}>
            Please resolve all {unresolvedCount} possible rename(s) before applying.
          </p>
        )}
        {hasStructuralChanges && !structuralChangesConfirmed && unresolvedCount === 0 && (
          <p role="alert" style={{ marginTop: 8 }}>
            Please confirm the structural (module) changes above before applying.
          </p>
        )}
      </div>
    </div>
  );
}
