# Survival Guide — Content Audit (Stage B.1: Glossary Normalization)

**Status:** Stage B.1. Content-only change — no UI, navigation, or test
files were modified (see `src/components/SurvivalGuideView.tsx` and
`src/components/SurvivalGuideView.test.tsx`, both untouched by this
pass). Updates `src/survival-guide/glossary-data.ts` only.

## Purpose

This pass normalizes a specific set of terms in
`SME_CURATED_GLOSSARY_ENTRIES` against a direct SME terminology
confirmation given as task instruction (not a source document), while
preserving every provenance trail already established in
`docs/survival-guide-stage-b-validation-report.md`. Per
`docs/survival-guide-content-governance.md` rule 4 ("Record conflicts,
don't resolve them silently"), any place where the new instruction
disagreed with previously source-confirmed content was **kept as a
visible conflict**, not overwritten.

Every touched entry remains `verificationStatus: 'SME-curated'` — none
was upgraded to `'verified'`. The Stage B.1 confirmation itself is
recorded as its own `GlossarySource` (`STAGE_B1_SME_SOURCE`,
`sitePath: 'stage-b1-sme-instruction'`) so a reader can always tell
which parts of an entry came from the original ingested file
(`defmet-survival-guide-v1.md`) versus this pass.

## 1. Confirmed terms (13 entries touched, `needsReview: false` unless noted)

| Term | Action | Notes |
|---|---|---|
| **GL** | Enriched (pre-existing entry) | `fullName: "Gating Lot"` already matched; added English `plainLanguage`, appended English confirmation to `definition`, added `RFC` to `relatedTerms`. No conflict. |
| **NGL** | Enriched (pre-existing entry) | `fullName: "Non-Gating Lot"` already present; added `"Non Gating Lot"` (no hyphen) as an additional alias, English `plainLanguage`. No conflict. |
| **SS** | Enriched + **resolved** | `fullName: "Surface Scan"` already matched. **`needsReview` flipped from `true` to `false`** — SS was one of the original 9 source-flagged terms; this instruction's explicit "Confirmed" resolves it. Added English `plainLanguage` and appended confirmation to `definition`. |
| **EDI** | Enriched — **conflict recorded, not resolved** | See §2. `needsReview` set to `true` (was `false`). |
| **NCDD** | **New entry added** | Did not exist anywhere before this pass (the term was explicitly recorded as *absent* from the source in `docs/survival-guide-stage-b-validation-report.md` §7). `fullName: "Normalized Cluster Defect Density"`. Source is `STAGE_B1_SME_SOURCE` only — there is no original-file source for this term. |
| **CDD** | **New entry added** | New term, not previously present. `fullName: "Cluster Defect Density"`. Source is `STAGE_B1_SME_SOURCE` only. |
| **ADC** | Enriched (pre-existing entry) | `fullName` already matched; appended English confirmation detail ("assigns confidence scores") to `definition`. No conflict. |
| **ARS** | **New entry added** | New term. `fullName: "Advanced Review Sampling"`. Source is `STAGE_B1_SME_SOURCE` only. |
| **YMC** | **New entry added** | New term. `fullName: "Yield Model Calculator"`. Source is `STAGE_B1_SME_SOURCE` only. |
| **DOR** | **New entry added** | New term. `fullName: "Defect Offline Review Station"`. Source is `STAGE_B1_SME_SOURCE` only. |
| **EDX** | Enriched (pre-existing entry) | Previously had **no `fullName`/no alias** (the original source document never stated one). This instruction's `"Energy Dispersive X-ray"` fills a genuine gap rather than overwriting a prior source-confirmed value — no conflict, since nothing was there to contradict. |
| **NGL/GL/SS/ADC/EDX** category assignments | Unchanged | Kept each entry's existing `category` (`recovery-tool-actions`, `systems`, `measurement-analysis`) rather than reassigning, since the instruction did not specify a category and the existing ones already fit. |
| **NCDD/CDD/YMC** category | New | Assigned `yield-defect` (matches sibling density/yield-model metrics `EDI`, `Defect Count`). |
| **ARS/DOR** category | New | Assigned `measurement-analysis` (matches sibling review/classification-station entries `ADC`, `EDX`). |

## 2. Conflicts recorded — NOT silently resolved

Two terms in the "Confirmed" list directly contradicted content this
repository had already sourced from the original SME-curated document.
Per governance rule 4, both are preserved with the conflict stated
in-entry and `needsReview` set to `true`, rather than picking a side.

### EDI — full-name conflict

- **Already in the repository** (from `defmet-survival-guide-v1.md`,
  read in full during Stage B): `fullName: "Equivalent Defect Impact"`.
  This was **not** one of the 9 terms the source document's own
  Governance section flagged as unconfirmed.
- **This instruction states:** `fullName: "Estimated Die Impact"`,
  `verificationStatus: "Confirmed"`.
- **Resolution taken:** `fullName` was **not changed** (the
  source-document value is kept, since it came from an actual read
  document, not a paraphrase). `"Estimated Die Impact"` was added as an
  **alias** so search still resolves it, and the conflict is spelled
  out verbatim inside `definition`. `needsReview` was flipped to `true`
  so this surfaces for a human SME to pick one expansion.
- **Recommendation:** a named SME must confirm which expansion is
  correct — possibly both are used informally in different teams, or
  one is simply wrong. Do not silently prefer either in future edits.

### GFA — verification-status conflict

- **Already in the repository:** `fullName: "Geometric Failure Area"`,
  stated directly in the source document body (not inferred from
  context) and, again, **not** one of the 9 originally-flagged terms.
- **This instruction states:** GFA is "pending SME verification," with
  an explicit instruction not to invent the full name and to set
  `fullName: ""`.
- **Resolution taken:** `fullName` was **not blanked out** — doing so
  would have discarded already-source-confirmed content, which
  `docs/survival-guide-content-governance.md` prohibits ("Never
  fabricate" cuts both ways: we also don't un-confirm confirmed content
  without evidence). The conflict is recorded verbatim inside
  `definition`, and `needsReview` was flipped from `false` to `true` so
  a human resolves whether the original source's stated expansion
  should stand or be retracted.
- **Recommendation:** if the instruction's uncertainty is based on
  information this repository doesn't have (e.g. the original document
  was itself later found unreliable for this term), a human reviewer
  should say so explicitly and then this entry can be downgraded
  properly with a citation — not automatically.

