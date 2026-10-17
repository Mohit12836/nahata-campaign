'use server';

import { headers } from 'next/headers';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase-server';
import {
  executeGamePlay,
  getStoredCustomers,
  saveStoredCustomers,
  getStoredCoupons,
  saveStoredCoupons,
  getStoredCampaign,
  getStoredPrizes,
  selectWinningPrize,
} from '@/lib/store';
import { PlayResultResponse, Prize } from '@/types';
import { sendToGoogleSheetsWebhook } from '@/lib/google-sheets';

// In-memory sliding window rate limiter (5 requests per 60s per IP/Phone)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count += 1;
  return true;
};

export interface ClaimPrizeInput {
  campaignId: string;
  fullName: string;
  phone: string;
  city: string;
  businessCategory: string;
  gameType: 'scratch' | 'spin';
  consent: boolean;
  targetPrizeId?: string;
}

export async function claimCampaignPrizeAction(input: ClaimPrizeInput): Promise<PlayResultResponse> {
  const reqHeaders = await headers();
  const clientIp = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || '127.0.0.1';
  const cleanPhone = (input.phone || '').replace(/\D/g, '').slice(-10);

  // 1. Rate Limiting Check
  if (!checkRateLimit(`claim_${clientIp}`) || !checkRateLimit(`phone_${cleanPhone}`)) {
    return {
      status: 'ERROR',
      message: 'अत्यधिक अनुरोध! कृपया 1 मिनट बाद पुनः प्रयास करें।',
    };
  }

  // 2. Strict Input Validation
  if (!input.fullName || input.fullName.trim().length < 2) {
    return {
      status: 'ERROR',
      message: 'कृपया अपना पूरा नाम (न्यूनतम 2 अक्षर) दर्ज करें।',
    };
  }

  if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return {
      status: 'ERROR',
      message: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर (6, 7, 8 या 9 से शुरू) दर्ज करें।',
    };
  }

  if (input.consent !== true) {
    return {
      status: 'ERROR',
      message: 'ऑफर प्राप्त करने और व्हाट्सएप पर कूपन कोड पाने के लिए सहमति आवश्यक है।',
    };
  }

  // 3. Central Execution: Try Supabase Cloud Backend first
  let result: PlayResultResponse | null = null;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('claim_campaign_prize', {
          p_campaign_id: input.campaignId,
          p_phone: cleanPhone,
          p_name: input.fullName.trim(),
          p_city: input.city || 'कुशलगढ़',
          p_category: input.businessCategory || 'घरेलू उपभोक्ता (Family / Home)',
          p_game_type: input.gameType,
          p_consent: true,
          p_target_prize_id: input.targetPrizeId || null,
        });

        if (error) {
          return {
            status: 'ERROR',
            message: `डेटाबेस त्रुटि: ${error.message}`,
          };
        }

        result = data as PlayResultResponse;
      } catch (err: unknown) {
        return {
          status: 'ERROR',
          message: err instanceof Error ? err.message : 'सर्वर प्रक्रिया में त्रुटि',
        };
      }
    }
  }

  // 4. Server-Side Execution (Guaranteed Claim with Google Sheets & CRM Backup)
  if (!result) {
    result = executeGamePlay(
      cleanPhone,
      input.fullName.trim(),
      input.city,
      input.businessCategory,
      input.gameType,
      input.targetPrizeId
    );
  }

  // 4.5 Issue secure opaque session cookie (No PII inside token)
  if ((result.status === 'SUCCESS' || result.status === 'ALREADY_PLAYED') && result.customer) {
    try {
      const { setCustomerSession } = await import('@/lib/customer-auth');
      await setCustomerSession(result.customer.id, input.campaignId);
    } catch (sessErr) {
      console.warn('Customer session creation warning:', sessErr);
    }
  }

  // 5. Dual CRM & Store Persistence Guarantee (Mirrors into Admin CRM immediately)
  if (result.status === 'SUCCESS' || result.status === 'ALREADY_PLAYED') {
    try {
      if (result.customer) {
        const storedCusts = getStoredCustomers();
        const existingIdx = storedCusts.findIndex((c) => c.phone === cleanPhone);
        if (existingIdx === -1) {
          storedCusts.unshift(result.customer);
          saveStoredCustomers(storedCusts);
        }
      }
      if (result.coupon) {
        const storedCoups = getStoredCoupons();
        const existingCoupIdx = storedCoups.findIndex((c) => c.code === result.coupon!.code);
        if (existingCoupIdx === -1) {
          storedCoups.unshift(result.coupon);
          saveStoredCoupons(storedCoups);
        }
      }
    } catch (crmStoreErr) {
      console.warn('Admin CRM local mirror warning:', crmStoreErr);
    }
  }

  // 6. Unified Post-Success Google Sheets Auto-Sync (Awaited with safe timeout)
  if (result.status === 'SUCCESS' && result.coupon) {
    try {
      const campaign = getStoredCampaign();
      const webhookUrl =
        campaign?.google_sheets_webhook_url ||
        process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
        process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
        undefined;

      const payload = {
        leadId: `LEAD-${result.coupon.code.slice(0, 8)}`,
        timestamp: new Date().toLocaleString('hi-IN'),
        storeName: campaign?.store_name || 'नाहाटा जनरल स्टोर्स',
        customerName: input.fullName.trim(),
        phone: cleanPhone,
        whatsappLink: `https://wa.me/91${cleanPhone}`,
        city: input.city || 'कुशलगढ़',
        category: input.businessCategory || 'घरेलू उपभोक्ता (Family / Home)',
        purchaseFrequency: 'नियमित ग्राहक (Regular)',
        gameType: input.gameType,
        prizeTitle: result.prize?.title || 'विशेष डिस्काउंट',
        couponCode: result.coupon.code,
        couponStatus: 'सक्रिय (VALID)',
        expiresAt: new Date(result.coupon.expires_at).toLocaleDateString('hi-IN'),
      };

      // Await sync with 3.5s timeout so Server Action guarantees dispatch before returning
      await Promise.race([
        sendToGoogleSheetsWebhook('NEW_LEAD', payload, webhookUrl),
        new Promise((resolve) => setTimeout(resolve, 3500)),
      ]).catch((err) => {
        console.warn('Google Sheets auto-sync background warning:', err);
      });
    } catch (sheetErr) {
      console.warn('Google Sheets lead payload error:', sheetErr);
    }
  }

  return result;
}

