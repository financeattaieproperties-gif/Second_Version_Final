# Main-domain production release design

Date: 2026-11-16. **Status: builder review complete; awaiting owner approval. Implementation has not started.**

## Intent and owner decisions

Prepare the existing Attaie Properties V2 codebase as one complete, verifiable release for `https://attaieproperties.com`. The owner explicitly chose preservation/migration of existing live data and a single release after every check passes. The selected approach is an isolated V2 copy: migrate and verify copies of existing data before the main domain switches.

All public pages, Website Admin, and the eight canonical staff entry URLs are in scope. Preserve the existing public design, Alabaster dashboards, English/Dari, RTL, accessibility, business history, existing public URLs, and separation between website administration and internal staff operations.

The owner also explicitly requires all existing integrations to work before launch: calls, Maps, chat/AI, Google Workspace, Website Admin Google login, and staff Firebase. None is deferred for the production acceptance decision.

See [the readiness audit](../../production/2026-11-16-readiness-audit.md) for specific defects and validation limits.

## Approaches

1. **Selected: complete isolated V2 release.** Copy and migrate live data into separate V2 databases/private storage, repair source/schema/permissions, verify all panels, prepare an upload/cutover package, and switch the domain only after acceptance. This takes more preparation but gives one coherent release and a rehearsed rollback.
2. **Not selected: phased public-first release.** Launch public pages before departments. This reduces each cutover's size but prolongs split behavior and does not meet the owner's chosen single-release preference.

An in-place destructive database replacement is incompatible with the owner's preservation decision and the existing V2 isolation rules.

## Goals

- A reproducible, dependency-locked production build from a clean checkout.
- Secure working Website Admin and all staff panels against the same canonical PHP/schema/role contracts.
- A guarded preservation migration and reconciliation report for the actual live source schema.
- Production domain/origin/SEO settings with public indexing enabled and private panels excluded from indexing.
- A complete public/private upload kit, migration artifacts, hashes, clear cPanel instructions, rollback instructions, and honest verification status.
- Real behavioral tests for complete workflows, direct API denial, cross-branch isolation, concurrent writes/retries, logout/account switching, and packaged deployment paths.

## Non-goals and failure conditions

No unrelated redesign, new customer-account product, blog, new database consolidation, or native Android/Electron installer release. Preserve compatibility of existing native sources where web/shared changes affect them, but keep native artifacts out of the web upload.

Do not reset live data, silently assign old records to branches, replace real inventory with demo records, grant website Admin internal CRM access, ship preview backends, hide failed writes behind local success, or claim hosted verification from mocks/builds.

Preparation does not authorize modifying the live V1 document root/database. The final live cutover remains a separately reviewed action, after concrete artifacts and evidence are ready.

## Architecture and security

Keep the existing applications and PHP/MySQL architecture. Use three distinct V2 data stores with separate runtime users: website data, internal CRM, and publication submissions. Private staff source, sessions, chat storage, and configuration remain outside all document roots. Website Admin accesses only website data and authorized publication records. Staff APIs access internal CRM and scoped submission workflows.

Make the existing canonical CEO/Manager/branch policy authoritative across contracts, database grants, PHP, UI, and fixtures. CEO has global oversight and staff/branch provisioning. Manager and ordinary staff operate in a valid active assigned branch; Manager performs HR/project-preparation work. Assigned/team/customer ownership rules further restrict branch-local data. Retired roles cannot authenticate as active roles. Preserve historical author IDs without restoring retired permissions.

Derive ownership and branch IDs on the server. Apply authorization to list/search/count/export, direct IDs, linked records, mutations, private downloads, and publication status. Preserve CSRF, secure cookies, authentication version/session invalidation, audit history, optimistic versions, idempotency, and transactions. A database role grant and UI visibility must not substitute for a record-level check.

Website Admin password authentication must verify supported hashes only, with throttling and a migration/reset path for legacy records. If Google/Firebase Website Admin login remains enabled, give it its own configured private verifier and explicit website authorization; it must not depend on a public source-layout path or grant staff access. Staff Firebase identity continues to map exact UID to an authorized MySQL profile.

Authenticated API responses must not enter a shared user-independent service-worker cache. Keep deliberate offline records partitioned by user and clear appropriate data on logout/account change. Remove unsafe old caches on upgrade. Confirm behavior in a real two-user browser.

## Website and business workflows

Use verified migrated catalog data. Empty catalog, missing record, and temporary service failure have distinct states. Remove production fixture substitution and fabricated sitemap entries. Support complete pagination, accurate Buy/Rent filters, exact unit deep links/visit requests, blueprint display, existing inquiry receipts/offline retries, Website Admin follow-up, and cross-device chat confirmation.

Complete staff creation/assignment and engineering deliverable creation in the live client. Align inventory, lead uniqueness, deal closure, HR agreement/preparation, Finance deposits/reversals/receipts, Marketing five-photo/revision/publication, Engineering submission/review, and management tasks with canonical backend authorization and branch ownership. Success UI requires a server-confirmed write; preserve user input on failure.

Use existing components/tokens and translations. Verify active UI paths in EN/FA, RTL, mobile/desktop, keyboard/dialog focus, print, empty/loading/error states.

## Data preservation and migration