## 3. Terms confirmed as still requiring SME verification (no fullName invented)

These three already existed as `needsReview: true` from the original
Stage B ingestion (all were on, or related to, the original 9-term
flagged list). This instruction's descriptions were **appended** to the
existing (Hebrew) `definition` as an additional English restatement —
they agree with, rather than contradict, what was already recorded, so
there is no conflict to record. `fullName` remains unset for all three,
per the explicit "do not invent" instruction.

| Term | fullName | needsReview | Notes |
|---|---|---|---|
| **MGPC** | `""` (unset) | `true` | Existing Hebrew definition already described a statistical/pattern signal across wafers; instruction's English description ("tracer type... sustained separation from baseline") was appended, not substituted. |
| **DFX** | `""` (unset) | `true` | Existing Hebrew definition already described a post-tool-activity defectivity check; instruction's English description was appended. |
| **GFA** | *(see §2 — kept, conflict recorded)* | `true` | Listed here too since the instruction placed it in "Pending SME Verification." |

## 4. Full list of entries touched, by id

`gl`, `ngl`, `ss`, `edi`, `ncdd` *(new)*, `cdd` *(new)*, `adc`, `ars`
*(new)*, `ymc` *(new)*, `dor` *(new)*, `edx`, `mgpc`, `dfx`, `gfa` — **14
entries touched, 5 newly added, 9 enriched/reconciled.**

## 5. Verification (programmatic, run against the live data)

- **Total entries:** 79 (74 from Stage B + 5 new in Stage B.1).
- **Duplicate `term` values (case-insensitive):** 0.
- **Alias/term name collisions across entries:** 0.
- **Entries with `verificationStatus: 'verified'`:** 0 (unchanged
  invariant — this pass does not introduce SharePoint-verified content).
- **Entries with `verificationStatus: 'SME-curated'`:** 79 (all of
  them).
- **`needsReview: true` entries:** 10 — `EDI, GFA, MGPC, RFC, xRFC, SM,
  MSS, DFX, DCL, SQC` (up from 9: `EDI` and `GFA` newly added per the
  conflicts in §2; `SS` removed after resolution in §1).

## 6. Outputs of this pass

1. `src/survival-guide/glossary-data.ts` — updated (14 entries touched,
   5 new; header comment updated to describe the Stage B.1 provenance
   marker `STAGE_B1_SME_SOURCE`).
2. `docs/survival-guide-content-audit.md` — this document.
3. **No changes** to `src/components/SurvivalGuideView.tsx`,
   `src/components/SurvivalGuideView.test.tsx`, `src/App.tsx`, routing,
   or any other test file, per the task's explicit constraints.
4. `npm run test` — 107/107 passing (unchanged test count; no test
   files were touched).
5. `npm run build` — succeeds (`tsc -b && vite build`).

## Conclusion

