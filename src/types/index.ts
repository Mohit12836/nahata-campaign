export interface Prize {
  id: string;
  campaign_id: string;
  title: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_gift' | 'better_luck';
  discount_value: number;
  min_order_value: number;
  probability_weight: number;
  total_quantity: number;
  claimed_quantity: number;
  is_active: boolean;
  terms_and_conditions: string;
  badge_color?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  store_name: string;
  headline: string;
  subheadline: string;
  banner_url?: string;
  whatsapp_number: string;
  whatsapp_community_link?: string;
  is_scratch_enabled: boolean;
  is_spin_enabled: boolean;
  max_plays_per_user: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  location: string;
  contact_person: string;
}

export interface Customer {
  id: string;
  phone: string;
  full_name: string;
  city: string;
  business_category: string;
  lead_source: string;
  whatsapp_consent: boolean;
  consent_timestamp: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  campaign_id: string;
  customer_id: string;
  prize_id: string;
  prize?: Prize;
  customer?: Customer;
  status: 'valid' | 'redeemed' | 'expired' | 'cancelled';
  expires_at: string;
  redeemed_at?: string;
  redeemed_by?: string;
  bill_number?: string;
  bill_amount?: number;
  created_at: string;
}

export interface PlayAttempt {
  id: string;
  campaign_id: string;
  customer_id: string;
  prize_id: string;
  game_type: 'scratch' | 'spin';
  created_at: string;
}

export interface PlayResultResponse {
  status: 'SUCCESS' | 'ALREADY_PLAYED' | 'ERROR';
  message: string;
  prize?: Prize;
  coupon?: Coupon;
  customer?: Customer;
}
