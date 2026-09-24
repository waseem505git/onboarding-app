# Stage C.1 — Systems Guide Data Model Plan

**Status:** Design/data-planning artifact only. No UI, routing, or CSS is
implemented by this document. It defines the intended structure for the
"Daily Systems Guide" section of "A Day in DEFMET" (Stage C.0 design,
Section 5) and records exactly what is and is not source-backed for each
system today, per `docs/stage-c-content-gap-report.md`.

**Governance:** the same rules as
`docs/survival-guide-content-governance.md` rule 1 apply here — never
fabricate a "Purpose" or "Typical Use Cases" cell. Where no source exists,
the cell says so explicitly rather than being left implicitly authoritative.

## Structure

Each system entry has five fields:

- **System** — the name as used in project sources.
- **Purpose** — what the system is for, only if a source states this.
- **Typical Use Cases** — concrete situations where an engineer opens it,
  only if a source states this.
- **Related Glossary Terms** — `id`s that now exist in
  `src/survival-guide/glossary-data.ts` (`SME_CURATED_GLOSSARY_ENTRIES`).
- **Training Priority** — `High` / `Medium` / `Low` / `Unknown`, based on
  how much the system recurs across existing onboarding material (workbook
  categories, tooltip glossary), not on any productivity judgment we're not
  positioned to make. `Unknown` is used wherever no evidence exists to
  rank it at all.

## Systems

| System | Purpose | Typical Use Cases | Related Glossary Terms | Training Priority |
|---|---|---|---|---|
| **ICE** | An internal Defect Metrology tool used for defect classification and review workflows (per `src/glossary/glossary.ts`; general-purpose description only, not DEFMET-specific). | Not sourced beyond the general purpose above. Appears once in the Stage B source document as a `relatedTerms` entry on ADC, with no described use case. | `ice`, `adc`, `classification` | Medium — appears in the imported training workbook's "Systems installation & overview" category (`docs/import-rules.md`) as one of 24 required systems, and has at least a general-purpose definition on record. |
| **Klarity** | A defect inspection and review tool used in Defect Metrology (per `src/glossary/glossary.ts`; general-purpose description only). | Not sourced. | `klarity` | Medium — same workbook category as ICE; has a general-purpose definition on record. |
| **DART** | An internal Defect Metrology tool/system (per `src/glossary/glossary.ts`; no further detail given even generically). | Not sourced. | `dart` | Medium — same workbook category; thinnest of the three tooltip-glossary systems (no purpose beyond "an internal tool/system"). |
| **Yoda Creek** (workbook: "YodaCreek") | Not sourced. Name only. | Not sourced. | *(none — no glossary entry created; insufficient evidence per Task 2 rule)* | Low/Unknown — appears only as a bare name in the imported training workbook's "Systems installation & overview" list (`docs/import-rules.md`); no definition exists anywhere in this repository. |
| **GAJT** | Not sourced. Name only. | Not sourced. | *(none)* | Low/Unknown — same as Yoda Creek: bare workbook name only. |
| **DAGRS** | Not sourced. Name only. | Not sourced. | *(none)* | Low/Unknown — same as Yoda Creek: bare workbook name only. |
| **Fuzion** | Not found anywhere in this repository (source document, tooltip glossary, training workbook reference, or any doc). | Not sourced. | *(none)* | Unknown — cannot be prioritized at all; the name itself is unconfirmed against any project source. |
| **WCS** | Not found anywhere in this repository. | Not sourced. | *(none)* | Unknown — same as Fuzion. |

## What "Training Priority" is and isn't

This column reflects **evidence recurrence**, not a judgment about which
system engineers actually need first on the job. It should not be used to
decide real onboarding sequencing without SME input — it only tells a
content author which systems already have *something* to build from
(ICE/Klarity/DART) versus which need a source before any content can be
written (Yoda Creek, GAJT, DAGRS) or even confirmed to exist as named in
the brief (Fuzion, WCS).

## Next steps before Stage C.2 can build system cards

1. Obtain a real source for Yoda Creek, GAJT, and DAGRS — likely the same
   Groups Instruction library / External_Systems_Catalog.md sources already
   flagged as unreachable in
   `docs/survival-guide-required-source-checklist.md`.
2. Confirm with an SME whether "Fuzion" and "WCS" are the correct/current
   names of real DEFMET systems at all, since neither appears anywhere in
   this repository's sources (source document, tooltip glossary, or
   imported training workbook).
3. For ICE/Klarity/DART, source DEFMET-specific purpose and use-case detail
   to replace the current generic tooltip-glossary descriptions — those
   three already have `needsReview: true` in `glossary-data.ts` for exactly
   this reason.
4. Only after (1)–(3), populate the "Purpose" / "Typical Use Cases" columns
   above with real content and flip the corresponding glossary entries'
   `needsReview` to `false` per the SME sign-off process in
   `docs/survival-guide-content-governance.md`.
