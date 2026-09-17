# Team Deployment Plan — DEFMET ONBOARDING (Pilot)

**Goal:** get a working URL in front of 5–20 Defect Metrology engineers
within the next few days, using the existing, unchanged application
(static React/Vite build + browser-local IndexedDB persistence). No new
features, no UI redesign, no SharePoint backend integration.

This plan covers **one** deployment path end to end. For the full
comparison of alternatives (Azure Static Web Apps, Azure Storage static
website, internal IIS, SharePoint doc-library hosting, SPFx), see the
assessment delivered alongside this document; those are not repeated here.

---

## 1. Recommended approach

**Internal GitHub Pages, private repository, GitHub Actions deploy.**

Reasons:
- No new infrastructure or cloud subscription request — reuses Intel's
  existing internal/enterprise GitHub, which engineers already have
  accounts on.
- The repo and CI workflow are **already prepared** in this project (see
  `.github/workflows/deploy-pages.yml` and `docs/github-pages-deployment.md`)
  from prior work — only the remote + push + Pages toggle remain.
- A private repository restricts the deployed site to authenticated
  internal users, satisfying "internal Intel users only" without any
  extra app-level authentication code.
- Zero changes to the application: build output is the same static
  `dist/` folder already produced by `npm run build`.
- Update process is a single `git push` — no manual file copy step.

---

## 2. Deployment architecture

```
Engineer's browser (Chrome/Edge, internal Intel machine)
        │
        │  HTTPS GET (direct URL, no iframe)
        ▼
GitHub Pages (internal GHES instance)
  - Serves the static dist/ build (HTML + CSS + JS)
  - Access restricted to authenticated internal GitHub users
  - No server-side code, no database
        │
        │  (nothing sent back to GitHub Pages after initial load)
        ▼
Engineer's browser IndexedDB
  - Database: defect-metrology-onboarding
  - Stores: curriculum tasks (parsed client-side from the workbook the
    engineer selects locally), engineer profile, per-task progress
  - Scoped per-browser, per-origin — never leaves the machine
  - Never touches GitHub Pages, the repo, or any server
```

Key properties:
- **No backend introduced.** GitHub Pages only serves static files.
- **No shared data.** Each engineer's progress lives only in their own
  browser, exactly as it does today running via `npm run dev`.
- **The real workbook and any exported progress files are never
  committed** to the repository — only application source code and the
  build workflow. See `docs/privacy-and-security.md`.

---

## 3. Rollout steps

### Step 0 — Confirm with IT (do this first, in parallel with everything else)
1. Confirm GitHub Pages is enabled on your GHES instance.
2. Confirm private repositories support Pages sites restricted to
   authenticated internal users (not public-internet-visible).
3. Confirm `actions/checkout`, `actions/setup-node`,
   `actions/upload-pages-artifact`, and `actions/deploy-pages` are
   available (via GitHub Connect or an internal mirror). If not, ask IT
   for the approved equivalents and swap them into
   `.github/workflows/deploy-pages.yml`.

### Step 1 — Validate the build locally
```powershell
cd onboarding-app
npm install
npm run test     # confirm the full suite still passes
npm run build    # confirm dist/ is produced with no errors
npm run preview  # optional: sanity-check the production build in a browser tab
```

### Step 2 — Create the private repository
1. On the internal GitHub instance, create a new **private** repository
   (e.g. `defmet-onboarding`), empty (no auto-created README/license).
2. Do **not** add the real `Training package_General_2026.xlsx` or any
   exported JSON/CSV progress file to the repo at any point.

### Step 3 — Push the existing local repo
```powershell
cd onboarding-app
git remote add origin https://<internal-github-host>/<org>/defmet-onboarding.git
git push -u origin main
```

### Step 4 — Enable Pages
1. In the new repo: **Settings → Pages** → set source to **GitHub
   Actions** (not "Deploy from a branch").
2. Push again (or re-run the workflow from the **Actions** tab) if it
   doesn't trigger automatically.

### Step 5 — Verify the deployment
1. Watch the **Actions** tab until the workflow run succeeds.
2. Open the resulting Pages URL (shown in the workflow run summary and
   in **Settings → Pages**) in a private/incognito window to confirm it
   loads for a logged-in internal account.
3. Complete a smoke test: create a test engineer profile, import the
   workbook (or `sample-data/`), mark a task complete, reload the page,
   confirm progress persisted.

### Step 6 — Share with the pilot group
1. Send the URL to the 5–20 pilot engineers with two short notes:
   - Each person's progress is private to their own browser — no shared
     login, no shared data.
   - Recommend they periodically use **Settings → Export Backup (JSON)**
     to avoid losing progress if they clear browser data.
2. Point them to `docs/privacy-and-security.md` if anyone asks where
   their data is stored.

---

## 4. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GHES Pages not enabled or doesn't support private/restricted visibility | Medium | Blocks this exact path | Fallback to Azure Static Web Apps (Free tier) per the comparison assessment — same `dist/` output, different upload target |
| Engineer clears browser data / uses a different browser or machine and loses progress | Medium | Medium (per-engineer, not systemic) | This is a known, documented limitation (see `docs/sharepoint-deployment.md` §9 and `docs/privacy-and-security.md`); encourage periodic JSON backup export |
| Someone accidentally commits the real workbook or an exported progress file | Low | Medium (internal data exposure inside the private repo) | `.gitignore` already excludes typical build/data artifacts; add a pre-push reminder/checklist item; repo is private, limiting blast radius |
| CI Actions (`upload-pages-artifact`/`deploy-pages`) unavailable on the internal GHES instance | Low–Medium | Blocks automated deploy | Ask IT for internally-approved equivalents; as a stopgap, build locally and push `dist/` output to a `gh-pages` branch manually |
| Pilot feedback reveals a real bug during the pilot window | Medium | Low–Medium | Standard `git push` redeploys a fix in minutes; no user action needed (browsers fetch the new hashed asset files automatically) |

---

## 5. Rollback strategy

Because this is a static, stateless deployment with no shared backend:

1. **Bad deploy / broken build:** revert the last commit and push —
   `git revert HEAD && git push` — the Actions workflow rebuilds and
   redeploys the previous known-good version automatically. No manual
   cleanup needed on the hosting side.
2. **Need to pull the pilot offline entirely:** in **Settings → Pages**,
   set the source back to "None" (or delete the Pages environment). The
   URL stops resolving; no engineer data is affected since it never left
   their browsers.
3. **Repository-level rollback:** since the repo is private and only
   contains source code + workflow files (never the workbook or real
   progress exports), there is no data-exposure cleanup required even in
   a worst-case revert — only redeploying working code.
4. **Individual engineer impact:** none from a rollback — each browser's
   IndexedDB is independent of what's currently deployed; reverting the
   hosted build does not touch or reset anyone's local progress.

---

## 6. Explicitly out of scope for this pilot

Per the current instructions, this plan intentionally does **not**
include:
- Any SharePoint backend/SPFx integration.
- Any new application features or UI changes.
- Any shared/central database — persistence remains per-browser
  IndexedDB exactly as today.
- Long-term/production hosting decisions — this is a pilot path only,
  chosen for speed; a longer-term hosting and centralized-progress
  decision can be revisited after the pilot, per the existing migration
  notes in `docs/sharepoint-deployment.md` §10 and `docs/data-model.md`.
