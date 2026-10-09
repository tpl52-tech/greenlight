# qa-task-manager

An Apple-styled QA task manager for the **ReUse App — Fall 2026** project
(Cornell EWB SoftDev). Manual testers work the tickets in Linear's
**Verifying** column as structured run sheets.

## Apps

- **`index.html` — Cue QA.** The run-sheet workspace: a ticket queue on the
  left, and a per-ticket run sheet on the right (preconditions checklist,
  numbered steps with ✅ *Expect* / ❌ *Fail if*, per-step Pass/Fail with a
  failure note, and an overall Pass / Fail / Blocked verdict + progress ring).
- **`cue.html` — Cue.** A minimal To Do / Done task manager (the original
  single-user version).

Both are single static HTML files — no build step.

## Where the tickets come from

Cue QA ships with the six tickets that were in **Verifying** as a baked-in
snapshot, each turned into a run sheet from its real acceptance criteria
(COR-35 uses the lead's hand-written script verbatim). The **↻ Refresh**
button re-pulls the Verifying column live.

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
