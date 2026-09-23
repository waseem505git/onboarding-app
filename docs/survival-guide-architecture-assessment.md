# Survival Guide — Architecture Assessment (Stage A)

**Status:** Stage A deliverable. Assessment only — **no UI is
implemented or modified by this document**, and no navigation is
changed.

## Purpose

Before any further Survival Guide work happens, this records what
already exists in the repository that is relevant to it, what state it's
in, and what constraints that puts on Stage B–D. It does not propose
component designs, file layouts for a future UI, or write any code.

## Current repository state relevant to the Survival Guide

### 1. Rolled-back UI (historical, not present)

A prior turn built `src/components/SurvivalGuide.tsx`,
`src/components/TermCard.tsx`, `src/components/DayInDefmet.tsx`, a
`src/survivalGuide/` module, and a "Survival Guide" navigation tab. This
was rolled back: those files were deleted and `src/App.tsx` /
`src/index.css` were restored to their pre-Survival-Guide state.
Confirmed by:

- `git status --porcelain` shows no tracked deletions/pending changes to
  `App.tsx` beyond the unstaged `src/index.css` modification already
  present before this session.
- `grep` for `Survival Guide|survival-guide|survivalGuide` in
  `src/App.tsx` returns no matches — the navigation tab is not present.
- `docs/survival-guide-content-governance.md` and
  `docs/survival-guide-user-guide.md` both carry a rollback notice at
  the top and describe that prior (now-historical) implementation.

**Constraint carried forward:** any future Stage D UI work must not
assume the old component names/paths still exist; it starts from zero,
informed by the historical docs but not bound to their exact prior
component boundaries.

### 2. Current evidence-review scaffold (present, non-production)

- `src/survival-guide/types.ts` — defines `GlossaryEntry` (the eventual
  published shape) and `ReviewRecord` (the richer Stage A audit shape,
  with fields like `conflictingInterpretations`, `limitations`,
  `smeQuestion`, `privacyRisk`, `publicationRecommendation`), plus
  supporting enums (`VerificationStatus`, `SourceAccessOutcome`,
  `RoleScope`, `ProcessScope`, `GlossarySourceType`).
- `src/survival-guide/review-data.ts` — 26 `ReviewRecord` placeholders
  (`CORE_TERM_REVIEW_RECORDS`) covering four categories (yield-defect,
  tracer-investigation, recovery-tool-actions, pd-daily-work). Every
  record currently has `validationStatus: 'needs-review'`, empty
  `sources`/evidence fields, and an explicit placeholder string — no
  invented content.
- Both files carry header comments explicitly stating they are **not
  imported by** `App.tsx`, any component, `src/domain/**`,
  `src/persistence/**`, `src/achievements/**`, or the existing
  `src/glossary/glossary.ts`. Verified: no import references to
  `survival-guide` exist outside this folder (confirmed via repository
  search).

**Assessment:** this scaffold is correctly isolated per its own stated
contract. It is safe to extend (e.g. add source-register/SME-review
docs referencing it) without any risk of it reaching production code
paths.

### 3. Existing, separate tooltip glossary (unaffected, out of scope)

`src/glossary/glossary.ts` is a small, static, already-shipped glossary
used for mission-title hover/focus tooltips (ICE, KLARITY, RFC, POR, WG,
EDI, DETS, DART, JMP). It is a different system with a different
purpose and audience, is explicitly called out as "unchanged" in
`docs/survival-guide-content-governance.md`, and is not modified,
extended, or referenced by the Stage A scaffold. Confirmed no coupling
between `src/glossary/` and `src/survival-guide/`.

### 4. Application architecture patterns a future Stage C/D would need to respect

Observed from `README.md` and `src/` layout (for context only — not
acted on in this stage):

- Strict module boundaries: `types/`, `parsing/`, `curriculum/`,
  `domain/`, `persistence/`, `components/`.
- Persistence is repository-interface-based
  (`CurriculumRepository`/`ProfileRepository`/`ProgressRepository`) over
  IndexedDB, with no network calls and no server component. A future
  Survival Guide data layer (Stage C) would need an analogous read-only,
  static/local pattern — the guide is described in prior (historical)
  docs as "a read-only, static reference layer" with "zero effect on
  curriculum progress, achievements, or workbook import/export."
- Navigation is a fixed set of tabs (Dashboard, Checklist, Settings)
  defined in `App.tsx`; adding a tab is a Stage D concern only, and is
  explicitly out of scope for Stage A per this task's instructions.

## Risks identified for later stages (not acted on now)

1. **Re-introducing premature UI** is the exact failure mode that
   caused the prior rollback. Stage gates in
   `docs/survival-guide-requirements-matrix.md` exist specifically to
   prevent repeating it.
2. **Acronym collision risk**: some Stage A candidate terms (e.g. `GO`,
   `PD`) are short and could collide with common English words or other
   in-app terminology; Stage B/C authoring will need to disambiguate via
   `category`/`roleScope`/`processScope`, not by guessing.
3. **Source absence, not just inaccessibility**: two mandated local
   files (`External_Systems_Catalog.md`,
   `Wafer_Pattern_Intelligence_Agent_Instructions.md`) do not exist
   anywhere in this repository or its parent folder (confirmed via
   repository-wide search) — this is a harder blocker than a
   permissions issue and needs to be resolved by whoever supplies those
   files, not by retrying access. See
   `docs/survival-guide-source-access-report.md`.

## Conclusion

The codebase is in a clean, correctly-isolated state to continue Stage
A. No architectural changes are required or made by this assessment.
Proceed to the source-access report.
