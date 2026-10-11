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
import { Coupon } from '@/types';
import { sendToGoogleSheetsWebhook } from '@/lib/google-sheets';

export async function adminLoginAction(pin: string): Promise<{ success: boolean; message: string }> {
  if (!validateAdminPin(pin)) {
    return { success: false, message: 'अमान्य सिक्योरिटी पिन! कृपया सही पिन दर्ज करें।' };
  }

  const token = createAdminSessionToken();
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

  // 2. Check if Supabase is Configured
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

        return data as { success: boolean; message: string };
      } catch (err: unknown) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'सर्वर त्रुटि',
        };
      }
    }
  }

  // 3. Fallback to server-validated store execution
  const res = redeemCoupon(
    input.code,
    input.billNumber,
    input.billAmount,
    input.redeemedBy || 'मनोज नाहटा (काउंटर)'
  );

  // 4. Automatic Google Sheets Auto-Sync (Non-blocking)
  if (res.success && res.coupon) {
    try {
      const payload = {
        timestamp: new Date().toLocaleString('hi-IN'),
        storeName: 'नाहाटा जनरल स्टोर्स',
        couponCode: res.coupon.code,
        billNumber: input.billNumber || res.coupon.bill_number || '',
        billAmount: input.billAmount || res.coupon.bill_amount || 0,
        redeemedBy: input.redeemedBy || 'मनोज नाहटा (काउंटर)',
        customerPhone: res.coupon.customer?.phone || res.coupon.customer_phone,
        customerName: res.coupon.customer?.full_name,
      };
      sendToGoogleSheetsWebhook('COUPON_REDEEMED', payload).catch(() => {});
    } catch {}
  }

  return res;
}
