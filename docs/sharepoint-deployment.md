







# Deploying DEFMET ONBOARDING to SharePoint Online

This document explains how to publish the existing onboarding application
(unchanged architecture — React + Vite + TypeScript + IndexedDB) so it can be
opened from a SharePoint Online Site Page by any engineer in Defect
Metrology.

**Nothing about the application itself changed for this purpose.** The
workbook parser, curriculum model, phase/module/task hierarchy, progress
calculations, achievements, theme system, engineer profiles, and import
logic are exactly as before. Only two small portability changes were made
(see [Code changes](#code-changes-made) below) so the same build output can
be hosted from a URL that isn't the site root.

---

## 1. Recommendation: which SharePoint integration approach?

Three approaches were investigated, as requested.

| Approach | What it means | Advantages | Disadvantages | Complexity | Ongoing maintenance |
|---|---|---|---|---|---|
| **A. IFrame embed of an externally-hosted static build** (via SharePoint's built-in **Embed** web part) | `npm run build` output is hosted on any internal static host (Azure Static Web Apps, Azure Storage static website, internal IIS, etc.) under the org's own domain. A SharePoint Site Page then adds an **Embed** web part with that URL. | Zero changes to the app's architecture or build tooling. No SPFx toolchain, no approval pipeline for a SharePoint package. Fastest to ship and easiest to update (just re-upload `dist/`). Each engineer's browser keeps its own independent IndexedDB data, satisfying "multiple engineers, independent browsers" with no extra work. | Requires *some* internal static hosting target outside SharePoint itself (even a single internal IIS folder is enough). The hosting domain must be added to the tenant's **embeddable content allow-list** (SharePoint admin center → Content services → Embed) and must not send `X-Frame-Options: DENY`/a blocking `Content-Security-Policy: frame-ancestors`. | **Low** | **Low** — redeploy is "copy new `dist/` folder to the host." |
| **B. Upload `dist/` into a SharePoint Document Library, embed via IFrame/Embed web part pointing at the library file** | The built files live inside SharePoint itself (a document library), and the Embed web part (or a classic Content Editor/Script Editor web part in a classic site) points at `index.html` inside that library. | No external host needed at all — everything lives in SharePoint. | Modern document libraries typically force `.html` files to download (Content-Disposition) rather than render, and SharePoint's own document library responses commonly include restrictive framing headers, so this is unreliable without extra tenant configuration (custom MIME/content-type handling, disabling "Open documents in the browser" restrictions, etc.). Harder to reproduce consistently across tenants; more trial-and-error. Updating requires re-uploading every file and being careful about cache-busted asset filenames vs. cached CDN copies. | **Medium** | **Medium** |
| **C. SharePoint Framework (SPFx) web part packaging** | The app is wrapped as a first-class SPFx web part (its own Node/Yeoman/gulp build, `.sppkg` package, App Catalog deployment, tenant/site approval). | Feels the most "native" to SharePoint; can pass SharePoint context (site, user) into the web part if ever needed; centrally managed via the App Catalog. | Requires an entirely separate build toolchain and packaging pipeline on top of the existing Vite app (or a full rebuild of the UI as an SPFx web part) — this violates the "do not rebuild the application" requirement for this task. Needs SharePoint admin approval to deploy/update the App Catalog package for every release. Much higher long-term maintenance (SPFx version upgrades, tenant admin approval for every update). | **High** | **High** |

### Recommendation

**Approach A — IFrame embed of an externally-hosted static build, via SharePoint's Embed web part.**

It is the only option that requires **zero changes to the application's
architecture, build process, or tooling**, matches the "keep it a static
Vite app" constraint exactly, and has the lowest ongoing maintenance burden
(publishing an update is just copying a new `dist/` folder over the old
one). Approach C (SPFx) is the natural next step *only if/when* the
organization wants the app centrally distributed through the App Catalog or
needs deep SharePoint context integration — see
[Migration path for future centralized storage](#10-migration-path-for-future-centralized-storage).

---

## 2. Build steps

From the `onboarding-app/` folder:

```powershell
npm install       # first time only, or after dependency changes
npm run test      # optional but recommended: 71 automated tests
npm run build     # produces the dist/ folder
```

`npm run build` runs `tsc -b && vite build`. The output is a fully static
site in `onboarding-app/dist/` — HTML, CSS, and JS only, no server code.

---

## 3. Deployment steps (recommended approach)

1. Run `npm run build` (see above). Confirm `dist/index.html` and
   `dist/assets/*` exist.
2. Copy the entire contents of `dist/` to your chosen internal static host
   (a few examples):
   - **Azure Static Web Apps** or an **Azure Storage static website**:
     upload the contents of `dist/` as the site root (e.g. `az storage blob
     upload-batch -s dist -d '$web'`).
   - **Internal IIS / web server**: copy `dist/*` into a folder served over
     HTTPS, e.g. `https://internal-tools.yourcompany.com/defmet-onboarding/`.
3. Confirm the hosting URL loads correctly in a normal browser tab first
   (this validates the deployment independent of SharePoint).
4. In SharePoint admin center, go to **Content services → Embed** (or the
   tenant setting for embeddable/trusted domains) and add the hosting
   domain from step 2 to the allow-list, if your tenant restricts embedding.
5. On the target SharePoint Site Page, edit the page → add the **Embed**
   web part → paste the hosting URL from step 2 (or the equivalent
   `<iframe>` snippet if your tenant's Embed web part expects raw HTML).
6. Set the web part's height to a generous value (900–1200px is a
   reasonable starting point) since the app scrolls internally like any
   normal web page — see [Limitations](#9-limitations-of-indexeddb) for the
   double-scrollbar note.
7. Publish the page.

Each engineer who opens the page gets the app running in their own browser,
with their own independent, private IndexedDB profile/progress data — no
extra configuration is needed per user.

---

## 4. Folder structure

```
onboarding-app/
  dist/                     ← build output; this is what gets deployed (step 2 above)
    index.html
    favicon.svg
    assets/
      index-<hash>.js
      index-<hash>.css
  src/                      ← application source (unchanged by this task)
  docs/
    sharepoint-deployment.md ← this file
    data-model.md
    import-rules.md
    privacy-and-security.md
  README.md
```

Nothing needs to be deployed except the contents of `dist/`. `src/`,
`docs/`, tests, and config files stay in source control only.

---

## 5. How to update the application

1. Make code changes in `src/` as usual (following the existing
   architecture — parser, curriculum, progress, persistence stay separated).
2. Run `npm run test`, `npm run build`, `npm run lint` and confirm all pass.
3. A fresh `dist/` folder is produced with new, uniquely hashed asset
   filenames (e.g. `index-BKfSXl9f.js` becomes a different hash). This
   means browsers will not serve a stale cached copy of the JS/CSS after an
   update — only `index.html` needs cache-busting consideration (most
   static hosts already set short/no-cache for `index.html` by default).

## 6. How to upload a new version

1. Re-run `npm run build`.
2. Replace the previous deployment's files with the new `dist/` contents at
   the same hosting location used in [Deployment steps](#3-deployment-steps-recommended-approach)
   step 2 (same URL, so the existing Embed web part on the SharePoint page
   does not need to change).
3. No SharePoint page edit is required for a normal update — the iframe
   simply loads the new build the next time someone opens the page.
4. If you rename/move the hosting URL, update the Embed web part's URL on
   the SharePoint page to match.

---

## 7. How workbook imports work

Unchanged from the existing application (see `docs/import-rules.md` for the
full, authoritative rules). In short: the engineer (or an admin) uses the
in-app **Import/Refresh curriculum** action to select
`Training package_General_2026.xlsx` from their own computer. The workbook
is parsed **entirely client-side in the browser** — it is never uploaded to
a server, because there is no server. On first import the curriculum is
stored in the browser's IndexedDB; on re-import, tasks are matched by their
stable ID so existing engineer progress is preserved, and any structural
changes are shown in an import review screen before being applied.

## 8. How engineer progress is stored

Unchanged from the existing application (see `docs/data-model.md`). Profile
data and per-task progress are stored in the browser's IndexedDB, separate
from the curriculum data. Nothing is sent to a server or to SharePoint —
SharePoint here is purely a page that hosts an iframe pointing at the static
app; it plays no role in storing or transmitting onboarding data.

---

## 9. Limitations of IndexedDB

These limitations pre-exist this task and are documented here because they
matter specifically for a SharePoint-hosted iframe deployment:

- **Per-browser, per-origin storage.** Progress is stored in the
  *engineer's own browser*, scoped to the exact origin (protocol + domain)
  serving the app — in this deployment, the static-hosting URL from step 2
  above, **not** the SharePoint page URL (the iframe's content has its own
  origin). Opening the same SharePoint page from a different browser,
  device, or browser profile starts a **new, empty** local profile; there
  is no automatic cross-device sync.
- **No cross-engineer visibility.** Because storage is local per browser,
  a manager or trainer cannot see an engineer's progress by opening the
  same SharePoint page themselves — they would only see their own local
  (likely empty) profile. Use the app's **CSV export** / **JSON backup**
  features to share progress externally, e.g. attached to an email or
  stored in a document library.
- **Data can be lost.** Clearing browser data/cookies, using a private/
  InPrivate window, switching browsers, or a browser policy that clears
  site data on close will erase local progress unless the engineer has
  exported a backup. Encourage periodic **JSON backup export**.
- **Third-party cookie / storage-partitioning policies.** Some browsers
  (Safari's ITP, Chrome's upcoming third-party storage partitioning, and
  some corporate "block third-party storage in iframes" policies) can
  restrict or partition storage for content running inside an iframe with a
  different origin than the top-level page. If engineers report progress
  "disappearing" between sessions, first check whether the browser is
  treating the embedded app's origin as third-party storage and, if so,
  consider opening the app in its own browser tab (the hosting URL
  directly) instead of through the SharePoint iframe, or consult the future
  migration path below.
- **No server-side backup or recovery.** If local storage is lost with no
  exported backup, the progress cannot be recovered — this is inherent to
  a fully client-side, serverless design and was an explicit, approved
  trade-off for the first version of this application.
- **Double scrollbars possible.** Because the app is a normal scrolling
  web page rendered inside a fixed-height iframe on the SharePoint page,
  very long checklists may produce an inner scrollbar (the app) in
  addition to the outer page scrollbar (SharePoint). Setting a generous
  Embed web part height (see step 6 in Deployment steps) minimizes this.

## 10. Migration path for future centralized storage

The persistence layer is already abstracted behind repository interfaces
(`CurriculumRepository`, `ProfileRepository`, `ProgressRepository` in
`src/persistence/`) specifically so IndexedDB can be swapped for a real
backend later **without rewriting the UI or domain logic**. When the
organization is ready to move beyond per-browser local storage:

1. Implement new repository classes (e.g. backed by Microsoft Graph /
   SharePoint Lists, Dataverse, or a small internal API) that satisfy the
   same repository interfaces already used by `App.tsx`.
2. Swap the concrete repository instances created near the top of
   `App.tsx` (currently `IndexedDbCurriculumRepository`,
   `IndexedDbProfileRepository`, `IndexedDbProgressRepository`) for the new
   implementations — no other application code needs to change.
3. At that point, migrating to a first-class **SPFx web part** (Approach C
   above) becomes far more attractive, since the web part could use the
   signed-in SharePoint user's identity directly instead of a locally
   created profile, and progress would be centrally visible to trainers
   without relying on manual CSV/JSON export.
4. Until that investment is made, the CSV export / JSON backup-and-restore
   features already in the app are the supported way to share or archive
   progress data centrally (e.g. a trainer collects exported JSON files
   into a SharePoint document library).

This deployment (Approach A) does not block that future migration in any
way — it is a packaging/hosting decision only.

---

## Code changes made

Two small, non-functional portability changes were made so the unchanged
application can be hosted from a non-root URL:

1. `vite.config.ts` — added `base: './'` so built assets use relative paths
   instead of absolute root paths (`/assets/...`), which works regardless of
   the folder depth the static build is hosted at.
2. `index.html` — the favicon reference now uses Vite's `%BASE_URL%`
   placeholder instead of a hardcoded `/favicon.svg`, so it resolves
   correctly under the same relative-base setup.
3. `src/index.css` — the app's centered content column max-width was
   widened slightly (1200px → 1440px) to make better use of a full-width
   SharePoint page canvas on large monitors; this is a pure CSS change with
   no effect on functionality, data, or the responsive behavior at smaller
   widths (existing breakpoints are unchanged).

No changes were made to the workbook parser, curriculum model, task
hierarchy, progress calculations, achievements, theme system, engineer
profile logic, or import logic.
