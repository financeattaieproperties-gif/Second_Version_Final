# Production readiness audit — 2026-11-16

## Verdict

**Do not deploy this checkout to `attaieproperties.com` yet.** Source, schema, role permissions, and release scripts disagree in ways that block real workflows and expose staff data across authorization boundaries.

This report records a repository-wide static audit across the public React application, Website Admin, staff application/contracts, PHP APIs, database scripts, builds, tests, and release workflows. Backend exploration inventoried 43 PHP files under `public/api/` and six staff-service modules, plus direct chat, AI, settings, cleanup/handoff, and private storage services. It is not proof that every path works. Production, Firebase, PHP/MySQL integration, browsers, migrations, and hosting have not been verified in this session.

Baseline: commit `2de403a` on `main`, cloned from `financeattaieproperties-gif/v2-dvelopment-`. No live service or database was changed. Real credential files were not read.

## Owner decisions recorded in this session

- Prepare one complete V2 release for `https://attaieproperties.com`, including the public website, Website Admin, and every existing staff panel.
- Preserve and migrate existing live data. Fresh empty-schema imports are not an upgrade path for that data.
- Use an isolated V2 copy, migrate and verify it, then switch the main domain after all checks pass.
- All existing integrations are required before launch: calls, Maps, chat/AI, Google Workspace, Website Admin Google login, and staff Firebase. Missing provider setup or acceptance remains a launch blocker.
- These decisions change the release target from historical testing-only plans. They do not establish that any upload, database operation, or cutover has occurred.

## Surface inventory

| Surface | Source and intended responsibilities |
| --- | --- |
| Public site | `src/App.tsx`: home, properties/list/detail, projects/list/detail, contact, about, agents/list/detail, careers/list/detail, Google Workspace, not found; inquiries/offline receipts, chat, visits, maps, calls, SEO. |
| Website Admin `/admin/` | `admin-panel/`: website catalog and uploads, leads/inquiries, chat, visits, careers/applicants, agents/branches, publication review, settings, SEO/sitemap. Separate website session identity. |
| CEO `/ceo/` | Global internal oversight, branches, staff provisioning, inventory ownership, review, and tasks according to the canonical role model. |
| Management `/management/` | Branch operations, HR contracts/project preparation, staff/task visibility within its authorization scope. |
| Sales leader `/sales-leader/` | Team and assigned lead operations. |
| Sales `/sales/` | Leads, follow-ups, visits, deal closure; PWA and device-local offline functionality. |
| Callcenter `/callcenter/` | Calls, contacts, lead activation, follow-ups, tasks. |
| Finance `/finance/` | Contracts, installments, deposits, receipts, approvals/reversals. |
| Marketing `/marketing/` | Marketing manager, videographer, and editor production/publication handoffs. |
| Engineering `/engineering/` | Architect, graphic designer, and 3D designer deliverables, versions, review. |
| Staff backend | `public/staff-api/` entrypoint; private `staff-service/src/`; internal CRM and authorized submission database access. |
| Website backend | `public/api/`, SEO/sitemap, chat/AI/visual configuration PHP services; website database plus authorized publication submission access. |
| Distribution | Root build, staff builds, Android companion build, multiple incompatible staging packagers, cPanel guide, FTPS dry-run workflow. Android/Electron installers are adjacent products, not web document-root files. |

## P0 — release blockers

### A01. Branch boundaries are not consistently enforced by the PHP staff service

`staff-service/src/Completion.php:29-42` reads project, contract, deposit, marketing, and HR records without consistent branch predicates. `record()` at lines 52-55 fetches direct IDs without a branch check. Private-file access at lines 119-127 uses role/ownership checks without consistently checking the owning branch. `App.php` authentication rejects only a retired Finance Assistant role, rather than all retired roles and inactive/missing branch assignments required by the canonical model.

**Impact:** a role with module access can receive or reference another branch's data. A hidden navigation item does not protect its API.