First inventory a private backup of actual live schemas, module versions, record counts, media paths, configuration shape, role meanings, and identity mappings. Do not infer current production shape from old repository `schema.sql`.

Develop guarded source-to-V2 migration steps against a restored isolated copy. Preserve IDs and foreign relationships where appropriate; otherwise keep explicit mapping tables. Preserve properties, projects/units, uploads, public slugs/URLs, inquiries/receipts, visits, applicants, users, Firebase UIDs, contracts, installments/deposits, audit history, and publication state that exist in the source installation. Missing old modules initialize without fictional business records.

Record ambiguous roles, duplicate customer/property identities, missing branches, broken media references, or unsupported schema versions. Halt before cutover until mappings are resolved; never guess. Check table counts, reference integrity, aggregate payment totals by currency, account access, uploaded files, and public URL continuity. Rehearse migration and rollback on copies; do not import fresh schemas over live databases.

For final cutover, define a short write freeze and final delta/backup procedure so writes made after the rehearsal are not lost. Record the old document root/configuration, keep compatible prior assets, and provide a restoration procedure that accounts for any new writes after launch.

## Production distribution

Add an explicit production profile for `https://attaieproperties.com` while retaining staging isolation. Produce public website, `/admin/`, `/ceo/`, `/management/`, `/sales-leader/`, `/sales/`, `/callcenter/`, `/finance/`, `/marketing/`, and `/engineering/`, with deep-link routing and current private staff service. Retain or redirect legacy staff entry URLs deliberately; do not emit an unknown `/dashboard/` role as a different workspace.

Build fresh into a new release directory. Disable previews; do not load real `.env.local`/private credentials or contact live APIs while building. Require necessary public Firebase/maps identifiers when the release enables those features. Keep source/migrations/SQL/private keys/configuration, test screenshots, stored user files, and native sources outside public output.

Produce public upload ZIP, private-outside-webroot ZIP, reviewed migration/preflight/reconciliation material, configuration templates without secrets, manifests/hashes, and cPanel/rollback/acceptance instructions. Existing uploaded user files are copied/preserved under a separate migration manifest, not replaced by repository fixtures.

Public metadata, PHP SEO, JSON-LD, sitemap, robots, API links, OAuth/Firebase authorized-domain instructions, and exact staff origin must agree on the canonical domain. Public production crawling is enabled; Admin and staff remain noindex and authenticated. Define HTTPS and alternate-host redirects without breaking APIs or existing records.

## External integrations

Harden calling transport, proxy/rate-limit handling, provider callback authentication/replay handling, and redacted errors before enabling CTC. Do not place real calls during automated tests. Calls, Maps, Google Workspace, Website Admin Google login, chat/AI, and staff Firebase are all required and need explicit configuration checks and controlled acceptance. Unconfigured integrations must show an honest unavailable state while being prepared; that state does not meet launch acceptance. A failed required integration blocks release rather than silently disappearing.

Provider account settings/secrets and live hosting evidence cannot be fabricated from source. The implementation will report required external configuration separately from local readiness.

## Verification and evidence

1. Clean locked install, dependency review, public/Admin/staff type checks, and fresh production builds.
2. PHP syntax and real isolated MySQL tests for supported schema versions, guarded migrations, constraints, transactions, preservation, and concurrent retries.
3. Complete allowed/denied API matrix for every active role and Website Admin across two branches, including direct IDs, downloads/exports, inactive accounts/branches, retired roles, and authentication switching.
4. Browser journeys against actual PHP/private-source/package layout, with preview middleware disabled. Cover public submissions/visits/chat/applicants/uploads; Website Admin CRUD/review/SEO; every staff business workflow; offline/account switching; EN/FA/RTL and responsive/keyboard/print behavior.
5. Package assertions for all required routes, correct origins/canonical/indexing, no previews/secrets/setup files in webroot, hashes/archive integrity, and current schema/service files.
6. Migration reconciliation and rollback rehearsal on isolated copies; write-freeze/final-copy checklist.
7. Owner hosting acceptance for TLS/Apache, PHP extensions, private paths/permissions, actual Firebase sign-in, integration account settings, data reconciliation, role workflows and logs before main-domain cutover.

Use separate evidence states for source review, local validation, migrated-copy validation, packaged validation, hosted acceptance, and live cutover. Unperformed checks remain explicitly unverified.

## Implementation choices and outstanding inputs

Builder choices: retain the existing stack/design; prefer narrow shared authorization helpers and versioned non-destructive migrations; make production configuration explicit; avoid broad rewrites. Fix defects with meaningful regression tests and organize work into independently verified stages.

External inputs required before final migration/cutover: private backup/schema inventory and media manifest, hosting PHP/MySQL/Apache capabilities and document-root layout, configured Firebase/Google/provider identifiers and authorized domains, legacy account/branch mapping decisions where ambiguous, and a cutover window. Obtain these through secure channels without printing passwords or user records in chat. They do not block source repairs or fictional fixture validation.

After builder review and owner approval, write the detailed implementation plan and execute it. This draft is not implementation completion or production approval.

## Builder review

A fresh reviewer found one unresolved release decision: mandatory versus deferred integrations. The owner resolved it by requiring every existing integration before launch. No other important planning questions remained. Hosting facts, migration mappings and the final cutover window remain explicit later prerequisites, not assumed approvals.
