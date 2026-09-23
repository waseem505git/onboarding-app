# Survival Guide — SME Review Checklist (Stage A)

**Status:** Stage A deliverable — process checklist only. No term is
reviewed against this checklist yet, since no source is accessible (see
`docs/survival-guide-source-access-report.md`). This document defines
*how* a review must happen once that changes; it does not perform one.

## Purpose

`docs/survival-guide-content-governance.md` (rule 6) states a `verified`
status requires an accessible source, a `reviewedBy`, a `reviewedOn`
date, and `needsReview: false`. This checklist makes that rule concrete
and repeatable so any SME/reviewer can apply it consistently across all
26 core terms (and any added later).

## Preconditions before a term can enter SME review

A term is **not eligible** for this checklist until all of the
following are true:

1. At least one source in its `sources` array has
   `accessOutcome: 'accessible-fully-read'` or
   `'accessible-partially-read'`.
2. The source's `sitePath` matches exactly what was actually opened
   (no approximated or remembered path).
3. Whoever populated the record can point to the specific
   section/passage used (`exactSourceSectionOrPassage` /
   `section`), not just "the document generally."

If any of these is false, stop — the record stays `needs-review` and
this checklist does not apply yet.

## Checklist (per term)

- [ ] **Source accessibility confirmed.** The reviewer independently
      opened the cited source (not relying solely on the drafter's
      claim) and confirms it currently supports the stated content.
- [ ] **No fabrication.** `proposedDefinition` /
      `plainLanguageExplanation` / `whyItMatters` / `verifiedFullName`
      are traceable to that source's actual text, not inferred from the
      term's spelling, usage elsewhere in the codebase, or general
      industry knowledge.
- [ ] **Acronym expansion rule respected.** If `verifiedFullName` is
      set, the source explicitly states that expansion — it was not
      derived from how the term is used in a sentence.
- [ ] **Stable vs. procedural classification checked.** `stableOrProcedural`
      reflects whether the concept is genuinely universal (`stable`) or
      tied to a specific MOO/module/team's current practice
      (`procedural`); `mixed` only if genuinely ambiguous after review,
      not as a default.
- [ ] **Conflicts preserved, not resolved silently.** If a second source
      disagrees, both interpretations remain in the text,
      `validationStatus` is set to `conflicting`, and this record is
      **not** eligible for `verified` until the conflict is explicitly
      adjudicated by a named SME with a documented rationale.
- [ ] **No confidential/operational data.** No real lot/wafer IDs,
      employee contacts, active incident detail, or live numeric
      thresholds. Any illustrative example is synthetic and labeled
      `Illustrative example`.
- [ ] **Privacy risk field completed honestly.** `privacyRisk` reflects
      an actual assessment, not the unexamined placeholder text, and the
      per-term privacy gate in `docs/survival-guide-privacy-review.md`
      has been applied.
- [ ] **`sourceStatus` / `evidenceStatus` updated together.**
      `sourceStatus` reflects the actual `SourceAccessOutcome` for the
      source just read, and `evidenceStatus` is upgraded to
      `'partial-evidence'` or `'full-evidence'` only to the extent the
      record's fields were actually populated from it — never both left
      stale while other fields change.
- [ ] **`smeReviewRequired` only cleared last.** Remains `true` until
      every other box on this checklist is satisfied for this term.
- [ ] **Role/process scope set deliberately.** `roleScope` /
      `processScope` reflect where the term actually applies, not left
      as an empty/default array copied from the placeholder.
- [ ] **Reviewer identity and date recorded.** `reviewedBy` (a named
      person, not a role or "TBD") and `reviewedOn` (an actual date) are
      set.
- [ ] **Publication recommendation set deliberately.**
      `publicationRecommendation` is changed from `do-not-publish` to
      `publish-with-sme-review` (or left at `do-not-publish` with a
      stated reason) — never left unexamined.
- [ ] **`needsReview` explicitly set to `false`.** Only after every item
      above is satisfied.

Only when **every** box above is checked may `validationStatus` be
changed away from `needs-review` (to `verified`, or to `conflicting` /
`historical` / `context-dependent` if that is what the evidence
actually shows — see `types.ts` for the full status set).

## What this checklist explicitly does not authorize

- It does not authorize writing UI to display any newly-verified term —
  that is Stage D, gated separately in
  `docs/survival-guide-requirements-matrix.md`.
- It does not authorize batch-verifying multiple terms from a single
  skim of a source document; each term's specific passage must be
  identified per the preconditions above.
- It does not override rule 5 in
  `docs/survival-guide-content-governance.md` (no confidential/
  production operational data) even if the source material contains
  such data — the reviewer must redact/generalize before it enters this
  record, or exclude the term rather than include unsafe content.

## Current applicability

As of this Stage A pass, **zero of the 26 core terms in
`src/survival-guide/review-data.ts` satisfy the preconditions above**
(see `docs/survival-guide-source-access-report.md`). Every record's
`sourceStatus` is `'access-denied'` or `'not-found'`,
`evidenceStatus` is `'no-evidence'`, and `smeReviewRequired` is `true`.
This checklist is therefore ready for future use but has not yet been
applied to any term.

## Related Stage A deliverable

See `docs/survival-guide-privacy-review.md` for the privacy-specific
gate that is additive to this checklist and must also be satisfied
before `smeReviewRequired` can be cleared.
