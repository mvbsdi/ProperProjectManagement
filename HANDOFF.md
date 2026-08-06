# Agent Handoff — ProperProjectManagement

## Who Is This User?

**Role:** Principal Software Engineer at a hardware+software integration company  
**Objective:** Fix a systemic organizational failure where software and controls teams are excluded from project planning until documents are due, then forced to scramble.  
**Tone:** Direct, engineering-first, no fluff. He does not want storytelling — he wants accountability, structure, and defensible process. He will push back if something feels too corporate or consultant-y.

---

## The Core Problem He Is Solving

Software/Controls teams find out about new projects **the week FSD and HI documents are due.** No heads-up. No planning. No staffing. The result is constant scrambling, developer burnout, and missed deadlines. The root cause is cultural: salespeople, KAMs, and PMs treat software as an afterthought — it is intangible compared to hardware, so it gets scheduled last.

---

## His Organization Structure

| Role | Responsibility |
|------|----------------|
| KAM / Sales | Customer relationship, commission-driven, may be disengaged post-sale |
| PM | Delivery timeline, hardware resources, site coordination |
| TPM (Technical PM) | Software scope owner — supposed to write FSD and HI docs, run requirements calls. Often disengaged in practice. |
| SA (Solution Architect) | On-site software configuration, customer-facing requirements gathering. Doubles as TPM on some projects. |
| Software Dept | Customizations and configuration — the people who actually build |
| Controls Team | PLC software, low-voltage integration |

**Key pain:** The TPM role is the weakest link. They sit on calls, supposedly capture requirements, and are supposed to relay to software — but in practice they're often absent or ineffective.

---

## Project Archetypes

| Type | Lead Time | Notes |
|------|-----------|-------|
| Greenfield | 4–8 wk pre-build | New customer, full software stack from scratch |
| Recontrol / Major Upgrade | 3–6 wk pre-build | Largest scope — existing hardware, new software layer or major changes |
| Minor Upgrade / Feature Add | 1–2 wk pre-build | Minimal blast radius but can have customization layered on |

Every project can have **customization** added at any point: new screens, new UI components, new integrations, new features. The product is configured per customer; sometimes it is configured AND customized.

---

## The Governance Framework Built

A 10-stage lifecycle with 3 mandatory gates that software/controls must pass before work continues:

**Stages:**
1. Opportunity Qualification  
2. Solution Shaping  
3. SOW Freeze  
4. Project Intake ← **Gate 1** (Software/Controls formally engaged here, not before)  
5. Discovery & Requirements  
6. Design & Planning ← **Gate 2**  
7. Build & Integration  
8. Site Readiness ← **Gate 3**  
9. Go-Live & Hypercare  
10. Closeout & Retrospective  

**4 Reconciliation Loops** (retry paths, not failure):
- **Loop A** — Feasibility Impasse (Stage 2→3): Scope not buildable, return to shaping  
- **Loop B** — Scope Inflation (Stage 5→4): Discovery reveals scope beyond SOW, must re-gate  
- **Loop C** — Requirements Gap (Stage 6→5): Design can't proceed, return to requirements  
- **Loop D** — Integration Conflict (Stage 7→6): Build reveals design flaw, return to design  

**8 Non-Negotiable Rules:**
1. No customization work starts without a signed CR  
2. No Gate 1 without Software Lead and Controls Lead signatures  
3. No FSD/HI docs written without Discovery complete  
4. TPM owns the FSD; Software Lead must sign off before it goes to customer  
5. SOW changes require CR — no verbal scope creep  
6. Software/Controls are consulted at Solution Shaping, not post-SOW  
7. Resource allocation is locked at Gate 2  
8. No Go-Live without Gate 3 sign-off from all three parties  

---

## What Has Been Built (All HTML, Self-Contained)

All files live in this repo. They are static HTML — no backend, no framework, no dependencies. They can be hosted on SharePoint, GitHub Pages, an intranet, or any static host as long as all files stay in the same folder (relative links).

