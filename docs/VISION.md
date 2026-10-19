# VISMART Retail Growth — Vision (working)
Status: IMPLEMENTATION STARTED / NOT ARCHITECTURE-FROZEN
Updated: 2026-10-19

## Outcome
One-person-operated, AI-assisted multi-tenant retail campaign platform. The merchant pays for measurable campaign value (offers, valid coupons and in-store redemption), not merely a static landing page.

## Initial product
- Merchant selects AI-assisted offers or supplies a custom offer. All price/stock/terms inputs require merchant approval.
- Reusable store-branded, mobile-first templates; one runtime serves all merchant campaign URLs.
- Sales lead -> qualified preview -> approved tier/quote -> verified payment -> merchant details -> preview -> approval -> publish -> delivery.
- Owner control center: merchants, plans, feature controls, audit, health, approvals, exceptions, spend.
- Merchant workspace: own campaigns, QR/links, coupon redemption and verified metrics.
- Customer: coupon claim/wallet first; future full portal only after adoption.
- WhatsApp distribution is a separate, permissioned subsystem connected through events.

## Business boundaries
- Price quotes follow owner-configured plan rules; no AI-invented pricing.
- Future services are hidden until launched and entitled.
- No silent re-use of merchant customer records for cross-service advertising.
- Analytics distinguish measured clicks, claims, verified redemptions and actual purchases.
- Early product/market fit requires paid merchants, repeat campaigns and controlled pilots.

## Engineering principles
Reuse audited existing code and permissively licensed packages. Prefer a modular monolith plus scalable workers over premature microservices. No tenant data in browser localStorage as the system of record. Adopt schemas, idempotency, replayable events, audit logs, clean failure handling and explicit approvals.
