# DEFMET ONBOARDING

A local, self-contained onboarding journey app built around
`Training package_General_2026.xlsx`. Every new engineer gets a fresh
profile, works through the checklist phase by phase and module by module,
can pick up exactly where they left off, and always knows what to do next.

This is a product, not a spreadsheet viewer: profiles, statuses, notes,
evidence links, and history all live independently of the master workbook,
which is never modified by the app.

## Install & run

```powershell
cd onboarding-app
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in your
browser.

Other useful commands:

```powershell
npm run build   # production build (tsc + vite build)
npm run test    # vitest unit test suite
npm run lint    # oxlint
npm run preview # preview a production build locally
```

For hosting `npm run build`'s output on an internal SharePoint Online Site
Page (for team-wide access beyond one local machine), see
`docs/sharepoint-deployment.md`. For hosting via Intel's internal GitHub
(GitHub Pages), see `docs/github-pages-deployment.md`.

## Where to place the workbook

You don't need to place the workbook inside this project folder at all. On
first launch, the app shows an "Import Onboarding Curriculum" screen -
click it (or drag-and-drop) and select `Training package_General_2026.xlsx`
from wherever it lives on your computer. The file is read entirely in your
browser; it is never copied into the project, uploaded, or committed to
source control.

## How curriculum import works

1. The workbook is parsed with `exceljs`, safely converting every cell to
   plain, sanitized text (see `docs/privacy-and-security.md`).
2. Rows are normalized into stable-ID tasks and grouped into 8 learning
   phases (see `docs/data-model.md` and `docs/import-rules.md` for the exact
   rules and rationale).
3. The result is saved as the master curriculum, separate from any
   engineer's progress.

To refresh the curriculum later (e.g. after the workbook is updated), use
Settings -> Refresh Master Curriculum. The app shows a full diff (added,
changed, removed, possible renames) and asks you to confirm any ambiguous
matches before applying anything - existing engineer progress on unchanged
or matched tasks is always preserved.

## Where progress is stored

All data - curriculum, profiles, and progress - is stored locally in your
browser's IndexedDB (database `defect-metrology-onboarding`). Nothing is
sent to a server. Progress auto-saves after every change; closing and
reopening the app (or the browser) does not lose anything.

## Export and restore progress

From Settings:

- Export JSON Backup - a complete snapshot (curriculum + all profiles +
  all progress) you can restore later or move to another browser/machine.
- Restore from Backup - loads a previously exported JSON backup.
- Export Progress CSV - the current engineer's checklist status, for
  spreadsheets or trainer review.
- Print-Friendly Summary - opens the browser print dialog on the current
  view.

## Starting a new engineer / switching profiles

Settings -> Start New Engineer creates a brand-new profile with a clean
slate, without touching the master curriculum or any other engineer's
progress. Multiple profiles can coexist; switch between them from the
profile dropdown in Settings. Reset Current Profile clears only the
active profile's progress (with a confirmation dialog) - the curriculum and
other profiles are unaffected.

## Project structure

```
src/
  types/        curriculum, profile, and progress TypeScript types
  parsing/      ExcelJS-based workbook parsing (untrusted-input safe)
  curriculum/   row normalization, phase assignment, module derivation, re-import diffing
  domain/       progress math, module progress, status transitions, next-best-task, profile lifecycle
  persistence/  IndexedDB repositories + JSON/CSV backup helpers
  components/   UI (dashboard, module accordions, task drawer, import review, settings)
docs/           data-model.md, import-rules.md, privacy-and-security.md
sample-data/    synthetic example profile/progress (no real data)
```

## Known limitations

- The source workbook has no "ECD" (target date) values, no explicit
  optional/required marker, and no prerequisite column - so those fields are
  either left blank or default to `required = true` rather than being
  invented. See `docs/import-rules.md`.
- Phase assignment for the "General" workbook category required an
  explicit, documented title lookup because that single category spans two
  conceptual phases (Welcome/Access/Communication and Process Flow/Defect
  Fundamentals). This is fully listed in `docs/import-rules.md` and can be
  revised there if the workbook is restructured. Because of this split,
  "General" produces **two** training modules (one per phase) rather than a
  single module — see "Modules" in `docs/import-rules.md`.
  "Systems installation & overview" is *not* split — all 24 of its items
  (tools and operational procedures) map to one phase
  (`systems-installation`) and one module so an engineer sees the full set
  in one place. As a result the `operational-procedures` phase is currently
  empty (kept in the schema for backward compatibility) — see
  `docs/data-model.md`.
- Training modules (the middle level of Phase → Module → Task) are
  **derived on the fly** from each task's phase + category, never stored.
  This keeps re-import and progress tracking simple and safe, but also
  means a module's identity depends on its phase + title text — renaming a
  category in the workbook produces a new module id (the underlying tasks
  keep their own stable ids and progress regardless).
- Re-import rename detection uses simple word-overlap similarity, not full
  fuzzy matching - very short or heavily reworded titles may not be flagged
  as a possible rename and will instead show as a plain add + remove.
- No multi-user sync: each browser/profile has its own independent local
  data. Use JSON backup/restore to move data between machines.
- No authentication - this is a personal, local-first tool for the first
  version, per the storage requirement in the brief.

## Future shared backend

Persistence is abstracted behind three repository interfaces
(`CurriculumRepository`, `ProfileRepository`, `ProgressRepository` in
`src/persistence/`). A future approved shared backend (e.g. a REST or
GraphQL service) can implement these same interfaces and be swapped in
without changing any UI component. See `docs/privacy-and-security.md` for
what must be re-reviewed (auth, transport security, retention) before that
happens.
