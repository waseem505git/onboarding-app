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
