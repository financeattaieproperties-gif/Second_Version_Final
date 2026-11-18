---
name: roheen-development
description: Codex-first development orchestrator for Attaie Properties V2. Route quick component edits, scoped features, and full dashboard work to the minimum appropriate agents; require approval for material changes and protect Firebase/MySQL auth and V2 boundaries.
---
# Roheen Development — Codex CLI

## Start every task
1. Read repository `AGENTS.md`, check `git status`, and inspect the exact affected files and tests. Never overwrite unrelated changes.
2. Inspect current code before trusting historical plans. For staff panels, check `apps/staff/`, `packages/staff-contracts/`, `staff-service/`, `public/api/`, relevant migrations, `docs/staff/departments-and-roles.md`, and `docs/staff/current-implementation.md` as applicable.
3. Classify the request by **actual risk**, not number of words: QUICK, FEATURE, or FULL. Tell the user the mode and scope. Follow existing design, React/TypeScript conventions, PHP API patterns, i18n, RTL and mobile behavior.

## Smart router
**QUICK**: isolated presentational or non-destructive component edits (copy, color, spacing, hide/remove visual-only card, icon, layout tweak). Use one agent / main Codex agent; no formal plan approval. Make the smallest diff, run focused validation, summarize. If deleting a component, inspect imports, references and dependencies first; do not delete underlying data or APIs unless separately authorized.

**FEATURE**: a scoped feature touching multiple layers or behavior (filter, form, existing API widget, navigation permissions). Write a concise plan with files, API/auth effects and tests. Ask approval before modifying contracts, permissions, authentication, schema, or destructive behavior. Delegate independent work only when useful; otherwise use one agent.

**FULL**: new department dashboard, broad workflow, new data model, major refactor. Write `plans/panels/<slug>/PLAN.md` using `templates/PLAN.md`, then **STOP** and obtain explicit approval of that version. No implementation or implementation subagents before approval. After approval, delegate specialist agents following `agents/ROLES.md` and the approved dependency graph. If delegation is unavailable, do work sequentially and state that explicitly.

Escalate QUICK -> FEATURE or FEATURE -> FULL whenever discovery shows greater risk; do not silently expand scope. Reapprove material plan changes. Never run parallel agents editing the same files. Assign clear file ownership and integrate reviewed diffs.

## Agent roles and dependencies
- Architect/contracts: identify existing contracts, data flows and authorization boundaries before other changes.
- UX: workflows, interaction states, accessibility, RTL/mobile.
- UI/React: existing components and design tokens, frontend tests.
- PHP API: validated inputs, auth, authorization, consistent errors and existing patterns.
- MySQL: additive migrations and rollback, no unapproved destructive SQL.
- Firebase/auth: token validation and exact Firebase UID ↔ MySQL staff mapping; no new UID workaround.
- Integration: routes, API clients, localization, loading/empty/error states.
- QA/security: focused tests, build, role checks, regression, diff review.
Spawn only roles required by the approved task. A small frontend change must not spawn PHP/DB/auth agents without cause.

## Safety boundaries
- V2 development only. Never modify V1, its database, or production deployment as a side effect.
- Do not assume staff permissions from job titles; verify current role registry. Finance Assistant role was removed in the referenced V2 design.
- Keep secrets and real staff/customer data out of commits, logs and test fixtures.
- Preserve EN/FA translations, RTL and responsive UX where applicable.
- Never deploy, import SQL or alter Firebase project settings without separate explicit authorization.
- Report actual verification outcomes, not imagined tests or deployment status.

## Progress reporting
When using `bin/roheen-monitor.mjs`, it reads Codex `exec --json` events and displays observed progress. Do not claim it provides reliable per-agent percentages: Codex event schemas and subagent visibility vary by version. For long tasks, emit clear task milestones in agent messages; the monitor displays observed activity, not fabricated percentages. Never expose secrets in log output.

## Finish
Summarize mode, changed files, agent assignments if any, test commands and results, unresolved risks and whether deployment was performed (default: no).
