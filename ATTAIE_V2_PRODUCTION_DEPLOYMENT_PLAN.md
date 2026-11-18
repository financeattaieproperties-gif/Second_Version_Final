# Attaie Properties Version 2 — Master Production Deployment Plan & System Architecture

> **Document Version**: 2.0.0 (Unified Production Master)  
> **Target Domain**: `https://attaieproperties.com` (with `https://www.attaieproperties.com`)  
> **Design Standard**: Option 2 Alabaster Architectural Split-Rail (`#F7F8FA` canvas, hairline borders, zero emojis)  
> **Backend Architecture**: Shared cPanel hosting with Isolated Private PHP backend + MySQL 8.0 + Firebase Authentication

---

## Table of Contents
1. [Core Principles & Architectural Boundaries](#1-core-principles--architectural-boundaries)
2. [Server Filesystem Layout](#2-server-filesystem-layout)
3. [Section 1: cPanel Database Creation & User Privileges](#section-1-cpanel-database-creation--user-privileges)
4. [Section 2: phpMyAdmin Schema & Staff Seed Import](#section-2-phpmyadmin-schema--staff-seed-import)
5. [Section 3: Uploading & Configuring the Private Backend](#section-3-uploading--configuring-the-private-backend)
6. [Section 4: Uploading the Public Website to `public_html`](#section-4-uploading-the-public-website-to-public_html)
7. [Section 5: Firebase Console Domain Authorization](#section-5-firebase-console-domain-authorization)
8. [Section 6: Sales Android Studio Build & Compilation](#section-6-sales-android-studio-build--compilation)
9. [Section 7: Sales iOS App Compilation (Xcode & Cloud CI)](#section-7-sales-ios-app-compilation-xcode--cloud-ci)
10. [Section 8: Call Center & Admin PC Apps (Installation & Building)](#section-8-call-center--admin-pc-apps-installation--building)
11. [Section 9: End-to-End Testing & Verification Checklist](#section-9-end-to-end-testing--verification-checklist)
12. [Complete User Roster & Workspace Routing Reference](#complete-user-roster--workspace-routing-reference)
13. [Disaster Recovery & Rollback Procedure](#disaster-recovery--rollback-procedure)

---

## 1. Core Principles & Architectural Boundaries

1. **V2 Production Domain**: The production target is strictly `https://attaieproperties.com` and its `www` alias.
2. **Three-Database Isolation Model**:
   - `Website DB`: Public properties, inquiries, and website-admin tables.
   - `Internal CRM DB`: Staff accounts, sales pipelines, call center queues, HR contracts, finance ledger, and audit events.
   - `Submissions DB`: Marketing publishing pipeline and staging assets.
3. **Zero Secrets in Public Webroot**: No database passwords, private keys, or session stores reside in `public_html/`. The webroot contains only compiled static bundles and thin pointer files (`paths.php`, `db.php`) referencing the private directory.
4. **Empty Initial Catalogs**: In accordance with V2 specifications, all mock projects and sample units have been removed. Production packages start with pristine, empty catalogs ready for live data entry.
5. **Firebase Identity Mapping**: Staff passwords are never stored in MySQL. Authentication is handled by Google Identity Toolkit / Firebase Auth; MySQL stores only the unique `firebase_uid`.

---

## 2. Server Filesystem Layout

```
/home/YOUR_CPANEL_USER/
├── attaie-v2-private/                       <-- [PRIVATE] Stored safely outside webroot
│   ├── app/                                <-- Core staff & CRM PHP logic (Completion, FirebaseAuth, etc.)
│   ├── sessions/                           <-- Secure session directory (chmod 0755)
│   ├── config.php                          <-- CRM database credentials & Firebase keys
│   └── website-db.php                      <-- Website database credentials & Etisalat CTC config
│
└── public_html/                            <-- [PUBLIC] Document Root
    ├── index.html                          <-- Public Website SPA (React 19 + Tailwind v4)
    ├── .htaccess                           <-- SPA fallbacks & deep-linking rewrite rules
    ├── .user.ini                           <-- PHP memory & upload configuration
    ├── api/
    │   └── db.php                          <-- Pointer to /home/.../website-db.php
    ├── staff-api/
    │   └── paths.php                       <-- Pointer to /home/.../config.php
    ├── admin/                              <-- In-browser Website Admin CMS
    └── (ceo, sales, callcenter...)         <-- Handled dynamically via .htaccess SPA rewrite
```

---

## SECTION 1: cPanel Database Creation & User Privileges

### Step 1.1: Determine Your cPanel Username
- Look at the top right of your cPanel dashboard.
- Note your username (for example: `attaiepr`).
- **Throughout all configuration files, replace `YOUR_CPANEL_USER` with this exact username.**

### Step 1.2: Create the 3 Databases in cPanel
1. In cPanel &rarr; search for **"MySQL Databases"** and open it.
2. Under **Create New Database**, create three separate databases:
   - Database 1: `YOUR_CPANEL_USER_attaie_website`
   - Database 2: `YOUR_CPANEL_USER_attaie_crm`
   - Database 3: `YOUR_CPANEL_USER_attaie_submissions`

### Step 1.3: Create Database User & Assign Permissions
1. Scroll down to **MySQL Users &rarr; Add New User**.
2. **Username**: enter `attaie_dbuser` (full username will be `YOUR_CPANEL_USER_attaie_dbuser`).
3. **Password**: Click **Password Generator**, copy the generated password, and save it in a secure note.
4. Click **Create User**.
5. Scroll down to **Add User To Database**:
   - User: `YOUR_CPANEL_USER_attaie_dbuser`
   - Database: `YOUR_CPANEL_USER_attaie_website`
   - Click **Add** &rarr; check **ALL PRIVILEGES** &rarr; click **Make Changes**.
6. Repeat step 5 to grant **ALL PRIVILEGES** on:
   - `YOUR_CPANEL_USER_attaie_crm`
   - `YOUR_CPANEL_USER_attaie_submissions`

---

## SECTION 2: phpMyAdmin Schema & Staff Seed Import

The prepared SQL files are located in:  
`releases/manual-production-dashboard-completion-20261118T094550Z/database/`

1. Open **phpMyAdmin** from cPanel.
2. **Website Database Import**:
   - Select `YOUR_CPANEL_USER_attaie_website` in the left tree.
   - Click the **Import** tab.
   - Choose file: `releases/.../database/fresh/01-website.sql` &rarr; click **Go**.
3. **Internal CRM Database Import**:
   - Select `YOUR_CPANEL_USER_attaie_crm` in the left tree.
   - Click the **Import** tab.
   - Choose file: `releases/.../database/fresh/02-internal-crm.sql` &rarr; click **Go**.
4. **Staff Roster Seeding (CEO + 10 Team Members)**:
   - Keep `YOUR_CPANEL_USER_attaie_crm` selected.
   - Click the **Import** tab.
   - Choose file: `releases/.../database/04-seed-all-staff-users.sql` &rarr; click **Go**.  
     *(This seeds Faiz Mohammad Attaie as CEO and all 10 departmental staff members with their verified Firebase UIDs).*
5. **Submissions Database Import**:
   - Select `YOUR_CPANEL_USER_attaie_submissions` in the left tree.
   - Click the **Import** tab.
   - Choose file: `releases/.../database/fresh/03-submissions.sql` &rarr; click **Go**.

---

## SECTION 3: Uploading & Configuring the Private Backend

### Step 3.1: Upload and Extract Private Package
1. In cPanel **File Manager**, navigate to your home directory (the parent of `public_html`).
2. Click **+ Folder** &rarr; Name: **`attaie-v2-private`**.
3. Enter `attaie-v2-private/` &rarr; click **Upload** &rarr; upload `UPLOAD-PRIVATE-OUTSIDE-WEBROOT.zip`.
4. Right-click the `.zip` &rarr; **Extract** &rarr; extract into `/home/YOUR_CPANEL_USER/attaie-v2-private/`.
5. Delete the `.zip` file from the server.

### Step 3.2: Configure `config.php` (Internal CRM Backend)
1. Inside `/home/YOUR_CPANEL_USER/attaie-v2-private/`, copy `config.example.php` to **`config.php`**.
2. Edit `config.php` and set:
```php
<?php
// /home/YOUR_CPANEL_USER/attaie-v2-private/config.php
return [
    'dsn' => 'mysql:host=localhost;dbname=YOUR_CPANEL_USER_attaie_crm;charset=utf8mb4',
    'database_user' => 'YOUR_CPANEL_USER_attaie_dbuser',
    'database_password' => 'YOUR_SAVED_DB_PASSWORD',
    'origin' => 'https://attaieproperties.com',
    'session_directory' => '/home/YOUR_CPANEL_USER/attaie-v2-private/sessions',
    'allow_local_http' => false,
    'firebase_project_id' => 'attaiepropertieswebsite',
    'firebase_api_key' => 'AIzaSyAUx95kyoXQjzROH48U92AnqmA-uRx2haU',
    'submission_dsn' => 'mysql:host=localhost;dbname=YOUR_CPANEL_USER_attaie_submissions;charset=utf8mb4',
    'submission_user' => 'YOUR_CPANEL_USER_attaie_dbuser',
    'submission_password' => 'YOUR_SAVED_DB_PASSWORD',
];
```
3. Save changes.

### Step 3.3: Configure `website-db.php` (Website Public API)
1. Inside `/home/YOUR_CPANEL_USER/attaie-v2-private/`, copy `website-db.example.php` to **`website-db.php`**.
2. Edit `website-db.php` and set lines 4–16:
```php
define('SUBMISSION_DB_HOST','localhost');
define('SUBMISSION_DB_USER','YOUR_CPANEL_USER_attaie_dbuser');
define('SUBMISSION_DB_PASS','YOUR_SAVED_DB_PASSWORD');
define('SUBMISSION_DB_NAME','YOUR_CPANEL_USER_attaie_submissions');

define('DB_HOST',    'localhost');
define('DB_USER',    'YOUR_CPANEL_USER_attaie_dbuser');
define('DB_PASS',    'YOUR_SAVED_DB_PASSWORD');
define('DB_NAME',    'YOUR_CPANEL_USER_attaie_website');
```
3. Save changes.

### Step 3.4: Set Session Permissions
- Ensure `/home/YOUR_CPANEL_USER/attaie-v2-private/sessions/` permissions are set to **`0755`** (writable by PHP).

---

## SECTION 4: Uploading the Public Website to `public_html`

### Step 4.1: Upload and Extract Web Assets
1. In cPanel **File Manager**, enter **`public_html/`**.
2. Click **Upload** &rarr; select `UPLOAD-WEBSITE-CONTENTS.zip`.
3. Once uploaded, right-click `UPLOAD-WEBSITE-CONTENTS.zip` &rarr; click **Extract** &rarr; extract into `public_html/`.
4. Delete the `.zip` file.
5. In File Manager Settings (top right), enable **Show Hidden Files (dotfiles)** and confirm `.htaccess` and `.user.ini` are present.

### Step 4.2: Connect Public Gateways
1. **Edit `public_html/staff-api/paths.php`**:
```php
<?php
return [
    'app_directory' => '/home/YOUR_CPANEL_USER/attaie-v2-private/app',
    'config_file' => '/home/YOUR_CPANEL_USER/attaie-v2-private/config.php',
];
```
2. **Edit `public_html/api/db.php`**:
```php
<?php
require '/home/YOUR_CPANEL_USER/attaie-v2-private/website-db.php';
```

---

## SECTION 5: Firebase Console Domain Authorization

1. Open [Firebase Console](https://console.firebase.google.com/) &rarr; project **`attaiepropertieswebsite`**.
2. Go to **Authentication** &rarr; **Settings** &rarr; **Authorized domains**.
3. Add:
   - `attaieproperties.com`
   - `www.attaieproperties.com`
4. Click **Done**.

---

## SECTION 6: Sales Android Studio Build & Compilation

The Android project is located in [`sales-android/`](file:///C:/Users/RoheenAhmadi/OneDrive/Desktop/PROJECTS/ATTAIEWEBV2MAINDOMAIN/v2-dvelopment-/sales-android/).

1. Open **Android Studio** &rarr; click **Open** &rarr; select `sales-android/`.
2. Wait for Gradle sync to complete (uses Gradle 8.9 and AGP 8.7.2).
3. **To test on device**: Connect an Android device with USB debugging enabled, select it in the top bar, and click **Run** (`Shift + F10`).
4. **To build standard APK**: Click **Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)**. Locate APK in `sales-android/app/build/outputs/apk/debug/app-debug.apk`.
5. **To build Google Play Store release**: Click **Build &rarr; Generate Signed Bundle / APK...** &rarr; select **Android App Bundle** &rarr; sign with release keystore.

---

## SECTION 7: Sales iOS App Compilation (Xcode & Cloud CI)

### Method A: GitHub Actions Cloud CI (Zero Mac Required)
1. Workflow file is ready in `.github/workflows/build-ios.yml`.
2. Push your project to GitHub.
3. Open your repo on GitHub &rarr; **Actions** &rarr; **Build iOS App** &rarr; click **Run workflow**.
4. Download the compiled iOS archive artifact upon workflow completion.

### Method B: Local Xcode on Mac
```bash
npm install
npx cap sync ios
npx cap open ios
```
In Xcode: Select your Developer Team in **Signing & Capabilities**, then click **Run** or **Product &rarr; Archive**.

---

## SECTION 8: Call Center & Admin PC Apps (Installation & Building)

### Pre-Built Binaries
Executable files are located in:  
`releases/manual-production-dashboard-completion-20261118T092800Z/desktop/`

- **`Attaie Admin Setup 1.0.0.exe`**: Full Windows installer with start menu and desktop shortcuts.
- **`Attaie Admin 1.0.0.exe`**: Standalone portable version.

### To Rebuild Desktop Apps from Source
```powershell
cd admin-panel
npm run pack
```
New packages will be generated in `admin-panel/release/`.

---

## SECTION 9: End-to-End Testing & Verification Checklist

| Test Item | Verification Target | Expected Result |
|---|---|---|
| **Public Website** | `https://attaieproperties.com` | Homepage loads, properties list works, language switch to Dari/RTL functions smoothly. |
| **CEO Command** | `https://attaieproperties.com/ceo/` | Log in with `Ceo@attaieproperties.com`. Executive KPIs and Team overview load. |
| **Sales Workspace** | `https://attaieproperties.com/sales/` | Log in with `emalkarimi@attaieproperties.com` (web or Android). Lead pipeline loads. |
| **Call Center** | `https://attaieproperties.com/callcenter/` | Log in with `attaullah@attaieproperties.com` (web or PC). Call dialer and lead intake load. |
| **Deep Link Reload** | `https://attaieproperties.com/ceo/team` | Press `Ctrl + F5`. Page reloads without 404 (handled by `.htaccess`). |

---

## Complete User Roster & Workspace Routing Reference

| User | Email | Role | Target Workspace | Firebase UID |
|---|---|---|---|---|
| **Faiz Mohammad Attaie** | `Ceo@attaieproperties.com` | `ceo` | `https://attaieproperties.com/ceo/` | `AyAy8pvBKMb7Uqj6NFBE03Opw5W2` |
| **Basir Wahidi** | `Basirwahidi@attaieproperties.com` | `sales_leader` | `https://attaieproperties.com/sales-leader/` | `TVQGvlQj0fd6N9MXozxSTqhL9Ka2` |
| **Emal Karimi** | `emalkarimi@attaieproperties.com` | `sales` | `https://attaieproperties.com/sales/` *(or Android)* | `NqAYxhprk2XKgQtqgjXLTwvpU5U2` |
| **Atta Ullah** | `attaullah@attaieproperties.com` | `callcenter` | `https://attaieproperties.com/callcenter/` *(or PC)* | `yLz9soswvdQJSD8mJFQ5QCREID13` |
| **Said Azam Sadat** | `azamsadat@attaieproperties.com` | `finance_manager` | `https://attaieproperties.com/finance/` | `Wuz5TNja9fUVMiOXy9ddC9CQYhI2` |
| **Sameer Kakar** | `sameerkakar@attaieproperties.com` | `marketing_manager` | `https://attaieproperties.com/marketing/` | `EopYP3KgjgNQlJc5ZfZNxraCLpE2` |
| **Samim Yousufi** | `samimyousufi@attaieproperties.com` | `editor` | `https://attaieproperties.com/marketing/` | `ezxgoUltXgcZ0qUcnQSYOqjl24e2` |
| **Ekram Malik** | `ekrammalik@attaieproperties.com` | `videographer` | `https://attaieproperties.com/marketing/` | `JivvGtQfo7bRFPewBeHlTTy8uMY2` |
| **Milad** | `Milad@attaieproperties.com` | `architect` | `https://attaieproperties.com/engineering/` | `IYIRlNZj7bTMa8hQMCsxdUDIzm42` |
| **Samim** | `samim@attaieproperties.com` | `graphic_designer` | `https://attaieproperties.com/engineering/` | `IvdT8F8pSCdTQortZFPNOlTrUl72` |
| **Shaheer Ahmadi** | `shaheerahmadi@attaieproperties.com` | `visual_designer_3d` | `https://attaieproperties.com/engineering/` | `5ysa1VlfyVTEPbxxam1McWze1Ki2` |

---

## 13. Disaster Recovery & Rollback Procedure

1. **Database Backups**: Before making changes, export backups of all 3 databases via phpMyAdmin Export (Quick - SQL format).
2. **File Rollback**: If an issue occurs during an update, re-extract the verified `UPLOAD-WEBSITE-CONTENTS.zip` and `UPLOAD-PRIVATE-OUTSIDE-WEBROOT.zip` packages.
3. **Preserving User UIDs**: Never run a destructive `DROP DATABASE` or `TRUNCATE core_users` on a live system. All staff records use `ON DUPLICATE KEY UPDATE` to preserve existing user IDs and historical audit trails.
