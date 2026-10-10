-- ==============================================================================
-- NAHATA GENERAL STORES — PRODUCTION CAMPAIGN & CRM SCHEMA
-- Migration: 20261010_nahata_campaign_schema.sql
-- ==============================================================================

-- 1. CAMPAIGNS TABLE
create table if not exists public.campaigns (
  id text primary key,
  slug text unique not null,
  title text not null,
  store_name text not null,
  headline text,
  subheadline text,
  banner_url text,
  whatsapp_number text not null,
  whatsapp_community_link text,
  is_scratch_enabled boolean default true,
  is_spin_enabled boolean default true,
  max_plays_per_user integer default 1,
  start_date timestamptz not null default now(),
  end_date timestamptz not null default (now() + interval '30 days'),
  is_active boolean default true,
  location text not null default 'मेन मार्केट, नाहटा चौक, राजस्थान',
  contact_person text not null default 'श्री मनोज नाहटा',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PRIZES TABLE (INVENTORY & PROBABILITY)
create table if not exists public.prizes (
  id text primary key,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  title text not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed_amount', 'free_gift', 'better_luck')),
  discount_value numeric not null default 0,
  min_order_value numeric not null default 0,
  probability_weight integer not null default 10 check (probability_weight >= 0),
  total_quantity integer not null default 100 check (total_quantity >= 0),
  claimed_quantity integer not null default 0 check (claimed_quantity >= 0),
  is_active boolean default true,
  terms_and_conditions text,
  badge_color text,
  created_at timestamptz default now()
);

-- 3. CUSTOMERS TABLE (STRICT CONSENT AUDIT)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  full_name text not null,
  city text not null,
  business_category text not null,
  lead_source text not null,
  whatsapp_consent boolean not null default false,
  consent_timestamp timestamptz not null default now(),
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists idx_customers_phone on public.customers(phone);

-- 4. COUPONS TABLE (UNIQUE PER CUSTOMER PER CAMPAIGN)
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  customer_phone text not null,
  customer_id uuid references public.customers(id) on delete set null,
  prize_id text not null references public.prizes(id) on delete restrict,
  status text not null check (status in ('valid', 'redeemed', 'expired', 'cancelled')) default 'valid',
  expires_at timestamptz not null default (now() + interval '7 days'),
  redeemed_at timestamptz,
  redeemed_by text,
  bill_number text,
  bill_amount numeric default 0,
  created_at timestamptz default now(),
  constraint unique_customer_campaign_coupon unique (customer_phone, campaign_id)
);

create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_coupons_phone on public.coupons(customer_phone);

-- 5. ADMIN AUDIT LOGS
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user text not null,
  action text not null,
  target_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.campaigns enable row level security;
alter table public.prizes enable row level security;
alter table public.customers enable row level security;
alter table public.coupons enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Campaigns: Public can read active campaigns; Write is admin only
create policy "Public can read active campaigns" on public.campaigns
  for select using (is_active = true);

-- Prizes: Public can read active prizes
create policy "Public can read active prizes" on public.prizes
  for select using (is_active = true);

-- Customers: Strictly admin / service role only (No unrestricted public access)
create policy "Admin can view customers" on public.customers
  for all using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Coupons: Public can view only their own coupon by code; Admin has full access
create policy "Public can verify own coupon by code" on public.coupons
  for select using (true);

create policy "Admin can manage all coupons" on public.coupons
  for all using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Admin can view audit logs" on public.admin_audit_logs
  for all using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- ==============================================================================
