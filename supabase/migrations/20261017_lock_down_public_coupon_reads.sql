-- Restrict public coupon access.
-- Coupon verification must be performed through a server-mediated action that
-- returns only the minimum fields needed for the supplied code. Never expose
-- the coupons table to anonymous table scans.
drop policy if exists "Public can verify own coupon by code" on public.coupons;
revoke select on table public.coupons from anon;
revoke select on table public.coupons from public;

-- Authenticated merchant access remains governed by the tenant-scoped RLS
-- policies installed by 20261012_vismart_multitenant_cinderblock_rls.sql.
-- Service-role access is privileged and must be explicitly scoped in server actions.
