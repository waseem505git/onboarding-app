# Data Model

This app keeps two kinds of data completely separate: the **master
curriculum** (from the workbook) and **per-engineer progress**. The
curriculum is never mutated by engineer activity, and progress is never
written back into the workbook.

## `CurriculumTask` (master curriculum, one row per meaningful workbook row)

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable ID derived from `category + title` (see "Stable IDs" below). Survives re-import as long as those two fields don't change. |
| `sourceRow` | number | The workbook row number this task came from, at the time of import. Used for ordering and traceability, not for identity. |
| `phase` | `Phase` | One of the 8 learning phases (see below). |
| `category` | string | The workbook's own section header (column A), preserved verbatim (whitespace-normalized). |
| `title` | string | Task name — usually column B, or column C / the category itself when column B was empty. |
| `sourceText` | string | Full concatenation of every non-empty cell in the row, for traceability back to the original workbook. |
| `description` | string | Human-readable combination of the topic detail, notes, and instructions found in the row. |
| `required` | boolean | Always `true` in the current import (the workbook does not mark any row optional — see docs/import-rules.md). |
| `owner` | string? | Not populated from the workbook (no owner column exists); reserved for future manual assignment. |
| `sourceHyperlink` | string? | Sanitized hyperlink discovered in the row, if any. |
| `prerequisites` | string[] | Always empty today — the workbook has no explicit prerequisite column, so none are invented. |
| `tags` | string[] | Currently just `[category]`. |
| `needsClarification` | boolean | True when the source wording is incomplete/ambiguous (see import-rules.md). |
| `clarificationNote` | string? | Human-readable explanation of what's unclear. |

## `Phase` (8 learning phases, curriculum order)

`welcome-access-communication` → `intro-1274-defect-metrology` →
`process-defect-fundamentals` → `systems-installation` →
`operational-procedures` → `por-layer-practice` →
`shift-readiness-wg-exposure` → `eng-inline-final-readiness`

`intro-1274-defect-metrology` and `operational-procedures` currently have no
tasks (see import-rules.md); both are kept in the enum — the former for
future workbook content, the latter for backward compatibility after its 11
tasks were merged into `systems-installation`.

## `EngineerProfile`

`id`, `fullName`, `startDate`, `roleOrTrack?`, `layerOrArea?`, `manager?`,
`buddyOrMentor?`, `targetCompletionDate?`, `createdAt`, `updatedAt`.

## `TaskProgress` (per engineer, per task — stored separately from curriculum)

| Field | Notes |
|---|---|
| `key` | `${profileId}::${taskId}` |
| `status` | One of the 7 allowed statuses. |
| `notes`, `evidenceLink`, `trainerOrOwner`, `targetDate`, `completionDate` | Editable by the engineer/trainer. |
| `reopenReason` | Required note captured when a Completed task is reopened. |
| `history` | Append-only list of `{ timestamp, fromStatus, toStatus, note }`. |

### Allowed statuses

`Not Started`, `In Progress`, `Blocked`, `Waiting for Trainer`,
`Ready for Review`, `Completed`, `Not Applicable`.

`Not Applicable` tasks are excluded from both the numerator and denominator
of every progress calculation.

## Stable IDs

`id = "task-" + hash(normalize(category) + "::" + normalize(title))`, with a
`-2`, `-3`, … suffix appended (in row order) whenever two rows normalize to
the same base ID. This means:

- Re-importing the same workbook unchanged produces the same IDs.
- Editing unrelated cells (notes, links, ECD) does **not** change a task's
  ID — only `category` or `title` text changes do.
- If a task's `category`/`title` genuinely changes text, it will look like a
  removed + added task on re-import; the Import Review screen lets a human
  confirm whether that's a rename (carry progress forward) or a truly new
  item.

## `CurriculumModule` (curriculum metadata — derived, never persisted)

Introduced to represent the workbook's implicit **Phase → Module → Task**
hierarchy (see docs/import-rules.md for the full rationale). A module is
one training section (e.g. "Systems installation & overview") within a
single phase.

| Field | Type | Notes |
|---|---|---|
| `moduleId` | string | `"module-" + hash(phaseId + "::" + title)`. Stable as long as the phase and title text don't change. |
| `title` | string | The workbook's category text, verbatim (or `"Uncategorized Training"` for the safe fallback). |
| `originalSourceText` | string | Same as `title` before fallback substitution. |
| `originalWorkbookRow` | number | First workbook row that contributed a task to this module. |
| `phaseId` | `Phase` | The single phase this module belongs to. |
| `displayOrder` | number | Position among all modules, ordered by phase then row. |
| `iconKey` | `ModuleIconKey` | Deterministically mapped 1:1 from `phaseId` — never inferred per-module. |
| `taskIds` | string[] | Ordered task IDs belonging to this module. |
| `needsClarification` | boolean | `true` only for the "Uncategorized Training" fallback module. |
| `sourceHyperlink` | string? | Present only if the category header cell itself carried a hyperlink. |

**Critically, `CurriculumModule` records are never written to IndexedDB.**
`buildModules(tasks)` recomputes the full module list from the current
`CurriculumTask[]` on every render/read. Consequences:

- No IndexedDB schema/version bump was needed to add modules (`DB_VERSION`
  stays `1`); see `src/persistence/db.ts`.
- No migration code is needed for existing engineer profiles — a profile
  created before modules existed opens exactly as before, because nothing
  about how tasks/progress are stored has changed.
- The JSON backup format is unchanged (`formatVersion` stays `1`) since it
  only ever contained tasks + profiles + progress, none of which changed
  shape.
- A module's progress (`ModuleProgressSummary`, from
  `src/domain/moduleProgress.ts`) is always derived fresh from its child
  tasks' current `TaskProgress` records — there is no separate module
  progress store to keep in sync or to desynchronize.