**Required:** one canonical server authorization policy covering sessions, lists, counts, searches, direct IDs, writes, exports, linked records, and downloads. Verify allowed and denied requests using two branches, every active role, disabled users/branches, and retired roles.

### A02. Fresh schema requires branch fields that production writes omit

Canonical SQL requires branch ownership on `core_management_tasks`, `inv_projects`, `mkt_production_entries`, and `sub_posts.origin_branch_id`. Corresponding inserts omit these fields in `App.php:createTask`, `Completion.php:saveInventory`, `marketingCreate`, and `flushSubmissionOutbox` (notably lines 87, 149, and 327).

`App.php:createStaff` also omits branch assignment, while lead creation requires an assigned branch. `publicUser()` omits branch information expected by the staff contract.

**Impact:** strict SQL rejects core workflows, or new staff accounts cannot operate. Marketing deliveries remain pending.

**Required:** derive branch ownership from verified server context, preserve it through cross-database publication, and align API DTOs/UI forms with the canonical schema. Do not invent branch mappings for old records.

### A03. Current roles and backend workflow role checks conflict

`staff-service/database/110-ceo-manager-branch-model.sql` replaces the old HR Manager model, reserves global authority for CEO, and gives Manager HR responsibilities. `Completion.php` still requires `hr_manager` for project preparation, agreement issuance/amendment, and related operations (lines 180, 203, 347). Inventory writes allow only `manager` (line 131), despite the canonical CEO grant. Task assignment also uses old role scopes.

`App.php:createStaff` offers retired roles and omits canonical Manager creation; `apps/staff/src/main.tsx` staff forms lack required branch assignment. Contracts, previews, fresh SQL, migrations, and PHP disagree.

**Required:** reconcile the existing canonical CEO/Manager/branch model across all layers; retain historical audit identities. Do not re-enable retired roles to make old fixtures pass.

### A04. Sales service worker can return another account's authenticated responses

`apps/staff/vite.config.ts:122-145` stores authenticated dashboard/lead GET responses in a shared `attaie-sales-api-cache`, keyed by URL, for up to seven days. This cache is not visibly partitioned by identity. Local snapshot cleanup does not remove Workbox CacheStorage responses.

**Impact:** after logout/account switching and a timeout, a response belonging to the previous account may be served to the next user. User-scoped localStorage tests do not establish service-worker isolation.

**Required:** remove authenticated API response caching or implement verified identity partitioning plus logout/account-switch cleanup, including removal of existing unsafe caches. Keep authorization failures online and fail closed. Exercise a real two-user browser sequence.

### A05. Standard dashboard builds explicitly include demo workspaces

`scripts/build-public-staff.mjs:22` sets `STAFF_ALLOW_PREVIEW='1'`. `apps/staff/src/main.tsx:155-184` can select a sample client from preview query parameters. This does not establish a live API authorization bypass, but it ships unauthenticated fictional workspaces inside a production artifact.

**Required:** previews disabled and removed from every production bundle; explicit development-only preview entrypoints. Scan the emitted files and check the deployed browser behavior.

### A06. Website Admin accepts a stored password hash as a password

`public/api/admin-login.php:97` authenticates with `password_verify($pass, $hash) || hash_equals($hash, $pass)`. The hash itself is accepted as a credential. No corresponding persistent login throttle is present in this endpoint.

**Required:** accept supported password hashes only through password verification; provide a reviewed migration/reset path for any historical plaintext records. Add persistent throttling and tests. Preserve current legitimate administrator access during migration.

### A07. Existing packagers do not produce the requested complete production release

`scripts/package-dashboard-completion.mjs:16` stops its fresh internal SQL list at migration 100 and omits the later role/lead-claim evolution. Its panel build loop at line 48 emits only `/dashboard/`, `/management/`, and `/callcenter/`, while canonical panel contracts define eight dedicated staff URLs. The standard build emits dedicated URLs but includes previews.

Staging packagers hardcode `website.attaieproperties.com`, public `Disallow: /`, global noindex headers, and disabled calls/chat. Their config origins reject main-domain staff writes until changed. Root build also invokes the Android build whose default API is the testing hostname.

