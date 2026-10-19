# Architecture — VISMART Retail Growth (candidate v0.1)
Status: WORKING DESIGN; major decisions pending qualification

## Runtime boundaries
- Frontend/BFF: existing Next.js 16 App Router project (merchant/storefront/admin views).
- Business application: tenant-scoped merchant, offer, campaign, coupon, order, subscription and entitlement modules.
- Authoritative state: PostgreSQL. Supabase is a candidate, NOT YET VERIFIED for this particular product. Do not use any other product's database as a shortcut.
- Async execution: persistent job queue with retry, idempotency key, timeout, dead-letter and replay (choose a single runtime after proof of compatibility).
- AI: provider-agnostic gateway; model produces validated offer/creative JSON. No arbitrary generated source execution, no unbounded tool authority.
- Integration adapters: payment provider, WhatsApp delivery and campaign media. Adapters must be swappable.
- Observability: correlated request/order/campaign IDs, audit log, error reporting, usage/cost counters.

## Diagram
Lead intake -> Qualification -> Preview -> Approved quote -> Verified payment
  -> Order state machine -> Intake validation -> Template render -> QA
  -> Merchant approval -> Versioned publish -> Delivery
  -> CampaignPublished event -> Opt-in WhatsApp integration
Owner dashboard reads server-verified aggregates; merchant reads only own authorized tenant; customer reads own consented coupon/wallet.

## Application modules
Identity and organizations | merchants | offer_catalog | template_registry | campaigns/campaign_versions | prizes/coupons/redemptions | payments/orders | plan_entitlements | customers/consent | AI tasks | events/outbox | usage/analytics | audit/alerts

## Example state models
Order: lead, qualified, quoted, payment_pending, paid, intake_pending, building, review_pending, published, delivered, needs_attention, cancelled, refunded.
Campaign: draft, validated, preview, approved, scheduled, active, paused, expired, archived.
Coupon: issued, redeemed, expired, cancelled.

## Cross-cutting contracts
1. Each request deriving merchant data must authorize organization membership on the server and in database RLS. Verify SELECT and UPDATE/WITH CHECK policies separately.
2. Store public pages expose only approved active campaign fields; internal stats, contact lists, unpublished offers and billing remain private.
3. Any webhook verifies provider signature, stores provider event ID uniquely, deduplicates, atomically changes order state, and publishes follow-up work through a durable outbox.
4. Every campaign has an immutable published version and explicit merchant approval history.
5. A user-supplied offer must be checked for inventory, dates, truthful claims, minimum purchase and legal constraints.
6. Human approval gates: payouts/refunds, unapproved prices, sensitive exports, mass messages and high-risk merchant claims.
7. AI/data APIs use least privilege and log identifiers, NOT raw sensitive customer records.
8. Cookie consent separates essential functions from optional analytics/marketing and records policy version, purposes and withdrawal.
9. Never present fake revenue as measured revenue; redemption != purchase.
10. Service catalog, modules, feature flags and plan entitlements permit future hidden products without leaking them now.

## Current repo gaps (source-audited, not live-tested)
- `src/lib/auth-server.ts` had known hardcoded fallback credentials; first branch removes them, further migration to user identity/MFA remains required.
- `src/app/store/[slug]/StoreCampaignClient.tsx` still hardcodes Nahata branding and uses browser-local merchant data.
- `src/lib/store.ts` uses per-process and localStorage state; cannot be authoritative across server instances.
- `src/lib/whatsapp.ts` includes Nahata-only copy and contact defaults.
- Admin counts originate in part from localStorage. New /control must not invent database records.
- Schema migrations contain initial tenant policies, not verified against an active product database.
- Two Vercel projects point to different historical commits; production release target must be selected and source-mapped before deployment.

## Environments and deployment safety
Branch PR -> CI typecheck/lint/tests -> isolated preview -> staged database -> release approval -> monitored deploy. No direct main/prod edits; no shared WACRM database until separately scoped and approved. Backup and restore drill before any schema cutover.

## Next accepted increments
See IMPLEMENTATION-ROADMAP.md. This document is not a substitute for validated database schema, per-feature tests or deployed verification.
