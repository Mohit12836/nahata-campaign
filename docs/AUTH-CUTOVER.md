# Nahata Admin Credential Cutover — STAGING ONLY
Date: 2026-10-19 | PR scope: fail-closed credential config, not a complete SaaS identity system.

## Why
Before this patch, `src/lib/auth-server.ts` had source-controlled fallback admin credentials used when environment variables were absent. The revised configuration requires an explicit strong session signing secret and six-to-twelve-digit temporary admin PIN; both fail closed when missing. The original credential values are not reproduced here.

## Pre-deployment requirements (NOT completed)
1. Verify the exact production Vercel project, Git commit, custom domains, and whether the vulnerable version is deployed.
2. Arrange a tested backup and roll-back; identify all serverless environments and affected identities.
3. Generate a fresh independent random `ADMIN_SESSION_SECRET` (at least 32 characters) in the provider secret manager, never a repository file.
4. Set a new `ADMIN_PIN` in provider secrets with six-to-twelve numeric digits; do not reuse an old/source-controlled PIN. Clear deprecated `ADMIN_SECURITY_PIN` once migrated.
5. Run new `node --experimental-strip-types --test scripts/admin-auth-config.test.mjs` on Node 22+, TypeScript typecheck, Next build, integration/session/regression tests and deployed smoke tests.
6. Verify missing envs block login, existing sessions are revoked after rotating signing secret, invalid/admin requests are denied and sensitive values are never logged.
7. Before multi-tenant production rollout, REPLACE shared PIN login with per-user identities, merchant roles, independent superadmin role, MFA and revocable sessions. Do not mark this narrow patch as finished auth security.
8. Staged cutover requires owner-reviewed deployment/rollback and incident coordination. Never deploy first and configure secrets later.

## Known additional blocked issues
- `/store/[slug]` loads localStorage-backed merchant data and hardcoded campaign copy; it is not yet a tenant-safe template factory.
- Process-local rate limits and mock storage are not reliable across multi-instance production.
- RLS migrations are only committed schema intent; independently inspect applied database and tenant isolation before allowing real customers.
- See https://github.com/Mohit12836/nahata-campaign/issues/6 and VISMART runtime/security trackers #13/#10 in `vismart-ai-closer`.

## Verification log
Only tests actually run may be claimed as passed; GitHub PR does not prove app build/deployment. Production state unchanged by this patch.
