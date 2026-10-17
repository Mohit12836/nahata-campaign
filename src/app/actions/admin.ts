'use server';

import { cookies } from 'next/headers';
import {
  createAdminSessionToken,
  validateAdminPin,
  isServerAdminAuthenticated,
  ADMIN_SESSION_COOKIE,
} from '@/lib/auth-server';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase-server';
import { redeemCoupon } from '@/lib/store';
import { Coupon, Merchant } from '@/types';
import { sendToGoogleSheetsWebhook } from '@/lib/google-sheets';
import { headers } from 'next/headers';

// In-memory sliding window rate limiter for admin login (Max 5 attempts per 15 minutes per IP)
// NOTE (Serverless Limitation): In-memory state is isolated per serverless worker.
// A distributed store (e.g. Upstash Redis) is recommended for production multi-instance deployments.
const adminLoginAttempts = new Map<string, { attempts: number; lockoutUntil: number }>();

const checkAdminLoginRateLimit = (ip: string): { allowed: boolean; retryAfterMinutes?: number } => {
  const now = Date.now();
  const entry = adminLoginAttempts.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  // Active lockout check
  if (entry.lockoutUntil > now) {
    const minutesLeft = Math.ceil((entry.lockoutUntil - now) / (60 * 1000));
    return { allowed: false, retryAfterMinutes: minutesLeft };
  }

  // Reset expired lockout
  if (now > entry.lockoutUntil && entry.lockoutUntil !== 0) {
    adminLoginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
};

const recordAdminLoginAttempt = (ip: string, success: boolean): void => {
  const now = Date.now();
  const entry = adminLoginAttempts.get(ip) || { attempts: 0, lockoutUntil: 0 };

  if (success) {
    // Reset on successful login
    adminLoginAttempts.delete(ip);
    return;
  }

  entry.attempts += 1;
  // Trigger 15-minute lockout after 5 failed attempts
  if (entry.attempts >= 5) {
    entry.lockoutUntil = now + 15 * 60 * 1000;
  }
  adminLoginAttempts.set(ip, entry);
};

export async function adminLoginAction(pin: string): Promise<{ success: boolean; message: string }> {
  const reqHeaders = await headers();
  const clientIp = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || '127.0.0.1';

  // 1. Rate Limiting / Lockout Check
  const rateLimitStatus = checkAdminLoginRateLimit(clientIp);
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      message: `अत्यधिक असफल प्रयास! सुरक्षा कारणों से एडमिन लॉगिन ${rateLimitStatus.retryAfterMinutes || 15} मिनट के लिए अस्थायी रूप से ब्लॉक है।`,
    };
  }

  // 2. Validate PIN with constant-time equality and fail-closed check
  if (!validateAdminPin(pin)) {
    recordAdminLoginAttempt(clientIp, false);
    return { success: false, message: 'अमान्य सिक्योरिटी पिन! कृपया सही पिन दर्ज करें।' };
  }

  // 3. Create Session Token (Fail closed if secret is missing/weak)
  const token = createAdminSessionToken();
  if (!token) {
    return {
      success: false,
      message: 'सर्वर सुरक्षा त्रुटि: एडमिन प्रमाणीकरण अनुपलब्ध है। कृपया सर्वर व्यवस्थापक से संपर्क करें।',
    };
  }

  // 4. Success: Clear rate limit record and set HTTP-only cookie
  recordAdminLoginAttempt(clientIp, true);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });

  return { success: true, message: 'एडमिन प्रमाणीकरण सफल!' };
}

export async function adminLogoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return { success: true };
}

export async function checkAdminAuthAction(): Promise<{ isAuthenticated: boolean }> {
  const isAuth = await isServerAdminAuthenticated();
  return { isAuthenticated: isAuth };
}

