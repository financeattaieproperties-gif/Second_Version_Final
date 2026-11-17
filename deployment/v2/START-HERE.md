# Attaie Properties V2 — Main Domain Deployment Guide (`attaieproperties.com`)

Target: **https://attaieproperties.com** (also accessible via `www.attaieproperties.com`). This is the V2 installation guide for the main domain document root and V2 MySQL database. Nothing is uploaded to your hosting account automatically; upload the prepared files manually.

No cPanel Terminal, Composer, Node, Python, or automatic installer is needed on the server. Use cPanel File Manager, Database Wizard, phpMyAdmin, and Firebase Console. Keep this guide open while you work.

## What is included

- Fresh public website and property-admin build, latest English-only teal `/callcenter/`, and `/management/`.
- PHP website/API files and a private staff service using Firebase Authentication.
- **39 tables in one NEW V2 database:** 19 website tables, 12 shared `core_` tables, and 8 `cc_` call-center tables. Future dashboard modules add their own tables and permission/registry rows without changing these tables.
- Empty project and apartment catalogs. Add new project records, photos, and plans through the application.
- A generated website-admin password kept in a private local file. Staff users use Firebase passwords instead; no staff passwords are stored in MySQL.

The photo explorer's current calibration/default configuration is unfinished; no project artwork is bundled, and this kit does not invent floor/apartment polygons or claim the interactive photo explorer is configured. Automatic Etisalat capture, outbound click-to-call, and AI chat are disabled/unconnected for this test installation. The manual call-center workflow is available. Ordinary telephone/WhatsApp links still point to the company's numbers.

## 1. Identify the files

| Item | Purpose | Where it goes |
| --- | --- | --- |
| `UPLOAD-WEBSITE-CONTENTS.zip` | Public website, admin and staff dashboards, PHP entrypoints, hidden routing files | Extract directly into the **testing subdomain document root** |
| `dist/` | Same public upload files, already extracted | Alternative to the public ZIP; upload its **contents**, not the folder |
| `UPLOAD-PRIVATE-OUTSIDE-WEBROOT.zip` | Private staff application, placeholder configuration, sessions directory | Extract in your cPanel **home directory**, outside every web root |
| `database/` | SQL files for phpMyAdmin | Keep on your computer; import through phpMyAdmin, never upload to web root |
| `private-setup/` | Private website-admin login and provisioning templates | Keep on your computer, never upload to web root |
| `manifest.json`, this guide | Verification/instructions | Keep outside web root |

Do not upload the whole release folder. Use only the newly prepared full V2 kit, not repository-root `dist` or earlier release ZIPs.

## 2. Verify the main domain (`attaieproperties.com`)

1. In cPanel open **Domains** and confirm **`attaieproperties.com`** points to your intended document root (usually `/home/CPANEL_USER/public_html`). Replace `CPANEL_USER` throughout this guide with the actual account name shown by cPanel.
2. Back up any existing files in `public_html` and export any existing database before replacing files or importing fresh SQL. These fresh SQL files are for a **new empty V2 database**.
3. In **SSL/TLS Status / AutoSSL**, confirm HTTPS is active for both `attaieproperties.com` and `www.attaieproperties.com`.
4. Select PHP **8.2 or newer** for `attaieproperties.com`. Required extensions: `mysqli` with mysqlnd, `pdo_mysql`, OpenSSL, cURL, fileinfo, JSON, and sessions. PHP must be able to reach Google's HTTPS endpoints with a valid CA certificate store.

## 3. Create one NEW V2 database

1. Open **Database Wizard** or **Manage My Databases**.
2. Create a NEW database, for example `CPANEL_USER_attaie_v2_test`.
3. Create a NEW database user, for example `CPANEL_USER_v2_app`, with a strong password. Save the database name, full username, password, and database host in your password manager. Use only these new credentials in this test kit.
4. Associate that user with **only this V2 database**. Runtime permissions needed by the application: **SELECT, INSERT, UPDATE, DELETE**. Perform schema imports with cPanel/phpMyAdmin setup privileges. If the host temporarily requires broader import privileges, remove CREATE/ALTER/DROP from the application user after importing.

