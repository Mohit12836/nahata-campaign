import 'server-only';

import { getSupabaseServerClient } from '@/lib/supabase-server';
import {
  assemblePublicStore,
  isValidStoreSlug,
  type PublicCampaignRow,
  type PublicMerchantRow,
  type PublicPrizeRow,
  type PublicStorePage,
} from './public-store-model';

/** Server-authoritative, public-safe read path. Never use browser storage or seed data. */
export async function loadPublicStore(slug: string): Promise<PublicStorePage | null> {
  if (!isValidStoreSlug(slug)) return null;

  const db = getSupabaseServerClient();
  if (!db) {
    console.error('[public-store] Campaign database is not configured.');
    return null;
  }

  const { data: merchant, error: merchantError } = await db
    .from('merchants')
    .select('id,slug,name,category,location,shop_number,whatsapp_number,status')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (merchantError || !merchant) {
    if (merchantError) console.error('[public-store] Merchant read failed.');
    return null;
  }

  const { data: campaign, error: campaignError } = await db
    .from('campaigns')
    .select('id,merchant_id,slug,title,headline,subheadline,location,is_active,start_date,end_date')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .gt('end_date', new Date().toISOString())
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (campaignError || !campaign) {
    if (campaignError) console.error('[public-store] Campaign read failed.');
    return null;
  }

  const { data: prizes, error: prizeError } = await db
    .from('prizes')
    .select('id,campaign_id,title,discount_type,discount_value,min_order_value,total_quantity,claimed_quantity,is_active,terms_and_conditions')
    .eq('campaign_id', campaign.id)
    .eq('is_active', true)
    .order('id', { ascending: true })
    .limit(50);

  if (prizeError || !prizes) {
    if (prizeError) console.error('[public-store] Offer read failed.');
    return null;
  }

  return assemblePublicStore(
    slug,
    merchant as PublicMerchantRow,
    campaign as PublicCampaignRow,
    prizes as PublicPrizeRow[],
  );
}
