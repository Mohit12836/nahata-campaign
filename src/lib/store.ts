import { Campaign, Prize, Customer, Coupon, PlayResultResponse } from '@/types';
import { INITIAL_CAMPAIGN, INITIAL_PRIZES, INITIAL_CUSTOMERS, INITIAL_COUPONS } from './mock-data';

const STORAGE_KEYS = {
  CAMPAIGN: 'nahata_campaign_data',
  PRIZES: 'nahata_prizes_data',
  CUSTOMERS: 'nahata_customers_data',
  COUPONS: 'nahata_coupons_data',
  USER_PLAYED: 'nahata_user_played_phone',
};

export const getStoredCampaign = (): Campaign => {
  if (typeof window === 'undefined') return INITIAL_CAMPAIGN;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
    return data ? JSON.parse(data) : INITIAL_CAMPAIGN;
  } catch {
    return INITIAL_CAMPAIGN;
  }
};

export const saveStoredCampaign = (campaign: Campaign): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CAMPAIGN, JSON.stringify(campaign));
};

export const getStoredPrizes = (): Prize[] => {
  if (typeof window === 'undefined') return INITIAL_PRIZES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRIZES);
    return data ? JSON.parse(data) : INITIAL_PRIZES;
  } catch {
    return INITIAL_PRIZES;
  }
};

export const saveStoredPrizes = (prizes: Prize[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
};

export const getStoredCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
};

export const getStoredCoupons = (): Coupon[] => {
  if (typeof window === 'undefined') return INITIAL_COUPONS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
    return data ? JSON.parse(data) : INITIAL_COUPONS;
  } catch {
    return INITIAL_COUPONS;
  }
};

export const saveStoredCoupons = (coupons: Coupon[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
};

export const executeGamePlay = (
  phone: string,
  fullName: string,
  city: string,
  businessCategory: string,
  gameType: 'scratch' | 'spin'
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
      message: 'आप इस मोबाइल नंबर से पहले ही ऑफर जीत चुके हैं!',
      coupon: existingCoupon,
      prize: existingCoupon.prize,
      customer: existingCoupon.customer,
    };
  }

  // 2. Select prize by weighted probability
  const activePrizes = prizes.filter((p) => p.is_active && p.claimed_quantity < p.total_quantity);
  const pool = activePrizes.length > 0 ? activePrizes : prizes;
  const totalWeight = pool.reduce((acc, p) => acc + p.probability_weight, 0);
  let randomVal = Math.floor(Math.random() * (totalWeight || 1));
  let selectedPrize = pool[0];

  for (const prize of pool) {
    if (randomVal < prize.probability_weight) {
      selectedPrize = prize;
      break;
    }
    randomVal -= prize.probability_weight;
  }

  // 3. Register or find customer
  let customer = customers.find((c) => c.phone === cleanPhone);
  if (!customer) {
    customer = {
      id: `c-${Date.now()}`,
      phone: cleanPhone,
      full_name: fullName,
      city: city || 'राजस्थान',
      business_category: businessCategory || 'उपभोक्ता',
      lead_source: `${gameType.toUpperCase()}_CAMPAIGN`,
      whatsapp_consent: true,
      consent_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    customers.unshift(customer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  // 4. Generate Unique Coupon Code
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const couponCode = `NAHATA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${randomSuffix}`;
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
    p.id === selectedPrize.id ? { ...p, claimed_quantity: p.claimed_quantity + 1 } : p
  );
  saveStoredPrizes(updatedPrizes);

  return {
    status: 'SUCCESS',
    message: 'बधाई हो! आपने शानदार ऑफर जीता है।',
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

  coupons[index] = coupon;
  saveStoredCoupons(coupons);

  return { success: true, message: 'कूपन सफलतापूर्वक रिडीम और सत्यापित कर दिया गया!', coupon };
};
