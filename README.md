# qa-task-manager

An Apple-styled QA task manager for the **ReUse App — Fall 2026** project
(Cornell EWB SoftDev). It is **manual testing for non-technical members**:
testers work the tickets in Linear's **Verifying** column as structured,
tap-through run sheets. A ticket belongs here only if its "working" is
observable by *using the app* — backend-only work (RLS, triggers, migrations,
Workers, endpoints) is the automated **verify sweep's** job, not Cue QA.

## Apps

- **`index.html` — Cue QA.** The run-sheet workspace: a ticket queue on the
  left, and a per-ticket run sheet on the right (preconditions checklist,
  numbered steps with ✅ *Expect* / ❌ *Fail if*, per-step Pass/Fail with a
  failure note, and an overall Pass / Fail / Blocked verdict + progress ring).
- **`cue.html` — Cue.** A minimal To Do / Done task manager (the original
  single-user version).

`cue.html` is a single static file; **Cue QA** is `index.html` plus its logic in
`app.js` beside it (served/published together). No build step either way.

## Where the tickets come from

Cue QA ships with the screen-observable tickets that were in **Verifying** as a
baked-in snapshot, each turned into a run sheet from its real acceptance criteria
(COR-35 uses the lead's hand-written script verbatim). The **↻ Refresh** button
re-pulls the Verifying column live and hides tickets written as pure backend work
(and shows how many it hid), so non-technical testers see what they can tap through.
It errs toward showing — an occasional backend ticket can slip through and is just
skipped — rather than risk hiding something a tester could actually check.

## Running it

Open `index.html` in a browser, or publish the repo with GitHub Pages
(Settings → Pages → Deploy from `main`).

Two features depend on the Claude artifact runtime (`window.claude`) and only
light up when the page is opened as a **Claude Artifact**:

- **Refresh** calls the viewer's **Linear** connector (`list_issues`) via the
  `mcp` capability. The viewer must have Linear connected in claude.ai.
- **Shared results** persist to the artifact's `db` so the whole team sees the
  same pass/fail state. Testers need **edit (Contributor) access** to record
  results; view-only members see a read-only run sheet.

Served as a plain file or on GitHub Pages (no `window.claude`), Cue QA still
works, but refresh is unavailable and results are kept per-browser in
`localStorage`. A deployed, team-shared version would wire results to the
project's own Supabase instead.
