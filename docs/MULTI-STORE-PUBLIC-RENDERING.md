# Multi-store public offer rendering (OF-20 partial)
Date: 2026-10-19 | Implementation: source patch; not live deployed.

## Functional slice
`/store/[slug]` now loads active merchant, a date-active campaign and its inventory-available prizes from **server database only**, with strong tenant association checks and no mock/localStorage fallback. The public page is a branded, accessible, responsive **read-only offer catalog**, not the full campaign claim system. It presents official campaign terms and a valid merchant-controlled WhatsApp enquiry link. Unknown, suspended, pending, future, expired, no-prize or database-unavailable stores fail closed to 404 rather than showing Nahata's data.

## Deliberate safety boundary
Current `FestivalOfferFunnel`, prize allocation server action, and existing claim/RPC paths have non-durable mock fallbacks, legacy tenant assumptions and SQL security findings. Do NOT expose these game/claim flows to multi-merchant customers until claims, coupon issuance, session state, authorization and RLS are independently hardened and tested. Public catalog does not promise a coupon or apply automatic discounts.

## Dependencies
- Verified merchant/campaign/prize tables/migrations and correct RLS/grants, by provider-authenticated read.
- `NEXT_PUBLIC_SUPABASE_URL` and supported server-side API credentials installed in deployment settings, not source-controlled.
- Versioned campaign publication and merchant-specific approvals remain planned.
- Check legacy branding in other pages and WhatsApp helpers before enabling any interactive multi-merchant funnel.
- Production deployment of this feature requires explicit safe migration, backup, staged E2E and security gate signoff.

## Tests and acceptance
`node --experimental-strip-types --test scripts/public-store.test.mjs`: verifies valid slug, store and tenant association, statuses, campaign dates, prize allocation availability, no mock fallback and safe public projection.
CI also runs auth tests, locked package install, TypeScript check and Next.js build. Passing CI is not evidence that database is configured or RLS secure.