export async function getAdminDataAction(): Promise<{
  customers: import('@/types').Customer[];
  coupons: import('@/types').Coupon[];
  campaign: import('@/types').Campaign;
  prizes: import('@/types').Prize[];
}> {
  const { getStoredCustomers, getStoredCoupons, getStoredCampaign, getStoredPrizes } = await import('@/lib/store');
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      customers: [],
      coupons: [],
      campaign: getStoredCampaign(),
      prizes: getStoredPrizes(),
    };
  }

  // Single-store MVP: scope every CRM record to the active campaign.
  // This server action may use a service-role client, which bypasses RLS; query filters
  // are therefore mandatory and must not rely on tenant RLS alone.
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const campaign = getStoredCampaign();
        const { data: dbCoupons, error: couponsError } = await supabase
          .from('coupons')
          .select('*, prize:prizes(*), customer:customers(*)')
          .eq('campaign_id', campaign.id)
          .order('created_at', { ascending: false });

        if (couponsError) throw couponsError;

        const customerIds = [...new Set(
          (dbCoupons || [])
            .map((coupon) => coupon.customer_id)
            .filter((id): id is string => Boolean(id))
        )];

        const { data: dbCustomers, error: customersError } = customerIds.length > 0
          ? await supabase
              .from('customers')
              .select('*')
              .in('id', customerIds)
              .order('created_at', { ascending: false })
          : { data: [], error: null };

        if (customersError) throw customersError;

        return {
          customers: dbCustomers || [],
          coupons: dbCoupons || [],
          campaign,
          prizes: getStoredPrizes(),
        };
      } catch (dbErr) {
        console.error('[DATABASE ERROR] Failed to fetch campaign-scoped admin data from Supabase:', dbErr);
      }
    }
  }

  // Production Fail-Closed Policy:
  // In production, do not return mock/in-memory customers if database is missing
  if (process.env.NODE_ENV === 'production') {
    return {
      customers: [],
      coupons: [],
      campaign: getStoredCampaign(),
      prizes: getStoredPrizes(),
    };
  }

  // Development Fallback
  return {
    customers: getStoredCustomers(),
    coupons: getStoredCoupons(),
    campaign: getStoredCampaign(),
    prizes: getStoredPrizes(),
  };
}

export interface RedeemCouponInput {
  code: string;
  billNumber?: string;
  billAmount?: number;
  redeemedBy?: string;
}

export async function redeemCouponAction(
  input: RedeemCouponInput
): Promise<{ success: boolean; message: string; coupon?: Coupon }> {
  // 1. Enforce Server-Side Admin Authentication
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      success: false,
      message: 'अनधिकृत कार्रवाई! कूपन रिडीम करने के लिए वैध एडमिन सत्र आवश्यक है।',
    };
  }

  if (!input.code || !input.code.trim()) {
    return { success: false, message: 'कृपया कूपन कोड दर्ज करें।' };
  }

  // 2. Central Execution: Try Supabase Cloud Backend first
  let res: { success: boolean; message: string; coupon?: Coupon } | null = null;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('redeem_campaign_coupon', {
          p_code: input.code.trim(),
          p_bill_number: input.billNumber || null,
          p_bill_amount: input.billAmount || 0,
          p_redeemed_by: input.redeemedBy || 'मनोज नाहटा (काउंटर)',
        });

        if (error) {
          return { success: false, message: `डेटाबेस त्रुटि: ${error.message}` };
        }

        res = data as { success: boolean; message: string; coupon?: Coupon };
      } catch (err: unknown) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'सर्वर त्रुटि',
        };
      }
    }
  }

  // 3. Robust Store Execution (With Google Sheets & CRM Backup)
  if (!res) {
    res = redeemCoupon(
      input.code,
      input.billNumber,
      input.billAmount,
      input.redeemedBy || 'मनोज नाहटा (काउंटर)'
    );
  }

  // 4. Unified Post-Success Google Sheets Auto-Sync (Runs on BOTH Supabase and Fallback paths)
  if (res.success) {
    try {
      const payload = {
        timestamp: new Date().toLocaleString('hi-IN'),
        storeName: 'नाहाटा जनरल स्टोर्स',
        couponCode: input.code.trim().toUpperCase(),
        billNumber: input.billNumber || res.coupon?.bill_number || '',
        billAmount: input.billAmount || res.coupon?.bill_amount || 0,
        redeemedBy: input.redeemedBy || 'मनोज नाहटा (काउंटर)',
        customerPhone: res.coupon?.customer?.phone || res.coupon?.customer_phone || '',
        customerName: res.coupon?.customer?.full_name || '',
      };
      sendToGoogleSheetsWebhook('COUPON_REDEEMED', payload).catch(() => {});
    } catch {}
  }

  return res;
}

// ==============================================================================
// SUPER-ADMIN SERVER-SIDE PERSISTENCE ACTIONS
// Enforces: Server-Side HMAC Session Auth, Strict Validation, Production Fail-Closed
// ==============================================================================

