# Source Security Findings — Work In Progress
Inspected on 2026-10-19. This is not a penetration test.

## Critical blocker: default administrator credentials
Original `src/lib/auth-server.ts` returned a fixed secret when ADMIN_SESSION_SECRET was missing and a fixed PIN when ADMIN_PIN was missing. A deployed instance without explicit env variables could accept public fallback credentials. F-001 removes those fallback values on the feature branch. Verify deployment env **without logging or committing secrets** before merging. Migrate from single shared PIN to per-user Auth + MFA (F-005).

## Isolation blocker
`src/app/store/[slug]/StoreCampaignClient.tsx` combines client-local merchants with hardcoded Nahata fields. `src/lib/store.ts` falls back to process memory/browser storage. Must switch to server-verified tenant/campaign data before offering as SaaS.

## Policy and production verification
Current Supabase migration SQL includes policies and SECURITY DEFINER functions; require review of search_path, EXECUTE grants, auth claim trust, service-role exposure, WITH CHECK, and public read filters. Do not apply existing migrations to an unrelated project automatically.

## Existing environment mapping
- Vercel: `nahata-campaign` latest production deployment metadata references commit `8f14728`.
- Vercel: `nahata-general-stores` latest production deployment metadata references commit `28e7b9c`.
- GitHub `main` at initial inspection: `28e7b9c`.
- No separately identified ACTIVE database for Offer SaaS was found in available Supabase connections. One active connected project belongs to WACRM and is out of scope.
- Deployment URLs, DNS and actual runtime behavior need follow-up verification; Vercel metadata alone does not prove functional health.

## First branch verification
- [ ] CI build and lint passed
- [ ] No-secret login denied
- [ ] With configured credentials, login + /control works
- [ ] Without admin session, /control redirects
- [ ] Database missing: no invented KPIs
- [ ] Existing customer campaign smoke tests passed
- [ ] Review + merge approval documented
