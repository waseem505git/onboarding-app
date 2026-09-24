/**
 * Stage B, Step 4 — Survival Guide UI.
 * Stage B.2 — every card/detail view now always shows the full English
 * expansion (or an explicit "pending SME verification" placeholder) plus
 * plain-language text, per docs/survival-guide-content-audit.md.
 *
 * Read-only reference view over `SME_CURATED_GLOSSARY_ENTRIES`
 * (src/survival-guide/glossary-data.ts). This is the first production
 * consumer of `src/survival-guide/**` — see
 * docs/survival-guide-requirements-matrix.md (Stage C/D) and
 * docs/survival-guide-stage-b-validation-report.md for the content this
 * renders.
 *
 * Safety/governance rules this view must uphold (see
 * docs/survival-guide-content-governance.md and
 * docs/survival-guide-safety-validation-report.md):
 *   - Every entry is labeled with its `verificationStatus` — never
 *     presented as if it were SharePoint-verified.
 *   - `needsReview: true` entries carry a visible "⚠ SME Review Required"
 *     flag.
 *   - A persistent disclaimer states this guide does not authorize any
 *     GO/NO-GO, scrap, threshold, or RFC/xRFC decision.
 *   - This component only renders `GlossaryEntry` fields already present in
 *     the data; it never fabricates, infers, or fills in missing text. A
 *     missing `fullName` is shown as an explicit "Full Name Pending SME
 *     Verification" placeholder, never a guessed expansion.
 */
import { useMemo, useState } from 'react';
import type { GlossaryCategory, GlossaryEntry } from '../survival-guide/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../survival-guide/categoryLabels';
import { IconAlertTriangle, IconBook } from './icons';

const SME_REVIEW_BADGE_TEXT = '⚠ SME Review Required';
const FULL_NAME_PENDING_TEXT = 'Full Name Pending SME Verification';

interface SurvivalGuideViewProps {
  entries: GlossaryEntry[];
}

