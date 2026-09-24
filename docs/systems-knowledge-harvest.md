# Stage C.2 — Systems Intelligence Harvest

**Status:** Documentation-only artifact. No UI, routing, or `src/` code is
changed by this document. This is a re-consolidation and verification pass
over the same source discovery performed in Stage C.1
(`docs/stage-c-content-gap-report.md`), re-run against every training,
onboarding, and SharePoint-derived source actually present in this
repository, to confirm nothing new has become available and to present the
findings in the template requested for Stage C.2.

## Sources searched (Task 1)

- `local-source-materials/terminology/defmet-survival-guide-v1.md` — the
  only Stage B source document present in this repository (SME-curated,
  not SharePoint-verified).
- `local-source-materials/README.md` — confirms the intake staging area's
  `systems/` subfolder (intended for DREAM-FE, Signal Management, Pilot
  Management, Station Monitor, etc.) is currently **empty**; no file has
  ever been placed there.
- `src/survival-guide/glossary-data.ts` — the current production glossary
  (86 entries as of Stage C.1).
- `src/glossary/glossary.ts` — the separate, already-shipped, static
  tooltip glossary (mission-title hover/focus hints).
- `docs/import-rules.md` — documents the exact contents of the imported
  training workbook (`Training package_General_2026.xlsx`), including its
  "Systems installation & overview" category (24 named items).
- `docs/survival-guide-required-source-checklist.md`,
  `docs/survival-guide-source-register.md`,
  `docs/survival-guide-source-access-report.md` — confirm which mandated
  SharePoint/instruction sources (Groups Instruction library,
  `External_Systems_Catalog.md`, `Wafer_Pattern_Intelligence_Agent_Instructions.md`)
  have never been reachable from this environment, and were still not
  reachable at the time of this pass.
- Every other file under `docs/`, `README.md`, `src/`: searched
  case-insensitively for all eight system names; no additional
  occurrences found beyond what is cited below.

**No external or SharePoint source was reachable during this pass** —
consistent with every prior Stage A/B/C.1 finding. No new source became
available since Stage C.1.

## Task 2 — System-by-system findings

### Klarity

- **Purpose:** "A defect inspection and review tool used in Defect
  Metrology." (Source: `src/glossary/glossary.ts`; general-purpose,
  non-DEFMET-specific description only — that file's own header states it
  "never invents an internal procedure or workflow step.")
- **Who Uses It:** Not sourced anywhere in this repository.
- **Common Use Cases:** Not sourced.
- **Workflow Position:** Not sourced. (Stage C.0 design speculated
  "Signal / defect detection stage" based on the tool category name alone
  — that speculation is not evidence and is not repeated here as fact.)
- **Known Related Terms:** None sourced. `glossary-data.ts` entry `klarity`
  currently lists `relatedTerms: []` for this reason.
- **Source References:** `src/glossary/glossary.ts` (existing tooltip
  glossary entry `KLARITY`).

### ICE

- **Purpose:** "An internal Defect Metrology tool used for defect
  classification and review workflows." (Source: `src/glossary/glossary.ts`;
  same general-purpose caveat as Klarity.)
- **Who Uses It:** Not sourced.
- **Common Use Cases:** Not sourced.
- **Workflow Position:** Not sourced directly. The Stage B source document
  mentions ICE exactly once, as a `relatedTerms` entry on the `ADC`
  (classification) glossary entry, with no explanatory sentence — this is
  the only workflow-adjacency evidence that exists, and it is weak (a bare
  co-listing, not a described relationship).
- **Known Related Terms:** `ADC`, `Classification` (per the one
  co-occurrence above).
