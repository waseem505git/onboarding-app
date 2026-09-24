# Stage C.0 — "A Day in DEFMET" Feature Design

**Status:** Design phase only. No React code, routing, CSS, tests, or glossary
data are changed by this document. Everything below is a proposal for a
future implementation stage (Stage C.1+), subject to SME review before any
content is published, per the same governance model used for the Survival
Guide (`docs/survival-guide-content-governance.md`).

**Relationship to existing work:** This feature is a *second onboarding
surface* that sits alongside the Survival Guide glossary
(`src/survival-guide/glossary-data.ts`, rendered by
`src/components/SurvivalGuideView.tsx`). It does not replace the glossary —
it re-uses it. The glossary answers "what does this term mean?"; "A Day in
DEFMET" answers "when, in what order, and why does this term show up in my
shift?".

**Important scope note found during design:** the glossary today has no
entries for `PD` as a standalone term, nor for the named systems in the
brief (Klarity, ICE, DART, Yoda Creek, GAJT, DAGRS, Fuzion, WCS) — `ICE`
only appears once, as a `relatedTerms` reference on `ADC`. This is called
out explicitly in Section 5 and Section 8 as new content that must be
sourced/SME-confirmed before publication, not invented here.

---

## Section 1 — User Journey

### Day 1
A new engineer has no vocabulary and no mental model of the shift. They are
handed dashboards (PD, Quality Overview) full of acronyms and can't yet tell
a routine signal from an urgent one. Goal for Day 1: give them a **map**,
not mastery — "here is the shape of a shift, here is where things live."

### Week 1
The engineer starts shadowing tracer investigations and recovery decisions.
They now recognize terms but don't yet know the *sequence* of steps or
which system produces which artifact. Goal for Week 1: reinforce the
**workflow order** (Signal → Tracer → Commonality → Segmentation → Tool
Investigation → RFC → GL → GO/NO GO) and connect each step to the tool used
for it.

### Month 1
The engineer participates directly: opens tracers, proposes commonality,
reads RFC output, and sits in on GO/NO GO calls. Goal for Month 1: fluency —
they can explain *why* a decision was made, not just *what* happened, and
can hand over a shift clearly to the next engineer.

### Recurring questions this feature should answer
| Question | Where it's answered today | Where it should live in this feature |
|---|---|---|
| What is PD? | Not in glossary yet (gap) | Section 3 (Start of Shift) |
| What is a tracer? | `tracer` glossary entry | Section 4 (Investigation Workflow), step 2 |
| What is MGPC? | `mgpc` glossary entry (`needsReview: true`) | Section 4, as a tracer *type* under step 2 |
| Why was a tool taken down? | `dtp`, `rfc`, `recovery` entries | Section 4, steps 5–6 (Tool Investigation → RFC) |
| What is GL? | `gl` glossary entry | Section 4, step 7 |
| What does GO mean? | `go` / `no-go` glossary entries | Section 4, step 8 |

---

## Section 2 — Information Architecture

Proposed top-level sections, in the order a new engineer encounters them
across a shift:

1. **Start of Shift** — reading the morning picture (PD, Main Issues, gaps,
   open tracers, quality, disposition).
2. **Understanding Signals** — what counts as a signal and why it fired.
3. **Investigation Workflow** — the step-by-step path from signal to
   decision.
4. **Recovery Workflow** — what happens once a root cause / tool action is
   identified, through to GO/NO GO.
5. **Daily Systems** — the tools engineers touch during the above, as
   reference cards.
6. **Handover** — what a complete, well-formed shift handover looks like.

Each section should be a distinct route/page (e.g.
`/day-in-defmet/start-of-shift`) so it can be linked to directly from
onboarding checklists, but all six should also be reachable from a single
"A Day in DEFMET" landing/timeline page (see Section 6).

---

## Section 3 — Start of Shift

### What should appear
- **PD** — the primary shift dashboard/report an engineer opens first.
  *(Content gap: no glossary entry exists yet. Must be sourced/SME-confirmed
  before publishing a definition — do not infer an expansion.)*
- **Main Issues** — the top EDI-impacting causes for the reporting period
  (`main-issues` glossary entry).
- **EDI Gap** — the portion of yield impact not yet explained/resolved
  (referenced as `relatedTerms` across `edi`, `main-issues`, `defect-gap`,
  `layer-gap`, `lots-gap`; no standalone entry yet — another content gap).
