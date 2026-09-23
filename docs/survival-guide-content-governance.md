> **⚠️ ROLLBACK NOTICE (Stage A audit):** This document, and the UI it
> describes (`SurvivalGuide.tsx`, `TermCard.tsx`, `DayInDefmet.tsx`, the
> `src/survivalGuide/` module, and the "Survival Guide" navigation tab),
> were built in a prior turn **before** the controlled, staged process was
> introduced. That implementation exceeded what was appropriate to build
> before source access and evidence validation were complete, and has
> since been **rolled back**: the components/tests/module were deleted
> and `App.tsx` / `src/index.css` were restored to their pre-Survival-Guide
> state. This file is retained only as a historical record of that draft
> and is **superseded** by `docs/survival-guide-requirements-matrix.md`
> and the Stage A deliverables. Do not treat anything below as current.

# Survival Guide — Content Governance

This document defines how content enters, is reviewed, and is published in
the **DEFMET Engineer Survival Guide** (`src/survivalGuide/`,
`src/components/SurvivalGuide.tsx`, `src/components/DayInDefmet.tsx`,
`src/components/TermCard.tsx`).

## Why this document exists

The Survival Guide is built from a **separate, source-tracked data model**
(`src/survivalGuide/types.ts`), distinct from the small informal tooltip
glossary in `src/glossary/glossary.ts` (unchanged, still used for mission
title hints). The Survival Guide's job is to explain how DEFMET terminology
connects to daily work — which makes it far more consequential to get
wrong than a one-line tooltip, so it carries an explicit governance layer.

## Current state (as of this scaffold)

**None of the ~140 candidate terms in `src/survivalGuide/data/terms.ts`
have been verified against an approved source.** Every entry:

- has `verificationStatus: 'needs-review'` and `needsReview: true`,
- has `sources: []` (no source could be opened),
- has no `fullName` (no acronym expansion is asserted),
- has `definition` / `plainLanguage` / `whyItMatters` set to an explicit
  placeholder string, never an invented explanation.

This happened because the mandated source chain (External_Systems_Catalog.md,
the Groups Instruction library, DREAM-FE / Signal Management / Pilot
Management SharePoint content, Wafer_Pattern_Intelligence_Agent_Instructions.md)
was **not reachable** from the environment this scaffold was built in
(SharePoint returned HTTP 403; the two named local files do not exist in
this repository). See `docs/survival-guide-source-register.md` for the
per-attempt record.

## Rules for adding or editing an entry

1. **Never fabricate.** `definition`, `plainLanguage`, `whyItMatters`,
   `fullName`, and `relatedTerms` may only be filled in from content you
   can point to in `sources`. If you cannot open/verify the source, leave
   the field at its placeholder and keep `needsReview: true`.
2. **Never derive an acronym expansion from how it's used in a sentence.**
   An acronym's `fullName` must come from an explicit, approved definition
   of that acronym — not from context or common usage.
3. **Distinguish universal definitions from local procedure.** Set
   `stableOrProcedural` to `'stable'` only for genuinely universal
   concepts; use `'procedural'` for anything tied to a specific MOO,
   module, or team's current practice; use `'mixed'` when unclear or
   unclassified (the default for all scaffold stubs).
4. **Record conflicts, don't resolve them silently.** If two sources
   disagree, keep both interpretations in `definition`, set
   `verificationStatus: 'conflicting'`, and require SME sign-off before
   publication (see `docs/survival-guide-sme-review.md`).
5. **No confidential or production operational data.** No real lot/wafer
   IDs, employee contacts, active incident detail, or live thresholds.
   Illustrative examples must be synthetic and explicitly labeled
   `Illustrative example`.
6. **A `verified` status requires all of:** an accessible source recorded
   in `sources` with `accessConfirmed: true`, a `reviewedBy`, a
   `reviewedOn` date, and `needsReview: false`.

## Schema versioning

- `SCHEMA_VERSION` (`src/survivalGuide/types.ts`) — bump when the
  `GlossaryEntry`/`GlossarySource` shape changes incompatibly.
- `CONTENT_VERSION` — bump whenever the entry inventory changes
  meaningfully (new terms added, definitions verified, entries
  deprecated). Currently `0.1.0-scaffold` — no verified content yet.

## Deprecating an entry

Do not delete a deprecated entry outright if it has ever been published
with `verificationStatus: 'verified'`. Instead:

1. Set `verificationStatus: 'historical'`.
2. Keep the term's old spelling(s) in `aliases` so existing links/searches
   still resolve.
3. Note the supersession in `definition` (e.g. "Superseded by X as of
   \<date\> per \<source\>").

## Renaming a term

Add the old term string to `aliases` before changing `term`, so search
continues to find the entry under its previous name.

## Marking a definition as changed

Update `reviewedOn` and add a short note to `definition` describing what
changed and why, citing the newer source. Do not silently overwrite a
previously-verified definition without this trail.

## Exporting entries requiring SME review

`src/survivalGuide/reviewReport.ts` → `buildReviewReport(entries)` computes,
from the live inventory:

- entries with no source (`noSource`)
- entries with only one unconfirmed source (`singleWeakSource`)
- entries marked conflicting (`conflicting`)
- procedural entries marked historical, i.e. possibly expired
  (`expiredProcedural`)
- entries whose only sources are external/generic (`externalOnly`)
- initialism-style terms with no verified full-name expansion
  (`missingAcronymExpansion`)
- entries with a `fullName` set but not yet verified (`unverifiedExpansion`)

**No entry from this report may be presented as an authoritative
definition until it is removed from every relevant list above.**

## What must never happen

- Publishing a `needs-review` entry in a way that looks authoritative.
- Converting an `Illustrative example` into a stated rule.
- Presenting a numeric threshold as universal because it appeared in one
  shift report, dashboard screenshot, or historical tracer.
- Silently picking one of two conflicting source definitions.