Both the website and staff service use this same V2 database in this kit. `leads` belongs to website inquiries; `cc_leads` belongs to the call-center module. Do not rename or merge them manually.

## 4. Import the tables and testing settings

In cPanel open **phpMyAdmin**. Click the NEW V2 database in the left sidebar. Verify its complete name and that it contains no tables. Use the **Import** tab in this order:

1. `database/01-new-v2-schema.sql` — creates all 39 tables, eight department groups, known roles/permissions, and module registrations.
2. `database/02-five-project-showcase.sql` — applies testing SEO settings only. The legacy filename is retained for import compatibility; it contains no project data.
3. `database/03-website-admin.sql` — adds the website catalog administrator with a bcrypt password hash.

Do not import the CEO template yet; fill it in during step 6. `VERIFY-TEST-DATABASE.sql` is a read-only checklist, not another creation script.

If an import fails, stop and save the exact error. Do not rerun creation files blindly or delete another database. Check whether the import was partial before deciding how to recover. Never use these files on a populated V2 database or V1 database.

## 5. Upload and configure the website

1. Open cPanel **File Manager > Settings** and enable **Show Hidden Files (dotfiles)**.
2. Open the testing subdomain's document root from step 2.
3. Upload `UPLOAD-WEBSITE-CONTENTS.zip` there, select it, and choose **Extract** into that same folder. Alternatively upload the contents of this kit's `dist/` folder through your file-transfer client.
4. Confirm the root directly contains `index.html`, `.htaccess`, `.user.ini`, `api/`, `admin/`, `callcenter/`, `management/`, and `staff-api/`. It must not be nested under an extra `dist/` or ZIP-name folder. Remove the uploaded ZIP after extraction.
5. In File Manager edit **the testing installation's** `api/db.php`. Replace:

   ```php
   define('DB_HOST', 'localhost'); // use your host's value
   define('DB_USER', 'YOUR_FULL_V2_DATABASE_USERNAME');
   define('DB_PASS', 'YOUR_V2_DATABASE_PASSWORD');
   define('DB_NAME', 'YOUR_FULL_V2_DATABASE_NAME');
   ```

   Change the existing values in that file; do not paste duplicate definitions. If a password contains a single quote or backslash, escape it correctly in the PHP string (`\'` or `\\`). Keep `ADMIN_USER` and `ADMIN_PASS` blank. Keep `ATTAIE_MANUAL_SCHEMA` set to `true`: this installation uses your manual SQL import and must not migrate tables during web requests.
6. Keep `uploads/` writable by the hosting user's PHP process. Start with normal hosting permissions (directories commonly 755, files 644); never use 777. Private upload subdirectories have denial rules that must remain in place.

The placeholder `api/db.php` contains no real credentials in the supplied archive. Fill it only in the V2 testing installation. The default generated `/admin/` login is in `private-setup/WEBSITE-ADMIN-LOGIN-PRIVATE.txt` on your computer; do not upload that file or send its password in chat.

## 6. Enable Firebase and create the Admin (CEO)

