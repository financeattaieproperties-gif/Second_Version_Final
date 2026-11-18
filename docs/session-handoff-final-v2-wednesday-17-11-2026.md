# Session Handoff: Final Version 2 - Wednsday - 17 -11 -2026 - By Roheen Ahmadi

**Session Title**: `Final Version 2 - Wednsday - 17 -11 -2026 - By Roheen Ahmadi`  
**Author**: Roheen Ahmadi (`financeattaieproperties@gmail.com`)  
**Date**: Wednesday, November 17 / 18, 2026  
**Repository**: `https://github.com/financeattaieproperties-gif/v2-dvelopment-.git`  
**Branch**: `main`  
**Primary Target Domain**: `https://attaieproperties.com` (and `https://www.attaieproperties.com`)  

---

## 1. Executive Summary & Session Objectives Completed

This session successfully finalized all operational, deployment, and documentation requirements for the **Attaie Properties Version 2 Production Launch**. Every aspect of the public website, internal staff workspaces, database schemas, mobile applications (Android Studio & iOS Xcode), and desktop applications (Call Center & Admin CRM) has been synthesized into authoritative master plans, fully implemented in source code, committed, tagged, and pushed to the remote repository.

---

## 2. Core Master Documentation Deliverables

### A. Authoritative Production Deployment Plan
- **File**: [`ATTAIE_V2_PRODUCTION_DEPLOYMENT_PLAN.md`](../ATTAIE_V2_PRODUCTION_DEPLOYMENT_PLAN.md)
- **Scope**: Comprehensive 9-section blueprint detailing:
  1. MySQL 3-database creation and privilege assignments via cPanel.
  2. PHP backend configuration and `.htaccess` routing rules.
  3. Public website and Admin CRM static builds deployment.
  4. Production staff workspaces (`/ceo`, `/sales`, `/callcenter`, `/finance`, etc.).
  5. Complete 11-member staff provisioning with Firebase UIDs.
  6. Android Studio APK/AAB build steps (`sales-android/`).
  7. iOS IPA compilation via Xcode and GitHub Actions (`.github/workflows/build-ios.yml`).
  8. Call Center and Admin Desktop PC executables (`callcenter-desktop/`, `admin-panel/`).
  9. Pre-launch security auditing, domain whitelisting, and validation checklists.

### B. End-to-End CRM Workflow & CEO Multi-Branch Governance Guide
- **File**: [`ATTAIE_V2_CRM_WORKFLOW_AND_CEO_MANAGEMENT_MASTER_GUIDE.md`](../ATTAIE_V2_CRM_WORKFLOW_AND_CEO_MANAGEMENT_MASTER_GUIDE.md)
- **Scope**: Detailed walkthrough of:
  - Lead lifecycle: Public form / WhatsApp / Etisalat call $\to$ Call Center registration $\to$ Deduplication & Ownership locking $\to$ Sales triage $\to$ SLA follow-up tasks $\to$ Field visit $\to$ Deal handoff.
  - Contract Issuance: 4-step wizard generating the official **Two-Page A4 Bilingual Legal Contract** (English/Dari) with cryptographic QR verification.
  - Milestone Installment Plans and Finance deposit approval workflow (`fin_deposits`).
  - Cross-department operations: Marketing 6-stage video production (`mkt_production_entries`) and Engineering versioned CAD/3D deliverables (`eng_deliverables`).
  - CEO Executive Command: Multi-branch governance (`core_branches`, `core_branch_managers`), real-time conversion radar, dispute arbitration, and audit logs.

---

## 3. Database Architecture & Roster Provisioning

### A. The 3 Isolated Databases
1. **Website Database**:
   - Stores public properties, inquiry forms (`leads`), and SEO configurations.
   - Initialized via `public/api/schema.sql` + `staff-service/database/102-website-submission-map.sql`.
   - Canonical base URL set to `https://attaieproperties.com` with `robots_index = 1`.
2. **Internal Office CRM Database**:
   - Houses all internal operations: core users, branches, call center, sales CRM, inventory, HR contracts, finance ledger, marketing, and engineering.
   - Built sequentially from migrations `001-core.sql` through `110-ceo-manager-branch-model.sql`.
