-- Enforce campaign lifecycle rules in the database claim path.
-- This migration is intentionally separate from the baseline schema so existing
-- environments can apply it after reviewing the campaign date semantics.

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
  v_campaign record;
begin
  v_clean_phone := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  if length(v_clean_phone) != 10 or v_clean_phone !~ '^[6-9][0-9]{9}$' then
    return jsonb_build_object('status', 'ERROR', 'message', 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।');
  end if;

  if p_consent is not true then
    return jsonb_build_object('status', 'ERROR', 'message', 'ऑफर प्राप्त करने के लिए व्हाट्सएप सहमति आवश्यक है।');
  end if;

  -- Serialize claims for the same campaign/phone to prevent duplicate concurrent claims.
  perform pg_advisory_xact_lock(hashtext(coalesce(p_campaign_id, '')), hashtext(v_clean_phone));

  -- Lock the campaign row so an administrator cannot deactivate/change its dates
  -- in the middle of a claim transaction.
  select id, is_active, start_date, end_date
    into v_campaign
  from public.campaigns
  where id = p_campaign_id
  for share;

  if v_campaign.id is null then
    return jsonb_build_object('status', 'ERROR', 'message', 'यह कैंपेन उपलब्ध नहीं है।');
  end if;

  if v_campaign.is_active is distinct from true
     or v_campaign.start_date > now()
     or v_campaign.end_date < now() then
    return jsonb_build_object('status', 'ERROR', 'message', 'यह कैंपेन अभी सक्रिय नहीं है या इसकी अवधि समाप्त हो चुकी है।');
  end if;

  select c.id, c.code, c.status, c.expires_at, p.title as prize_title, p.terms_and_conditions
    into v_existing_coupon
  from public.coupons c
  left join public.prizes p on p.id = c.prize_id
  where c.customer_phone = v_clean_phone and c.campaign_id = p_campaign_id
  limit 1;

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

  if p_target_prize_id is not null then
    select * into v_selected_prize
    from public.prizes
    where id = p_target_prize_id
      and campaign_id = p_campaign_id
      and is_active = true
      and claimed_quantity < total_quantity
    for update;
  end if;

  if v_selected_prize.id is null then
    select * into v_selected_prize
    from public.prizes
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

  insert into public.customers (
    phone, full_name, city, business_category, lead_source, whatsapp_consent, consent_timestamp
  )
  values (
    v_clean_phone, trim(p_name), coalesce(p_city, 'कुशलगढ़'),
    coalesce(p_category, 'घरेलू उपभोक्ता (Family / Home)'),
    upper(coalesce(p_game_type, 'unknown')) || '_CAMPAIGN', true, now()
  )
  returning id into v_customer_id;

  v_coupon_code := 'NAHATA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' || floor(1000 + random() * 9000)::text;
  v_expires_at := least(now() + interval '7 days', v_campaign.end_date);

  insert into public.coupons (
    code, campaign_id, customer_phone, customer_id, prize_id, status, expires_at
  )
  values (
    v_coupon_code, p_campaign_id, v_clean_phone, v_customer_id, v_selected_prize.id, 'valid', v_expires_at
  )
  returning id into v_coupon_id;

  update public.prizes
  set claimed_quantity = claimed_quantity + 1
  where id = v_selected_prize.id
    and claimed_quantity < total_quantity;

  if not found then
    raise exception 'Prize inventory changed during claim; transaction rolled back';
  end if;

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

revoke all on function public.claim_campaign_prize(text, text, text, text, text, text, boolean, text) from public;
grant execute on function public.claim_campaign_prize(text, text, text, text, text, text, boolean, text) to anon, authenticated, service_role;
