> **⚠️ ROLLBACK NOTICE (Stage A audit):** The UI this document describes
> was rolled back — see the notice in
> `docs/survival-guide-content-governance.md`. Retained for historical
> reference only; not current.

# Survival Guide — User Guide

## What it is

**Survival Guide** is a new tab in the DEFMET Onboarding app (alongside
Dashboard, Checklist, Settings) that helps a new Defect Metrology engineer
understand how DEFMET terminology connects to daily work — not just a
list of definitions.

It has two views, reachable via the sub-tabs at the top of the section:

### 1. Terminology

- **Search** by term, abbreviation, alias, or full name. For example,
  searching `RFC` finds the same entry as searching its verified full
  name, once one exists — see the note on unverified terms below.
- **Filters:** Category (Yield & Defect Fundamentals, Tracer &
  Investigation, Recovery & Tool Actions, PD & Daily Work, Process &
  Manufacturing, Measurement & Analysis Flow, Systems), Scope (FE / BE /
  SSAFI / general), and Knowledge type (stable knowledge / procedural /
  unclassified).
- **Alphabetical index** — click a letter to jump to that section.
- Each **term card** shows: term, full name (only if verified), plain
  language explanation, why it matters, where you encounter it, how it
  connects to daily work, related terms (clickable), scope, verification
  status badge, and sources.
- A **visible warning** appears on any entry that is procedural,
  context-dependent, or still awaiting SME review — so it's never mistaken
  for a settled, universal rule.
- If a search finds nothing, you'll see a no-results message and, when
  applicable, "did you mean" suggestions for similarly-spelled terms.

### 2. A Day in DEFMET

A 12-step educational walk-through of how these concepts show up across a
shift, from reviewing PD/EDI gaps through capturing learning for future
investigations. Each step links to the glossary categories it touches.
This is explicitly **not** an executable procedure — every step says to
follow the current approved procedure and module-specific guidance.

## Important: current content status

As shipped in this scaffold, **every glossary entry is marked "Needs
review"** — a banner at the top of the Terminology view says so. This is
intentional: the mandated internal sources (SharePoint Groups Instruction
library, DREAM-FE, Signal Management, Pilot Management, and the two named
local instruction files) were not reachable when this was built, and the
project's own accuracy rule prohibits guessing at their contents. Treat
every entry as an **intake checklist item**, not a source of truth, until
an SME completes the review process in
`docs/survival-guide-sme-review.md`.

## Accessibility & responsive behavior

- All filters and the search box have associated `<label>`s.
- The term list, tabs, and related-term links are all standard buttons/
  inputs — fully keyboard-navigable (Tab/Shift+Tab, Enter/Space to
  activate) with visible focus states.
- On narrow/mobile widths, the term-card grid collapses to a single
  column and "A Day in DEFMET" steps stack vertically.
- Dark mode is inherited automatically from the app's existing theme
  toggle (`ThemeContext` / `data-theme` attribute) — no separate setting
  needed.

## Privacy

The Survival Guide never stores or displays real lot/wafer IDs, employee
contact details, active incident data, current tool restrictions, or live
production thresholds. It has zero effect on curriculum progress,
achievements, or workbook import/export — it is a read-only, static
reference layer (see `docs/survival-guide-content-governance.md`).

## For engineers who want to help verify content

See `docs/survival-guide-source-register.md` for what's missing per term,
and `docs/survival-guide-sme-review.md` for the checklist to follow before
an entry can be marked verified.