13 distinct terms were normalized (9 enriched/reconciled + 5 net-new
after excluding GFA, which was already counted as touched-not-added).
Two genuine conflicts with previously source-confirmed content (EDI,
GFA) were surfaced and preserved rather than silently overwritten, and
both now require SME reconciliation before either interpretation is
treated as final. SS was successfully resolved off the review list.
MGPC, DFX, and GFA remain `needsReview: true` pending an SME, with no
acronym expansion invented for any of them.

---

# Stage B.3 — Engineer Notes Integration

**Status:** Content-only change. `src/components/SurvivalGuideView.tsx`,
`src/components/SurvivalGuideView.test.tsx`, `src/App.tsx`, navigation,
routing, search, and filtering were **not modified**. Only
`src/survival-guide/glossary-data.ts` was changed, plus this document.

## Purpose

The task supplied 17 operational terms "collected from engineering
onboarding notes" (GO, NO GO, WTD, PM, OOC, HIGH EDI, NVD, MULTI PASS,
PILOT, UCL, LCL, DCL, QEF, DRB, TALA, OS, E3 ABORT) to add to the
glossary, with an explicit instruction not to touch EDI, GFA, MGPC, or
DFX (left exactly as Stage B.1 recorded them, including their
`needsReview: true` conflict flags).

Before editing, every one of the 17 terms was checked against the live
`SME_CURATED_GLOSSARY_ENTRIES` array. **15 of the 17 already existed**
in the glossary (with a Hebrew-sourced definition from the original
Stage B ingestion). Only **NVD** and **MULTI PASS** were genuinely
absent. Per governance rule 4, the 15 pre-existing terms were
**enriched, not overwritten**: existing `fullName`/`definition`/
`relatedTerms` values were kept, and this instruction's English
`plainLanguage`/`whyItMatters`/additional `relatedTerms` were merged in
only where they did not contradict what was already recorded. A new
provenance marker, `STAGE_B3_ENGINEER_NOTES_SOURCE`
(`sitePath: 'stage-b3-engineer-onboarding-notes'`), was added to each
touched entry's `sources` array alongside the original file source, so
the origin of the added content stays traceable and distinct from both
`GLOSSARY_SOURCE_FILE` and `STAGE_B1_SME_SOURCE`.

## 1. New terms added (2)

| Term | id | fullName | needsReview | Notes |
|---|---|---|---|---|
| **NVD** | `nvd` | *(intentionally left unset)* | `true` | Instruction listed `verificationStatus: SME_REQUIRED` and gave "NVD" itself as the stated full name. Per governance rule 1 (never invent/assert an acronym expansion), a value identical to the acronym is treated as an unresolved expansion, not a confirmed one — `fullName` was left unset so the UI shows "Full Name Pending SME Verification" instead of implying "NVD" is a real expansion. `verificationStatus` stays `'SME-curated'` (the type has no `SME_REQUIRED` literal); `needsReview: true` is the field that encodes the "SME required" status, consistent with how MGPC/DFX/GFA/DCL already work. Category: `process-manufacturing`. |
| **MULTI PASS** | `multi-pass` | `"Multi Pass"` | `false` | Confirmed/SME-curated per instruction; "Multi Pass" is an English phrase, not an acronym, so `fullName` equals the term itself (same convention as GO/NO GO/Pilot/High EDI/E3 Abort below). Category: `process-manufacturing`. |

## 2. Pre-existing terms enriched (15) — no overwrites