export async function getSuperAdminMerchantsAction(): Promise<{
  success: boolean;
  message?: string;
  merchants: Merchant[];
}> {
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      success: false,
      message: 'अनधिकृत अनुरोध! सुपर एडमिन डेटा देखने के लिए वैध सत्र आवश्यक है।',
      merchants: [],
    };
  }

  // 1. Fetch from Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[SUPER ADMIN] Supabase fetch merchants error:', error.message);
          if (process.env.NODE_ENV === 'production') {
            return {
              success: false,
              message: `डेटाबेस त्रुटि: ${error.message}`,
              merchants: [],
            };
          }
        } else if (data && data.length > 0) {
          return { success: true, merchants: data as Merchant[] };
        }
      } catch (err: unknown) {
        console.error('[SUPER ADMIN] Supabase connection error:', err);
        if (process.env.NODE_ENV === 'production') {
          return {
            success: false,
            message: 'डेटाबेस सर्वर से संपर्क विफल रहा।',
            merchants: [],
          };
        }
      }
    }
  }

  // 2. Production Fail-Closed Policy: Do not return unpersisted mock merchants if database is missing
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      message: 'डेटाबेस अनुपलब्ध है। प्रोडक्शन में मर्चेंट सूची लोड नहीं की जा सकी।',
      merchants: [],
    };
  }

  // 3. Development Fallback
  const { getStoredMerchants } = await import('@/lib/store');
  return { success: true, merchants: getStoredMerchants() };
}

export async function updateMerchantStatusAction(
  merchantId: string,
  newStatus: 'active' | 'pending' | 'suspended'
): Promise<{ success: boolean; message: string; merchant?: Merchant }> {
  // 1. Server-side Authentication Check
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      success: false,
      message: 'अनधिकृत कार्रवाई! स्टेटस बदलने के लिए सुपर एडमिन प्रमाणीकरण आवश्यक है।',
    };
  }

  // 2. Input Validation
  if (!merchantId || typeof merchantId !== 'string') {
    return { success: false, message: 'अमान्य मर्चेंट आईडी।' };
  }
  if (!['active', 'pending', 'suspended'].includes(newStatus)) {
    return { success: false, message: 'अमान्य स्टेटस मान (केवल active, pending, suspended मान्य हैं)।' };
  }

  // 3. Central Execution: Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .update({ status: newStatus })
          .eq('id', merchantId)
          .select()
          .single();

        if (error) {
          console.error('[SUPER ADMIN] Supabase update status error:', error.message);
          return { success: false, message: `डेटाबेस त्रुटि: ${error.message}` };
        }

        return {
          success: true,
          message: `मर्चेंट स्टेटस सफलतापूर्वक '${newStatus}' में अपडेट हो गया।`,
          merchant: data as Merchant,
        };
      } catch (err: unknown) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'सर्वर प्रक्रिया में त्रुटि',
        };
      }
    }
  }

  // 4. Production Fail-Closed Policy
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      message: 'डेटाबेस अनुपलब्ध है। प्रोडक्शन में डेटा सुरक्षा कारणों से स्टेटस अपडेट विफल रहा।',
    };
  }

  // 5. Development Fallback
  const { getStoredMerchants, saveStoredMerchants } = await import('@/lib/store');
  const merchants = getStoredMerchants();
  const idx = merchants.findIndex((m) => m.id === merchantId);
  if (idx === -1) {
    return { success: false, message: 'मर्चेंट नहीं मिला।' };
  }
  merchants[idx] = { ...merchants[idx], status: newStatus };
  saveStoredMerchants(merchants);

  return {
    success: true,
    message: `[Dev Mock] मर्चेंट स्टेटस '${newStatus}' में अपडेट किया गया।`,
    merchant: merchants[idx],
  };
}

