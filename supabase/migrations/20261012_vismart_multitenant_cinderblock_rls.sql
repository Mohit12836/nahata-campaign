-- ==============================================================================
-- VISMART OFFER MANAGEMENT SAAS — ENTERPRISE MULTI-TENANT ARCHITECTURE
-- Migration: 20261012_vismart_multitenant_cinderblock_rls.sql
-- Inspired by Cinderblock Security Engine & Multi-Tenant RLS Best Practices
-- ==============================================================================

-- 1. EXTEND MERCHANTS WITH SAAS TENANT SETTINGS
alter table if exists public.merchants
  add column if not exists business_gst text,
  add column if not exists billing_cycle text default 'monthly',
  add column if not exists custom_domain text,
  add column if not exists settings jsonb default '{"enable_spin": true, "enable_scratch": true, "sms_notifications": false, "auto_whatsapp_share": true}'::jsonb;

-- 2. ORGANIZATION MEMBERS & RBAC TABLE (Cinderblock Workspace Pattern)
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null references public.merchants(id) on delete cascade,
  user_id uuid not null, -- references auth.users(id) when Supabase Auth is active
  role text not null check (role in ('owner', 'admin', 'cashier', 'viewer')) default 'cashier',
  invited_by uuid,
  created_at timestamptz default now(),
  constraint unique_user_merchant unique (merchant_id, user_id)
);

create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_org_members_merchant on public.organization_members(merchant_id);

-- 3. CAMPAIGN ATTRIBUTION & REFERRAL TRACKING (Dub.co Pattern)
alter table if exists public.coupons
  add column if not exists referrer_code text,
  add column if not exists share_count integer default 0,
  add column if not exists bonus_claimed boolean default false,
  add column if not exists bonus_amount numeric default 0;

create table if not exists public.campaign_referral_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.campaigns(id) on delete cascade,
  coupon_code text not null,
  share_platform text not null default 'whatsapp',
  client_ip text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists idx_referral_coupon on public.campaign_referral_logs(coupon_code);

-- ==============================================================================
-- CINDERBLOCK-GRADE SECURITY HELPER FUNCTIONS
-- ==============================================================================

-- Helper: Check if current authenticated user belongs to the target merchant
create or replace function public.is_org_member(
  p_merchant_id text,
  p_required_role text default null
)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_user_id uuid;
  v_role text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  select role into v_role
  from public.organization_members
  where merchant_id = p_merchant_id and user_id = v_user_id;

  if v_role is null then
    return false;
  end if;

  if p_required_role is null then
    return true;
  end if;

  if p_required_role = 'owner' and v_role = 'owner' then
    return true;
  elsif p_required_role = 'admin' and v_role in ('owner', 'admin') then
    return true;
  elsif p_required_role = 'cashier' and v_role in ('owner', 'admin', 'cashier') then
    return true;
  elsif p_required_role = 'viewer' then
    return true;
  end if;

  return false;
end;
$$;

-- Helper: Get list of merchant IDs accessible by current user
create or replace function public.get_user_merchant_ids()
returns setof text
language sql
security definer
stable
set search_path = public
as $$
  select merchant_id
  from public.organization_members
  where user_id = auth.uid();
$$;

-- ==============================================================================
-- MULTI-TENANT ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Merchant A can NEVER read or modify Merchant B's data
-- ==============================================================================
alter table public.organization_members enable row level security;
alter table public.campaign_referral_logs enable row level security;

-- Organization Members: Members can view their own team; Owners can manage team
create policy "Users can view members of their own merchants"
  on public.organization_members
  for select
  using (
    merchant_id in (select public.get_user_merchant_ids())
    or auth.role() = 'service_role'
  );

create policy "Owners and Admins can manage members"
  on public.organization_members
  for all
  using (
    public.is_org_member(merchant_id, 'admin')
    or auth.role() = 'service_role'
  );

-- Merchants RLS Upgrade:
drop policy if exists "Admin can manage all merchants" on public.merchants;
create policy "Owners and Admins can update their own merchant record"
  on public.merchants
  for update
  using (
    public.is_org_member(id, 'admin')
    or auth.role() = 'service_role'
  );

create policy "Super admin can manage all merchants"
  on public.merchants
  for all
  using (
    auth.jwt() ->> 'role' = 'super_admin'
    or auth.role() = 'service_role'
  );

-- Campaigns RLS Upgrade:
drop policy if exists "Public can read active campaigns" on public.campaigns;
create policy "Public can read active campaigns"
  on public.campaigns
  for select
  using (is_active = true);

create policy "Merchant staff can manage their own campaigns"
  on public.campaigns
  for all
  using (
    public.is_org_member(merchant_id, 'admin')
    or auth.role() = 'service_role'
  );

-- Prizes RLS Upgrade:
drop policy if exists "Public can read active prizes" on public.prizes;
create policy "Public can read active prizes"
  on public.prizes
  for select
  using (is_active = true);

create policy "Merchant staff can manage prizes for their own campaigns"
  on public.prizes
  for all
  using (
    campaign_id in (
      select id from public.campaigns
      where merchant_id in (select public.get_user_merchant_ids())
    )
    or auth.role() = 'service_role'
  );

-- Coupons RLS Upgrade:
-- Cashiers & Admins can read & update coupons strictly for their OWN merchant
drop policy if exists "Admin can manage all coupons" on public.coupons;
create policy "Merchant staff can view and redeem coupons for their own campaigns"
  on public.coupons
  for all
  using (
    campaign_id in (
      select id from public.campaigns
      where merchant_id in (select public.get_user_merchant_ids())
    )
    or auth.role() = 'service_role'
  );

-- Referral Logs:
create policy "Public can insert referral logs"
  on public.campaign_referral_logs
  for insert
  with check (true);

create policy "Merchant staff can view referral logs for their campaigns"
  on public.campaign_referral_logs
  for select
  using (
    campaign_id in (
      select id from public.campaigns
      where merchant_id in (select public.get_user_merchant_ids())
    )
    or auth.role() = 'service_role'
  );

-- ==============================================================================
-- STORED FUNCTION: LOG CAMPAIGN SHARE & VIRAL ATTRIBUTION (Dub.co Pattern)
-- ==============================================================================
create or replace function public.log_campaign_share(
  p_coupon_code text,
  p_platform text default 'whatsapp'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon record;
  v_next_share integer;
  v_unlocked boolean := false;
begin
  select * into v_coupon
  from public.coupons
  where upper(trim(code)) = upper(trim(p_coupon_code))
  for update;

  if v_coupon.id is null then
    return jsonb_build_object('success', false, 'message', 'अमान्य कूपन कोड');
  end if;

  v_next_share := coalesce(v_coupon.share_count, 0) + 1;
  if v_next_share >= 5 and coalesce(v_coupon.bonus_claimed, false) = false then
    v_unlocked := true;
  end if;

  update public.coupons
  set
    share_count = v_next_share,
    bonus_claimed = case when v_unlocked then true else bonus_claimed end,
    bonus_amount = case when v_unlocked then 50 else bonus_amount end
  where id = v_coupon.id;

  insert into public.campaign_referral_logs (campaign_id, coupon_code, share_platform)
  values (v_coupon.campaign_id, v_coupon.code, p_platform);

  return jsonb_build_object(
    'success', true,
    'share_count', v_next_share,
    'bonus_unlocked', v_unlocked,
    'bonus_amount', case when v_unlocked then 50 else coalesce(v_coupon.bonus_amount, 0) end
  );
end;
$$;

revoke all on function public.log_campaign_share from public;
grant execute on function public.log_campaign_share to anon, authenticated, service_role;
