import { Campaign, Prize, Customer, Coupon, PlayResultResponse, Merchant } from '@/types';
import { INITIAL_CAMPAIGN, INITIAL_PRIZES, INITIAL_CUSTOMERS, INITIAL_COUPONS, INITIAL_MERCHANTS } from './mock-data';

const STORAGE_KEYS = {
  CAMPAIGN: 'nahata_campaign_data',
  PRIZES: 'nahata_prizes_data',
  CUSTOMERS: 'nahata_customers_data',
  COUPONS: 'nahata_coupons_data',
  USER_PLAYED: 'nahata_user_played_phone',
  MERCHANTS: 'nahata_merchants_data',
};

let memCampaign: Campaign = INITIAL_CAMPAIGN;
let memPrizes: Prize[] = INITIAL_PRIZES;
let memCustomers: Customer[] = INITIAL_CUSTOMERS;
let memCoupons: Coupon[] = INITIAL_COUPONS;
let memMerchants: Merchant[] = INITIAL_MERCHANTS;

export const getStoredMerchants = (): Merchant[] => {
  if (typeof window === 'undefined') return memMerchants;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
    return data ? JSON.parse(data) : memMerchants;
  } catch {
    return memMerchants;
  }
};

export const saveStoredMerchants = (merchants: Merchant[]): void => {
  memMerchants = merchants;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merchants));
  } catch {}
};

export const getMerchantBySlug = (slug: string): Merchant | undefined => {
  const merchants = getStoredMerchants();
  return merchants.find((m) => m.slug.toLowerCase() === slug.toLowerCase());
};

export const saveStoredMerchant = (merchant: Merchant): void => {
  const merchants = getStoredMerchants();
  const index = merchants.findIndex((m) => m.id === merchant.id);
  if (index >= 0) {
    merchants[index] = merchant;
  } else {
    merchants.push(merchant);
  }
  saveStoredMerchants(merchants);
};

export const registerMerchantApplication = (
  data: Partial<Merchant> & { name: string; phone: string; location: string }
): Merchant => {
  const merchants = getStoredMerchants();
  const slug = (data.slug || data.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `shop-${Date.now().toString().slice(-4)}`;

  const newMerchant: Merchant = {
    id: `merch-${Date.now()}`,
    slug,
    name: data.name,
    category: data.category || 'जनरल स्टोर / खुदरा व्यापार',
    owner_name: data.owner_name || 'दुकानदार',
    logo_url: data.logo_url || '/nahata-logo.jpg',
    location: data.location,
    shop_number: data.shop_number || '',
    phone: data.phone,
    whatsapp_number: data.whatsapp_number || `91${data.phone.slice(-10)}`,
    whatsapp_community_link: data.whatsapp_community_link,
    status: 'pending', // Starts in pending until Super Admin approves
    plan: (data.plan as 'starter' | 'growth' | 'enterprise') || 'starter',
    quota_coupons_total: 1000,
    quota_coupons_used: 0,
    created_at: new Date().toISOString(),
  };

  merchants.unshift(newMerchant);
  saveStoredMerchants(merchants);
  return newMerchant;
};

export const getStoredCampaign = (): Campaign => {
  if (typeof window === 'undefined') return memCampaign;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
    return data ? JSON.parse(data) : memCampaign;
  } catch {
    return memCampaign;
  }
};

export const saveStoredCampaign = (campaign: Campaign): void => {
  memCampaign = campaign;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGN, JSON.stringify(campaign));
  } catch {}
};

export const getStoredPrizes = (): Prize[] => {
  if (typeof window === 'undefined') return memPrizes;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRIZES);
    return data ? JSON.parse(data) : memPrizes;
  } catch {
    return memPrizes;
  }
};

export const saveStoredPrizes = (prizes: Prize[]): void => {
  memPrizes = prizes;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
  } catch {}
};

export const getStoredCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return memCustomers;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : memCustomers;
  } catch {
    return memCustomers;
  }
};

export const saveStoredCustomers = (customers: Customer[]): void => {
  memCustomers = customers;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch {}
};

export const getStoredCoupons = (): Coupon[] => {
  if (typeof window === 'undefined') return memCoupons;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
    return data ? JSON.parse(data) : memCoupons;
  } catch {
    return memCoupons;
  }
};

export const saveStoredCoupons = (coupons: Coupon[]): void => {
  memCoupons = coupons;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  } catch {}
};

export const selectWinningPrize = (prizesList: Prize[]): Prize => {
  // Never fall back to exhausted or inactive inventory.
  const pool = prizesList.filter(
    (p) => p.is_active && p.claimed_quantity < p.total_quantity
  );

  if (pool.length === 0) {
    throw new Error('No active prizes with available inventory.');
  }

  const totalWeight = pool.reduce((acc, p) => acc + (p.probability_weight || 1), 0);
  let randomVal = Math.floor(Math.random() * (totalWeight || 1));
  let selected = pool[0];

  for (const prize of pool) {
    if (randomVal < (prize.probability_weight || 1)) {
      selected = prize;
      break;
    }
    randomVal -= (prize.probability_weight || 1);
  }

  return selected;
};

let sessionTargetPrize: Prize | null = null;
export const getSessionTargetPrize = (): Prize => {
  if (typeof window === 'undefined') {
    return INITIAL_PRIZES[0];
  }
  if (!sessionTargetPrize) {
    sessionTargetPrize = selectWinningPrize(getStoredPrizes());
  }
  return sessionTargetPrize;
};

