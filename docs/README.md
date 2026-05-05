# ClearPath Scope Builder

Web-based tool for assembling Scope of Work documents for ClearPath Construction projects.
Outputs print-ready PDF and editable .docx.

**Live site:** https://skcagents.github.io/Clearpath-scope-builder/

---

## What's in here

| File | Purpose |
|---|---|
| `index.html` | Entry point — load this in a browser or via GitHub Pages |
| `ScopeLibrary.jsx` | Master library of scope sections and line items |
| `ScopeComponents.jsx` | React UI components for the builder interface |
| `ScopeDocument.jsx` | Renders the print/PDF document layout |
| `ScopeDocx.js` | Generates the editable Microsoft Word (.docx) export |
| `*.compiled.js` | Pre-transpiled versions of the .jsx files (not currently used; HTML loads .jsx through Babel at runtime) |
| `assets/` | ClearPath logo files |

## Running locally

No build step required. Either:

- Open `index.html` directly in a browser, **or**
- From this folder, run `python3 -m http.server 8000` and visit `http://localhost:8000`

The local server route is more reliable because some browsers restrict `file://` script loading.

## Editing the scope library

The single most common edit is adding/removing sections or line items.
Open `ScopeLibrary.jsx` — everything is in one array at the top of the file. Save, refresh the browser, done.

## Deploying updates

This repo is served by GitHub Pages from the `main` branch root.
Any commit pushed to `main` is live within ~30–60 seconds.

```bash
# typical update flow
git pull
# ...edit files...
git add .
git commit -m "Add new line items to demolition section"
git push
```

If updates aren't appearing, hard-refresh the browser (Cmd+Shift+R / Ctrl+Shift+R) — GitHub Pages caches aggressively.

## Versioning

Tag stable releases so you can roll back if something breaks mid-meeting:

```bash
git tag v1.0.0
git push --tags
```

To roll back: `git revert <bad-commit>` and push, or check out a known-good tag and force-push.
