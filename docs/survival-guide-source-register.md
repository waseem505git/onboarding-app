# Survival Guide — Source Register (Stage A)

**Status:** Stage A deliverable. Per-term access status only — **no
definitions, acronym expansions, or procedural content appear here.**
See `docs/survival-guide-source-access-report.md` for the underlying
per-system access attempts and evidence, and
`src/survival-guide/review-data.ts` for the machine-readable
`ReviewRecord` this table mirrors.

## How to read this table

Every candidate term below needs **at least one** of the mandated
sources to become accessible before Stage B authoring can begin for it.
"Needed source(s)" lists which of the blocked systems (see the access
report) would plausibly hold its definition, based only on category —
not on any content already read, since none has been.

| Term | Category | Needed source(s) | Current access status |
|---|---|---|---|
| EDI | yield-defect | Yield Knowledge Base, Groups Instruction library | Blocked (not-attempted / access-denied) |
| Defect Count | yield-defect | Yield Knowledge Base | Blocked (not-attempted) |
| NCDD | yield-defect | Yield Knowledge Base, Groups Instruction library | Blocked (not-attempted / access-denied) |
| Baseline | yield-defect | Yield Knowledge Base | Blocked (not-attempted) |
| GFA | yield-defect | Yield Knowledge Base, Groups Instruction library | Blocked (not-attempted / access-denied) |
| CFA | yield-defect | Yield Knowledge Base, Groups Instruction library | Blocked (not-attempted / access-denied) |
| Flyer | yield-defect | Yield Knowledge Base | Blocked (not-attempted) |
| Excursion | yield-defect | Yield Knowledge Base, Groups Instruction library | Blocked (not-attempted / access-denied) |
| Tracer | tracer-investigation | DREAM-FE, Signal Management | Blocked (not-attempted) |
| MGPC | tracer-investigation | DREAM-FE, Groups Instruction library | Blocked (not-attempted / access-denied) |
| OOC | tracer-investigation | Signal Management, Yield Knowledge Base | Blocked (not-attempted) |
| High EDI | tracer-investigation | Yield Knowledge Base | Blocked (not-attempted) |
| Commonality | tracer-investigation | DREAM-FE, Groups Instruction library | Blocked (not-attempted / access-denied) |
| Hitback | tracer-investigation | DREAM-FE, Groups Instruction library | Blocked (not-attempted / access-denied) |
| Root Cause | tracer-investigation | Groups Instruction library | Blocked (access-denied) |
| RFC | recovery-tool-actions | Pilot Management, Groups Instruction library | Blocked (not-attempted / access-denied) |
| xRFC | recovery-tool-actions | Pilot Management, Groups Instruction library | Blocked (not-attempted / access-denied) |
| DTP | recovery-tool-actions | Pilot Management, Groups Instruction library | Blocked (not-attempted / access-denied) |
| GO | recovery-tool-actions | Pilot Management, Groups Instruction library | Blocked (not-attempted / access-denied) |
| NO GO | recovery-tool-actions | Pilot Management, Groups Instruction library | Blocked (not-attempted / access-denied) |
| GL | recovery-tool-actions | Pilot Management, Groups Instruction library | Blocked (not-attempted / access-denied) |
| NGL | recovery-tool-actions | Pilot Management, Groups Instruction library | Blocked (not-attempted / access-denied) |
| Station Monitor | recovery-tool-actions | Pilot Management, Wafer_Pattern_Intelligence_Agent_Instructions.md | Blocked (not-attempted / not-found) |
| PD | pd-daily-work | Groups Instruction library | Blocked (access-denied) |
| Disposition | pd-daily-work | Groups Instruction library | Blocked (access-denied) |
| POR | pd-daily-work | Groups Instruction library, External_Systems_Catalog.md | Blocked (access-denied / not-found) |

**Terms requiring the two absent local files specifically:**
`Station Monitor` (Wafer_Pattern_Intelligence_Agent_Instructions.md) and
`POR` (External_Systems_Catalog.md) — these two cannot proceed even if
SharePoint access were restored, since the files themselves do not
exist in this repository. All other rows are blocked purely on the
corporate-access boundary and would become workable if that boundary
were opened.

## Consistency check against `review-data.ts`

All 26 terms above match `CORE_TERM_REVIEW_RECORDS` in
`src/survival-guide/review-data.ts` (verified by direct comparison of
the term list and category assignment in that file). No term has been
added, removed, or reclassified here relative to that scaffold.

## What this register does not do

- It does not assert any term's actual meaning.
- It does not guess which specific document/page within a blocked
  system would contain the answer beyond the system-level category
  already implied by the term's classification.
- It is not a substitute for `docs/survival-guide-source-access-report.md`,
  which is the authoritative record of what was actually attempted.