function matchesQuery(entry: GlossaryEntry, q: string): boolean {
  if (!q) return true;
  const haystack = [entry.term, entry.abbreviation ?? '', entry.fullName ?? '', ...entry.aliases, entry.definition]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function findEntryByTermOrAlias(entries: GlossaryEntry[], name: string): GlossaryEntry | undefined {
  const target = name.trim().toLowerCase();
  return entries.find(
    (e) => e.term.toLowerCase() === target || e.aliases.some((a) => a.toLowerCase() === target),
  );
}

export function SurvivalGuideView({ entries }: SurvivalGuideViewProps) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<GlossaryCategory | 'all'>('all');
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      entries
        .filter((e) => (categoryFilter === 'all' ? true : e.category === categoryFilter))
        .filter((e) => (needsReviewOnly ? e.needsReview : true))
        .filter((e) => matchesQuery(e, q))
        .sort((a, b) => a.term.localeCompare(b.term)),
    [entries, categoryFilter, needsReviewOnly, q],
  );

  const categoriesPresent = useMemo(
    () => CATEGORY_ORDER.filter((c) => entries.some((e) => e.category === c)),
    [entries],
  );

  const selected = useMemo(() => entries.find((e) => e.id === selectedId) ?? null, [entries, selectedId]);

  return (
    <div className="survival-guide">
      <div className="survival-guide-disclaimer" role="note">
        <IconAlertTriangle size={18} />
        <div>
          <strong>SME-curated, not SharePoint-verified.</strong> This guide is an
          orientation reference only. It does not replace MOO, current RFC/xRFC
          procedure, QEF, module decisions, safety instructions, or Tool Owner
          guidance, and must never be used to authorize a GO/NO-GO, Scrap,
          Threshold, or RFC/xRFC decision. Terms flagged{' '}
          <span className="badge-needs-review">{SME_REVIEW_BADGE_TEXT}</span> have an
          acronym expansion the source itself could not confirm from a formal
          document.
        </div>
      </div>

      <div className="filters-bar" role="search">
        <div className="field">
          <label htmlFor="guide-search">Search terms</label>
          <input
            id="guide-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search term, abbreviation, definition…"
          />
        </div>
        <div className="field">
          <label htmlFor="guide-category-filter">Category</label>
          <select
            id="guide-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as GlossaryCategory | 'all')}
          >
            <option value="all">All categories</option>
            {categoriesPresent.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 'auto' }}>
          <input
            id="guide-needs-review-only"
            type="checkbox"
            style={{ width: 'auto' }}
            checked={needsReviewOnly}
            onChange={(e) => setNeedsReviewOnly(e.target.checked)}
          />
          <label htmlFor="guide-needs-review-only" style={{ marginBottom: 0 }}>
            Needs SME review only
          </label>
        </div>
      </div>

      <div className="survival-guide-count">
        {filtered.length} of {entries.length} terms
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No terms match the current filters.</div>
      ) : (
        <div className="glossary-term-grid">
          {filtered.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="glossary-term-card"
              onClick={() => setSelectedId(entry.id)}
            >
              <div className="glossary-term-card-head">
                <span className="glossary-term-name">
                  {entry.term}
                  {entry.abbreviation && entry.abbreviation !== entry.term ? ` (${entry.abbreviation})` : ''}
                </span>
                {entry.needsReview && <span className="badge-needs-review">{SME_REVIEW_BADGE_TEXT}</span>}
              </div>
              <div className="glossary-term-fullname">
                {entry.fullName ? entry.fullName : <em className="glossary-fullname-pending">{FULL_NAME_PENDING_TEXT}</em>}
              </div>
              <div className="glossary-term-category">{CATEGORY_LABELS[entry.category]}</div>
              <div className="glossary-term-definition">{entry.definition}</div>
              {entry.plainLanguage && <div className="glossary-term-plain">{entry.plainLanguage}</div>}
              <div className="glossary-term-status">
                <span className="badge-sme-curated">SME-curated</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" role="presentation" onClick={() => setSelectedId(null)}>
          <div
            className="modal glossary-term-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-term-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glossary-term-modal-head">
              <div>
                <h2 id="glossary-term-modal-title">
                  <IconBook size={18} /> {selected.term}
                  {selected.abbreviation && selected.abbreviation !== selected.term ? ` (${selected.abbreviation})` : ''}
                </h2>
                {selected.fullName ? (
                  <div className="glossary-term-fullname">{selected.fullName}</div>
                ) : (
                  <div className="glossary-term-fullname">
                    <em className="glossary-fullname-pending">{FULL_NAME_PENDING_TEXT}</em>
                  </div>
                )}
              </div>
              <button type="button" className="btn" onClick={() => setSelectedId(null)}>
                Close
              </button>
            </div>

            <div className="glossary-term-badges">
              <span className="badge-sme-curated">SME-curated</span>
              {selected.needsReview && <span className="badge-needs-review">{SME_REVIEW_BADGE_TEXT}</span>}
              <span className="glossary-term-category">{CATEGORY_LABELS[selected.category]}</span>
            </div>

            <section>
              <h3>Definition</h3>
              <p>{selected.definition}</p>
            </section>

            {selected.plainLanguage && (
              <section>
                <h3>Plain language</h3>
                <p>{selected.plainLanguage}</p>
              </section>
            )}

            {selected.whyItMatters && (
              <section>
                <h3>Why it matters</h3>
                <p>{selected.whyItMatters}</p>
              </section>
            )}

            {selected.whereYouWillSeeIt.length > 0 && (
              <section>
                <h3>Where you'll see it</h3>
                <ul>
                  {selected.whereYouWillSeeIt.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </section>
            )}

            {selected.aliases.length > 0 && (
              <section>
                <h3>Also known as</h3>
                <p>{selected.aliases.join(', ')}</p>
              </section>
            )}

            {selected.relatedTerms.length > 0 && (
              <section>
                <h3>Related terms</h3>
                <div className="glossary-related-chips">
                  {selected.relatedTerms.map((relatedName) => {
                    const relatedEntry = findEntryByTermOrAlias(entries, relatedName);
                    return relatedEntry ? (
                      <button
                        key={relatedName}
                        type="button"
                        className="glossary-related-chip"
                        onClick={() => setSelectedId(relatedEntry.id)}
                      >
                        {relatedName}
                      </button>
                    ) : (
                      <span key={relatedName} className="glossary-related-chip glossary-related-chip-unresolved">
                        {relatedName}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h3>Source</h3>
              <ul>
                {selected.sources.map((s, i) => (
                  <li key={i}>
                    {s.fileName ?? s.sitePath} ({s.accessOutcome})
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
