# Main-Domain Production Polish & Packaging Plan
Plan version: 1
Status: APPROVED
Target: Attaie V2 production-ready manual release package for `https://attaieproperties.com` (verified locally/staging only; no live V1 modification)

## User objective and scope
Finalize UI/UX polishing, EN/FA parity in staff workspaces, removal of bundled demo project fallbacks, CEO staff-provisioning verification, and production build/packaging for `https://attaieproperties.com`:
- Keep **Website Admin** (`/admin/`) and **CEO** (`/ceo/`) strictly separated.
- Support all **12 active staff roles** across the **8 canonical staff entry URLs** (`/ceo/`, `/management/`, `/sales-leader/`, `/sales/`, `/callcenter/`, `/finance/`, `/marketing/`, `/engineering/`).
- Provision the first **CEO** (`ceo@attaieproperties.com`, Firebase UID `AyAy8pvBKMb7Uqj6NFBE03Opw5W2`) in `core_users` (private manual SQL/setup artifact; no passwords in SQL/commits) and ensure `/ceo/` supports adding employees (email, Firebase UID, role, required branch for non-CEO roles).
- Remove the 5 bundled `SIGNATURE_PROJECTS` demo project fallbacks so the public site renders live database records or a clean empty state.
- Complete the 6 UI polish integrations from `plans/v2-final-polishing-plan.md` and EN/FA translations in `apps/staff/`. Keep `admin-panel/` (`/admin/`) English-only for this release.
- Preserve existing uncommitted workspace changes.

## Current codebase evidence (exact paths)
- Public SPA: `src/App.tsx`, `src/components/sections/LandingPageContent.tsx`, `src/lib/signatureProjects.ts`, `src/components/ui/table.tsx`, `src/components/ui/dashboard-alabaster-split-rail.tsx`.
- Website Admin CRM: `admin-panel/src/App.tsx`, `admin-panel/src/pages/{Properties,Projects,Leads,Visits,PublishingTasks,...}.tsx`, `public/api/admin-login.php`, `public/api/bootstrap.php`.
- Staff Workspaces & Backend: `apps/staff/src/main.tsx`, `apps/staff/src/auth/firebase.mjs`, `packages/staff-contracts/role-preference.mjs`, `staff-service/src/App.php`, `staff-service/src/FirebaseAuth.php`, `staff-service/database/{001-core.sql,110-ceo-manager-branch-model.sql}`.
- Existing baseline specs: `docs/superpowers/specs/2026-11-16-main-domain-production-design.md`, `plans/v2-final-polishing-plan.md`.

## Roles and explicit permission matrix
- **Website Admin** (`/admin/`): Session + CSRF auth (`admin_users` / `ADMIN_FIREBASE_*`); manages public listings, projects, inquiries, chat, visits, SEO, and publication review. No internal CRM access.
- **12 Active Staff Roles** (Firebase UID ↔ `core_users` via `staff-service`):
  - `ceo` (`/ceo/`, `branch_id = NULL`): Global oversight, `core.staff.manage`, `core.departments.manage`, `core.tasks.assign`, `inventory.manage`, `finance.read`, `engineering.deliverables.review`.
  - `manager` (`/management/`, branch-scoped): Branch management, HR contracts, Pre-Sale inventory, duplicate review.
  - `sales_leader` (`/sales-leader/`, branch-scoped): Team leads, SLAs, advisor assignments.
  - `sales` (`/sales/`, branch-scoped): Personal CRM leads, site visits, deal closing.
  - `callcenter` (`/callcenter/`, branch-scoped): Follow-ups, incoming inquiries, 24-hr scheduling.
  - `finance_manager` (`/finance/`, branch-scoped): HR contract installment verification, customer deposits.
  - `marketing_manager`, `videographer`, `editor` (`/marketing/`, branch-scoped): Filming schedules, editing, social submissions.
  - `architect`, `graphic_designer`, `visual_designer_3d` (`/engineering/`, branch-scoped): 2D blueprints, print collateral, 3D renders.
- **Retired/Blocked**: `admin`, `hr_manager`, `branch_manager`, `assistant_manager`, `production_manager`, `photographer`, `customer`, `finance_assistant`.

## Screens, UX journeys and accessibility
- **Public site**: Empty/live-only project catalog (no `SIGNATURE_PROJECTS` demo fallback), Before/After floor plan comparison, Pricing/Payment plan cards.
- **Admin CRM (`/admin/`)**: Standardized Shadcn `table` + `dialog`, `DateRangePicker`, `LiquidProgress` upload bar, `FullscreenCalendar` integration.
- **CEO Dashboard (`/ceo/`)**: Staff provisioning form (`name`, `email`, `firebaseUid`, `role` from 12 canonical active roles, required `branchId` for non-CEO roles), Alabaster Split-Rail layout, EN/FA + RTL support.
- Preserve keyboard focus rings, `aria-label`s, and `prefers-reduced-motion`.

