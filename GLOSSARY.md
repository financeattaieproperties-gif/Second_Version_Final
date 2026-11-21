# Attaie Properties

Attaie Properties operates a public property website and separate internal staff workspaces.

## Language

**V1**:
The existing live Attaie Properties installation and its existing business records.

**V2**:
The replacement website and staff workspaces being prepared for a single complete release on `attaieproperties.com`.

**Website Admin**:
The administrator responsible for public listings, website inquiries, messages, and publication review. Authenticated via `admin_users` session cookies.
_Avoid_: CEO, Staff Admin

**CEO**:
The internal staff role with global oversight across branches (`branch_id = NULL`). Authenticated via Firebase Auth mapped to `core_users`.

**Manager**:
The internal staff role with operational oversight strictly scoped to an assigned branch (`branch_id`).
_Avoid_: Branch Manager, HR Manager, Production Manager

**Lead Owner**:
The single primary staff agent responsible for a customer lead (`crm_customer_owners`). Cross-branch collaboration uses shared access or logged referrals.
_Avoid_: Co-owner, Secondary Owner

**Lead Referral**:
A logged transfer of customer lead responsibility between branches requiring manager authorization (`crm_lead_referrals`).
_Avoid_: Direct reassignment, silent transfer

**Desktop Shell**:
A thin Electron wrapper around the shared static Vite staff web bundles (`callcenter-desktop`, `sales-desktop`) providing OS desktop integration.
_Avoid_: Standalone desktop client, native application

**Production launch**:
The transition of `attaieproperties.com` to the verified V2 release (preserving existing live business data, or starting with a fresh database when explicitly authorized to replace test-only data).
_Avoid_: testing deployment