- **Source References:** `src/glossary/glossary.ts` (tooltip glossary entry
  `ICE`); `local-source-materials/terminology/defmet-survival-guide-v1.md`
  (line ~633, `ADC`'s "מונחים קשורים" field lists "ICE").

### DART

- **Purpose:** "An internal Defect Metrology tool/system." (Source:
  `src/glossary/glossary.ts`; no further detail given even generically —
  this is the thinnest of the three tooltip-glossary descriptions.)
- **Who Uses It:** Not sourced.
- **Common Use Cases:** Not sourced.
- **Workflow Position:** Not sourced.
- **Known Related Terms:** None sourced.
- **Source References:** `src/glossary/glossary.ts` (tooltip glossary entry
  `DART`).

### Yoda Creek (workbook: "YodaCreek")

- **Purpose:** Not sourced anywhere. Name only.
- **Who Uses It:** Not sourced.
- **Common Use Cases:** Not sourced.
- **Workflow Position:** Not sourced.
- **Known Related Terms:** None.
- **Source References:** `docs/import-rules.md` — one of 24 bare system
  names listed under the imported training workbook's "Systems
  installation & overview" category. This is the *only* place this name
  appears anywhere in the repository. No definition, purpose, or use-case
  sentence accompanies it in the workbook mapping documented there.

### GAJT

- **Purpose:** Not sourced. Name only.
- **Who Uses It:** Not sourced.
- **Common Use Cases:** Not sourced.
- **Workflow Position:** Not sourced.
- **Known Related Terms:** None.
- **Source References:** `docs/import-rules.md` (same 24-item workbook
  list as Yoda Creek). Only occurrence in the repository.

### DAGRS

- **Purpose:** Not sourced. Name only.
- **Who Uses It:** Not sourced.
- **Common Use Cases:** Not sourced.
- **Workflow Position:** Not sourced.
- **Known Related Terms:** None.
- **Source References:** `docs/import-rules.md` (same 24-item workbook
  list). Only occurrence in the repository.

### Fuzion

- **Purpose:** Not found. No occurrence of this name exists anywhere in
  this repository — not in the Stage B source document, not in the
  tooltip glossary, not in the 24-item imported workbook system list, not
  in any `docs/*.md` file.
- **Who Uses It / Common Use Cases / Workflow Position / Known Related
  Terms:** Not applicable — nothing to report.
- **Source References:** None. This name is unconfirmed against any
  project source and should be verified with an SME before further work
  assumes it is a real, correctly-named DEFMET system.

### WCS

- **Purpose:** Not found. Same as Fuzion — no occurrence anywhere in this
  repository.
- **Who Uses It / Common Use Cases / Workflow Position / Known Related
  Terms:** Not applicable.
- **Source References:** None. Same verification need as Fuzion.

## Task 3 — PD and EDI Gap: do authoritative definitions exist?

**Conclusion: No. Neither term has an authoritative (SME-verified or
document-stated) definition anywhere in this repository.** Both are
referenced extensively but never directly defined. No definition is
invented here, per instruction.

### PD

- Appears as the Stage B source document's own Section 4 header: "PD
  והעבודה היומיומית" ("PD and daily work").
- Appears in `EDI`'s "where you'll see it" field: "דוחות PD, סקירות Yield,
  בדיקת Gaps, Tracers ו-Disposition" ("PD reports, Yield reviews, Gap
  checks, Tracers and Disposition").
- Appears in the imported training workbook as item "PD Process flow and
  defects" under the "General" category (`docs/import-rules.md`).
- Appears as its own row in
  `docs/survival-guide-required-source-checklist.md` ("PD | Groups
  Instruction library | No | No | No | No | Yes | See source register"),
  confirming its mandated source (Groups Instruction library) was
  requested but **never received**.
- **Authoritative definition found: none.** No file in this repository
  states what the letters "PD" stand for or gives it a direct definition
  sentence. This matches the existing `glossary-data.ts` entry `pd`
  (added in Stage C.1), which is deliberately evidence-only,
  `needsReview: true`, and asserts no `fullName`.

### EDI Gap

- Appears only inside `relatedTerms`/"מונחים קשורים" (related-terms)
  fields on five other Stage B entries: `EDI`, `Chronic Gap`, `Main
  Issues`, `Defect Gap`, `Layer Gap`.
- Never given its own header or definition sentence in the source
  document, or in any other file in this repository.
- **Authoritative definition found: none.** The existing `glossary-data.ts`
  entry `edi-gap` (added in Stage C.1) already discloses its working
  description as an inference from repeated co-occurrence, not a sourced
  definition — this pass found no new evidence to upgrade that.

**No glossary changes were made in this stage** — this pass confirms the
Stage C.1 entries for `pd` and `edi-gap` remain accurate and does not
introduce any new, unsupported claims.