**Required:** one explicit production build/profile producing all dedicated staff panels plus Website Admin/public site, current backend and separately scoped database migration artifacts. Production public SEO must be indexable; every private panel must remain noindex. No stale directory, demo, secret, migration endpoint, or APK/native source should enter the public upload.

### A08. No validated non-destructive migration path for the live installation exists yet

Existing delivery paths concentrate on empty databases or specific prior V2 module states. The source contains multiple schemas, later migrations, historical role migrations, and divergent package SQL. Migration 110 maps legacy role meanings and disables accounts without branch mappings; it must never be applied blindly to an already canonical installation.

**Required:** inspect a private backup/schema inventory of the actual source installation; build a guarded, versioned migration into isolated V2 databases; reconcile record IDs, relationships, uploads, administrator accounts, exact Firebase UIDs, receipts, contracts, payments, and publication history. Record unresolved mappings and stop. Check counts/integrity and rehearse rollback before cutover. Fresh schema is only for empty fictional fixtures.

## P1 — functional/security blockers to close before acceptance

### A09. Public listings fabricate real-looking inventory on empty/error responses

`src/components/sections/LandingPageContent.tsx:314-327` substitutes demo listings and the five historical projects. `src/lib/signatureProjects.ts` retains these records; `src/pages/ProjectDetailPage.tsx:85-96` resurrects them after failed/404 API calls. `src/lib/dbService.ts:391-425` substitutes generated apartments after unit API failures, including invented prices/availability and demo videos.

**Required:** migrated data is authoritative. Empty, not-found, and unavailable states must be distinct. Do not delete real migrated records merely because their names resemble old fixtures; remove application-level fixture substitution. Update tests that currently require the five bundled projects.

### A10. Public catalog pagination and unit journeys are incomplete

`getProjects()` reads only the first API page. Unit aggregation caps page traversal and can silently return partial results after failures. Properties unit links target `#unit-{id}`, but `ProjectUnitsSection` has no matching anchors or unit visit action. Default Buy filtering does not consistently exclude rentals.

**Required:** complete pagination/error handling; preserve accurate totals; connect inventory cards to the exact unit and unit-specific visit workflow; cover Buy/Rent combinations.

### A11. Blueprint and localized/accessible public workflows are missing

Property API fields for floor/3D plan URLs are present, but current `PropertyDetailPage` does not render the documented blueprint viewer. Landing page hero/search/sections and active unit/modal content contain hardcoded English despite EN/FA locale files. Apartment dialogs lack complete focus/dialog behavior.

**Required:** restore the supported blueprint journey, localize active user flows, and verify keyboard focus, Escape/close restoration, RTL, mobile layouts, and visible validation errors using the existing design system.

### A12. Website Admin Google/Firebase login uses a source-only verifier path

`public/api/admin-login.php:20` expects `staff-service/src/FirebaseAuth.php` inside the public installation/source layout. Intended packaging places the staff service outside all web roots behind a private locator. The current Google login button can therefore reach a 503 in the intended release layout.

**Required:** select and package a separately configured website authentication verifier without granting website Admin CRM access. Preserve website-password login compatibility securely. Test the packaged layout, not only source directories.

### A13. Website Admin SEO updates can report success after a failed save

`admin-panel/src/api.ts:235-266` catches failed SEO persistence and returns merged local/cache data. UI success can conceal failed PHP/database writes. There are broader local fallback paths that require contract verification.

**Required:** show server failure, retain unsaved input, and reserve confirmed success for committed writes. Test save/reload from a separate browser context.

### A14. Engineering work creation is missing from the live client journey

Engineering create routes exist in `Completion.php`, but the staff client/UI has no corresponding deliverable creation path; generic management tasks do not create engineering deliverables.

**Required:** wire authorized creation/assignment, file/version submission, and CEO review end to end. An empty production database must support the workflow without preview seeding.

