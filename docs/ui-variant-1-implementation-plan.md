# UI Variant 1 — Complete Implementation Plan & Progress Tracker

> **Default Standard Notice:** **UI Variant 1 (Minimal Architectural Split-Rail — Logo Tri-Color Edition)** is the mandatory default UX/UI standard for all current and future Attaie Properties V2 dashboards across **Web**, **Android (`sales-android`)**, **iOS (`sales-ios`)**, and **PC Desktop (`admin-panel` Electron & `callcenter-desktop`)**.
>
> **Agent Rule:** Work **dashboard by dashboard**. After implementing and verifying (`tsc --noEmit` + build) each dashboard, mark its checkboxes `[x]` in this file with the date/notes.

---

## 1. Canonical Design System (Variant 1 Spec)

| Token / Element | Exact Value | Usage |
|---|---|---|
| **Logo Blue** | `#0072BC` (hover `#005E9B`, tint `#E6F2FA`) | Active rail/nav item, primary CTA buttons (`+ New Entry`, `Issue Contract`), primary chart series |
| **Logo Green** | `#14A850` (tint `#E8F7EE`) | Positive KPI delta pills, sparklines, secondary chart series, `Available` / `Closed` / `Approved` / `Sold` badges |
| **Logo Slate Gray** | `#818285` (tint `#F1F5F9`) | Muted labels, inactive icons, table headers, hairline borders (`#E2E8F0`), `Draft` / `Pending` / `Reserved` badges |
| **Canvas & Surface** | `#F8FAFC` canvas, `#FFFFFF` cards/drawers, `#FBFBFD` 64px rail, `#1E293B` ink | Crisp flat light SaaS UI (zero dark mode, zero neon, zero gradients) |
| **Typography & Motion** | `DM Sans` + `tabular-nums`, `lucide-react` 1.5px icons, `motion/react` `layout` spring (`bounce: 0.15, visualDuration: 0.25`) | Respect `prefers-reduced-motion`; **no** logo entrance animation on sign-in |

### Core Component Blueprint (Every Dashboard Must Match)
1. **Shell:** Collapsible two-tier Split-Rail (`64px` icon rail + `224px` contextual drawer) + top search header + breadcrumb bar.
2. **Overview:** 4 KPI cards with inline SVG sparklines + `#14A850`/`#818285` delta pills, dual-tone (`#0072BC` & `#14A850`) Area/Bar chart, and Channel/Status Donut chart.
3. **Data Tables:** Hairline table (`#E2E8F0` borders, `#818285` uppercase headers), filter pills, search input, tri-color status badges, and pagination.
4. **Split-View Workflows:** Queue list on the left + document/verification checklist & `#0072BC` primary action drawer on the right.

---

## 2. Phase 0 — Shared Foundation & Login (Completed)

- [x] **Updated Company Logo:** Extracted `Logo.png` from `Logo.rar` into `public/login-logo.png` and `public/logo.png` (`2026-11-20`).
- [x] **Removed Sign-In Logo Animation:** Removed `AttaieLogoEntrance` / `playingEntrance` from `apps/staff/src/main.tsx` (`2026-11-20`).
- [x] **Shared CSS Tokens:** Updated `shared/alabaster-dashboard.css` and `apps/staff/src/styles.css` root/rail/nav/mobile-tab tokens to `#0072BC`, `#14A850`, `#818285` (`2026-11-20`).
- [x] **Admin & Staff Login Pages:** Updated `admin-panel/src/pages/Login.tsx` and `apps/staff/src/main.tsx` (`Login`) to Variant 1 light card with updated `/login-logo.png` (`2026-11-20`).
- [x] **Admin Shell Layout:** Updated `admin-panel/src/components/Layout.tsx` split-rail active/muted tokens to `#0072BC` / `#E6F2FA` / `#818285` (`2026-11-20`).

---

## 3. Dashboard-by-Dashboard Implementation Checklist

### Dashboard 1: Admin CRM (`admin-panel/` — Web `/admin` & Electron PC)
- [x] **Overview (`Dashboard` / Analytics):** 4 KPI cards with inline sparklines + `#14A850` delta pills, dual-tone `#0072BC`/`#14A850` Area Chart, Channel Breakdown Donut Chart (`2026-11-20`, `admin-panel/src/pages/Overview.tsx`).
- [x] **Tables (`Properties`, `Projects`, `Leads`, `Visits`, `Submissions`, `Careers`):** Hairline table styling, filter pills, search bar, tri-color status badges, and pagination (`2026-11-20`, `admin-panel/src/components/variant1.tsx` + all 6 pages).
- [x] **Split-View / Forms (`PropertyForm`, `ProjectForm`, `Chat`):** Unified Variant 1 card borders, `#0072BC` primary CTAs, `#818285` muted labels (`2026-11-20`).
- [x] **Verification:** `npm run build:admin` + Electron PC (`cd admin-panel && npm run build`) pass (`2026-11-20`).

