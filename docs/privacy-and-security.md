# Privacy & Security

## Data location

Everything the app stores lives in your browser's **IndexedDB**, in a
database named `defect-metrology-onboarding`, scoped to this browser
profile on this machine. Nothing is uploaded, synced, or sent to any
server. There is no backend, no analytics, and no telemetry in this
version.

## What is collected

Only the fields needed to run the onboarding checklist:

- Engineer profile: full name, start date, role/track, layer/area, manager,
  buddy/mentor, target completion date.
- Per-task progress: status, notes, evidence link, trainer/owner, dates.

No sensitive personal data (e.g. government IDs, health data, home address)
is collected or requested by any form in this app.

## Untrusted input handling

The workbook is treated as **untrusted input**:

- Cell values are read as plain text only. Rich text, hyperlink objects, and
  formula results are all converted to plain strings — nothing is ever
  interpreted as HTML or executed as a formula.
- Every string is passed through `sanitizeText` (strips control characters,
  neutralizes leading `=`/`+`/`-`/`@` characters that could be interpreted
  as a formula if the value were ever re-opened in a spreadsheet tool).
- Every hyperlink is passed through `sanitizeUrl`, which only allows
  `http:`, `https:`, and `mailto:` protocols. Anything else (e.g.
  `javascript:`) is dropped silently and never rendered as a clickable link.
- React itself escapes all text content by default; this app never uses
  `dangerouslySetInnerHTML`.

## Import workflow

The workbook is **never bundled into the app or committed to source
control**. The user selects the file at runtime via a file picker or
drag-and-drop; the file is read entirely in the browser and never
transmitted anywhere.

## Public demos / repositories

If this project is ever shared publicly:

- Do not commit `Training package_General_2026.xlsx` or any exported JSON
  backup — both may contain internal links and organizational details.
- The `sample-data/` folder contains only clearly-labeled **synthetic**
  example data for demonstration; it contains no real employee or workbook
  content.
- Review `docs/import-rules.md` before publishing — it quotes a few short
  fragments of source wording for traceability; confirm this is acceptable
  for your organization's disclosure policy before making the repo public.

## Third-party dependencies

- `exceljs` is used for workbook parsing (chosen over the `xlsx`/SheetJS
  npm package, which has known, currently-unpatched high-severity
  prototype-pollution/ReDoS advisories on npm).
- `idb` is a small, dependency-free wrapper over the browser's native
  IndexedDB API — no data leaves the browser through it.
- No cloud SDKs, ad/analytics scripts, or remote font/script CDNs are used.

## Future shared backend

Persistence is abstracted behind repository interfaces
(`CurriculumRepository`, `ProfileRepository`, `ProgressRepository`). A
future approved shared backend should implement the same interfaces; at
that point this document must be revisited to cover authentication,
transport security, and data retention for that backend.