### A15. Calling integrations require hardening and controlled provider validation

`public/api/initiate-call.php:163-164` and `public/api/ctc/ctc_auth.php:73-74` disable TLS peer/hostname verification. Public IP limits trust a client-supplied forwarded address; database failures can bypass limits. Callback endpoints update records without verified provider authentication, and catch responses include upstream/exception details.

**Required:** verified TLS, trusted proxy policy, reliable rate limiting, authenticated replay-safe provider callbacks, redacted failures, and a controlled provider test. Calls must remain unavailable until this passes; no live calls were placed by this audit.

### A16. Canonical domain and crawling policy are inconsistent

Public metadata, PHP SEO, robots/sitemap, JSON-LD, and UI defaults contain both `www.attaieproperties.com` and `attaieproperties.af`; `ProjectDetailPage` retains the `.af` canonical. Private staff configuration defaults to the testing subdomain. Static sitemap generation invents seeded detail URLs on data failures and defaults to contacting the live API during a build.

**Required:** use the owner's exact canonical `https://attaieproperties.com`, preserve old URL compatibility/redirects, ensure public PHP and React metadata agree, and generate listing URLs only from verified published records. Builds must not contact live APIs implicitly.

### A17. Request-time website schema mutations remain enabled by default

`public/api/bootstrap.php` runs schema setup unless `ATTAIE_MANUAL_SCHEMA === true`. Intended manual packages set it, but a raw `dist` upload may not. A public request must not migrate production schemas.

**Required:** explicit separately executed migrations, a fail-closed runtime schema/version check, least-privilege runtime DB users, and packaged-layout verification.

### A18. Sales cannot supply the private buyer files required for deal closure

`apps/staff/src/main.tsx:3141-3145` supplies raw buyer-portrait/Tazkira URL fields defaulting to `/logo.png`. The API requires a private uploaded record of the correct purpose (`Completion.php:297` and `fileReference()`), but the closure flow exposes no upload control.

**Required:** integrate the existing private-upload control, validate required document purposes, retain form state on upload/save failure, and exercise closure through a real Sales login into HR handoff.

### A19. Visit timing and concurrent updates are not consistently enforced

`public/api/submit-visit-request.php:20-27` validates hours against a supplied DateTime offset instead of normalizing to Kabul first. `src/components/property/VisitRequestDialog.tsx:15` uses browser-local weekday calculation after parsing a Kabul-offset date. `public/api/admin/visit-requests.php:20-40` checks transitions before its transaction without locking/versioning the row. Concurrent edits can invalidate transitions or overwrite notes/history.

**Required:** normalize appointment instants to UTC and apply business rules in Kabul; make frontend date/slot choices agree. Lock or version updates and verify competing status/note writes and rate-limit boundaries.

### A20. Packaged CSP conflicts with Website Admin's entrypoint and Google flows

`scripts/package-dashboard-completion.mjs` copies `deployment/staff/dashboard.htaccess` into Admin. That policy uses `style-src 'self'`, while `admin-panel/index.html:7-44` supplies an inline base stylesheet. The policy also needs a reviewed Firebase/Google popup/frame/connect configuration for the enabled Admin Google flow.

**Required:** align real deployed entrypoints and CSP with externalized styles or deliberate hashes/nonces and narrow required provider origins. Verify on Apache with browser console checks; Vite preview does not enforce the packaged `.htaccess` policy.

### A21. Listing API SQL failures can masquerade as an empty database

`get-properties.php:42-44`, `get-projects.php:23-25`, and `get-project-units.php:93-95` can return HTTP 200 empty arrays after failed SQL preparation.

**Required:** return a generic service failure, log diagnostic details privately, and make the public UI distinguish unavailability from a legitimately empty catalog. Include packaged-schema incompatibility cases in API tests.

### A22. Unit details imply verified plans/features when data is absent

`src/lib/projectExplorerUtils.ts:65-75` substitutes generic technical/furnished plans for missing uploaded plans. `ProjectUnitsSection` presents these in its active apartment modal alongside fixed structural/parking/finish assertions.