const sessionPrizeStore = new Map<string, Prize>();

export async function getOrAssignSessionPrizeAction(
  clientSessionId?: string,
  campaignSlug?: string
): Promise<{ prize?: Prize; sessionId: string; unavailable?: boolean }> {
  let clientIp = '127.0.0.1';
  try {
    const reqHeaders = await headers();
    clientIp = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || '127.0.0.1';
  } catch {}

  const effectiveSessionId = clientSessionId && clientSessionId.trim().length > 5
    ? clientSessionId.trim()
    : `sess_${clientIp.replace(/[^a-zA-Z0-9]/g, '_')}_${campaignSlug || 'nahata'}`;

  const prizes = getStoredPrizes();
  const availablePrizes = prizes.filter(
    (prize) => prize.is_active && prize.claimed_quantity < prize.total_quantity
  );

  const existing = sessionPrizeStore.get(effectiveSessionId);
  if (
    existing &&
    availablePrizes.some((prize) => prize.id === existing.id)
  ) {
    return { prize: existing, sessionId: effectiveSessionId };
  }

  sessionPrizeStore.delete(effectiveSessionId);
  if (availablePrizes.length === 0) {
    return { sessionId: effectiveSessionId, unavailable: true };
  }

  const assigned = selectWinningPrize(availablePrizes);
  sessionPrizeStore.set(effectiveSessionId, assigned);
  return { prize: assigned, sessionId: effectiveSessionId };
}

export async function getActiveCustomerSessionAction(): Promise<{
  isAuthenticated: boolean;
  coupon?: import('@/types').Coupon;
  customer?: import('@/types').Customer;
}> {
  try {
    const { getCustomerSession } = await import('@/lib/customer-auth');
    const session = await getCustomerSession();
    if (!session) {
      return { isAuthenticated: false };
    }

    const customers = getStoredCustomers();
    const customer = customers.find((c) => c.id === session.customerId);
    if (!customer) {
      return { isAuthenticated: false };
    }

    const coupons = getStoredCoupons();
    const coupon = coupons.find((cp) => cp.customer_id === customer.id || cp.customer?.phone === customer.phone);

    return {
      isAuthenticated: true,
      customer,
      coupon,
    };
  } catch {
    return { isAuthenticated: false };
  }
}

export async function logoutCustomerAction(): Promise<{ success: boolean }> {
  try {
    const { clearCustomerSession } = await import('@/lib/customer-auth');
    await clearCustomerSession();
    return { success: true };
  } catch {
    return { success: false };
  }
}


