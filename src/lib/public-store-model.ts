/**
 * Public campaign model: immutable, server-authorized projection.
 * No customer records, private merchant fields, mock data or localStorage.
 */
export interface PublicMerchantRow {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  location: string;
  shop_number: string | null;
  whatsapp_number: string | null;
  status: string;
}

export interface PublicCampaignRow {
  id: string;
  merchant_id: string | null;
  slug: string;
  title: string;
  headline: string | null;
  subheadline: string | null;
  location: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface PublicPrizeRow {
  id: string;
  campaign_id: string;
  title: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  total_quantity: number;
  claimed_quantity: number;
  is_active: boolean;
  terms_and_conditions: string | null;
}

export interface PublicStorePage {
  merchant: {
    id: string;
    name: string;
    slug: string;
    category: string;
    location: string;
    shopNumber: string;
    whatsappUrl: string | null;
  };
  campaign: {
    id: string;
    title: string;
    headline: string;
    subheadline: string;
    expiresAt: string;
  };
  offers: Array<{
    id: string;
    title: string;
    type: string;
    value: number;
    minimumBill: number;
    terms: string;
  }>;
}

export const isValidStoreSlug = (slug: unknown): slug is string =>
  typeof slug === 'string' &&
  slug.length > 0 &&
  slug.length <= 63 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

const whatsappUrl = (input: string | null, store: string): string | null => {
  const digits = (input ?? '').replace(/\D/g, '');
  const phone = /^91[6-9]\d{9}$/.test(digits)
    ? digits
    : /^[6-9]\d{9}$/.test(digits)
      ? `91${digits}`
      : null;
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(`नमस्कार, ${store} के ऑफर के बारे में जानकारी चाहिए।`)}`;
};

/**
 * Rejects draft, pending, suspended, future, expired, cross-merchant and
 * out-of-stock data even if the server DB client has elevated privileges.
 * Treat the resulting page as public, not as evidence of coupon eligibility.
 */
export function assemblePublicStore(
  requestedSlug: string,
  merchant: PublicMerchantRow | null,
  campaign: PublicCampaignRow | null,
  prizes: PublicPrizeRow[],
  now: Date = new Date(),
): PublicStorePage | null {
  if (!isValidStoreSlug(requestedSlug) ||
      !merchant || merchant.slug !== requestedSlug ||
      merchant.status !== 'active' || !merchant.name?.trim() ||
      !campaign || campaign.merchant_id !== merchant.id ||
      !campaign.is_active || !campaign.title?.trim() ||
      !Number.isFinite(now.getTime())) return null;

  const start = new Date(campaign.start_date).getTime();
  const end = new Date(campaign.end_date).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > now.getTime() ||
      end <= now.getTime() || end <= start) return null;

  const available = prizes.filter((p) =>
    p.campaign_id === campaign.id &&
    p.is_active === true &&
    p.title?.trim() &&
    Number.isFinite(Number(p.total_quantity)) &&
    Number.isFinite(Number(p.claimed_quantity)) &&
    Number(p.total_quantity) > Number(p.claimed_quantity) &&
    Number(p.total_quantity) > 0 &&
    Number(p.claimed_quantity) >= 0 &&
    ['percentage','fixed_amount','free_gift','better_luck'].includes(p.discount_type),
  );
  if (available.length === 0) return null;

  return {
    merchant: {
      id: merchant.id,
      name: merchant.name,
      slug: merchant.slug,
      category: merchant.category ?? '',
      location: merchant.location || campaign.location,
      shopNumber: merchant.shop_number ?? '',
      whatsappUrl: whatsappUrl(merchant.whatsapp_number, merchant.name),
    },
    campaign: {
      id: campaign.id,
      title: campaign.title,
      headline: campaign.headline || campaign.title,
      subheadline: campaign.subheadline || '',
      expiresAt: campaign.end_date,
    },
    offers: available.map((p) => ({
      id: p.id,
      title: p.title,
      type: p.discount_type,
      value: Number(p.discount_value) || 0,
      minimumBill: Math.max(0, Number(p.min_order_value) || 0),
      terms: p.terms_and_conditions || '',
    })),
  };
}
