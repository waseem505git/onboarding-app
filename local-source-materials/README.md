# Local Source Materials — Stage B Intake Staging Area

**Status:** Stage A.1 deliverable. This directory is infrastructure for
a future Stage B; it currently contains no source documents.

## What this directory is for

This is a **local-only staging area** for manually exported copies of
approved internal source documents (SharePoint pages/files, and the two
named local instruction files) that Stage B will need in order to
validate and author Survival Guide terminology and daily-work content.

Because this tool environment cannot authenticate to SharePoint (see
`docs/survival-guide-source-access-report.md`), a human with an
authenticated, authorized session must manually export the approved
files and place them under the appropriate subfolder here:

```
local-source-materials/
  README.md          (this file — the only file in this tree tracked by Git)
  instructions/       Groups Instruction library files, prompt-usage guidance,
                      External_Systems_Catalog.md, Wafer_Pattern_Intelligence_
                      Agent_Instructions.md
  terminology/        source material for the 26 core terms in
                      docs/survival-guide-core-term-review.md
  procedures/         procedural/how-to source material (as opposed to stable
                      definitions)
  systems/            source material describing systems (DREAM-FE, Signal
                      Management, Pilot Management, Station Monitor, etc.)
  daily-work/         source material for the daily-work topics in
                      docs/survival-guide-required-source-checklist.md
```

## Rules

1. **Only place files exported from the approved SharePoint locations**
   listed in `docs/survival-guide-source-access-report.md` and
   `docs/survival-guide-required-source-checklist.md`. Do not place
   files from unapproved sources, personal notes, or anything not
   traceable to an approved location.
2. **A file placed here is an evidence input, not an automatically
   verified fact.** Placing a file in this directory does not mark any
   term `verified`, does not populate any `ReviewRecord`, and is not
   itself Stage B review — it only makes the material available *for*
   that review.
3. **Every file must still be reviewed for scope, date, authority, and
   confidentiality** before any part of it is used to fill in a
   `ReviewRecord`. Use `docs/survival-guide-source-intake-template.md`
   to record that review per file (owner, last-modified date, export
   date/exporter, terminology scope, stable-vs-procedural
   classification, confidential-data review, Stage B approval,
   reviewer, notes).
4. **No content from this directory may be copied into the production
   application (`src/`, other than the Stage A review scaffold in
   `src/survival-guide/`) before Stage B validation is complete** for
   that specific term/topic, per
   `docs/survival-guide-content-governance.md` and
   `docs/survival-guide-sme-review.md`.
5. **Files placed here must never be committed to Git.** Everything
   under this directory except this README is excluded via
   `.gitignore` (`local-source-materials/*` with
   `!local-source-materials/README.md`). Do not weaken or bypass that
   rule (e.g. with `git add -f`).
6. **No file in this directory is transmitted anywhere by any tooling
   in this repository.** `npm run source:intake-check` (see
   `scripts/source-intake-check.mjs`) only reads local filesystem
   metadata (file name, extension, size, hash) — it never uploads,
   parses, prints, or summarizes file content, and it does not run as
   part of `build`, `test`, or CI/deployment.

## What to export and where

See `docs/survival-guide-required-source-checklist.md` for the full list
of required sources and topics, and
`docs/survival-guide-source-intake-template.md` for the per-file record
to fill in once a file is placed here.
