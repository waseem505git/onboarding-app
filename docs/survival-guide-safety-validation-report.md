# Survival Guide — Stage B, Step 5: Safety Validation Report

**Status:** Stage B, Step 5. Validates the Step 4 UI
(`src/components/SurvivalGuideView.tsx`, wired into the "Survival Guide"
tab in `src/App.tsx`) against
`docs/survival-guide-content-governance.md` and the safety commitments
made in `docs/survival-guide-stage-b-validation-report.md`. This is a
verification pass — it does not add, remove, or edit any glossary term
content in `src/survival-guide/glossary-data.ts`.

## 1. Verification-status labeling (no false authority)

- Programmatic check of `src/survival-guide/glossary-data.ts`:
  **74 entries**, of which **0** have `verificationStatus: 'verified'`
  and **74** have `verificationStatus: 'SME-curated'`. No entry's
  `sources[].sourceType` is `'sharepoint'` (0 matches) — every source is
  `'sme-curated'`, matching the Stage B ingestion.
- The UI (`SurvivalGuideView`) renders a `badge-sme-curated` "SME-curated"
  badge on **every** term card and in the detail dialog — there is no
  code path that omits it or that renders a different/upgraded status
  label. Confirmed by test: *"every production entry is labeled
  SME-curated, never a bare 'verified' claim"*
  (`SurvivalGuideView.test.tsx`).

## 2. `needsReview` terms are visibly flagged, not buried

- Programmatic check confirms exactly **9** entries have
  `needsReview: true`: `mgpc, rfc, xrfc, sm, mss, dfx, dcl, ss, sqc` —
  matching the 9 terms Stage B's own validation report identified from
  the source document's Governance section (acronym expansions "not
  from a formal source").
- The UI renders a `badge-needs-review` "Needs SME review" badge on the
  term card *and* in the detail dialog for every such entry, plus a
  "Needs SME review only" filter checkbox so a reviewer/SME can isolate
  exactly this set. Confirmed by test: *"flags needsReview entries with
  a visible badge"* / *"does not show the needs-review badge for entries
  that do not need it"*.

## 3. Persistent non-authorization disclaimer

- `SurvivalGuideView` renders a fixed, non-dismissible banner (not a
  one-time modal that can be dismissed and forgotten) stating the guide
  is SME-curated/not SharePoint-verified, does not replace MOO/RFC-xRFC
  procedure/QEF/module decisions/safety instructions/Tool Owner
  guidance, and **must never be used to authorize a GO/NO-GO, Scrap,
  Threshold, or RFC/xRFC decision** — directly carrying forward
  recommendation 5 in `docs/survival-guide-stage-b-validation-report.md`.
- Confirmed by test: *"always renders the SME-curated /
  not-authoritative disclaimer"* asserts both the SME-curated wording and
  the GO/NO-GO wording are present on every render, regardless of filter
  state (the banner is outside the filtered list).

## 4. No fabrication introduced by the UI layer

- `SurvivalGuideView` only reads and displays fields already present on
  `GlossaryEntry` (`term`, `abbreviation`, `fullName`, `aliases`,
  `definition`, `plainLanguage`, `whyItMatters`, `whereYouWillSeeIt`,
  `relatedTerms`, `sources`). It contains no hardcoded term text,
  no inferred acronym expansions, and no synthesized definitions.
- Empty-per-source fields (`plainLanguage`, `whyItMatters`,
  `whereYouWillSeeIt`) are conditionally hidden (`selected.plainLanguage &&
  ...`) rather than rendered as an empty/misleading section — the UI
  never displays a blank heading that could be mistaken for "no content
  exists" vs. "not yet sourced".
- "Related terms" that don't resolve to another entry in this data set
  (e.g. `NCDD`, `Station Monitor`, `PD` — see the Stage B validation
  report §7, absent from this source) render as an inert, visually
  de-emphasized chip (`glossary-related-chip-unresolved`) rather than a
  broken/misleading link or a fabricated entry.

## 5. No confidential or production operational data

- Grep of `src/survival-guide/glossary-data.ts` for numeric
  threshold-like patterns (`%`, `Threshold`) finds exactly one mention,
  in the `Excursion`/related entry: a *reference to the existence of* "a
  Threshold מוגדר" (a defined threshold), with no numeric value,
  consistent with rule 5 in `docs/survival-guide-content-governance.md`
  ("No confidential or production operational data... no live
  thresholds"). No real lot/wafer IDs, employee names/contacts, or
  active-incident detail were found in the source or the ingested data.
- All illustrative content is explicitly labeled "Illustrative example"
  or "Examples (from source)" inline (2 occurrences), matching the
  content-governance rule that illustrative examples must be
  synthetic and explicitly labeled — none were converted into a stated
  rule by the UI.

## 6. Existing systems remain unaffected

- `src/glossary/glossary.ts` (the separate, pre-existing tooltip
  glossary used for mission-title hints) has **no pending changes**
  (`git status --porcelain` shows it untouched) and is not imported by
  `SurvivalGuideView.tsx`.
- No changes were made to `src/domain/**`, `src/persistence/**`, or
  `src/achievements/**`. `App.tsx` changes are additive only: a new
  `Tab` union member (`'survivalGuide'`), one new nav button, and one
  new conditional render block — no existing tab/route logic was
  altered.

## 7. Accessibility

- The disclaimer banner uses `role="note"`; the detail view uses
  `role="dialog"` with `aria-modal="true"` and `aria-labelledby`,
  consistent with the existing modal pattern in `TaskDetailDrawer.tsx`
  / `ImportReviewModal.tsx`.
- Status is never conveyed by color alone: both the "SME-curated" and
  "Needs SME review" badges carry text, not just a color chip, matching
  the existing `StatusBadge` convention ("Always renders an icon AND
  text, never color alone").

## Conclusion

No governance rule from `docs/survival-guide-content-governance.md` was
found violated by the Step 4 UI or the data it renders. The two
findings worth carrying forward are pre-existing (recorded already in
the Stage B validation report), not new:

1. The 9 `needsReview` terms still require SME sign-off before any
   `needsReview: false` upgrade — the UI does not and must not perform
   this upgrade itself.
2. `NCDD`, `Station Monitor`, and `PD` remain absent from the data set
   and therefore from the UI; they are not fabricated to fill the gap.

Proceed to Step 6 (tests and build).