export const executeGamePlay = (
  phone: string,
  fullName: string,
  city: string,
  businessCategory: string,
  gameType: 'scratch' | 'spin',
  targetPrizeId?: string,
  whatsappConsent = false
): PlayResultResponse => {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const customers = getStoredCustomers();
  const coupons = getStoredCoupons();
  const prizes = getStoredPrizes();
  const campaign = getStoredCampaign();

  // 1. Anti-Cheat: Check if user has already played with this phone number
  const existingCoupon = coupons.find(
    (c) => c.customer?.phone === cleanPhone && c.campaign_id === campaign.id
  );

  if (existingCoupon) {
    return {
      status: 'ALREADY_PLAYED',
      message: 'आप इस मोबाइल नंबर से पहले ही ऑफर प्राप्त कर चुके हैं!',
      coupon: existingCoupon,
      prize: existingCoupon.prize,
      customer: existingCoupon.customer,
    };
  }

  // 2. Fail closed when all inventory is exhausted; never mint an unavailable prize.
  const hasAvailablePrize = prizes.some(
    (p) => p.is_active && p.claimed_quantity < p.total_quantity
  );
  if (!hasAvailablePrize) {
    return {
      status: 'EXHAUSTED',
      message: 'क्षमा करें! इस कैंपेन के सभी विशेष इनाम समाप्त हो चुके हैं।',
    };
  }

  // Select prize: either target prize (if active & available) or weighted random
  let selectedPrize: Prize | undefined;
  if (targetPrizeId) {
    selectedPrize = prizes.find(
      (p) => p.id === targetPrizeId && p.is_active && p.claimed_quantity < p.total_quantity
    );
  }

  if (!selectedPrize) {
    selectedPrize = selectWinningPrize(prizes);
  }

  // 3. Register or find customer
  let customer = customers.find((c) => c.phone === cleanPhone);
  if (!customer) {
    customer = {
      id: `c-${Date.now()}`,
      phone: cleanPhone,
      full_name: fullName,
      city: city || 'कुशलगढ़',
      business_category: businessCategory || 'घरेलू उपभोक्ता (Family / Home)',
      lead_source: `${gameType.toUpperCase()}_CAMPAIGN`,
      whatsapp_consent: whatsappConsent,
      ...(whatsappConsent ? { consent_timestamp: new Date().toISOString() } : {}),
      created_at: new Date().toISOString(),
    };
    customers.unshift(customer);
    saveStoredCustomers(customers);
  }

  // 4. Generate Unique Coupon Code (NAHATA-FEST-XXXX)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const couponCode = `NAHATA-FEST-${randomSuffix}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const newCoupon: Coupon = {
    id: `coup-${Date.now()}`,
    code: couponCode,
    campaign_id: campaign.id,
    customer_id: customer.id,
    prize_id: selectedPrize.id,
    prize: selectedPrize,
    customer: customer,
    status: 'valid',
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };

  coupons.unshift(newCoupon);
  saveStoredCoupons(coupons);

  // 5. Update Prize Claim Count
  const updatedPrizes = prizes.map((p) =>
    p.id === selectedPrize!.id ? { ...p, claimed_quantity: p.claimed_quantity + 1 } : p
  );
  saveStoredPrizes(updatedPrizes);

  return {
    status: 'SUCCESS',
    message: 'बधाई हो! आपका डिस्काउंट कूपन सफलतापूर्वक जनरेट हो गया है।',
    prize: selectedPrize,
    coupon: newCoupon,
    customer: customer,
  };
};

export const redeemCoupon = (
  code: string,
  billNumber?: string,
  billAmount?: number,
  redeemedBy: string = 'मनोज नाहटा (काउंटर)'
): { success: boolean; message: string; coupon?: Coupon } => {
  const coupons = getStoredCoupons();
  const index = coupons.findIndex((c) => c.code.toUpperCase() === code.trim().toUpperCase());

  if (index === -1) {
    return { success: false, message: 'अमान्य कूपन कोड। कृपया सही कोड दर्ज करें।' };
  }

  const coupon = coupons[index];
  if (coupon.status === 'redeemed') {
    return {
      success: false,
      message: `यह कूपन पहले ही ${new Date(coupon.redeemed_at || '').toLocaleDateString('hi-IN')} को रिडीम किया जा चुका है!`,
      coupon,
    };
  }

  if (coupon.status === 'expired' || new Date(coupon.expires_at) < new Date()) {
    return { success: false, message: 'यह कूपन समाप्त (Expired) हो चुका है।' };
  }

  coupon.status = 'redeemed';
  coupon.redeemed_at = new Date().toISOString();
  coupon.redeemed_by = redeemedBy;
  coupon.bill_number = billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
  coupon.bill_amount = billAmount || 0;

  // Generate Next Purchase Coupon for customer repeat visit / Next Weekly Sale
  const nextSuffix = Math.floor(1000 + Math.random() * 9000);
  coupon.next_purchase_coupon = {
    code: `NAHATA-REPEAT-${nextSuffix}`,
    discount_text: 'अगली खरीद पर ₹50 फ्लैट छूट (या 10% अतिरिक्त छूट)',
    min_order_value: 500,
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };

  coupons[index] = coupon;
  saveStoredCoupons(coupons);

  return {
    success: true,
    message: 'कूपन सफलतापूर्वक रिडीम हुआ! अगली खरीद का नया डिस्काउंट कूपन जारी कर दिया गया है।',
    coupon,
  };
};
