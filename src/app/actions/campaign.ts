'use server';

import { headers } from 'next/headers';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase-server';
import { executeGamePlay } from '@/lib/store';
import { PlayResultResponse } from '@/types';
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

  // 4. Server-Side Execution (Fallback store mode when Supabase is unconfigured or skipped)
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

  // 5. Unified Post-Success Google Sheets Auto-Sync (Runs on BOTH Supabase and Fallback paths)
  if (result.status === 'SUCCESS' && result.coupon) {
    try {
      const payload = {
        leadId: `LEAD-${result.coupon.code.slice(0, 8)}`,
        timestamp: new Date().toLocaleString('hi-IN'),
        storeName: 'नाहाटा जनरल स्टोर्स',
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
      // Fire-and-forget background sync
      sendToGoogleSheetsWebhook('NEW_LEAD', payload).catch(() => {});
    } catch {}
  }

  return result;
}
