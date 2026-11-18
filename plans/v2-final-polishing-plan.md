# Attaie Properties V2 — Final Implementation & Deployment Master Plan

**Target Domain:** `attaieproperties.com` (Staging / Testing: `website.attaieproperties.com`)  
**Design System:** Alabaster Architectural Split-Rail (`#F7F8FA` canvas, `#FFFFFF` cards, `#0F172A` primary CTA/rail, `#0145F2` brand gold/blue, `#E2E8F0` hairlines, `tabular-nums`)

---

## 1. Executive Summary & Objectives
This master plan integrates all 21st.dev UI polish components, standardizes data tables with Shadcn primitives, configures the multi-database MySQL architecture, establishes Firebase CEO/Manager & Website Admin authentication, and prepares the manual cPanel deployment package for **`attaieproperties.com`**.

---

## 2. UI Components & 21st.dev Integrations
All components adhere to the Alabaster Architectural Split-Rail design system, Tailwind v4, TypeScript strict mode, and EN/FA bilingual (RTL) support:

1. **Date Range Picker** (`@kuratlielia/components/date-range-picker`)
   - *Usage*: Advanced filtering across Properties, Leads, and Staff Analytics views.
2. **Liquid Progress Uploading Bar** (`@animbits/components/loaders-liquid-progress`)
   - *Usage*: Fluid visual feedback during media (photos/videos/floor plans) and document uploads in the Admin CRM and Staff Portal.
3. **Pricing & Payment Plan Cards** (`@uilayout.contact/components/pricing`)
   - *Usage*: Property and project payment schedules, re-themed to Alabaster and brand blue/navy instead of default orange.
4. **Before/After Floor Plan Comparison** (`@ibrandify/components/before-after-comparison`)
   - *Usage*: Interactive technical blueprint vs. 3D furnished floor plan changer in Property Detail and Masterplan Viewer.
5. **Fullscreen Calendar** (`@ahmedmayara/components/fullscreen-calendar`)
   - *Usage*: Appointment scheduling, property viewings, and CRM lead follow-up timelines in staff and admin dashboards.
6. **Shadcn Table with Dialog** (`table-with-dialog.tsx` + `button`, `checkbox`, `table`, `badge`, `dialog` primitives)
   - *Usage*: Standardized data tables featuring fixed headers, row selection, status badges, and detail modal dialogs across all admin and staff modules.

---

## 3. Database Architecture (MySQL)
Three isolated MySQL databases to prevent cross-contamination:
- **Website Database**: Properties, projects, leads, website admin (`01-website.sql`, `102-website-submission-map.sql`).
- **Internal CRM Database**: Staff dashboards, inventory, HR, finance, sales, roles (`fresh/02-internal-crm.sql`, migrations `090`–`100`).
- **Submissions Database**: Publication revisions and assets (`fresh/03-submissions.sql`, `101-submission-assets.sql`).

---

## 4. Authentication & Security
- **Staff Authentication**: Firebase Authentication (Email/Password). Mapped exact Firebase UIDs to MySQL roles in `core_users` (`ceo`, `manager`, `sales`, `callcenter`, etc.).
- **Website Admin**: Session-based authentication backed by `admin_users` table with secure password hashing (`password_hash`).
- **CORS & Rate Limiting**: Strict allowlists for click-to-call and lead submission endpoints.

---

## 5. Deployment Workflow (`attaieproperties.com`)
1. **Build & Package**:
   - Run `node scripts/package-dashboard-completion.mjs releases/manual-staging-dashboard-completion-<timestamp>` to generate fresh `UPLOAD-WEBSITE-CONTENTS.zip` and `UPLOAD-PRIVATE-OUTSIDE-WEBROOT.zip`.
2. **cPanel & phpMyAdmin Setup**:
   - Create the three MySQL databases and user.
   - Import fresh SQL schemas or run additive upgrades.
   - Provision CEO/Manager in Firebase and map UIDs; generate website admin password hash.
3. **File Uploads**:
   - Upload website contents to public document root (`public_html` / `website.attaieproperties.com`).
   - Extract private application files outside the web root.
   - Verify `.htaccess`, hidden files, and permissions.

---

## 6. Verification & Acceptance Criteria
- Monorepo TypeScript type-check (`npm run build`) passes with zero errors.
- Responsive layout verification across 375px, 768px, 1024px, and 1440px.
- EN/FA localization and RTL direction switching operational.
- Hosted verification of Firebase sign-in, database mappings, and data table modals on `attaieproperties.com`.