- **Defect Gap / Layer Gap / Lots Gap** — the three ways `Main Issues` gets
  sliced: by defect type, by process layer, and by lot population
  (`defect-gap`, `layer-gap`, `lots-gap`).
- **Open Tracers** — investigations currently active from a prior shift
  (`tracer` entry; "open" status is a workflow state, not yet a glossary
  field — see Section 8 data requirements).
- **Quality** — open quality events and their status (`quality-overview`,
  `open-issue`, `qef`).
- **Disposition** — pending or recent GO/NO GO/hold decisions (`dispo`,
  `go`, `no-go`).

### What the user should learn
- The shift starts by **reading**, not acting: PD + Main Issues tell you
  where the yield pain is; Open Tracers tell you what's already being
  chased; Quality/Disposition tell you what's blocked or about to be
  released.
- Every number on this page is a pointer into one of the later workflow
  stages — e.g., a Defect Gap line item is the *output* of Section 4's
  workflow for a prior signal.

---

## Section 4 — Investigation Workflow

```
Signal
  ↓
Tracer
  ↓
Commonality
  ↓
Segmentation
  ↓
Tool Investigation
  ↓
RFC
  ↓
GL
  ↓
GO / NO GO
```

| Step | Purpose | Inputs | Outputs | Related glossary entries |
|---|---|---|---|---|
| 1. Signal | Detect that something deviates from expected behavior (statistical, EDI-based, or single-wafer). | Baseline, control limits (UCL/LCL), incoming lot/wafer data | A candidate signal to triage (may resolve as `False Signal` / `Bad Data`) | `ooc`, `high-edi`, `false-signal`, `bad-data`, `ucl`, `lcl`, `baseline` |
| 2. Tracer | Open a formal investigation into the signal's root cause. | A confirmed signal | An active tracer with a type (MGPC, OOC, High EDI, Hitback) | `tracer`, `mgpc`, `hitback` |
| 3. Commonality | Find what the affected wafers/lots share (tool, chamber, subentity, recipe). | Tracer scope (affected wafer/lot list) | A candidate shared factor to investigate further | `commonality`, `entity`, `subentity`, `cell`, `recipe` |
| 4. Segmentation | Narrow the population using the commonality to isolate the true suspect group. | Commonality candidate | A segmented (smaller, higher-confidence) suspect population | `segmentation` |
| 5. Tool Investigation | Examine the implicated tool/chamber/CEID for the mechanism behind the pattern. | Segmented population, tool history | A root cause hypothesis (or confirmed root cause) | `root-cause`, `ceid`, `pm`, `cm` |
| 6. RFC | Define and execute the approved recovery/validation actions for the tool. | Root cause hypothesis, approved procedure for the CEID/event type | Completed recovery actions, tool ready for gating | `rfc`, `xrfc`, `dtp`, `tala` |
| 7. GL | Run the gating lot(s) whose results will decide the tool's fate. | Tool post-RFC | Gating lot data (± NGL follow-up lot data) | `gl`, `ngl`, `follow-up-lot` |
| 8. GO / NO GO | Decide whether the tool returns to production. | GL (and NGL) results vs. release criteria | Disposition: `GO` (return to production) or `NO GO` (remains restricted, loop back to step 5/6) | `go`, `no-go`, `dispo` |

**Design notes for implementation:**
- This should render as an **expandable, linear timeline component** (see
  Section 6), not a static table — each step expands to show
  purpose/inputs/outputs plus inline glossary links.
- NO GO should visually branch back to step 5 or 6, since it is a loop, not
  a dead end — the diagram must show this is cyclic, not strictly linear.

---

## Section 5 — Daily Systems Guide

Proposed system cards, one per tool named in the brief. **Content status:**
none of these eight system names currently exist in
`src/survival-guide/glossary-data.ts`. The card shells and their slot for
"Related glossary terms" are designed now; the actual "why engineers use
it" / "where it fits" text must be authored and SME-confirmed in Stage C.1
before publication — this design intentionally does not fabricate that
content.