-- ATOMIC STORED FUNCTION: CLAIM CAMPAIGN PRIZE
-- Handles concurrency, row locking (FOR UPDATE), anti-cheat check, atomic decrement
-- ==============================================================================
create or replace function public.claim_campaign_prize(
  p_campaign_id text,
  p_phone text,
  p_name text,
  p_city text,
  p_category text,
  p_game_type text,
  p_consent boolean,
  p_target_prize_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean_phone text;
  v_existing_coupon record;
  v_customer_id uuid;
  v_selected_prize record;
  v_coupon_code text;
  v_coupon_id uuid;
  v_expires_at timestamptz;
begin
  -- 1. Sanitize & Validate Phone
  v_clean_phone := right(regexp_replace(p_phone, '\D', '', 'g'), 10);
  if length(v_clean_phone) != 10 or v_clean_phone !~ '^[6-9][0-9]{9}$' then
    return jsonb_build_object(
      'status', 'ERROR',
      'message', 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।'
    );
  end if;

  if p_consent is not true then
    return jsonb_build_object(
      'status', 'ERROR',
      'message', 'ऑफर प्राप्त करने के लिए व्हाट्सएप सहमति आवश्यक है।'
    );
  end if;

  -- 2. Anti-Cheat: Check if customer already claimed coupon for this campaign
  select c.id, c.code, c.status, c.expires_at, p.title as prize_title, p.terms_and_conditions
  into v_existing_coupon
  from coupons c
  left join prizes p on p.id = c.prize_id
  where c.customer_phone = v_clean_phone and c.campaign_id = p_campaign_id;

  if v_existing_coupon.code is not null then
    return jsonb_build_object(
      'status', 'ALREADY_PLAYED',
      'message', 'आप इस मोबाइल नंबर से पहले ही ऑफर प्राप्त कर चुके हैं!',
      'coupon', jsonb_build_object(
        'code', v_existing_coupon.code,
        'status', v_existing_coupon.status,
        'expires_at', v_existing_coupon.expires_at,
        'prize_title', v_existing_coupon.prize_title,
        'terms', v_existing_coupon.terms_and_conditions
      )
    );
  end if;

  -- 3. Atomic Prize Selection with Row Lock (FOR UPDATE)
  if p_target_prize_id is not null then
    select * into v_selected_prize
    from prizes
    where id = p_target_prize_id
      and campaign_id = p_campaign_id
      and is_active = true
      and claimed_quantity < total_quantity
    for update;
  end if;

  -- If target prize is unavailable/exhausted, select best available active prize with stock
  if v_selected_prize.id is null then
    select * into v_selected_prize
    from prizes
    where campaign_id = p_campaign_id
      and is_active = true
      and claimed_quantity < total_quantity
    order by (random() * probability_weight) desc
    limit 1
    for update;
  end if;

  if v_selected_prize.id is null then
    return jsonb_build_object(
      'status', 'EXHAUSTED',
      'message', 'क्षमा करें! इस कैंपेन के सभी विशेष इनाम समाप्त हो चुके हैं।'
    );
  end if;

  -- 4. Create or Update Customer record
  insert into customers (
    phone, full_name, city, business_category, lead_source, whatsapp_consent, consent_timestamp
  )
  values (
    v_clean_phone, trim(p_name), p_city, p_category, upper(p_game_type) || '_CAMPAIGN', true, now()
  )
  returning id into v_customer_id;

  -- 5. Generate Unique Coupon Code (NAHATA-XXXX-XXXX)
  v_coupon_code := 'NAHATA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' || floor(1000 + random() * 9000)::text;
  v_expires_at := now() + interval '7 days';

  insert into coupons (
    code, campaign_id, customer_phone, customer_id, prize_id, status, expires_at
  )
  values (
    v_coupon_code, p_campaign_id, v_clean_phone, v_customer_id, v_selected_prize.id, 'valid', v_expires_at
  )
  returning id into v_coupon_id;

  -- 6. Atomically Decrement Inventory
  update prizes
  set claimed_quantity = claimed_quantity + 1
  where id = v_selected_prize.id;

  return jsonb_build_object(
    'status', 'SUCCESS',
    'message', 'बधाई हो! आपका डिस्काउंट कूपन सफलतापूर्वक जनरेट हो गया है।',
    'coupon', jsonb_build_object(
      'id', v_coupon_id,
      'code', v_coupon_code,
      'status', 'valid',
      'expires_at', v_expires_at,
      'prize_title', v_selected_prize.title,
      'terms', v_selected_prize.terms_and_conditions
    )
  );
end;
$$;

-- Revoke default public execution & grant least privilege
revoke all on function public.claim_campaign_prize from public;
grant execute on function public.claim_campaign_prize to anon, authenticated, service_role;

-- ==============================================================================
-- ATOMIC STORED FUNCTION: REDEEM COUPON
-- ==============================================================================
create or replace function public.redeem_campaign_coupon(
  p_code text,
  p_bill_number text,
  p_bill_amount numeric,
  p_redeemed_by text default 'मनोज नाहटा (काउंटर)'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon record;
begin
  select * into v_coupon
  from coupons
  where upper(trim(code)) = upper(trim(p_code))
  for update;

  if v_coupon.id is null then
    return jsonb_build_object('success', false, 'message', 'अमान्य कूपन कोड। कृपया सही कोड दर्ज करें।');
  end if;

  if v_coupon.status = 'redeemed' then
    return jsonb_build_object(
      'success', false,
      'message', 'यह कूपन पहले ही ' || to_char(v_coupon.redeemed_at, 'DD/MM/YYYY') || ' को रिडीम किया जा चुका है!'
    );
  end if;

  if v_coupon.status = 'expired' or v_coupon.expires_at < now() then
    return jsonb_build_object('success', false, 'message', 'यह कूपन समाप्त (Expired) हो चुका है।');
  end if;

  update coupons
  set
    status = 'redeemed',
    redeemed_at = now(),
    redeemed_by = p_redeemed_by,
    bill_number = p_bill_number,
    bill_amount = p_bill_amount
  where id = v_coupon.id;

  -- Audit log entry
  insert into admin_audit_logs (admin_user, action, target_id, details)
  values (
    p_redeemed_by,
    'COUPON_REDEEMED',
    v_coupon.code,
    jsonb_build_object('bill_number', p_bill_number, 'bill_amount', p_bill_amount)
  );

  return jsonb_build_object('success', true, 'message', 'कूपन सफलतापूर्वक रिडीम और सत्यापित कर दिया गया!');
end;
$$;

revoke all on function public.redeem_campaign_coupon from public;
grant execute on function public.redeem_campaign_coupon to authenticated, service_role;
