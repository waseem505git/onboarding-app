# Stage C.1 — Content Gap Report

**Status:** Design/data-planning artifact. Records the outcome of Task 1
(source discovery) and the resulting Task 2 glossary changes, for the
concepts named in the Stage C.1 brief: Klarity, ICE, DART, Yoda Creek,
GAJT, DAGRS, Fuzion, WCS, PD, EDI Gap, Main Issues, Shift Handover.

## Method

Searched, in order: `local-source-materials/terminology/defmet-survival-guide-v1.md`
(the approved Stage B source document), `src/survival-guide/glossary-data.ts`
(the current production glossary, 81 entries before this stage),
`src/glossary/glossary.ts` (the separate, already-shipped tooltip
glossary), and every file under `docs/` (project-authored process
documents, including the Stage A source-access/checklist trail). No
external or SharePoint sources were consulted — none are reachable from
this environment, consistent with every prior Stage A/B finding recorded
in `docs/survival-guide-source-access-report.md`.

## 1. Concepts found (source-backed — added to `glossary-data.ts`)

| Concept | Found in | What was actually found | Action taken |
|---|---|---|---|
| **Main Issues** | `glossary-data.ts` (`id: "main-issues"`) — already existed before this stage | Full entry already present, `needsReview: false`, sourced from the Stage B document's "PD והעבודה היומיומית" section | No change needed — already covered. |
| **ICE** | `src/glossary/glossary.ts` (existing tooltip glossary); one `relatedTerms` mention on `ADC` in the Stage B document | Short, general, non-DEFMET-specific description: "An internal Defect Metrology tool used for defect classification and review workflows." | Added new entry `id: "ice"`, `needsReview: true` (thin/generic source only). |
| **Klarity** | `src/glossary/glossary.ts` (as "KLARITY") | "A defect inspection and review tool used in Defect Metrology." | Added new entry `id: "klarity"`, `needsReview: true`. |
| **DART** | `src/glossary/glossary.ts` | "An internal Defect Metrology tool/system." (no further detail even generically) | Added new entry `id: "dart"`, `needsReview: true`. |
| **PD** | Stage B source document (Section 4 header "PD והעבודה היומיומית"; EDI's "where you'll see it" field: "דוחות PD, סקירות Yield, בדיקת Gaps..."); `docs/import-rules.md` (workbook item "PD Process flow and defects") | Extensive *usage* evidence, but no source anywhere states what "PD" stands for or defines it directly. | Added new entry `id: "pd"`, evidence-only definition, no `fullName` asserted, `needsReview: true`. |
| **EDI Gap** | Stage B source document — cited as a `relatedTerms` entry on 5 other entries (EDI, Chronic Gap, Main Issues, Defect Gap, Layer Gap) | Never given its own header/definition sentence anywhere in the document. | Added new entry `id: "edi-gap"`, definition explicitly disclosed as an inference from co-occurrence, not a sourced definition, `needsReview: true`. |

## 2. Concepts found by name only (not added — insufficient evidence for an entry)

| Concept | Found in | Why no entry was created |
|---|---|---|
| **Yoda Creek** (workbook: "YodaCreek") | `docs/import-rules.md` — one of 24 bare system names imported from `Training package_General_2026.xlsx`'s "Systems installation & overview" category | Zero definition, purpose, or usage sentence exists anywhere in this repository. Creating an entry would require inventing content, which Task 2 and `docs/survival-guide-content-governance.md` rule 1 both prohibit. |
| **GAJT** | Same as above | Same as above. |
| **DAGRS** | Same as above | Same as above. |

## 3. Concepts not found at all (need SME confirmation the names are even correct)

| Concept | Search result |
|---|---|
| **Fuzion** | No occurrence anywhere in this repository — not in the Stage B source document, not in `src/glossary/glossary.ts`, not in the imported training workbook's 24-item system list (`docs/import-rules.md`), not in any `docs/*.md` file. |
| **WCS** | Same — no occurrence anywhere in this repository. |

These two names come only from the Stage C.0/C.1 task briefs themselves.
Before any content work continues on them, an SME should confirm (a)
whether these are current, correctly-spelled DEFMET system names, and (b)
which document/system is the source of record for them — per
`docs/survival-guide-required-source-checklist.md`'s existing pattern for
naming an "expected approved location" before content is written.

## 4. Concepts needing SME review (already added, but incomplete/uncertain)

All five newly-added entries carry `needsReview: true`. Specifically:

- **ICE / Klarity / DART** — only a generic, non-DEFMET-specific
  description exists (from the separate tooltip glossary, which by its own
  documented design never states an internal procedure). An SME needs to
  confirm: full name (if any), DEFMET-specific purpose, and where each fits
  in the investigation/recovery workflow (Stage C.0 design, Section 4/5).
- **PD** — no source states what the letters stand for or gives a direct
  definition; only recurring usage context exists. The mandated source
  (Groups Instruction library) has never been received — see
  `docs/survival-guide-required-source-checklist.md`, "PD" row, and
  `docs/survival-guide-source-register.md`. An SME must supply the actual
  definition/expansion.
- **EDI Gap** — the working definition in the new entry is explicitly
  labeled an inference from repeated co-occurrence with EDI/Main
  Issues/Defect Gap/Layer Gap/Lots Gap, not a confirmed definition. An SME
  must confirm or correct this.

## 5. Concept confirmed out of scope for this stage

- **Shift Handover** — appears in
  `docs/survival-guide-required-source-checklist.md` ("Status, ownership,
  next steps, and shift handover | Groups Instruction library | ... | Not
  yet exported") as a recognized required topic, but no content for it
  exists in any reachable source. No glossary entry was created for it,
  since "Shift Handover" is a process/workflow topic (Stage C.0 design,
  Section 2, item 6) rather than a single glossary term, and inventing
  checklist content for it would violate the same no-fabrication rule.
  This remains an open input for Stage C.3 (see
  `docs/stage-c-a-day-in-defmet-design.md`, Section 8).

## Glossary count

- Entries before this stage: **81**
- Entries added this stage: **5** (`ice`, `klarity`, `dart`, `pd`, `edi-gap`)
- Entries after this stage: **86**
- Entries with `needsReview: true` after this stage: **16** total —
  **11 pre-existed** this stage (`edi`, `gfa`, `mgpc`, `rfc`, `xrfc`, `sm`,
  `mss`, `dfx`, `dcl`, `nvd`, `sqc`; see `glossary-data.ts`'s file header
  comments for the pre-existing rationale) and **5 are the new entries
  added here** (`ice`, `klarity`, `dart`, `pd`, `edi-gap`).

## Validation performed

- `npm run build` — passed (TypeScript project build + Vite build), no
  type errors introduced by the new entries or the new `GlossarySource`
  marker.
- `npm run test` — passed, 16 test files / 109 tests, including
  `src/components/SurvivalGuideView.test.tsx` (12 tests) which exercises
  the exact component that renders `SME_CURATED_GLOSSARY_ENTRIES`.
- No UI, routing, navigation, or test file was modified — only
  `src/survival-guide/glossary-data.ts` (data) and this stage's two new
  `docs/*.md` files.