| System | Why engineers use it (to be confirmed) | Where it fits in the workflow (to be confirmed) | Candidate related glossary terms (already exist) |
|---|---|---|---|
| Klarity | *TBD — SME input needed* | Likely Signal / defect detection stage | `edi`, `defect-count`, `gfa`, `cfa` |
| ICE | *TBD — SME input needed* | Referenced today only as a `relatedTerms` entry on `ADC` — likely Classification/inspection stage | `adc`, `classification`, `finebin` |
| DART | *TBD — SME input needed* | Likely Tracer/signal management stage | `tracer`, `mgpc`, `ooc` |
| Yoda Creek | *TBD — SME input needed* | Likely Commonality/segmentation analytics | `commonality`, `segmentation` |
| GAJT | *TBD — SME input needed* | Likely Tool Investigation / recovery gating | `rfc`, `gl`, `ngl` |
| DAGRS | *TBD — SME input needed* | Likely Recovery/disposition automation | `recovery`, `dispo`, `tala` |
| Fuzion | *TBD — SME input needed* | Likely cross-system data aggregation for PD/Quality Overview | `quality-overview`, `main-issues` |
| WCS | *TBD — SME input needed* | Likely tool/CEID-level control or scheduling | `ceid`, `entity`, `subentity` |

Each card's template (fields, not content) for Stage C.1 authoring:
- **System name + one-line role**
- **Why engineers use it** (plain-language, SME-sourced)
- **Where it fits** (map to one or more Section 4 workflow steps)
- **Related glossary terms** (auto-populated — see Section 7)
- **Verification status badge** (reuse `VerificationStatus`/`needsReview`
  pattern from `GlossaryEntry`, so unverified system descriptions are never
  visually indistinguishable from SME-curated ones)

---

## Section 6 — Visual Components

- **Process timeline** — horizontal (desktop) / vertical (mobile) stepper
  for the Section 4 workflow; current-step highlighting when used as a
  literal walkthrough, otherwise fully static/explorable.
- **Expandable workflow cards** — each of the 8 steps and each of the 8
  system cards collapse/expand in place (accordion pattern), consistent
  with keeping information density low for Day-1 users while letting
  Month-1 users skim.
- **Clickable glossary links** — every acronym/term rendered in this
  feature should link to (or inline-popover) its `GlossaryEntry` from the
  existing Survival Guide data, rather than re-stating definitions.
- **Investigation flow diagram** — a dedicated SVG/diagram component for
  the Section 4 pipeline showing the NO GO feedback loop explicitly (see
  Section 4 design notes).
- **Responsive mobile layout** — timeline collapses to a vertical
  accordion; system cards stack single-column; diagram becomes
  scroll-and-tap rather than a wide horizontal graphic.

No specific component library or implementation is prescribed here; this is
left for Stage C.1 to align with whatever is already used in
`src/components/`.

---

## Section 7 — Glossary Reuse

`glossary-data.ts` should be the **single source of truth** for term
definitions; this feature must not duplicate definitions.

- **Workflow pages (Section 4):** each step's table row references
  glossary `id`s (as shown above). At render time, the page looks up each
  referenced `id` in `SME_CURATED_GLOSSARY_ENTRIES` and renders the term's
  `plainLanguage` (falling back to `definition`) inline or on hover/click —
  never a hand-written restatement.
- **System cards (Section 5):** the "Related glossary terms" list on each
  card is generated by filtering `SME_CURATED_GLOSSARY_ENTRIES` on
  `relatedTerms`/`category` matches (e.g., `category === 'systems'`) plus an
  explicit curated list per system, so cards stay in sync as the glossary
  grows.
- **Investigation diagrams (Section 6):** each diagram node carries a
  glossary `id`; clicking/tapping a node opens the same detail view already
  used in `SurvivalGuideView.tsx`, so there is exactly one rendering
  implementation for "show me this term's full entry" across both
  features.
- **Verification integrity:** because some referenced entries carry
  `needsReview: true` (e.g. `mgpc`, `rfc`, `xrfc`, `dcl`), this feature must
  surface the same `SME-curated` / `needsReview` badge already mandated for
  the Survival Guide (`docs/survival-guide-content-governance.md`) wherever
  it pulls in a glossary term — it must not present flagged terms as
  settled just because they appear in a workflow diagram.

---

## Section 8 — Implementation Plan

### Stage C.1 — Foundation (Start of Shift + Daily Systems shells)
- **Screens:** 2 (Start of Shift page, Daily Systems index + per-system
  detail as expandable cards on one page — not 8 separate routes yet).
