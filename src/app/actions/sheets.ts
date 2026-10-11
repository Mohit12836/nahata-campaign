'use server';

import {
  sendToGoogleSheetsWebhook,
  isValidGoogleAppsScriptUrl,
  GoogleSheetsLeadPayload,
  GoogleSheetsRedeemPayload,
} from '@/lib/google-sheets';
import { isServerAdminAuthenticated } from '@/lib/auth-server';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase-server';
import { getStoredCustomers, getStoredCoupons, getStoredCampaign } from '@/lib/store';

export async function testGoogleSheetsWebhookAction(
  webhookUrl: string
): Promise<{ success: boolean; message: string }> {
  // 1. सर्वर-साइड एडमिन प्रमाणीकरण जाँच (Admin Authentication Check)
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      success: false,
      message: 'अनधिकृत अनुरोध! केवल प्रमाणित व्यवस्थापक ही Webhook टेस्ट कर सकते हैं।',
    };
  }

  // 2. सख्त Webhook URL सत्यापन (SSRF Protection)
  if (!webhookUrl || !isValidGoogleAppsScriptUrl(webhookUrl)) {
    return {
      success: false,
      message: 'अमान्य URL! केवल अधिकृत Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec) मान्य है।',
    };
  }

  const res = await sendToGoogleSheetsWebhook('PING', { test: true }, webhookUrl);
  return res;
}

