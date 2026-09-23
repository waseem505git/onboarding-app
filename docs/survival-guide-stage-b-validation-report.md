# Survival Guide — Stage B Validation Report

**Status:** Stage B, first ingestion pass. **Source classification:
`SME-curated`, not SharePoint-verified.** Per the user's explicit Stage B
instruction, `local-source-materials/terminology/defmet-survival-guide-v1.md`
is treated as an SME-curated terminology source and used directly as
the Survival Guide MVP content source. This does **not** satisfy the
original Stage A SharePoint source-access requirement — see
"Relationship to Stage A" below.

## Source

- File: `local-source-materials/terminology/defmet-survival-guide-v1.md`
- Declared status (per its own header): "SME-Curated" v1.0, an internal
  survival/orientation guide for new DEFMET engineers — explicitly *not*
  a replacement for MOO, current RFC/xRFC procedure, QEF, module
  decisions, safety instructions, or Tool Owner guidance.
- Ingested with `verificationStatus: 'SME-curated'` on every term, per
  instruction. **No term is marked `verified`.**

## 1. Categories imported

All 7 numbered sections in the source map 1:1 onto the existing 7
`GlossaryCategory` values in `src/survival-guide/types.ts` — no new
category was invented and none was left unused:

| Source section | `GlossaryCategory` | Terms |
|---|---|---|
| 1. מושגי Yield ו-Defect בסיסיים | `yield-defect` | 8 |
| 2. Tracer ו-Investigation | `tracer-investigation` | 10 |
| 3. Recovery ופעולות Tool | `recovery-tool-actions` | 14 |
| 4. PD והעבודה היומיומית | `pd-daily-work` | 11 |
| 5. Manufacturing ו-Process | `process-manufacturing` | 12 |
| 6. Measurement ו-Analysis Flow | `measurement-analysis` | 8 |
| 7. מונחי בקרה, איכות ופעולות נוספות | `systems` | 11 |

**7 categories imported, all pre-existing.**

Two more sections in the source (`8. מילון קצר לפי א'-ב' / A-Z` and
`9. Governance ותחזוקה`) are **not term categories** — section 8 is a
redundant abbreviation index of the same terms defined above (used only
as corroborating evidence, e.g. confirming `xRFC`'s expansion is
*absent* from its own entry — see below) and section 9 is the source's
own governance/maintenance notes (used to determine `needsReview`
below). Neither produced glossary entries.

## 2. Terms imported

**74 terms imported**, one `GlossaryEntry` each, into
`src/survival-guide/glossary-data.ts`. Every entry has:
- `verificationStatus: 'SME-curated'`
- exactly one source: `{ sourceType: 'sme-curated', fileName: 'defmet-survival-guide-v1.md', accessOutcome: 'accessible-fully-read' }`
- `stableOrProcedural: 'mixed'` (the source does not classify terms as
  stable vs. procedural per-term, so this is left at the documented
  "unclassified" default rather than guessed per term)
- `roleScope: []` and `processScope: []` (the source does not state
  FE/BE/SSAFI or layer/segment/process/CEID/module scope per term)

## 3. Missing fields (per-field gap counts, out of 74)

| Field | Present | Missing | Notes |
|---|---|---|---|
| `definition` | 74 | 0 | Every term has a הגדרה (definition) block |
| `plainLanguage` | 2 | 72 | Only **Defect Count** and **MGPC** have a בשפה פשוטה block; all others left as `''` |
| `whyItMatters` | 9 | 65 | Only EDI, GFA, Flyer, Baseline, Excursion, Tracer, Root Cause, PM, Recovery have a למה זה חשוב block; all others left as `''` |
| `whereYouWillSeeIt` | 1 | 73 | Only **EDI** has an איפה פוגשים את זה block; all others left as `[]` |
| `relatedTerms` | 66 | 8 | Missing for: WTD, MTD, QTD, Cell, PEM, LL, DCL, SQC |
| `roleScope` / `processScope` | 0 | 74 | Not specified per-term anywhere in the source |

**None of these gaps were filled by inference, paraphrase, or general
knowledge — every empty field is empty because the source is silent on
it for that term**, consistent with the "no fabrication" rule in
`docs/survival-guide-content-governance.md`.

## 4. Parsing issues

- The source mixes Hebrew and English/acronym text within the same
  field (e.g. definitions are Hebrew prose containing embedded English
  terms like "Wafer", "Tool", "Yield"). This was preserved verbatim, not
  translated or normalized, to avoid altering meaning.
- Several header lines use two distinct naming patterns that both
  needed correct handling: `"Defect Count (DC)"` (term + parenthetical
  abbreviation) and a bare acronym header with a separate `שם מלא` field
  (e.g. `"## EDI"` + `שם מלא: Equivalent Defect Impact`). Both were
  parsed correctly and verified by spot-check.
