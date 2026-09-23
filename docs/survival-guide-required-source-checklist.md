# Survival Guide — Required Source Checklist (Stage A.1)

**Status:** Stage A.1 deliverable. **No source in this checklist has
been received, reviewed, or approved.** Every "Local file received" /
"Privacy review completed" / "Sufficient evidence" cell below is `No`
by design — this document defines what is required, not what has
arrived. Do not edit a row to say a source has been received unless a
file genuinely exists under `local-source-materials/` and an intake
record for it exists in
`docs/survival-guide-source-intake-template.md`.

## Column definitions

- **Required source topic** — what the source must cover.
- **Expected approved location** — the mandated system/folder it should
  come from, per `docs/survival-guide-source-access-report.md`.
- **Local file received** — `Yes`/`No`; whether a file is currently
  present under `local-source-materials/` for this row.
- **Privacy review completed** — `Yes`/`No`; whether
  `docs/survival-guide-privacy-review.md`'s per-file gate has been
  applied to the received file.
- **Readable by Copilot** — `Yes`/`No`; whether the file is in a format
  this tool can actually open and read (e.g. plain text/Markdown vs. an
  unreadable binary/proprietary format) — a distinct question from
  whether it has been reviewed.
- **Sufficient evidence** — `Yes`/`No`; whether the received, reviewed
  file actually contains enough to satisfy the term/topic's evidence
  requirement — not assumed from the file merely existing.
- **SME review required** — always `Yes` until
  `docs/survival-guide-sme-review.md`'s full checklist has been applied.
- **Notes** — anything else relevant.

## 1. Mandatory instruction and navigation sources

| Required source topic | Expected approved location | Local file received | Privacy review completed | Readable by Copilot | Sufficient evidence | SME review required | Notes |
|---|---|---|---|---|---|---|---|
| `External_Systems_Catalog.md` | Named local instruction file (not present in this repository — see source-access report) | No | No | No | No | Yes | File does not exist in this repository or any searched local path; must be supplied by its owner. |
| All Markdown files from the exact Groups_Instruction SharePoint folder | SharePoint — Groups Instruction library. **The exact folder path has not yet been discovered/confirmed in this environment**; whoever exports files must record the exact site + folder in `docs/survival-guide-source-intake-template.md` | No | No | No | No | Yes | Access to SharePoint is blocked (`access-denied`, see source-access report); the precise folder path is unknown until a human with access identifies it. |
| Prompt-usage guidance from the Groups_Instruction folder | Same SharePoint folder as above | No | No | No | No | Yes | Same blocker as above — cannot be split out until the folder itself is reachable. |
| `Wafer_Pattern_Intelligence_Agent_Instructions.md` | Named local instruction file (not present in this repository — see source-access report) | No | No | No | No | Yes | File does not exist in this repository or any searched local path; must be supplied by its owner. |

## 2. Core terminology sources

