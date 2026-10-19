# Small, Independently Verifiable Work Packages
Each package requires: PR scope, exact source files, verification report, rollback notes, and owner acceptance.
Status values: TODO / IN_PROGRESS / IN_PR / VERIFIED / BLOCKED.

| ID | Status | Small deliverable | Pass condition |
| --- | --- | --- | --- |
| F-001 | IN_PR | No shipped fallback admin passcode/session secret | Missing secrets disable login; auth tests pass |
| F-002 | IN_PR | Auth-gated clean /control overview | Unauthorized redirected; no fake data/PII; no actions triggered |
| F-003 | TODO | Prod source/deployment mapping for both Vercel projects | Domain -> deployment -> Git SHA -> env plan documented |
| F-004 | TODO | Decide isolated Offer SaaS DB and staging | Dedicated project, ownership and rollback plan confirmed |
| F-005 | TODO | Auth migration to owner/merchant users and MFA | Tenant A cannot read or modify Tenant B; staff permissions tested |
| F-006 | TODO | Server-backed merchant directory and dashboard KPIs | Numbers match database across sessions/devices |
| F-007 | TODO | Store campaign public renderer | Two distinct merchants render correct branding with separate data |
| F-008 | TODO | Template registry and offer JSON validator | Invalid discounts/prizes/expiry rejected before publish |
| F-009 | TODO | Versioned preview / approval / publish | Draft cannot silently overwrite live published terms |
| F-010 | TODO | Atomic coupon claims and redemptions | Parallel claims/redeems cannot overspend or double-redeem |
| F-011 | TODO | Plan catalog, limits, feature flags | UI/actions enforce entitlements server-side |
| F-012 | TODO | Payment order ledger + verified webhooks | Repeated/out-of-order webhook yields one correct order |
| F-013 | TODO | AI assisted merchant intake and preview | Deterministic validated JSON and approval gate |
| F-014 | TODO | Durable job processing with retries | Interrupted build resumes once, exception visible in admin |
| F-015 | TODO | WhatsApp CampaignPublished handoff | Opt-in checked; delivery engine independent |
| F-016 | TODO | Consumer wallet and consent preferences | Secure customer ownership, deletion/withdrawal path |
| F-017 | TODO | Analytics with event taxonomy | Counts verified against sampled claim/redemption records |
| F-018 | TODO | Renewal automation, billing portal and support operations | Merchant can self-serve; owner can safely intervene |
| F-019 | TODO | Pilot, load/backup/restore and cost budget gates | Paid pilot results, documented baseline and recovery drill |
| F-020 | TODO | Resolve legacy full-repository ESLint errors | All historical files pass npm run lint; scoped lint stays required meanwhile |

## Operating rules
- F-001/F-002 are foundation, not finished multi-tenant identity.
- No third-party service is installed merely because it is popular; shortlist, evaluate license and resource cost, then integrate in a dedicated PR.
- Do not start customer bulk messaging, tracking or charging real customers from a development environment.
- Updates belong in Git commits and reviewable PRs. Existing campaign main branch must stay unaffected.
