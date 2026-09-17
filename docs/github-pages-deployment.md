# Hosting DEFMET ONBOARDING on Intel's internal GitHub (GitHub Pages)

This is one concrete way to satisfy "Approach A" in
`docs/sharepoint-deployment.md` (an externally-hosted static build, embedded
into SharePoint via the Embed web part, or linked directly from a OneNote
page) using Intel's internal/enterprise GitHub instance instead of Azure or
an internal IIS server. No application code changes were needed beyond what
was already done for SharePoint hosting (`base: './'` in `vite.config.ts`
already makes the build work at any URL depth, including a GitHub Pages
project-page path like `.../<org>/<repo>/`).

## Before you start — confirm with IT

1. **GitHub Pages must be enabled** for your GitHub Enterprise instance —
   some GHES installs have it turned off. Ask IT/your GitHub admin.
2. **Repository visibility**: create the repo as **private**, restricted to
   your org/team. Confirm whether your GHES version supports "private"
   Pages sites (so only authenticated Intel GitHub users can view the
   deployed URL) — this matters because the app is internal onboarding
   tooling, not public content.
3. **GitHub Actions availability**: confirm `actions/checkout`,
   `actions/setup-node`, `actions/upload-pages-artifact`, and
   `actions/deploy-pages` are available on your instance (via GitHub
   Connect to github.com, or an internal actions mirror). If they aren't
   mirrored, ask IT for the internally-approved equivalents and swap them
   into `.github/workflows/deploy-pages.yml`.

## What was set up in this repo

- `git init` was run inside `onboarding-app/` (this folder is the repo
  root — the workbook file and any other files in the parent `training/`
  folder are **not** part of this repository and will not be pushed).
- `.github/workflows/deploy-pages.yml`: a GitHub Actions workflow that, on
  every push to `main`, runs `npm ci`, `npm run test`, `npm run build`, and
  publishes the resulting `dist/` folder to GitHub Pages.
- Nothing else changed — the workflow only builds and deploys the exact
  same static `dist/` output described in `docs/sharepoint-deployment.md`.

## Steps to finish the setup

1. On your internal GitHub instance, create a new **private** repository
   (e.g. `defmet-onboarding`), empty (no README/license auto-created).
2. Back in this folder, add it as the remote and push:
   ```powershell
   git add -A
   git commit -m "Initial commit: DEFMET ONBOARDING app"
   git branch -M main
   git remote add origin https://<your-internal-github-host>/<org>/defmet-onboarding.git
   git push -u origin main
   ```
3. In the repo's **Settings → Pages**, set the source to **GitHub Actions**
   (not "Deploy from a branch").
4. Push (or re-run the workflow from the **Actions** tab) — the workflow
   builds and deploys automatically. The **Actions** tab and the Pages
   settings page will show the resulting URL once deployment succeeds,
   something like:
   `https://<org>.pages.<your-internal-github-host>/defmet-onboarding/`
   (exact format depends on your GHES Pages configuration).
5. That URL is the "relevant link" — use it either:
   - directly, shared with your team, or
   - pasted into a SharePoint **Embed** web part (see
     `docs/sharepoint-deployment.md`), or
   - as a plain hyperlink from a OneNote page (OneNote can't embed the live
     app, only link to it — see the in-chat guidance already given).

## Updating the app later

Just commit and push to `main` — the workflow rebuilds and redeploys
automatically. No manual file upload step, unlike the Azure/IIS approach in
`docs/sharepoint-deployment.md`.

## Privacy note

Only application **source code** (TypeScript/React/CSS/config) is pushed to
this repository — never the real `Training package_General_2026.xlsx`
workbook and never any real engineer's exported JSON/CSV progress data. The
app parses the workbook entirely client-side after each engineer selects it
from their own computer; the workbook itself should not be committed to
source control. If you ever add sample/demo data to this repo, make sure it
stays clearly labeled synthetic, per `docs/privacy-and-security.md`.
