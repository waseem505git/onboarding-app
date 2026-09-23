# Survival Guide — Requirements Matrix

**Status:** Stage A complete (see "Stage A.1" section below for the
follow-on local-source-intake infrastructure work). Stage B (content
authoring) has **not** begun. **Non-normative for content** — this
document tracks process/requirements only. No glossary term definitions
appear here.

## Purpose

The first attempt at the DEFMET Engineer Survival Guide built a full UI
(`SurvivalGuide.tsx`, `TermCard.tsx`, `DayInDefmet.tsx`, the
`src/survivalGuide/` module, and a new navigation tab) before source
access and evidence validation were complete. That work was rolled back
(see the notice at the top of `docs/survival-guide-content-governance.md`
and `docs/survival-guide-user-guide.md`). This matrix replaces that
approach with an explicit, staged plan so each subsequent stage has a
verifiable gate before more is built.

## Staged plan

| Stage | Scope | Gate to proceed |
|---|---|---|
| **A — Evidence intake & planning** | Requirements matrix (this doc), architecture assessment, source-access report, source register, core-term review scaffold (no content), SME review checklist. **No UI, no navigation changes, no production glossary content.** | All Stage A deliverables produced; source accessibility explicitly confirmed or explicitly confirmed blocked, and documented. |
| **B — Source-verified content authoring** | Fill in `ReviewRecord` fields from accessible, approved sources only; SME sign-off on any term moved toward `verified`. | Every candidate term has a recorded source-access outcome; SME review checklist exists and is usable. |
| **C — Data model integration** | Convert reviewed/SME-approved records into `GlossaryEntry` data consumed by application code. | Stage B content passes governance rules in `docs/survival-guide-content-governance.md`. |
| **D — UI implementation** | Build (or rebuild) the Survival Guide tab, term cards, "A Day in DEFMET" walkthrough, and navigation entry. | Stage C data exists and is non-empty for at least a usable initial term set; design/UX reviewed. |

This document only covers **Stage A**. Stage B onward are out of scope
until Stage A's gate is satisfied and explicitly re-opened.

## Stage A requirements traceability

| ID | Requirement | Source of requirement | Deliverable | Acceptance criteria | Status |
|---|---|---|---|---|---|
| A-1 | Produce a requirements matrix describing the staged plan | Prior rollback notice in `survival-guide-content-governance.md` (references this file) | `docs/survival-guide-requirements-matrix.md` (this file) | Exists; lists stages A–D; traces each Stage A requirement to a deliverable and status | Done |
| A-2 | Assess current codebase architecture before building further | Stage A specification | `docs/survival-guide-architecture-assessment.md` | Documents existing relevant modules, the rollback state, and integration points/constraints for later stages, without proposing or writing UI code | Done |
| A-3 | Attempt and record access to every mandated source system | Stage A specification; `types.ts` `SourceAccessOutcome` | `docs/survival-guide-source-access-report.md` | Every source in the mandated chain has a recorded outcome (`accessible-fully-read` / `accessible-partially-read` / `access-denied` / `not-found` / `ambiguous-path` / `not-attempted`) with method and timestamp | Done |
| A-4 | Confirm source accessibility before continuing to remaining Stage A deliverables | User instruction (this task) | Source-access report conclusion | Explicit go/no-go statement | Done — **no-go**: all mandated sources are blocked or absent in this environment |
| A-5 | Maintain a per-term source register distinct from the access report | `review-data.ts` doc comment; `docs/survival-guide-user-guide.md` | `docs/survival-guide-source-register.md` | One row per candidate term (26 core terms) with the exact source(s) it would need and current access status | Done |
| A-6 | Human-readable mirror of `CORE_TERM_REVIEW_RECORDS` for non-engineers | `review-data.ts` doc comment | `docs/survival-guide-core-term-review.md` | Lists all 26 terms with their current placeholder status; **no invented definitions** | Done |
| A-7 | Define the SME sign-off checklist required before any record may move toward `verified` | `docs/survival-guide-content-governance.md` (§ Rules for adding or editing an entry, rule 6) | `docs/survival-guide-sme-review.md` | Checklist enumerates every condition required for `verified` status | Done |
| A-8 | Assess privacy risk of the Stage A scaffold and define the privacy gate for future authoring | `docs/survival-guide-content-governance.md` rule 5; user instruction | `docs/survival-guide-privacy-review.md` | Confirms no privacy risk exists yet; defines binding per-term privacy checklist for Stage B | Done |
| A-9 | Give each term inventory record explicit, minimal Stage A tracking fields (term, verification status, source status, evidence status, SME-review-required, notes) instead of only the richer audit shape | User instruction | `src/survival-guide/types.ts` (`sourceStatus`, `evidenceStatus`, `smeReviewRequired`, `notes` on `ReviewRecord`; new `EvidenceStatus` type), `src/survival-guide/review-data.ts` (populated per term) | `tsc --noEmit` passes; every one of the 26 terms has `sourceStatus` set from the access report, `evidenceStatus: 'no-evidence'`, `smeReviewRequired: true`, and a term-specific `notes` string; no term marked `verified` | Done |

