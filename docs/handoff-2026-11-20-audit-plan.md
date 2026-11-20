# V2 Full Audit & Implementation Plan (2026-11-20)

This plan consolidates the three codebase audits conducted on 2026-11-20 across:
1. **Department / Agent / User / Branch Relations** (`staff-service/src/` vs MySQL schemas & `GLOSSARY.md`)
2. **UX / UI & Frontend Contracts** (`apps/staff/src/`, `admin-panel/src/`, `src/`)
3. **Public PHP Endpoints & MySQL Schemas** (`public/api/` vs `public/api/schema.sql` & `deployment/v2/complete-v2-mysql-schema.sql`)

---

## Completed in Session (Ready to Deploy / Commit)

- **PHP 8.3.36 CLI installed locally** via `winget` (`PHP.PHP.8.3`) for local `php -l` syntax checks.
- **`staff-service/src/App.php`** (verified with `php -l`):
  - Fixed `createTask()` missing `NOT NULL` `branch_id` on `INSERT INTO core_management_tasks`.
  - Updated `activeUser()` to select `branch_id`.
  - Added `isGlobalRole()`, `userBranchId()`, `requireUserBranchId()`.
  - Scoped `manager` (non-`ceo`) to their own `branch_id` in `workspace()`, `lead()`, and `assignees`.
  - Enforced same-branch validation in `eligible()` (lead handoffs) and `createStaff()` (`teamLeaderId`).
  - Allowed `ceo` to deactivate/reactivate `manager` accounts in `setStaffActive()`.
- **`staff-service/src/Completion.php`** (verified with `php -l`):
  - Fixed `marketingCreate()` missing `branch_id` and added `ceo` `branchId` support.
  - Fixed `flushSubmissionOutbox()` & `marketingDto()` missing `origin_branch_id` / `branchId` for `sub_posts`.
  - Allowed `ceo` to access `?view=contracts`.
  - Scoped `manager` to their own `branch_id` in `moduleWorkspace()`, `issueAgreement()`, `amendAgreement()`, `prepareProject()`, and `customerReview()`.
  - Enforced same-branch validation for `assignedTeamLeaderId` and `assignedSalesAgentIds` in `saveInventory()`.
  - Made `version` check in `customerReview()` conditional when `version` is provided.
- **`deployment/v2/complete-v2-mysql-schema.sql`**:
  - Added `crm_customer_owners`, `crm_customer_shared_access`, `crm_lead_referrals`.
  - Added `website_inquiry_events`, `seo_keywords`, `leads` inquiry-receipt/followup columns, and `project_units.gallery_images` / `video_url`.
- **`public/api/schema.sql`**:
  - Added `website_submission_publications`.

---

## Remaining Implementation Plan (Next Session)

### Phase 1 — Backend & Staff API Polish (`staff-service/` & `apps/staff/src/`)

- [ ] **1.1 Overview view for `ceo` & `manager` (`staff-service/src/App.php:177`)**
  - Currently `?view=overview` routes `ceo`/`manager` to `workspace()` (CRM-only), omitting `projects`, `hrContracts`, `financeDeposits`, `engineeringDeliverables`, `marketingEntries`, and `hrWorkItems` from `moduleWorkspace('overview')`.
  - Fix: Merge or include module summary data when `$this->isManager()` requests `?view=overview`.
- [ ] **1.2 `core_branch_managers` sync (`staff-service/src/App.php:322`)**
  - `createStaff()` inserts `manager` into `core_users`, but does not sync `core_branch_managers`.
  - Fix: Insert/update `core_branch_managers` when provisioning or reassigning a `manager`.
- [ ] **1.3 Clean up retired role references & `assignees` list**
  - Audit `App.php:211` and `Completion.php:9,32,39,43,73,101,339-340` for retired roles (`hr_manager`, `branch_manager`, `production_manager`, `photographer`) and ensure `04-seed-all-staff-users.sql` aligns `ceo` `branch_id` (`NULL` vs `1`) and `department_code`.
- [ ] **1.4 Pass `version` in `resolveCustomerReview` (`apps/staff/src/api.ts`, `main.tsx`, `preview.ts`)**
  - Update `resolveCustomerReview(reviewId, decision, version)` and include `version` in the `CustomerReviewRequest` DTO so optimistic locking is enforced end-to-end.

---

### Phase 2 — Public PHP Endpoints (`public/api/`)

- [ ] **2.1 Fix `ctc/callback.php` `reference_id` type coercion (`public/api/ctc/callback.php:28,38,46`)**
  - When falling back to `requestid` / `request_id` (string), query `WHERE etisalat_request_id = ?` instead of binding a string to `INT UNSIGNED reference_id`.
- [ ] **2.2 Fix transaction rollback leaks in `admin/submissions.php` (`public/api/admin/submissions.php:96-125`)**
  - Call `$sdb->rollback()` before every `json_out()` error exit inside the transaction.
- [ ] **2.3 Harden `submission-photo.php` (`public/api/submission-photo.php:9-12`)**
  - Call `cors()`, check `$db->connect_error`, set `utf8mb4` charset, and return 503 cleanly on DB failure.