1. Open [Firebase Console](https://console.firebase.google.com/) and select project **`roheenahmadi-907a7`**.
2. Open **Build > Authentication**. If prompted, choose **Get started**.
3. Under **Sign-in method**, enable **Email/Password** and save. Email/password is the method implemented here; phone/SMS sign-in is not part of this kit.
4. Under Authentication **Settings > Authorized domains**, add both `attaieproperties.com` and `www.attaieproperties.com` without `https://` or a path. Check the password reset email template's sender/name and allowed action domain.
5. Under **Users > Add user**, create the CEO's email and strong password. Save the password privately.
6. Open that user's details and copy the exact **UID** and email. UID matching is case-sensitive. Do not use the Google Cloud project number, project ID, or an email address as the UID.
7. On your computer, open `database/04-staff-ceo.template.sql` in a plain-text editor. Fill these two values:

   ```sql
   SET @owner_firebase_uid = 'PASTE_EXACT_FIREBASE_USER_UID';
   SET @owner_email = 'ceo@example.com';
   SET @owner_name = 'Admin (CEO)';
   ```

8. Save and import that edited file in phpMyAdmin with the NEW V2 database selected. It adds a `core_users` row with role `ceo`. Blank template values intentionally create no account. Do not import twice for the same user. No password belongs in this SQL.

A Firebase user without an active matching MySQL row cannot enter the staff workspace. The browser never chooses its own role. All eight department groups are registered, but their future dashboards are not installed by this kit.

## 7. Install the private staff application

1. In File Manager go to your cPanel **home directory**, for example `/home/CPANEL_USER`.
2. Upload `UPLOAD-PRIVATE-OUTSIDE-WEBROOT.zip` there and extract it there. It creates:

   ```text
   /home/CPANEL_USER/attaie-v2-private/
       app/src/App.php
       app/src/Domain.php
       app/src/FirebaseAuth.php
       config.php
       sessions/
   ```

   This folder must be outside the testing document root, `public_html`, and every other domain's web root. Delete the private ZIP after extraction. The `paths-reference.php` file is only a reference; the active locator is configured in step 8.
3. Edit the private `config.php` and set the **same** V2 database as the website:

   ```php
   'dsn' => 'mysql:host=localhost;dbname=CPANEL_USER_attaie_v2_test;charset=utf8mb4',
   'database_user' => 'CPANEL_USER_v2_app',
   'database_password' => 'YOUR_V2_DATABASE_PASSWORD',
   'origin' => 'https://attaieproperties.com',
   'allowed_origins' => ['https://www.attaieproperties.com'],
   'session_directory' => '/home/CPANEL_USER/attaie-v2-private/sessions',
   'allow_local_http' => false,
   ```

   Change existing values; do not add duplicate array keys. Preserve the included Firebase project ID/Web API key. The supplied key is a public Firebase web identifier, not a service-account private key. No service-account JSON, Composer install, or Firebase Security Rules for MySQL are needed here.
4. Make the private sessions directory writable by the hosting user's PHP process. Start with 700 for private directories and 600 for private config if your PHP runs as your hosting user; ask the host for its supported restrictive permissions if PHP cannot read/write them. Never make these files world-writable.

## 8. Connect the staff API using File Manager

Edit `staff-api/paths.php` **inside the testing document root**. Replace only the absolute paths:

```php
return [
    'app_directory' => '/home/CPANEL_USER/attaie-v2-private/app',
    'config_file' => '/home/CPANEL_USER/attaie-v2-private/config.php',
];
```

This public locator stores paths only, not passwords. Its HTTP access is denied by the included `.htaccess`; PHP loads it internally. The entrypoint checks that the service and config are outside its web root. Confirm they are outside **all** other web roots too. No environment-variable setup or cPanel Terminal is required for this method. Existing staff environment configuration remains supported if the locator file is absent.

## 9. Sign in and set up CEO, Sales Team Leaders, Sales Agents & CRM Projects

These are separate role-locked login surfaces:

| URL / App | Role | How it is created |
| --- | --- | --- |
| `/admin/` (or Admin PC `.exe`) | Website property/catalog administrator | Generated `owner` login in the private local text file, backed by `admin_users` (plus optional Google sign-in allowlist) |
| `/ceo/` | CEO (Top-level owner) | Firebase email/password plus the CEO `core_users` row (`role='ceo'`) from step 6 |
| `/management/` | Operations / HR Manager | Created by CEO inside `/ceo/` → Team (`role='manager'`) |
| `/callcenter/` (or Call Center PC `.exe`) | Call Center Agent | Created by CEO inside `/ceo/` → Team (`role='callcenter'`) |
| `/sales-leader/` | Sales Team Leader | Created by CEO inside `/ceo/` → Team (`role='sales_leader'`) |
| `/sales/` (or Android APK / iOS App) | Sales Agent | Created by CEO inside `/ceo/` → Team (`role='sales'`, linked to Branch & Sales Team Leader) |
| `/finance/`, `/marketing/`, `/engineering/` | Finance, Marketing & Engineering staff | Created by CEO inside `/ceo/` → Team |

### Day-2 Team & CRM Project Setup Order (2-Day Rollout)

1. **Bootstrap CEO first** (step 6): ensure the CEO user is in Firebase Auth and `core_users` (`role='ceo'`), and confirm `core_branches` has `Main Branch (Kabul)` (`id=1`).
2. Sign in at **`https://attaieproperties.com/ceo/`**.
3. Open **Team tasks → Create agent** for each staff member (creating each user's Email/Password in Firebase Auth first and copying their exact UID):
   - Create your **Sales Team Leader(s)** first (`Role = Sales Team Leader`, `Branch = Main Branch (Kabul)`).
   - Next, create each **Sales Agent** (`Role = Sales Agent`, `Branch = Main Branch (Kabul)`, and select their supervising **Sales Team Leader**).
   - Create any **Call Center Agents**, **Manager**, **Finance Manager**, **Marketing**, or **Engineering** staff as needed.
4. **Add all Pre-Sale Projects inside CRM (`/ceo/` → Pre-Sale Projects → Add New Project)**:
   - Public website project catalogs stay empty (`/api/get-projects.php` stays `[]`).
   - Add each project's exterior cover photo, Commercial vs. Residential floors, corridors (A–Z), apartment/shop/supermarket units, typical floor copy, and assign the **Sales Team Leader** and **Sales Agents** on Step 4.
5. **Install Client Apps**:
   - **Call Center PC `.exe`**: build from `callcenter-desktop/` (`npm install && npm run pack:win`) and install `Attaie Call Center Setup.exe` on call center PCs (connects to `https://attaieproperties.com/callcenter/` by default).
   - **Website Admin PC `.exe`**: build from `admin-panel/` (`npm install && npm run pack`) and install `Attaie Admin Setup.exe` on admin PCs (connects to `https://attaieproperties.com` by default).
   - **Sales Agent Android APK**: build from `sales-android/` in Android Studio (`Build APK(s)` or `./gradlew assembleDebug`, connects to `https://attaieproperties.com/staff-api/v1`).
   - **Sales Agent iOS App**: open `https://attaieproperties.com/sales/` in iPhone/iPad Safari → **Share → Add to Home Screen** (instant standalone app), or build a signed `.ipa` via `sales-ios/` in Xcode on macOS.

## 10. Test the workflow

Use clearly fictional test records in this V2 database:

1. As a Call Center agent sign in at `/callcenter/` (or the Call Center desktop `.exe`) and click **New entry**. Enter a fictional customer name/phone, manual call time, requirements, and next follow-up time. Save.
2. As a Sales Team Leader sign in at `/sales-leader/`, verify your assigned Sales Agents appear under **Team** and team pipeline metrics + conversion charts render in **Leads**.
3. As a Sales Agent sign in on `/sales/` (or Android APK / iOS Home Screen app), verify assigned leads load, offline cache saves snapshots, and follow-up feedback (`Follow up`, `Visit`, `Deal closed`, `Deal lost`) submits cleanly.
4. From `/ceo/` choose **Assign task**, select an agent, enter instructions/priority/deadline, and verify task completion in the agent's **My Tasks**.
5. Check logout, password reset, browser refresh, mobile layout, and deep links such as `/callcenter/followups`, `/sales/leads`, `/sales-leader/leads`, `/ceo/projects`.

## 11. Verify the server and database

Open `database/VERIFY-TEST-DATABASE.sql` in phpMyAdmin's SQL tab with the V2 database selected. Expected: 39 tables, empty projects and project_units tables, eight department rows, module versions `core=1` and `callcenter=1`, and the provisioned staff profiles.

Check these browser URLs:

- `/api/get-projects.php` returns an empty array until projects are added. Removed project detail URLs show the existing missing-project state.
- `/admin/` signs in with the private generated website-admin login. Property CRUD, uploads, inquiries, career applications, and visit requests need their own fictional V2 workflow checks before relying on them.
- `/staff-api/v1/session` returns JSON with `user: null` when signed out. A configured anonymous session is not a server error.
- `/staff-api/v1/dashboard` denies signed-out access. A customer or unrelated department account must not read call-center records.
- Root `robots.txt` says `Disallow: /`; browser Network response headers include `X-Robots-Tag: noindex, nofollow, noarchive`. Staff HTML also has noindex. These discourage indexing, but authentication protects private data.
- Public website visits make no `/staff-api/` requests or staff asset downloads.
- `/staff-api/paths.php`, `/visual-config/data/draft.json`, and private upload paths deny HTTP access. The private application/config/SQL/password file must not have a public URL at all.

Google Maps needs its own browser key authorized for this testing hostname. The normal contact links use company numbers; avoid real calls/messages during checks. A successful local build is not proof of hosting configuration or a real Firebase login.

## 12. Troubleshooting

| Symptom | Check |
| --- | --- |
| Staff service returns 503 / Not configured | `staff-api/paths.php` absolute paths; private config outside web roots; PHP read permissions; required extensions; correct database; all schema SQL imported |
| Database connection failed | Full cPanel-prefixed database/user names, password escaping, host, and database-user association |
| Firebase login fails before app access | Email/Password enabled, correct account/password/project, network access to Identity Toolkit, browser CSP headers |
| Firebase verifies but workspace access is denied | Exact case-sensitive UID exists in `core_users`, correct role, `active=1`; creating a Firebase user alone is insufficient |
| Sign-in could not be verified | Server cURL/OpenSSL/CA store, Google HTTPS egress, server clock, Firebase project/key pairing, account disabled/revoked state |
| Browser key works but PHP lookup is rejected | A key restricted to browser HTTP referrers may reject server calls. Use an appropriate server key from the same Firebase project in private PHP config, restricted to required Identity Toolkit API and supported server restrictions. Keep the browser key in the frontend build. Do not add a service-account secret to the website |
| Login works but saves fail with origin/CSRF errors | Exact HTTPS `origin` in private config, correct domain, cookies enabled; sign out/in after config changes. Do not visit the dashboard through a different hostname |
| Deep links return public home/404 | Correct root and nested `.htaccess` files uploaded; mod_rewrite enabled; files extracted into the correct document root |
| Entire site returns 500 | Check cPanel Errors/PHP logs. Ask the host whether copied PHP directives/Options in `.htaccess` are supported before altering only the testing installation |
| Project photo explorer is absent | The current visual calibration config is unfinished. Assets and sample listings are included; this is a documented remaining feature, not a failed database import |
| AI chat or click-to-call returns forbidden | Intentionally disabled in this testing kit. Do not connect it to V1 credentials or assume automatic Etisalat capture exists |
| Session expires | Sign in again. Staff sessions expire at Firebase ID-token expiry (about one hour) or 30 minutes of inactivity. Account revocation is rechecked at most five minutes apart while active; MySQL activity/permissions are checked each request |

For offboarding, first resolve active lead/task assignments. Disable the Firebase user and set the matching V2 `core_users.active` to `0`, incrementing `auth_version`, through a reviewed admin operation/phpMyAdmin. Keep the records/history; do not delete the user row or role tables. Permission changes belong in V2 MySQL and must be reviewed before granting broader access.

## Backups, updates and rollback

Before replacing an existing V2 site, download its current files and export its V2 database privately. Keep the known-good release, private configuration and sessions secure. The supplied SQL is **new-install only**. Do not rerun it for a later dashboard module or overwrite populated tables.

Future modules install their own tables and new registry/permission rows. Existing core/module schema changes need a separate explicit migration and backup. Do not copy V2 files into V1's document root, use V1 credentials, or restore test data into V1.

If a new V2 release fails, stop staff activity and restore compatible prior application files. Do not restore an old database over newer customer work without reviewing data loss. Nothing in this guide authorizes a main-domain production deployment.

## Reference documentation

- [cPanel File Manager](https://docs.cpanel.net/cpanel/files/file-manager/110/) and [show hidden files](https://support.cpanel.net/hc/en-us/articles/5085107370135-How-to-show-hidden-files-in-cPanel-File-Manager).
- [cPanel database users and privileges](https://docs.cpanel.net/cpanel/databases/manage-my-databases/).
- [Firebase email/password authentication](https://firebase.google.com/docs/auth/web/password-auth) and [server token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
