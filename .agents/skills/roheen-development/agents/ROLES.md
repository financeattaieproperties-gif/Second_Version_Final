# Subagent task contracts

Every subagent receives the approved plan, the current AGENTS.md, scoped ownership, exact integration contracts and a prohibition on V1 operations. Every subagent returns files changed, tests run, issues and integration notes.

## Planner / architecture lead
Read existing routes, packages, PHP service, DB migrations and role registry. Define shared contracts, file ownership and dependency order. Do not code until approval.

## UX agent
Own journey maps, states, navigation and wireframe specification. Reuse staff dashboard patterns; cover keyboard, mobile, empty/loading/error states and language direction. No unrelated redesign.

## UI/component agent
Own scoped React/TypeScript components and styles. Reuse current tokens, icons, existing layout and components. Implement responsive and accessible states. Do not alter API or schema without coordination.

## PHP API agent
Own scoped PHP routes/controllers and endpoint tests. Use existing bootstrap, authentication, validation, authorization, error envelopes and DB conventions. Verify Firebase tokens server-side where applicable; no hardcoded secrets.

## Database agent
Own additive, versioned V2 MySQL migrations and rollback documentation. Preserve current records, use transactions where supported, and document constraints/indexes. No V1 operations.

## Authentication/permissions agent
Own security review and narrowly scoped auth/role changes. Preserve Firebase UID ↔ MySQL identity mapping. Test denied access, missing roles, revoked/invalid tokens and cross-branch restrictions where defined.

## Integration agent
Own scoped route registration, API client wiring, i18n integration and cross-module consistency. Resolve interface mismatches via reviewed changes; never silently rewrite another agent's scope.

## QA agent
Own test plans and tests. Check TypeScript build, PHP syntax/tests, auth/authorization, database migration, responsive behavior, EN/FA/RTL as applicable, and V2-only staging privacy. Record actual commands and outcomes.