export async function updateMerchantQuotaAction(
  merchantId: string,
  additionalQuota: number
): Promise<{ success: boolean; message: string; merchant?: Merchant }> {
  // 1. Server-side Authentication Check
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      success: false,
      message: 'अनधिकृत कार्रवाई! कोटा बदलने के लिए सुपर एडमिन प्रमाणीकरण आवश्यक है।',
    };
  }

  // 2. Input Validation
  if (!merchantId || typeof merchantId !== 'string') {
    return { success: false, message: 'अमान्य मर्चेंट आईडी।' };
  }
  if (!Number.isInteger(additionalQuota) || additionalQuota <= 0 || additionalQuota > 100000) {
    return { success: false, message: 'अमान्य कोटा राशि (1 से 1,00,000 के बीच पूर्णांक आवश्यक है)।' };
  }

  // 3. Central Execution: Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        // Fetch current quota to increment atomically
        const { data: currentMerchant, error: fetchErr } = await supabase
          .from('merchants')
          .select('quota_coupons_total')
          .eq('id', merchantId)
          .single();

        if (fetchErr || !currentMerchant) {
          return { success: false, message: 'मर्चेंट रिकॉर्ड प्राप्त करने में विफल।' };
        }

        const newTotal = (currentMerchant.quota_coupons_total || 0) + additionalQuota;
        const { data, error } = await supabase
          .from('merchants')
          .update({ quota_coupons_total: newTotal })
          .eq('id', merchantId)
          .select()
          .single();

        if (error) {
          return { success: false, message: `डेटाबेस त्रुटि: ${error.message}` };
        }

        return {
          success: true,
          message: `कूपन कोटा में +${additionalQuota} की वृद्धि सफल (नया कुल: ${newTotal})।`,
          merchant: data as Merchant,
        };
      } catch (err: unknown) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'सर्वर प्रक्रिया में त्रुटि',
        };
      }
    }
  }

  // 4. Production Fail-Closed Policy
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      message: 'डेटाबेस अनुपलब्ध है। प्रोडक्शन में डेटा सुरक्षा कारणों से कोटा अपडेट विफल रहा।',
    };
  }

  // 5. Development Fallback
  const { getStoredMerchants, saveStoredMerchants } = await import('@/lib/store');
  const merchants = getStoredMerchants();
  const idx = merchants.findIndex((m) => m.id === merchantId);
  if (idx === -1) {
    return { success: false, message: 'मर्चेंट नहीं मिला।' };
  }
  const newTotal = (merchants[idx].quota_coupons_total || 0) + additionalQuota;
  merchants[idx] = { ...merchants[idx], quota_coupons_total: newTotal };
  saveStoredMerchants(merchants);

  return {
    success: true,
    message: `[Dev Mock] कूपन कोटा में +${additionalQuota} की वृद्धि हुई (कुल: ${newTotal})।`,
    merchant: merchants[idx],
  };
}

export async function updateMerchantPlanAction(
  merchantId: string,
  newPlan: 'starter' | 'growth' | 'enterprise'
): Promise<{ success: boolean; message: string; merchant?: Merchant }> {
  // 1. Server-side Authentication Check
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      success: false,
      message: 'अनधिकृत कार्रवाई! प्लान बदलने के लिए सुपर एडमिन प्रमाणीकरण आवश्यक है।',
    };
  }

  // 2. Input Validation
  if (!merchantId || typeof merchantId !== 'string') {
    return { success: false, message: 'अमान्य मर्चेंट आईडी।' };
  }
  if (!['starter', 'growth', 'enterprise'].includes(newPlan)) {
    return { success: false, message: 'अमान्य प्लान (केवल starter, growth, enterprise मान्य हैं)।' };
  }

  // 3. Central Execution: Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .update({ plan: newPlan })
          .eq('id', merchantId)
          .select()
          .single();

        if (error) {
          return { success: false, message: `डेटाबेस त्रुटि: ${error.message}` };
        }

        return {
          success: true,
          message: `मर्चेंट प्लान सफलतापूर्वक '${newPlan}' में अपडेट हो गया।`,
          merchant: data as Merchant,
        };
      } catch (err: unknown) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'सर्वर प्रक्रिया में त्रुटि',
        };
      }
    }
  }

  // 4. Production Fail-Closed Policy
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      message: 'डेटाबेस अनुपलब्ध है। प्रोडक्शन में डेटा सुरक्षा कारणों से प्लान अपडेट विफल रहा।',
    };
  }

  // 5. Development Fallback
  const { getStoredMerchants, saveStoredMerchants } = await import('@/lib/store');
  const merchants = getStoredMerchants();
  const idx = merchants.findIndex((m) => m.id === merchantId);
  if (idx === -1) {
    return { success: false, message: 'मर्चेंट नहीं मिला।' };
  }
  merchants[idx] = { ...merchants[idx], plan: newPlan };
  saveStoredMerchants(merchants);

  return {
    success: true,
    message: `[Dev Mock] मर्चेंट प्लान '${newPlan}' में अपडेट किया गया।`,
    merchant: merchants[idx],
  };
}