- **Data requirements:**
  - New content: `PD` and `EDI Gap` as first-class glossary entries (SME
    source required).
  - New content: the 8 system names as new glossary entries or a new
    lightweight "systems" data file, SME-sourced — do not launch with
    placeholder/TBD text in production.
  - Decide the "open tracer" **workflow state** model (is this new data or
    inferred from existing `tracer`/`dispo` shape?).
- **Reusable components:** glossary-term link/popover (new, shared with
  Stage C.2/C.3), read-only card/accordion primitive.
- **Testing scope:** unit tests for glossary-lookup rendering (term found /
  `needsReview` badge shown / term missing → visible gap, not silent
  fallback); snapshot test for Start of Shift layout at desktop + mobile
  widths.

### Stage C.2 — Investigation & Recovery Workflow
- **Screens:** 2 (Investigation Workflow page with the 8-step diagram +
  Recovery Workflow page, or one combined page if the diagram comfortably
  shows the GO/NO GO loop without crowding).
- **Data requirements:** the Section 4 step-to-glossary-id mapping table
  becomes real, testable data (e.g. a small `dayInDefmetWorkflow.ts` data
  file listing steps with purpose/inputs/outputs/relatedGlossaryIds) —
  content here is already backed by existing SME-curated glossary entries,
  so no new source material is strictly required to ship a first version.
- **Reusable components:** process timeline/stepper, investigation flow
  diagram (with cyclic NO GO edge).
- **Testing scope:** diagram renders all 8 steps; each step's related-term
  links resolve to real glossary entries (a data-integrity test, not just
  UI); mobile layout collapses correctly.

### Stage C.3 — Journey Integration & Handover
- **Screens:** 3 (unifying landing/timeline page tying Day 1 / Week 1 /
  Month 1 narrative to the other pages; Handover page/checklist; navigation
  entry point(s) into "A Day in DEFMET" from wherever the Survival Guide
  tab currently lives).
- **Data requirements:** handover checklist content (new, SME-sourced —
  what must a departing engineer communicate: open tracers, pending
  GO/NO-GO calls, unresolved quality events). Likely reuses `open-issue`,
  `dispo`, `quality-overview` glossary entries as the backbone.
- **Reusable components:** none new expected — should compose Stage
  C.1/C.2 components.
- **Testing scope:** end-to-end navigation test (landing → each section →
  back); accessibility pass on the full diagram + accordion set; regression
  check that the existing Survival Guide tab/tests are unaffected.

---

## Final Report

### Files created
- `docs/stage-c-a-day-in-defmet-design.md` (this document). No other files
  were created or modified — no React/routing/CSS/test/glossary-data
  changes were made, per the design-phase constraint.

### Architecture summary
"A Day in DEFMET" is designed as a companion learning surface to the
existing Survival Guide, built on the same `GlossaryEntry` data and the
same SME-curated/`needsReview` governance model. It is organized into six
sections (Start of Shift → Understanding Signals → Investigation Workflow →
Recovery Workflow → Daily Systems → Handover) that mirror the real shift
lifecycle, with a central 8-step investigation/recovery pipeline
(Signal → Tracer → Commonality → Segmentation → Tool Investigation → RFC →
GL → GO/NO GO, with NO GO looping back) as the feature's spine. The design
deliberately surfaces two content gaps rather than papering over them: `PD`
and `EDI Gap` have no glossary entries yet, and none of the eight named
systems (Klarity, ICE, DART, Yoda Creek, GAJT, DAGRS, Fuzion, WCS) exist in
`glossary-data.ts` today — both must go through the same SME-sourcing
process as the rest of the Survival Guide before Stage C.1 can ship
non-placeholder content for them.

### Recommended first implementation task
Start Stage C.1 with **sourcing the missing content**, not UI: get SME
confirmation/definitions for `PD`, `EDI Gap`, and the 8 named systems, and
add them to `glossary-data.ts` following the existing
`SME_CURATED_GLOSSARY_ENTRIES` shape and provenance pattern (new
`GlossarySource` marker, `needsReview: true` until confirmed, no invented
`fullName`s). Only after that data exists should the Start of Shift page
and Daily Systems cards be built against it — building the UI first would
force placeholder content into a page designed around already-verified
data.