## Existing UI components/tokens to reuse
- `shared/alabaster-dashboard.css` & `src/components/ui/dashboard-alabaster-split-rail.tsx` (`#F7F8FA` canvas, `#FFFFFF` cards, `#0F172A` primary CTA/rail, `#0145F2` brand blue, `#E2E8F0` hairlines, `tabular-nums`).
- `src/components/ui/Button.tsx` (`cn()`), `src/components/ui/table.tsx`.

## React components and file ownership
- **Public & UI polish**: `src/components/sections/LandingPageContent.tsx`, `src/lib/signatureProjects.ts`, `src/components/property/*`, `src/components/ui/*`.
- **Admin CRM polish**: `admin-panel/src/pages/*`, `admin-panel/src/components/*`.
- **Staff & CEO dashboard**: `apps/staff/src/main.tsx`, `apps/staff/src/i18n/*` (EN/FA headings, pillar labels, Manager duplicate modal, CEO employee creation form validation).
- **PHP/SQL**: `staff-service/src/App.php` (verify branch requirement on non-CEO `POST /staff-api/v1/staff`), private CEO provisioning SQL template in release docs.

## PHP endpoint contracts and error handling
- Verify `POST /staff-api/v1/staff` validates the 12 canonical roles, valid email + Firebase UID, and branch assignment for non-CEO roles, returning structured JSON errors (`400`/`403`/`409`) without leaking stack traces.
- Keep `public/api/admin-login.php` and `require_admin()` CSRF checks intact.

## Database changes, migration and rollback
- No destructive schema resets. Use existing 3-database architecture (`01-website.sql`, `fresh/02-internal-crm.sql`, `fresh/03-submissions.sql` + additive migrations `090`–`110`).
- Provide idempotent `INSERT ... ON DUPLICATE KEY UPDATE` (or `INSERT IGNORE` + check) SQL in the private release instructions to map `ceo@attaieproperties.com` (`AyAy8pvBKMb7Uqj6NFBE03Opw5W2`) as `ceo` (`branch_id = NULL`, `active = 1`).

## Firebase authentication and MySQL UID mapping
- Staff login via `apps/staff/src/auth/firebase.mjs` → `POST /staff-api/v1/auth/login` → `Staff\FirebaseAuth` verifies JWT against Google public certs → `core_users.firebase_uid` lookup.
- First CEO (`ceo@attaieproperties.com` / `AyAy8pvBKMb7Uqj6NFBE03Opw5W2`) is provisioned in Firebase Auth by the owner and mapped in V2 MySQL `core_users`.

## English/Dari/RTL and responsive behavior
- Translate hardcoded headings, `pillarDefinitions`, and Manager duplicate modal in `apps/staff/src/main.tsx` to EN/FA with RTL parity.
- Keep `admin-panel/` (`/admin/`) English-only for this release.
- Verify responsive layouts across `375px`, `768px`, `1024px`, and `1440px`.

## Subagent dependency graph and ownership boundaries
1. **Track A (Public & Admin UI Polish)**: `src/` demo removal + UI components, `admin-panel/` Shadcn table/dialog & 21st.dev integrations.
2. **Track B (Staff/CEO EN/FA + Employee Provisioning)**: `apps/staff/` i18n + CEO employee creation branch/role validation + `staff-service/` check.
3. **Track C (Build, QA & Packaging)**: `npm run build`, `admin-panel` `web:build`, `apps/staff` build, `node scripts/package-dashboard-completion.mjs`, and verification checks.

## Acceptance tests and commands
- Root: `npm run build` (`tsc --noEmit && vite build`), `npm run lint`
- Admin panel: `cd admin-panel && npm run typecheck && npm run web:build`
- Staff apps: `apps/staff` build + typecheck
- Packaging: `node scripts/package-dashboard-completion.mjs releases/manual-staging-dashboard-completion-<timestamp>`

## Risks and excluded work
- Excluded: Stitch MCP screen generation (not connected), `admin-panel/` Dari translation, live V1 database/webroot modification, or Electron/Android installer releases.
- Risk: Existing uncommitted files in `public/{ceo,engineering,finance,marketing,sales-leader,sales}/` will be regenerated cleanly on build.

## Manual V2 staging deliverables
- `UPLOAD-WEBSITE-CONTENTS.zip` (for `public_html` / document root, including `.htaccess`)
- `UPLOAD-PRIVATE-OUTSIDE-WEBROOT.zip` (for `staff-service/`, configs, outside webroot)
- Private CEO `core_users` provisioning SQL for `ceo@attaieproperties.com` (`AyAy8pvBKMb7Uqj6NFBE03Opw5W2`) + cPanel/phpMyAdmin cutover checklist.

Approval requested: Approve this plan version before any implementation.