### Dashboard 2: Call Center (`/callcenter` & `callcenter-desktop` PC)
- [ ] **Overview:** 4 KPI cards (`Drafts Needs Details`, `Active Leads`, `Handoffs to Sales`, `Duplicate Conflicts`) with sparklines + Hourly/Weekly Intake vs. Handoff Bar Chart.
- [ ] **Leads Table:** Hairline table with `Serial`, `Customer`, `Phone`, `Project`, `Stage (L/F/V)`, `SLA`, and `Complete Entry` action.
- [ ] **Entry & Dedup Drawer:** Slide-over `EntryForm` with `#0072BC` CTA and amber duplicate-review alert banner.
- [ ] **Verification:** `npm run build:staff` + `callcenter-desktop` check pass.

### Dashboard 3: Sales Agent Web & Mobile (`apps/staff` `/sales`, `sales-android`, `sales-ios`)
- [ ] **Web Overview & Mobile Overview Tab:** 4 KPI cards (`My Active`, `Due Today`, `Overtime`, `Closed Month`) with sparklines + 24h SLA Compliance Ring/Bar.
- [ ] **Leads & Follow-ups Views:** Hairline desktop table + `SalesMobileCards.tsx` with `#0072BC` Call button, `#14A850` WhatsApp/Closed pills, `#818285` metadata, and filter chips.
- [ ] **Feedback & Close Deal Modal:** 4-way selector (`Follow up`, `Visit`, `Deal Closed`, `Deal Lost`), Buyer Photo + Tazkira upload cards, and `#0072BC` Close Deal CTA.
- [ ] **Android & iOS Sync:** Rebuild `sales-android` (`npm run build:sales-android`) and verify `sales-ios` web bundle sync.

### Dashboard 4: Sales Leader (`/sales-leader`)
- [ ] **KPI Row:** 4 KPI cards (`Team Active Leads`, `Visit-to-Close %`, `24h SLA Compliance %`, `Closed Volume`) with sparklines.
- [ ] **Charts:** Update `LeadConversionFunnelChart.tsx` (`#0072BC` → `#14A850`) and `AgentConversionChart.tsx` (`#818285` vs `#14A850`) to Variant 1 palette.
- [ ] **Team Table:** Hairline agent performance table with filter pills & pagination.
- [ ] **Verification:** `npm run build:staff` passes.

### Dashboard 5: Branch Management & HR Contracts (`/management`)
- [ ] **Overview & Duplicate Reviews:** 4 KPI cards (`Pending Contracts`, `Units Deal Closed`, `Units Sold`, `Duplicate Reviews`) + Inventory Stacked Bar Chart.
- [ ] **HR Contracts Split-View (`HrContractsWorkspace.tsx`):** Left queue of `pending_contract` handoffs + Right verification drawer (Buyer Photo, Tazkira, Sellers, Company, Boundaries) with `#0072BC` **Issue Contract** CTA.
- [ ] **Verification:** `npm run build:staff` passes.

### Dashboard 6: Finance (`/finance`)
- [ ] **Overview (`FinanceWorkspace.tsx`):** 4 KPI cards (`Issued Contracts`, `Collected Deposits`, `Pending Approvals`, `Overdue`) with sparklines + Monthly Cashflow Area Chart (`#0072BC` / `#14A850`).
- [ ] **Deposit Ledger Table:** Hairline table with `Record`, `Approve` (`#14A850`), and `Reverse` actions.
- [ ] **Verification:** `npm run build:staff` passes.

### Dashboard 7: Marketing (`/marketing`)
- [ ] **Overview & KPIs (`MarketingWorkspace.tsx`):** 4 KPI cards (`Submitted`, `Filming Scheduled`, `Editing Scheduled`, `Posted & Synced`) + Channel Donut.
- [ ] **Pipeline & 5-Photo Drawer:** Clean stage columns/table + Mark Posted drawer (`Facebook | YouTube | Instagram`, 5-photo grid, `#0072BC` sync CTA).
- [ ] **Verification:** `npm run build:staff` passes.

### Dashboard 8: Engineering (`/engineering`)
- [ ] **Overview & KPIs (`EngineeringWorkspace.tsx`):** 4 KPI cards (`Assigned`, `Pending CEO Review`, `Approved`, `Revision Requested`) with sparklines.
- [ ] **Deliverables Table & Version Drawer:** Hairline table + right-side version history (`v1`, `v2`, `v3`) with `#14A850` Approve and `#818285`/`#BC3D46` Revision controls.
- [ ] **Verification:** `npm run build:staff` passes.

### Dashboard 9: CEO (`/ceo`)
- [ ] **Executive Overview:** Cross-branch 4 KPI cards + dual-tone Revenue/Pipeline Area Chart + `ProjectOccupancyChart.tsx` (`#14A850` Available, `#0072BC` Sold/Closed, `#818285` Reserved).
- [ ] **Inventory & Assignments:** `ProjectInventoryWizard.tsx` + Engineering/Sales assignment tables styled in Variant 1.
- [ ] **Verification:** `npm run build:staff` passes.

---

## 4. Final Cross-Platform Release Verification

- [ ] `npm run build:admin` (Web `/admin`)
- [ ] `npm run build:staff` (Web `/callcenter`, `/sales`, `/sales-leader`, `/management`, `/finance`, `/marketing`, `/engineering`, `/ceo` + `sales-android`)
- [ ] `cd admin-panel && npm run build` (Admin Electron PC)
- [ ] `callcenter-desktop` & `sales-ios` wrapper verification