3. **Submissions Database**:
   - Air-gapped database for social media marketing assets and public property submissions (`055-submissions-db.sql` + `101-submission-assets.sql`).

### B. Complete Staff Seeding Script
- **File**: [`staff-service/database/04-seed-all-staff-users.sql`](../staff-service/database/04-seed-all-staff-users.sql)
- **Mapped Accounts (Firebase UID $\to$ MySQL)**:
  1. **CEO**: Faiz Mohammad Attaie (`AyAy8pvBKMb7Uqj6NFBE03Opw5W2`) — Global cross-branch oversight
  2. **Sales Leader**: Basir Wahidi (`TVQGvlQj0fd6N9MXozxSTqhL9Ka2`)
  3. **Sales Agent**: Emal Karimi (`NqAYxhprk2XKgQtqgjXLTwvpU5U2`)
  4. **Call Center Agent**: Atta Ullah (`yLz9soswvdQJSD8mJFQ5QCREID13`)
  5. **Finance Manager**: Said Azam Sadat (`Wuz5TNja9fUVMiOXy9ddC9CQYhI2`)
  6. **Marketing Manager**: Sameer Kakar (`EopYP3KgjgNQlJc5ZfZNxraCLpE2`)
  7. **Video Editor**: Samim Yousufi (`ezxgoUltXgcZ0qUcnQSYOqjl24e2`)
  8. **Videographer**: Ekram Malik (`JivvGtQfo7bRFPewBeHlTTy8uMY2`)
  9. **Architect**: Milad (`IYIRlNZj7bTMa8hQMCsxdUDIzm42`)
  10. **Graphic Designer**: Samim (`IvdT8F8pSCdTQortZFPNOlTrUl72`)
  11. **3D Visual Designer**: Shaheer Ahmadi (`5ysa1VlfyVTEPbxxam1McWze1Ki2`)

---

## 4. Mobile & Desktop Multi-Platform Status

| Platform | Source Directory | Tech Stack | Status |
|---|---|---|---|
| **Sales Android App** | `sales-android/` | Capacitor 7 + Android Studio (Java 17 / Gradle 8.11.1 / AGP 8.7.2) | Configured with server URL `https://attaieproperties.com`, adaptive launcher icons, offline cache, target SDK 34. |
| **Sales iOS App** | `sales-ios/` + `.github/workflows/build-ios.yml` | Capacitor 7 + CocoaPods + Xcode 15/16 | Automated GitHub Actions CI workflow configured for unsigned IPA and TestFlight builds. |
| **Call Center Desktop** | `callcenter-desktop/` | Electron + Vanilla JS | Standalone Windows NSIS executable with dynamic server URL configuration modal (`server-config.html`). |
| **Admin CRM Desktop** | `admin-panel/` | electron-vite + React 18 + TypeScript | Dual Electron desktop & browser build (`/admin`), frameless window with system tray and image uploader. |

---

## 5. Security & Production Boundary Enforcement

1. **Option 2 Alabaster Architectural Split-Rail Design Standard**:
   - Clean `#F7F8FA` canvas, hairline borders (`#E2E8F0`), `#0F172A` active navigation pillars. Zero emojis, zero thick left borders.
2. **Dual-Origin CORS Whitelist**:
   - `staff-service/src/App.php` explicitly allows both `https://attaieproperties.com` and `https://www.attaieproperties.com`, as well as mobile capacitor runtimes (`capacitor://localhost`, `http://localhost`).
3. **Empty Initial Project Catalog**:
   - `src/lib/signatureProjects.ts` adheres to owner mandate: `export const SIGNATURE_PROJECTS: Project[] = [];`. Production starts clean without bundled legacy sample projects.
4. **No Hardcoded Passwords**:
   - All staff authentication delegates to Firebase Authentication via Google Identity Toolkit. MySQL stores only verified UIDs, email identifiers, and authorization roles.

---

## 6. Git Synchronization & Release Tags

- **GitHub Remote**: `https://github.com/financeattaieproperties-gif/v2-dvelopment-.git`
- **Branch**: `main`
- **Latest Commit**: Included in `Final Version 2 - Wednsday - 17 -11 -2026 - By Roheen Ahmadi`
- **Release Tag**: `Final-Version-2-Wednsday-17-11-2026-By-Roheen-Ahmadi`