export async function bulkSyncToGoogleSheetsAction(
  overrideUrl?: string
): Promise<{ success: boolean; message: string; count: number }> {
  // 1. सर्वर-साइड एडमिन प्रमाणीकरण जाँच
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    return {
      success: false,
      message: 'अनधिकृत कार्रवाई! बल्क सिंक के लिए व्यवस्थापक लॉगिन आवश्यक है।',
      count: 0,
    };
  }

  // 2. URL सत्यापन
  if (overrideUrl && !isValidGoogleAppsScriptUrl(overrideUrl)) {
    return {
      success: false,
      message: 'अमान्य URL! केवल Google Apps Script Web App URL मान्य है।',
      count: 0,
    };
  }

  let leads: GoogleSheetsLeadPayload[] = [];
  let redemptions: GoogleSheetsRedeemPayload[] = [];
  const campaign = getStoredCampaign();
  const storeName = campaign?.store_name || 'नाहाटा जनरल स्टोर्स';

  // 3. केंद्रीय डेटाबेस (Supabase) से वास्तविक रिकॉर्ड निकालना
  let loadedFromDatabase = false;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: dbCoupons, error } = await supabase
          .from('coupons')
          .select(`
            id,
            code,
            status,
            created_at,
            expires_at,
            redeemed_at,
            bill_number,
            bill_amount,
            redeemed_by,
            customer_phone,
            customer:customers (
              id,
              full_name,
              phone,
              city,
              business_category,
              lead_source
            ),
            prize:prizes (
              id,
              title,
              type
            )
          `)
          .order('created_at', { ascending: false })
          .limit(1000);

        interface DbCouponItem {
          code: string;
          created_at: string;
          status: string;
          expires_at: string;
          redeemed_at?: string;
          redeemed_by?: string;
          bill_number?: string;
          bill_amount?: number;
          customer_phone?: string;
          customer?: {
            id?: string;
            phone?: string;
            full_name?: string;
            city?: string;
            business_category?: string;
            lead_source?: string;
          };
          prize?: {
            title?: string;
          };
        }

        if (!error && dbCoupons && dbCoupons.length > 0) {
          loadedFromDatabase = true;
          const typedCoupons = dbCoupons as unknown as DbCouponItem[];
          leads = typedCoupons.map((c: DbCouponItem) => {
            const cust = c.customer;
            const phone = cust?.phone || c.customer_phone || '';
            return {
              leadId: cust?.id || `LEAD-${c.code.slice(0, 8)}`,
              timestamp: new Date(c.created_at).toLocaleString('hi-IN'),
              storeName,
              customerName: cust?.full_name || 'अज्ञात ग्राहक',
              phone,
              whatsappLink: `https://wa.me/91${phone}`,
              city: cust?.city || 'कुशलगढ़',
              category: cust?.business_category || 'सामान्य ग्राहक',
              purchaseFrequency: 'नियमित ग्राहक (Regular)',
              gameType: cust?.lead_source?.includes('SPIN') ? 'spin' : 'scratch',
              prizeTitle: c.prize?.title || 'विशेष डिस्काउंट',
              couponCode: c.code,
              couponStatus: c.status === 'redeemed' ? '✅ रिडीम हो चुका' : 'सक्रिय (VALID)',
              expiresAt: new Date(c.expires_at).toLocaleDateString('hi-IN'),
            };
          });

          redemptions = typedCoupons
            .filter((c: DbCouponItem) => c.status === 'redeemed')
            .map((c: DbCouponItem) => ({
              timestamp: c.redeemed_at ? new Date(c.redeemed_at).toLocaleString('hi-IN') : '',
              storeName,
              couponCode: c.code,
              billNumber: c.bill_number || '',
              billAmount: c.bill_amount || 0,
              redeemedBy: c.redeemed_by || 'मनोज नाहटा (काउंटर)',
              customerPhone: c.customer?.phone || c.customer_phone,
              customerName: c.customer?.full_name,
            }));
        }
      } catch (dbErr) {
        console.warn('Supabase bulk sync query failed, falling back to local store:', dbErr);
      }
    }
  }

  // 4. फ़ॉलबैक: इन-मेमोरी / लोकल स्टोर से डेटा लोड करना
  if (!loadedFromDatabase) {
    const customers = getStoredCustomers();
    const coupons = getStoredCoupons();

    leads = coupons.map((c) => {
      const cust = c.customer || customers.find((cust) => cust.id === c.customer_id);
      const phone = cust?.phone || c.customer_phone || '';
      return {
        leadId: cust?.id || `LEAD-${c.code.slice(0, 8)}`,
        timestamp: new Date(c.created_at).toLocaleString('hi-IN'),
        storeName,
        customerName: cust?.full_name || 'अज्ञात ग्राहक',
        phone,
        whatsappLink: `https://wa.me/91${phone}`,
        city: cust?.city || 'कुशलगढ़',
        category: cust?.business_category || 'घरेलू उपभोक्ता (Retail)',
        purchaseFrequency: 'नियमित ग्राहक (Regular)',
        gameType: cust?.lead_source?.includes('SPIN') ? 'spin' : 'scratch',
        prizeTitle: c.prize?.title || 'विशेष डिस्काउंट',
        couponCode: c.code,
        couponStatus: c.status === 'redeemed' ? '✅ रिडीम हो चुका' : 'सक्रिय (VALID)',
        expiresAt: new Date(c.expires_at).toLocaleDateString('hi-IN'),
      };
    });

    redemptions = coupons
      .filter((c) => c.status === 'redeemed')
      .map((c) => ({
        timestamp: c.redeemed_at ? new Date(c.redeemed_at).toLocaleString('hi-IN') : '',
        storeName,
        couponCode: c.code,
        billNumber: c.bill_number || '',
        billAmount: c.bill_amount || 0,
        redeemedBy: c.redeemed_by || 'मनोज नाहटा (काउंटर)',
        customerPhone: c.customer?.phone || c.customer_phone,
        customerName: c.customer?.full_name,
      }));
  }

  // 5. सुरक्षित बैचिंग व प्रेषण (Batching Dispatch to Google Sheets)
  const BATCH_SIZE = 50;
  let successCount = 0;
  let lastError = '';

  for (let i = 0; i < Math.max(leads.length, 1); i += BATCH_SIZE) {
    const chunkLeads = leads.slice(i, i + BATCH_SIZE);
    const chunkRedemptions = redemptions.slice(i, i + BATCH_SIZE);

    const res = await sendToGoogleSheetsWebhook(
      'BULK_SYNC',
      { leads: chunkLeads, redemptions: chunkRedemptions },
      overrideUrl
    );

    if (res.success) {
      successCount += chunkLeads.length;
    } else {
      lastError = res.message;
      break;
    }
  }

  if (lastError && successCount === 0) {
    return {
      success: false,
      message: `Google Sheets सिंक विफल: ${lastError}`,
      count: 0,
    };
  }

  const sourceLabel = loadedFromDatabase ? 'केंद्रीय डेटाबेस (Supabase)' : 'स्थानीय स्टोर';
  return {
    success: true,
    message: `${sourceLabel} से ${leads.length} लीड्स और ${redemptions.length} रिडेम्पशन Google Sheets में सुरक्षित रूप से सिंक हुए।`,
    count: leads.length,
  };
}