- One entry (`## Original Adders / Adders Only`) and one field value
  (`SS`'s `שם מלא: Surface Scan / Surf Scan`) use `" / "` to present two
  names for the same concept; the first name became the canonical
  `term`/`fullName` and the second an alias, rather than being dropped.
- Supplementary content that doesn't map to a single schema field
  (הערה "note", הבהרה "clarification", דוגמה/דוגמאות "example(s)",
  טריגרים אפשריים "possible triggers", מה בודקים בדרך כלל "what's
  typically checked", אסוציאציות נפוצות "common associations") was
  **appended to `definition`** with an explicit inline label (e.g.
  "Clarification (from source): …", "Examples (from source): …") rather
  than silently discarded, so no source content was lost.
- No file-format, encoding, or structural parsing errors occurred; all
  74 term blocks parsed cleanly.

## 5. Duplicate entries

**None.** All 74 `term` values are unique (case-insensitive check), and
no alias on any entry collides with another entry's `term` (verified
programmatically). One intentional near-duplicate concept exists by
design, not error: `PM` (Preventive Maintenance) and `CM` (Corrective
Maintenance) are distinct terms with distinct definitions, not
duplicates.

## 6. Conflicting aliases

**None found** — no alias string is claimed by more than one entry.

One **naming variance worth flagging for SME reconciliation**: the
Stage A core-term inventory (`docs/survival-guide-core-term-review.md`)
lists a term called **`Disposition`**; this source defines the same
concept under the header **`Dispo`** with `שם מלא: Disposition`. This
import set `term: 'Dispo'`, `fullName: 'Disposition'`, and added
`'Disposition'` as an alias so search-by-either-name resolves to the
same entry — but a human should confirm `Dispo` (vs. `Disposition`) is
the preferred display term before this leaves MVP status.

## 7. Cross-check against the Stage A 26 core terms

23 of the 26 Stage A core terms are present as a `term` in this import;
1 is present only as an alias; **3 are absent entirely**:

| Stage A core term | Found as |
|---|---|
| Disposition | alias of `Dispo` |
| **NCDD** | **not found anywhere in this source** |
| **Station Monitor** | **not found as its own entry** (only referenced inside other entries' `relatedTerms`, e.g. `xRFC`, `PM`, `DFX`) |
| **PD** | **not found as its own entry** (it is the *category 4 section title concept*, but has no dedicated definition block) |
| (all other 22) | found as `term` |

These three remain absent from the production content model and are
**not** invented here.

## 8. SME review recommendations

The source document's own **section 9 (Governance ותחזוקה)** explicitly
flags a set of acronym expansions as "not from a formal source" and
recommends confirming them with an SME or approved document before wide
distribution:

**MGPC, RFC, xRFC, MSS, SM, SS, DFX, DCL, SQC**

Every one of these 9 entries has `needsReview: true` set in
`glossary-data.ts` for exactly this reason (all other 65 entries have
`needsReview: false`). Additional recommendations:

1. **Confirm `Dispo` vs. `Disposition` as the canonical display term**
   (see §6).
2. **Source NCDD, Station Monitor, and PD** from an approved
   document/SME before they can be added — they are Stage A core terms
   with no coverage in this SME-curated source.
3. **Fill the 72/74 `plainLanguage`, 65/74 `whyItMatters`, and 73/74
   `whereYouWillSeeIt` gaps** with a follow-up SME pass — these fields
   are legitimate MVP-usable content as-is (accurate but incomplete),
   not blocked/placeholder text, but a fuller pass would materially
   improve the guide's usefulness.
4. **Confirm `roleScope`/`processScope`** per term — currently blank for
   all 74 entries since the source doesn't scope terms to
   FE/BE/SSAFI/layer/segment/etc.
5. Per the source's own explicit scope limitation (front-matter
   warning), **do not treat any entry as authorizing a GO/NO GO, Scrap,
   Threshold, or RFC/xRFC decision** — this is carried into the UI's
   "SME Curated" labeling and is not a new restriction invented here.

## Relationship to Stage A

This ingestion **does not close** the original Stage A SharePoint
source-access gap recorded in
`docs/survival-guide-source-access-report.md`. SharePoint, the Groups
Instruction library, Yield Knowledge Base, DREAM-FE, Signal Management,
and Pilot Management remain unreached; `External_Systems_Catalog.md` and
`Wafer_Pattern_Intelligence_Agent_Instructions.md` remain absent. Stage
B here proceeds on a **separate, explicitly-authorized SME-curated
source** per direct user instruction, not on those blocked sources —
the distinction is preserved via `verificationStatus: 'SME-curated'`
(never `'verified'`) and `sourceType: 'sme-curated'` (never
`'sharepoint'`) on every entry.