| File | Purpose |
|------|---------|
| `forms-index.html` | **Hub page** — start here. Links all documents. Shows the process flow. |
| `form-project-intake.html` | Project Intake Form (Stage 4, Gate 1). 6 sections. Mailto submit. Auto-generates INT-YYYY-XXXX doc ID. |
| `form-change-request.html` | Change Request Form. Impact matrix, effort estimate, 3-party approval. Auto-generates CR-YYYY-XXXX doc ID. |
| `form-gate-checklist.html` | Gate Sign-Off Checklist — tabbed Gates 1/2/3. Blocker items flagged. PASS/FAIL/CONDITIONAL outcome. **PASS is blocked (inline error + row highlighting) until every blocker for the active gate is checked.** Auto-generates GATE-YYYY-XXXX doc ID. |
| `form-closeout-retro.html` | Project Closeout & Retrospective Form (Stage 10). Delivery outcomes, gate/loop history, keep/stop/start retro, metrics, action items, 3-party sign-off. Auto-generates RETRO-YYYY-XXXX doc ID. |
| `swimlane.html` | Swimlane diagram — CSS-grid, six role lanes × 10 stage columns with ownership intensity, Gates 1/2/3 marked, loop strip for Loops A–D. |
| `raci.html` | Standalone interactive RACI matrix — role highlighting, per-role accountability filters, legend, print styles. Content consistent with the governance pack. |
| `tracker.html` | **Active Projects tracker** — live inventory of every project/effort: 10-segment stage strip with gate markers, per-project detail panel with "You are here" + exactly ONE primary next action (fill intake / record gate result / advance stage / file closeout), gate recording (PASS auto-advances; CONDITIONAL advances with an open flag until cleared; FAIL stays), reconciliation-loop "back" button, owners/notes editing, full history log, name-of-editor via localStorage `ppm_user`. Persists through `GET/POST api/projects` (relative URL — the gateway API at `/ppm/api/projects`) with optimistic concurrency (409 → refresh + re-apply). Data lives in the private repo `mvbsdi/ppm-projects` (`projects.json`), auto-committed+pushed by the gateway on every save. |
| `assistant.js` | **Timmy the Tote** — Clippy-style onboarding assistant included by every page (`<script defer src="assistant.js">`). First visit: asks "who are you" (8 roles incl. Exec, KAM/Sales, PM, TPM, SA, SW Eng, Controls Eng), then spotlights that role's starting document on the hub and gives role-aware tips (the tracker tip is the role's "guiding light" — guidance, never a filter). One context tip per page, shown once (tracked in localStorage `ppm_assistant.seen`). × hides for the session; "don't show again" is permanent; a "need a hand?" edge tab re-summons either way. Swappable avatar: Timmy the Tote (red AutoStore bin, default) or Robert the Robo-Arm — both inline SVG with blink/bob animations. All state in localStorage key `ppm_assistant`. |
| `project-lifecycle-exec.html` | **Executive working session deck** — 20 slides, engineering voice, keyboard nav. Built for a principal engineer presenting to leadership to "right the ship." Sections: DIAGNOSIS → FRAMEWORK → GOVERNANCE → ASK. Closes with 4 formal asks. |
| `project-lifecycle-slides.html` | **Team deck** — 27 slides, spoon-fed one idea per screen. For rolling out process to people who have never had formal process. |
| `project-lifecycle-pack.html` | **Dense reference doc** — full RACI, all gate checklists, all rules, all metrics. Single-page, dark theme. For people who want the whole picture. |

---

## Known To-Dos / Next Iterations

Cleared 2026-08-06: placeholder email replaced (all forms submit to `mike.vanbibber@elementlogic.net`), blocker enforcement added to the gate checklist, closeout/retro form built, swimlane diagram built, print CSS added to all forms, standalone RACI page built.

Remaining:
- [ ] **Real form backend** when moving off mailto: — user would like to host this eventually (SharePoint, Azure, etc.)
- [ ] **Branding** — currently no company logo or color scheme. User may want to customize.

## Hosting

Live on the user's portal LB at `https://vanbibber.elws.elementlogic.io/ppm/` — a **public** (no-login) static route on the portal gateway (`~/gateway` on his remote box; the rest of the portal is password-gated). To redeploy after changes: `cp ~/projects/ProperProjectManagement/*.html ~/deployments/ppm/` — no restart needed.

---

## Technical Notes

- All inter-file links use **relative paths** (e.g., `href="form-project-intake.html"`) — do not change to absolute paths
- Forms use `window.location.href = 'mailto:...'` for submission — works in any email client
- Doc IDs are generated client-side with `Math.random()` — display only, not stored
- Gate checklist uses tab switching via `selectGate(n, el)` JS function
- CSS uses `:has()` selector for checkbox/radio styling — requires Chrome 105+, Firefox 121+, Safari 15.4+
- `window.open()` on `file://` URLs is blocked by browsers — all navigation uses `<a href>` tags

---

## How To Continue Working With Him

1. **Ask before building** — he will tell you what's wrong with something directly. Don't over-explain or over-design.
2. **Engineering voice, not consultant voice** — avoid buzzwords, avoid fluff, avoid "synergy."
3. **Show, don't tell** — build the thing and open it. He will react and iterate.
4. **He iterates fast** — be ready to make targeted edits, not rebuilds.
5. **He knows the org better than you** — if he says a role doesn't work the way you modeled it, trust him and adjust.