| Term | Expected approved location | Local file received | Privacy review completed | Readable by Copilot | Sufficient evidence | SME review required | Notes |
|---|---|---|---|---|---|---|---|
| EDI | Yield Knowledge Base / Groups Instruction library | No | No | No | No | Yes | See `docs/survival-guide-source-register.md` |
| Defect Count | Yield Knowledge Base | No | No | No | No | Yes | See source register |
| NCDD | Yield Knowledge Base / Groups Instruction library | No | No | No | No | Yes | See source register |
| Baseline | Yield Knowledge Base | No | No | No | No | Yes | See source register |
| GFA | Yield Knowledge Base / Groups Instruction library | No | No | No | No | Yes | See source register |
| CFA | Yield Knowledge Base / Groups Instruction library | No | No | No | No | Yes | See source register |
| Flyer | Yield Knowledge Base | No | No | No | No | Yes | See source register |
| Excursion | Yield Knowledge Base / Groups Instruction library | No | No | No | No | Yes | See source register |
| Tracer | DREAM-FE / Signal Management | No | No | No | No | Yes | See source register |
| MGPC | DREAM-FE / Groups Instruction library | No | No | No | No | Yes | See source register |
| OOC | Signal Management / Yield Knowledge Base | No | No | No | No | Yes | See source register |
| High EDI | Yield Knowledge Base | No | No | No | No | Yes | See source register |
| Commonality | DREAM-FE / Groups Instruction library | No | No | No | No | Yes | See source register |
| Hitback | DREAM-FE / Groups Instruction library | No | No | No | No | Yes | See source register |
| Root Cause | Groups Instruction library | No | No | No | No | Yes | See source register |
| RFC | Pilot Management / Groups Instruction library | No | No | No | No | Yes | See source register |
| xRFC | Pilot Management / Groups Instruction library | No | No | No | No | Yes | See source register |
| DTP | Pilot Management / Groups Instruction library | No | No | No | No | Yes | See source register |
| GO | Pilot Management / Groups Instruction library | No | No | No | No | Yes | See source register |
| NO GO | Pilot Management / Groups Instruction library | No | No | No | No | Yes | See source register |
| GL | Pilot Management / Groups Instruction library | No | No | No | No | Yes | See source register |
| NGL | Pilot Management / Groups Instruction library | No | No | No | No | Yes | See source register |
| Station Monitor | Pilot Management / `Wafer_Pattern_Intelligence_Agent_Instructions.md` | No | No | No | No | Yes | Blocked on absent local file in addition to SharePoint access — see source register |
| PD | Groups Instruction library | No | No | No | No | Yes | See source register |
| Disposition | Groups Instruction library | No | No | No | No | Yes | See source register |
| POR | Groups Instruction library / `External_Systems_Catalog.md` | No | No | No | No | Yes | Blocked on absent local file in addition to SharePoint access — see source register |

## 3. Daily-work evidence

| Daily-work topic | Expected approved location | Local file received | Privacy review completed | Readable by Copilot | Sufficient evidence | SME review required | Notes |
|---|---|---|---|---|---|---|---|
| PD and EDI-gap review | Groups Instruction library / Yield Knowledge Base | No | No | No | No | Yes | Not yet exported |
| Layer and defect contributors | Yield Knowledge Base | No | No | No | No | Yes | Not yet exported |
| Current and previous tracers | DREAM-FE / Signal Management | No | No | No | No | Yes | Not yet exported |
| Wafer maps and morphology | Yield Knowledge Base / Wafer Pattern Intelligence source | No | No | No | No | Yes | Depends on the absent `Wafer_Pattern_Intelligence_Agent_Instructions.md` |
| Segmentation, hitback, and commonality | DREAM-FE / Groups Instruction library | No | No | No | No | Yes | Not yet exported |
| Tool, chamber, subentity, operation, and recipe context | Groups Instruction library / External systems catalog | No | No | No | No | Yes | Depends on the absent `External_Systems_Catalog.md` |
| RFC and xRFC | Pilot Management / Groups Instruction library | No | No | No | No | Yes | Not yet exported |
| Station-monitor and recovery review | Pilot Management / Wafer Pattern Intelligence source | No | No | No | No | Yes | Depends on the absent `Wafer_Pattern_Intelligence_Agent_Instructions.md` |
| Gating and follow-up disposition | Groups Instruction library | No | No | No | No | Yes | Not yet exported |
| Status, ownership, next steps, and shift handover | Groups Instruction library | No | No | No | No | Yes | Not yet exported |
| Quality and excursion escalation | Groups Instruction library / Yield Knowledge Base | No | No | No | No | Yes | Not yet exported |

## Current status summary

- **0 of the sources above have been received, reviewed, or approved.**
- Two mandated local files remain **absent from the repository**
  regardless of SharePoint access:
  `External_Systems_Catalog.md` and
  `Wafer_Pattern_Intelligence_Agent_Instructions.md`.
- The **exact SharePoint site and folder for the Groups Instruction
  library have not been confirmed** in this environment and must be
  identified by a human with an authenticated session before export.
- This checklist will be updated (rows flipped to `Yes` with intake
  records added) only as real files are placed under
  `local-source-materials/` and reviewed — never in anticipation of
  that happening.