> Items A-5 through A-7 are process/scaffold deliverables that do not
> depend on source content being accessible (they describe *what is
> missing*, not the missing content itself), so per the Stage A
> specification they proceed immediately after A-4's go/no-go is
> recorded above, in this same pass.

## Explicit non-goals for Stage A

- No UI components, hooks, routes, or navigation entries are added or
  modified.
- No entry in `src/survival-guide/review-data.ts` or any new document
  contains a fabricated, paraphrased-from-memory, or context-inferred
  definition, acronym expansion, or procedure.
- No changes to `src/glossary/glossary.ts` (the separate, existing
  tooltip glossary) or its consumers.
- No changes to `App.tsx`, `src/index.css` beyond what is already
  reverted, or any other production UI file.

## Open items carried into Stage B

- Restoring SharePoint/VPN/SSO access (or obtaining vetted offline
  extracts) for: the Groups Instruction library, Yield Knowledge Base,
  DREAM-FE, Signal Management, Pilot Management, plus the two named local
  files (`External_Systems_Catalog.md`,
  `Wafer_Pattern_Intelligence_Agent_Instructions.md`), neither of which
  exists in this repository.
- Identifying a named SME/reviewer able to complete
  `docs/survival-guide-sme-review.md` once source access exists.

## Stage A.1: Local Source Intake Preparation

**Status:** Complete. This is infrastructure work performed *between*
Stage A and Stage B — it does not itself perform source validation or
content authoring, and Stage B remains not started.

Since this tool cannot authenticate to SharePoint (Stage A finding),
Stage A.1 prepares a secure, auditable local staging area for a human to
manually place approved, exported source files, so that Stage B can
begin as soon as real files arrive.

| ID | Requirement | Deliverable | Acceptance criteria | Status |
|---|---|---|---|---|
| A.1-1 | Create a local, non-production staging directory structure for manually exported source files | `local-source-materials/` (`README.md`, `instructions/`, `terminology/`, `procedures/`, `systems/`, `daily-work/`) | Directory tree exists; README explains purpose, sourcing rule, evidence-not-fact status, required per-file review, no-copy-before-Stage-B rule, and no-Git rule | Done |
| A.1-2 | Ensure exported source files are never committed to Git, while the process README stays tracked | `.gitignore` rule `local-source-materials/*` + `!local-source-materials/README.md` | `git check-ignore` confirms nested test files under `terminology/` and `procedures/` are ignored; the same command confirms `README.md` is *not* ignored; existing `.gitignore` rules untouched | Done — verified live (see source-access... verification log in the task response) |
| A.1-3 | Provide a per-file intake manifest template | `docs/survival-guide-source-intake-template.md` | Blank template with all required fields; owner/reviewer/source-dates left unset; explicitly states no records exist yet | Done |
| A.1-4 | Provide a required-source checklist covering instruction/navigation sources, all 26 core terms, and the 11 daily-work evidence topics | `docs/survival-guide-required-source-checklist.md` | Every row present as specified; every status cell is `No` (nothing claimed as received) | Done |
| A.1-5 | Provide a development-only, metadata-only local source validator | `scripts/source-intake-check.mjs` + `npm run source:intake-check` | Inventories name/extension/size/hash; flags empty files, unsupported types, duplicate filenames; never reads/prints file content or makes network calls; not invoked by `build`, `test`, or `.github/workflows/deploy-pages.yml` | Done — verified live with temporary test files, then deleted |
| A.1-6 | Preserve existing production behavior | N/A (regression check) | `npm run test` (97/97 passing), `npm run build` (succeeds, `dist/` contains no reference to `local-source-materials`), `npm run lint` (no new errors) all pass unchanged; `App.tsx` and navigation untouched | Done |

**Stage B content validation is explicitly NOT marked complete by this
section.** Stage A.1 only prepares the intake location and tooling; no
source file has been placed, reviewed, or approved, and no
`ReviewRecord` has moved off `needs-review`.