| Term | id | Action | Notes |
|---|---|---|---|
| **GO** | `go` | Enriched | Added `fullName: "GO"` (the term has no separate expansion — it is already an English word), `plainLanguage`, `whyItMatters`, added `RFC` to `relatedTerms`. Existing Hebrew `definition` kept, English confirmation appended. No conflict. |
| **NO GO** | `no-go` | Enriched | Added `fullName: "NO GO"`, `plainLanguage`, added `GL` to `relatedTerms`. No conflict. |
| **WTD** | `wtd` | Enriched | `fullName: "Week To Date"` already matched exactly. Added `plainLanguage`, appended English confirmation to `definition`. No conflict. |
| **PM** | `pm` | Enriched | `fullName: "Preventive Maintenance"` already matched. Added `plainLanguage`; `relatedTerms` and `whyItMatters` already covered the instruction's content, left as-is. No conflict. |
| **OOC** | `ooc` | Enriched | `fullName: "Out Of Control"` already matched. Added `plainLanguage`, added `High EDI` to `relatedTerms` (existing `UCL, LCL, Baseline, Tracer` kept). No conflict. |
| **HIGH EDI** | `high-edi` | Enriched | Added `fullName: "High EDI"` (no separate expansion exists), `plainLanguage`, added `OOC` to `relatedTerms`. No conflict. |
| **PILOT** | `pilot` | Enriched | Added `fullName: "Pilot"`, `plainLanguage`, added `Baseline` to `relatedTerms` (existing `DOE, Split Lot, Non-POR` kept). No conflict. |
| **UCL** | `ucl` | Reviewed, no change | `fullName: "Upper Control Limit"` and `definition` already matched the instruction exactly; the instruction supplied no new `plainLanguage`/`relatedTerms` beyond what already exists, so nothing was added. |
| **LCL** | `lcl` | Reviewed, no change | Same as UCL — already matched, nothing new to merge. |
| **DCL** | `dcl` | Enriched | `fullName: "Disposition Control Limit"` and `needsReview: true` were **already set** from the original Stage B ingestion (DCL was one of the original 9 flagged terms) — this instruction's `SME_REQUIRED` status is fully consistent with that, not a new flag. Appended English confirmation to `definition`; `needsReview` left `true`. No conflict. |
| **QEF** | `qef` | Enriched | `fullName: "Quality Event Form"` already matched. Added `plainLanguage`, added `Excursion` and `RFC` to `relatedTerms` (existing `Quality Overview, DRB, Non-POR` kept). No conflict. |
| **DRB** | `drb` | Enriched | `fullName: "Disposition Review Board"` already matched. Added `plainLanguage`; existing `relatedTerms` (`Disposition, QEF, TO3`) already covered the instruction's set, left as-is. No conflict. |
| **TALA** | `tala` | Enriched | `fullName: "Tool Activation List Automation"` already matched. Added `plainLanguage`. No conflict. |
| **OS** | `os` | Enriched | Existing `fullName: "Oversample"` (one word) vs. instruction's "Over Sample" (two words) — same meaning, not a substantive conflict; existing spelling kept as `fullName`, `"Over Sample"` added as an additional `alias` so both forms resolve. Added `plainLanguage`, added `Monitor` to `relatedTerms`. |
| **E3 ABORT** | `e3-abort` | Enriched | Added `fullName: "E3 Abort"` (no separate expansion — already a descriptive phrase), `plainLanguage`. No conflict. |

No genuine conflicts were found among these 15 terms — every overlap was
either an exact match (UCL, LCL) or a minor spelling variant recorded as
an added alias rather than a contradiction (OS).

## 3. Terms untouched per explicit instruction

`EDI`, `GFA`, `MGPC`, `DFX` — left exactly as Stage B.1 recorded them,
including their `needsReview: true` flags and unresolved conflicts. No
edits were made to these four entries in this pass.

## 4. Glossary size and verification (programmatic, run against the live data)

- **Glossary size:** 79 → **81** (2 net-new: NVD, MULTI PASS).
- **Duplicate `id` values:** 0.
- **Entries with `verificationStatus: 'SME-curated'`:** 81 (all of them
  — unchanged invariant).
- **Entries with `verificationStatus: 'verified'`:** 0 (unchanged).
- **`needsReview: true` entries:** 11 — `EDI, GFA, MGPC, RFC, xRFC, SM,
  MSS, DFX, DCL, NVD, SQC` (up from 10 after Stage B.1: `NVD` is the
  only newly-flagged entry in this pass; DCL was already flagged before
  this pass and remains so).
- **SME_REQUIRED-equivalent (`needsReview: true`) count contributed by
  this pass:** 1 new (`NVD`); `DCL` was already counted.

## 5. Outputs of this pass

1. `src/survival-guide/glossary-data.ts` — updated (17 entries touched:
   2 new — NVD, MULTI PASS — and 15 enriched; added
   `STAGE_B3_ENGINEER_NOTES_SOURCE` provenance marker).
2. `docs/survival-guide-content-audit.md` — this section.
3. **No changes** to `src/components/SurvivalGuideView.tsx`,
   `src/components/SurvivalGuideView.test.tsx`, `src/App.tsx`,
   navigation, routing, search, or filtering.
4. `npm run test` — 109/109 passing (unchanged test count/result; no
   test files were touched).
5. `npm run build` — succeeds (`tsc -b && vite build`).

## Conclusion

Of the 17 terms requested, 2 were genuinely new (NVD, MULTI PASS) and
15 already existed from the original Stage B ingestion. All 15 were
enriched additively — no existing source-confirmed content was
overwritten, and no conflicts were found (OS's minor spelling variant
was resolved as an added alias, not a contradiction). NVD is recorded
with `needsReview: true` and no invented `fullName`, consistent with
governance rule 1. EDI, GFA, MGPC, and DFX were left untouched exactly
as instructed. Glossary size is now 81 entries.
