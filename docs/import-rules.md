# Import Rules

This document explains exactly how `Training package_General_2026.xlsx` is
turned into curriculum tasks, and why, so the mapping can be audited against
the source workbook at any time.

## Workbook structure (as discovered)

Single sheet, 53 rows, columns A-G:

- **Column A** (merged cells): section header / category.
- **Column B**: task or system name.
- **Column C**: sub-topic / detail for that task.
- **Column D**: header "ECD" (target completion date) - no rows currently
  have a value here, so no target dates are imported; this is a gap in the
  source workbook, not something this app invents.
- **Column E**: short note.
- **Column F**: reference label, sometimes with a hyperlink.
- **Column G**: extra free-text instruction.

Row 1 (`A1:B1` merged = "Intro to 1274 DM") is the document title, not a
task - it is skipped.

## Row to task rules

1. Every row with content in column B, C, E, F, or G becomes exactly one
   task. Column A's merged category is carried forward to every row in its
   range.
2. A category header with **no** content rows underneath it (e.g. "Shifts
   training", which has nothing in B-G) still becomes its own task, using
   the category name as the title, so it is never silently dropped.
3. Title precedence: column B, else column C, else the category name.
4. `description` combines the sub-topic (when the title came from column B),
   the note (column E), the reference label (column F), and the extra
   instruction (column G), each on its own line.
5. `sourceText` always contains the full original row content, unmodified,
   for audit purposes.

## Phase assignment

The workbook's own category (column A) drives phase assignment. One
category clearly mixes two conceptual phases; it is split by an explicit
title lookup (not a fuzzy heuristic), listed here in full so the mapping is
auditable:

- **"General"**: titles "adding to relavant lists/groups" and "AGS copy"
  map to **Welcome, Access & Communication**; everything else in "General"
  ("PD Process flow and defects", "Data flow & Database", "NCDD/ EDI
  calculation") maps to **Process Flow, Defect Fundamentals & Data Flow**.
- **"Systems installation & overview"**: all 24 items (ICE, EDI.com,
  KLARITY, DETS, DART, 1-Click, YodaCreek, DAGRS, GAJT, JMP, RFC, I MATCH,
  CLUI, Tracer report, 1NOTE, TEAMs, Auto dispo, Pilot management, Lime
  Light, Excursion, Scrap procedere / FIDO / ALIS, Lab procedure (ALIS,
  HUDZ), Signal management, How to open Tracer) map to a single phase,
  **Systems Installation & Proficiency**, so an engineer sees the complete
  set of required systems/tools/procedures in one place instead of split
  across two phases and two identically-named module cards.
  *(Revision, 2026-09-17: earlier versions of this app split the last 11
  items above into a separate "Operational Procedures" phase. That phase
  is kept in the `Phase` enum for backward compatibility with existing data
  but no longer receives any tasks on import — it behaves like the
  already-empty "Introduction to 1274 Defect Metrology" phase. The
  "Process Flow Explorer" achievement, previously tied to that phase, was
  retargeted to Systems Installation & Proficiency; see
  `src/achievements/achievementRules.ts`.)*
- **"POR layers Practice"** maps to **POR Layer Practice** (direct mapping).
- **"Shifts training"** and **"WG Overview & tool menagerie"** map to
  **Shift Readiness & Working-Group Exposure**.
- **"ENG- Inline layers Practice"** maps to **Engineering Inline Practice &
  Final Readiness**.

**Assumption / known gap:** no workbook rows map to "Introduction to 1274
Defect Metrology" - the phase exists in the enum for future content but is
currently empty. The A1 title row is treated purely as the document/program
name, not as task content.

**Required vs. optional:** the workbook does not mark any row as optional,
so every imported task defaults to `required = true`. This can be changed
manually once ownership decides which items are optional; the app does not
infer this.

**Prerequisites:** the workbook has no prerequisite column, so
`prerequisites` is always `[]` on import - nothing is invented. "Next Best
Task" recommendations therefore rely only on phase order and status.

## Rows flagged "Needs clarification"

- Row 2's instruction text ("Switch to ___ by ___ 'owner' and look for:
  ___ manager") appears to be missing placeholder values. Preserved
  verbatim, flagged for a human to clarify.
- "Shifts training" (row 43) is a heading with no further detail rows in the
  source; flagged so a human can add detail or confirm it's intentionally
  a single checkpoint.

Minor spelling variants in the source (e.g. "relavant", "procedere",
"menagerie", "Cassification", "mechanizm", "Uniqe") are preserved exactly as
written and are not auto-corrected, per the rule against silently altering
source wording. Only rows with substantive ambiguity (missing information,
not just a typo) are flagged as "Needs clarification".

## Re-import behavior

1. The new workbook is parsed and normalized the same way as any import.
2. `computeReimportDiff(oldTasks, newTasks)` compares by stable ID:
   - Same ID, no field differences -> unchanged (progress untouched).
   - Same ID, some fields differ -> changed (progress untouched, only
     curriculum content updates).
   - New ID with no matching old ID -> added.
   - Old ID missing from the new set -> removed.
3. Removed/added pairs whose titles are textually similar (Jaccard word
   overlap >= 0.4) are flagged ambiguous - a human must explicitly choose
   "same task" (progress is remapped to the new ID) or "different tasks"
   (old progress is kept, orphaned, associated with the now-removed ID; it
   is never deleted automatically).
4. Nothing is written to storage until the human reviewing the diff clicks
   Apply Changes.
5. `computeModuleReimportDiff(oldTasks, newTasks)` additionally reports
   structural (module-level) changes for review — see "Modules" below.
   Duplicate task IDs produced by a bad workbook edit are reported under
   `idConflicts` rather than silently overwriting one another.

## Modules: Phase -> Module -> Task

The workbook's own column-A category is also the intended "training
module" grouping (e.g. "General", "Systems installation & overview",
"POR layers Practice"). The app now presents three levels:

```
Phase -> Module -> Task
```

**Modules are derived, never stored.** A module is computed at read time
from `(task.phase, task.category)` — there is no new database table, no
schema version bump, and no migration step. This is a deliberate design
choice:

- Task IDs, and therefore all engineer progress (which is keyed only by
  `taskId`), are completely unaffected by introducing modules.
- Re-import can never "duplicate" a module, because modules are recomputed
  from the current task list every time, not accumulated in storage.
- Moving a task to a different module on re-import cannot lose its
  progress, because progress never references a module.

**Module identity:** `moduleId = hash(phaseId :: title)`. Because two
category headers ("General" and "Systems installation & overview")
legitimately split across two phases via the existing, tested title
overrides above, each (phase, category) pair becomes its own module — so
"General" produces **two** modules (one in Welcome/Access/Communication,
one in Process Flow & Defect Fundamentals), each containing only the rows
that actually belong to that phase. This reuses only already-audited phase
logic; no new fuzzy classification was introduced to draw module
boundaries.

**Safe fallback:** a task whose category is blank (not currently possible
with `Training package_General_2026.xlsx`, but preserved for future
workbooks) is placed in a module titled **"Uncategorized Training"** and
flagged `needsClarification: true`. Tasks are never hidden or dropped
because a module could not be determined.

**Module status** is derived purely from its child tasks' current
progress (never stored separately):

| Module status     | Rule |
|--------------------|------|
| Not Applicable      | 0 applicable required tasks in the module |
| Completed           | every applicable required task is Completed |
| Blocked             | at least one child task is Blocked |
| Ready for Review    | every unfinished applicable task is Ready for Review |
| In Progress         | at least one applicable task has started |
| Not Started         | otherwise |

`Not Applicable` tasks are excluded from the module's progress fraction,
exactly like the existing overall/phase calculations.

**Module classification report:** `classifyTasks()` labels every imported
row as `Explicit` (category's default phase applied), `Rule-based` (an
existing title-override changed the phase), or `Ambiguous` (already flagged
`needsClarification`) — deterministic labels, not a probabilistic
confidence score. See the table below.

| Source row type | How it is recognized | How it is represented | Affects progress? |
|---|---|---|---|
| Document title (row 1) | `rowNumber === 1` and column A equals column B | Excluded entirely, never a task | No |
| Module header (column A category) | The category text itself, carried across its merged range | A `CurriculumModule` (title = category text), never its own task | No — modules are excluded from the task progress denominator entirely |
| Task | Any row with content in column B/C/E/F/G under a category | A `CurriculumTask` assigned to the module for `(phase, category)` | Yes, if `required` and not `Not Applicable` |
| Supporting detail (sub-topic, note, reference, extra instruction) | Columns C/E/F/G on a task row | Folded into that task's `description`/`sourceText`, not a separate row | No — part of the task it supports |
| Ambiguous row | Flagged `needsClarification` (unclear wording or a header with no content rows) | Task (or fallback module) with `needsClarification: true`, original wording preserved | Yes, if `required` and not `Not Applicable` — clarification does not remove it from progress, it only flags it for review |

**Continue behavior (per module):** selecting Continue opens the next
actionable task using this priority: In Progress -> Ready for Review ->
Waiting for Trainer -> first unblocked Not Started -> Blocked (only if
nothing else is actionable), respecting the workbook's row order. Once
every applicable required task in a module is Completed, the button reads
"Review Module" and opens the first task in curriculum order (rather than
disappearing) so there is always something to review.

**Accordion UI:** each module card expands/collapses independently. The
expanded/collapsed state is a per-module UI preference persisted in
`localStorage` (key `defmet.moduleExpanded.<moduleId>`), separate from
IndexedDB curriculum/progress data — it is purely a display preference and
carries no onboarding content. Opening a task from anywhere (dashboard
"Next Mission", search, etc.) auto-expands its module once; the engineer
can still explicitly collapse that module afterward while the task drawer
remains open.

**A note on "POR layers Practice" row shape:** unlike the other modules,
each POR layers Practice row packs *two* related values into one row —
column B holds a short internal code (e.g. "STRFC") and column C holds its
descriptive name (e.g. "Process Flow"). These are **the same mission**, not
two missions, so each of the 12 POR rows becomes exactly one task whose
title is the column-B code and whose description includes the column-C
name (plus the column-E note, e.g. "high level overview"). No content is
dropped — both values are preserved, just combined into one task rather
than split into two, because splitting them would invent a task boundary
the workbook itself does not draw.

