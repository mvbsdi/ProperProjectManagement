# ProperProjectManagement

Project lifecycle governance framework for a hardware+software integration company.

Built to solve one problem: **software and controls teams are always the last to know.**

---

## What's Here

| File | Description |
|------|-------------|
| [`forms-index.html`](forms-index.html) | **Start here** — Document hub, process flow overview, links all artifacts |
| [`tracker.html`](tracker.html) | **Active Projects tracker** — live inventory of every effort, stage/gate status, one-click resume and gate advancement. Persists via the portal's `/ppm/api/projects` API to the private git-backed store `mvbsdi/ppm-projects`. |
| [`form-project-intake.html`](form-project-intake.html) | Project Intake Form (Gate 1) |
| [`form-change-request.html`](form-change-request.html) | Change Request Form |
| [`form-gate-checklist.html`](form-gate-checklist.html) | Gate Sign-Off Checklist (Gates 1, 2, 3) — PASS blocked until all blocker items check out |
| [`form-closeout-retro.html`](form-closeout-retro.html) | Project Closeout & Retrospective Form (Stage 10) |
| [`swimlane.html`](swimlane.html) | Swimlane diagram — role ownership across all 10 stages, gates and loops marked |
| [`raci.html`](raci.html) | Standalone interactive RACI matrix |
| [`project-lifecycle-exec.html`](project-lifecycle-exec.html) | Executive working session deck (20 slides) |
| [`project-lifecycle-slides.html`](project-lifecycle-slides.html) | Team rollout deck (27 slides) |
| [`project-lifecycle-pack.html`](project-lifecycle-pack.html) | Dense single-page reference doc |
| [`HANDOFF.md`](HANDOFF.md) | Agent/collaborator handoff context |

## Usage

Open `forms-index.html` in a browser. All files are self-contained static HTML — no build step, no server required. Host together in the same folder on any static host (GitHub Pages, SharePoint, intranet, Netlify, etc.). All forms print cleanly to paper/PDF via the browser's print dialog.

## To Customize

1. Forms submit to `mike.vanbibber@elementlogic.net` — edit the `const to = '...'` line in each form to change
2. Add your company logo/branding if needed
3. Adjust gate checklist items to match your actual project types
