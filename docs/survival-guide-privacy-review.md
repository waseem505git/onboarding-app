# Survival Guide — Privacy Review (Stage A)

**Status:** Stage A deliverable. This reviews the *process and
scaffold* for privacy risk, not any content — because no content exists
yet (all 26 core terms remain `needs-review` with empty evidence, per
`docs/survival-guide-source-access-report.md`). No definitions,
acronym expansions, or procedural content appear below.

## Scope of this review

1. Does the current Stage A scaffold (`src/survival-guide/types.ts`,
   `src/survival-guide/review-data.ts`) itself introduce any privacy or
   confidentiality risk?
2. Does the *plan* for Stage B/C content authoring (per
   `docs/survival-guide-content-governance.md` and
   `docs/survival-guide-sme-review.md`) adequately prevent privacy risk
   before it can occur?
3. What privacy-specific gate must be satisfied before any term can
   move past `needs-review`?

## Finding 1 — current scaffold contains no privacy risk

Every field in every `ReviewRecord` in `review-data.ts` is either:
- an empty array/`undefined` (no data entered), or
- static boilerplate text (`NO_SOURCE_ACCESSIBLE`, the fixed
  `smeQuestion` template, the fixed `limitations`/`notes` text) that
  describes the *absence* of evidence, not any real operational,
  personal, or production data.

`privacyRisk` on every placeholder record explicitly reads "None
identified in this placeholder — no operational data has been entered,"
which is verified true by inspection of every other field on the same
record. **No lot/wafer ID, employee name/contact, active incident
detail, or live threshold appears anywhere in the scaffold.**

## Finding 2 — governance rules are sufficient in principle, but rely on future manual compliance

`docs/survival-guide-content-governance.md` rule 5 already states: "No
confidential or production operational data. No real lot/wafer IDs,
employee contacts, active incident detail, or live thresholds.
Illustrative examples must be synthetic and explicitly labeled
`Illustrative example`." `docs/survival-guide-sme-review.md` requires a
reviewer to independently confirm this per term before `verified`. This
is adequate **as a rule**, but Stage A cannot itself guarantee future
compliance — it is enforced at Stage B authoring time and Stage-B/SME
review time, not by any automated check today.

**Gap identified:** there is currently no automated/lint-level guard
(e.g. a pattern check for lot-ID-shaped strings, employee-name-shaped
strings, or numeric threshold patterns) in this scaffold or its future
authoring path. This is recorded as an open item for Stage B, not
solved here, because building such a check would itself be
content/tooling work outside Stage A's scope.

## Finding 3 — the two absent local files are an unknown privacy quantity

`External_Systems_Catalog.md` and
`Wafer_Pattern_Intelligence_Agent_Instructions.md` do not exist in this
repository (`docs/survival-guide-source-access-report.md`), so their
actual content — and therefore whether they contain anything
privacy-sensitive — is unknown. This is a **neutral, not a negative**
finding for this review: since they were never read, they cannot have
introduced any risk into this scaffold. It does mean that once they
become available, whoever adds them to the repository must apply the
same governance rule-5 filter before any of their content is
transcribed into a `ReviewRecord`.

## Privacy gate required before Stage B authoring (binding on future work)

Before any `ReviewRecord` field is populated from a real source, the
person doing so must, per term:

- [ ] Confirm the passage being transcribed contains no real lot/wafer
      ID, employee name/contact, active incident identifier, or live
      numeric threshold.
- [ ] If the source passage contains an example that is inherently
      illustrative, rewrite it as synthetic data and label it
      `Illustrative example` rather than copying the source's real
      example verbatim.
- [ ] Set `privacyRisk` to a genuine, term-specific assessment (not the
      placeholder boilerplate) — e.g. "Source passage referenced a
      specific lot ID; excluded and replaced with a synthetic example"
      or "No sensitive data present in source passage."
- [ ] If genuine privacy-sensitive content cannot be excluded without
      losing the term's meaning, do not include that term in this
      pass — flag it in `docs/survival-guide-source-register.md` notes
      instead of publishing a redacted-but-still-risky version.

This gate is additive to, not a replacement for, the full
`docs/survival-guide-sme-review.md` checklist.

## Conclusion

**No privacy risk exists in the current Stage A scaffold.** The
governance and SME-review rules already written are sufficient in
principle to prevent risk during Stage B, provided the binding gate
above is followed per term at authoring time. This review identifies no
action required now beyond documenting that gate, since no content
exists yet to apply it to.