**Required:** render verified listing attributes only; clearly label any deliberate illustrative material and show a truthful unavailable state for missing plans. Keep reusable explorer code without fabricating property facts.

### A23. Engineering review authority conflicts across real and preview paths

`EngineeringWorkspace.tsx:43` exposes review to CEO/Manager; shared domain workflow allows CEO; `Completion.php:315` allows only Manager. Related real service listing/creation paths omit or reject CEO even though the canonical model grants global review.

**Required:** use one canonical review/assignment policy across UI, contract helpers, SQL grants, and PHP. Provide links to the protected submitted file for authorized reviewers. Verify direct denial as well as button visibility.

## Verification and tooling gaps

- Root has `bun.lock`, but no `package-lock.json`; the documented `npm ci` path is not reproducible from this checkout. Bun is not installed here. Root scripts resolve packages differently from separately declared Admin React 18 and staff/public React 19 dependencies; choose and verify a consistent isolated install strategy.
- `vitest.config.ts` includes only `packages/staff-contracts/**/*.test.ts`; other repository TypeScript tests are excluded from the normal `npm test` command.
- Several browser tests explicitly select preview workspaces. Preview success is separate from real API acceptance.
- Blueprint-purpose uploads do not enforce the documented JPEG/PNG-specific restriction; current generic WebP/GIF acceptance must be reconciled with the blueprint contract.
- Direct website chat has private atomic storage and thread authorization, but public-message rate limits/storage caps need implementation and load/retention acceptance before public launch.
- `vite.config.ts` unconditionally registers mock PHP middleware for development and production preview. A successful `npm run preview` request is not PHP/MySQL evidence.
- API fixtures include retired roles and machine-specific PHP paths. Update them transparently to test canonical roles and schema constraints.
- The only GitHub deploy workflow uses `npm install`, builds without release acceptance checks, and performs FTPS **dry-run only**. It neither proves deploy readiness nor deploys the service/private files/databases.
- PHP/MySQL binaries, browser dependencies, and project Node dependencies were not available in this fresh clone. Do not substitute a historical report for current validation.

## Checks actually run

| Check | Result |
| --- | --- |
| Initial Git status | Clean `main`, tracking `origin/main`, commit `2de403a`. |
| `node --test --test-reporter=spec tests/staff/domain/*.test.mjs tests/staff/packaging/isolation.test.mjs tests/image-preloader.test.mjs tests/featured-carousel-hooks.test.mjs` | **64 passed, 0 failed**. Domain helpers and source assertions; no hosted workflows. One passing assertion requires removed bundled projects, illustrating stale acceptance criteria. |
| `npm.cmd run lint` | Cannot execute TypeScript: `'tsc' is not recognized`. No dependencies installed. |
| `npm.cmd run typecheck --prefix apps/staff` | Same missing TypeScript tool. |
| `npm.cmd test -- --reporter=dot` | Cannot execute Vitest: `'vitest' is not recognized`. |
| Full production builds | Not run; dependency/tooling setup and approved implementation design required first. |
| PHP lint, real database/API/browser checks | Not run; runtimes/dependencies unavailable in this clone. |
| Live hosting/Firebase/cPanel/DB/calls | Not operated or verified. |

## Release evidence required

Every existing panel must pass real login, session expiry/logout, permitted and denied API operations, branch isolation, error/retry behavior, and its complete business workflow. Public catalog/contact/visit/chat/careers/upload/publication flows must operate against real PHP and isolated migrated data. Type checks, production builds, meaningful regression tests, packaged-layout checks, URL/SEO checks, responsive EN/FA/RTL checks, migration rehearsal, and rollback rehearsal must pass before the upload package can be called locally ready.

Production hosting verification remains separate: private paths, extensions, HTTPS, cookies, Apache routing/headers, writable protected storage, Firebase authorized domains, integration account configuration, data import reconciliation, and owner acceptance on the prepared installation. Preserve backups and record the cutover decision.