- [ ] **2.4 Validate ENUMs & required fields on `admin/projects.php` & `admin/properties.php`**
  - Validate `name`, `location`, `status`, `type`, `listing_type` on both `POST` and `PUT` (return 400/422 instead of 500).
- [ ] **2.5 Sync `public/api/bootstrap.php` & `admin/project-units.php`**
  - Add missing `leads` columns and `project_units.gallery_images` / `video_url` to `bootstrap.php:195-227`.
  - Replace MariaDB-only `ADD COLUMN IF NOT EXISTS` in `admin/project-units.php:119` with an `INFORMATION_SCHEMA.COLUMNS` check compatible with MySQL 8.0.
- [ ] **2.6 Security hardening (`admin-login.php`, `initiate-call.php`, `ctc_auth.php`)**
  - Remove plaintext password fallback in `public/api/admin-login.php:97` once all `admin_users` rows use `password_hash()`.
  - Use `REMOTE_ADDR` (not spoofable `HTTP_X_FORWARDED_FOR`) in `initiate-call.php:46-49` and enable TLS peer verification in `initiate-call.php:163-164` & `ctc_auth.php:73-74` (after confirming server CA bundle).

---

### Phase 3 — Admin CRM & Staff UX/UI Fixes (`admin-panel/src/`, `apps/staff/src/`)

- [ ] **3.1 Wire up "Save Settings" in `admin-panel/src/pages/SettingsPage.tsx`**
  - Persist `apiUrl` using `setAdminServerUrl()` from `admin-panel/src/api.ts:16` instead of a no-op state toggle.
- [ ] **3.2 Add real error handling in `admin-panel/src/pages/Properties.tsx` & `Projects.tsx`**
  - Surface error banners on `getProperties()`, `getProjects()`, `remove()`, and `cycleStatus()` failures instead of swallowing errors into empty states.
- [ ] **3.3 Align `admin-panel/src/pages/Login.tsx` with Option 2 Alabaster**
  - Replace legacy dark navy glassmorphism (`#0A1F5C` / `#020E3A` / `#0145F2`) with Option 2 Alabaster (`#F7F8FA` canvas, `#FFFFFF` card, `#0F172A` primary CTA).
- [ ] **3.4 Remove emojis & legacy class names**
  - Replace `📷` in `admin-panel/src/pages/ProjectForm.tsx:483,560` and `💡` in `admin-panel/src/components/ApartmentGalleryReorder.tsx:467` with Lucide icons.
  - Rename `avatar gold` in `apps/staff/src/main.tsx:1281,1462,1635,2543` to Alabaster-neutral naming.
  - Add `aria-label` to icon-only dismiss buttons in `Projects.tsx:136-142`, `Leads.tsx:593`, `Visits.tsx:218`, and `ApartmentGalleryReorder.tsx:410`.
- [ ] **3.5 Disable/hide non-functional Google Sign-In & Reset Password in `apps/staff/src/main.tsx`**
  - Hide or disable buttons that call `loginWithGoogle()` / `resetPassword()` (which unconditionally throw).

---

### Phase 4 — Bilingual (EN/FA) & RTL (`dir="rtl"`) Fixes (`apps/staff/src/`, `src/`)

- [ ] **4.1 Translate `MarketingWorkspace.tsx` & `EngineeringWorkspace.tsx`**
  - Replace hardcoded English strings with `t()` calls and sync the 101 missing keys between `apps/staff/src/i18n/en.json` and `fa.json`.
- [ ] **4.2 Convert physical directional Tailwind classes to logical RTL-safe classes in `src/`**
  - `src/components/forms/QuickContactModal.tsx` (`left-3.5` → `start-3.5`, `pl-10 pr-4` → `ps-10 pe-4`)
  - `src/components/forms/SearchBar.tsx`
  - `src/components/layout/Navbar.tsx`
  - `src/components/map/AttaieGoogleMap.tsx`
  - `src/components/project/PaymentPlanComparisonCard.tsx`
  - `src/components/about/ContactSectionContent.tsx`

---

## Testing Checklist (For Live User & Workflow Testing)

As you test each user role and workflow, note any failures (HTTP status + Network response JSON + console error) so we can add them directly to this plan and fix them:
- [ ] `ceo` — Login, Create Project, Create/Deactivate Manager & Staff, View Contracts, Create Task, Marketing Entry
- [ ] `manager` — Branch-scoped Leads, Customers, Duplicate Review, Project Preparation, Issue/Amend Contract, Tasks
- [ ] `callcenter` — Manual Call, Draft Lead, Submit/Handoff to `sales` (same branch)
- [ ] `sales` / `sales_leader` — Claim Customer, Create Sales Lead, Refer Lead, Close Deal Handoff
- [ ] `marketing_manager` / `videographer` / `editor` — Submit Property, Schedule/Complete Filming, Schedule Editing, Mark Posted (5 photos → `sub_posts`)
- [ ] `finance_manager` — Draft & Confirm Deposit against Issued/Amended Contract
- [ ] `architect` / `graphic_designer` / `visual_designer_3d` — Upload Engineering Deliverable Version
- [ ] Public Website + Admin CRM (`/admin`) — Inquiry Form, Visit Request, Click-to-Call, Submissions Publish
