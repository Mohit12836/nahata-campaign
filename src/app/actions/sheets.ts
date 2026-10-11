'use server';

import { sendToGoogleSheetsWebhook, GoogleSheetsLeadPayload, GoogleSheetsRedeemPayload } from '@/lib/google-sheets';
import { getStoredCustomers, getStoredCoupons, getStoredCampaign } from '@/lib/store';

export async function testGoogleSheetsWebhookAction(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, message: 'कृपया वैध Google Apps Script Web App URL दर्ज करें।' };
  }

  const res = await sendToGoogleSheetsWebhook('PING', { test: true }, webhookUrl);
  return res;
}

export async function bulkSyncToGoogleSheetsAction(overrideUrl?: string): Promise<{ success: boolean; message: string; count: number }> {
  const customers = getStoredCustomers();
  const coupons = getStoredCoupons();
  const campaign = getStoredCampaign();

  const leads: GoogleSheetsLeadPayload[] = coupons.map((c) => {
    const cust = c.customer || customers.find((cust) => cust.id === c.customer_id);
    const phone = cust?.phone || c.customer_phone || '';
    return {
      leadId: cust?.id || `LEAD-${c.code.slice(0, 8)}`,
      timestamp: new Date(c.created_at).toLocaleString('hi-IN'),
      storeName: campaign.store_name,
      customerName: cust?.full_name || 'अज्ञात ग्राहक',
      phone: phone,
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

  const redemptions: GoogleSheetsRedeemPayload[] = coupons
    .filter((c) => c.status === 'redeemed')
    .map((c) => ({
      timestamp: c.redeemed_at ? new Date(c.redeemed_at).toLocaleString('hi-IN') : '',
      storeName: campaign.store_name,
      couponCode: c.code,
      billNumber: c.bill_number || '',
      billAmount: c.bill_amount || 0,
      redeemedBy: c.redeemed_by || 'मनोज नाहटा (काउंटर)',
      customerPhone: c.customer?.phone || c.customer_phone,
      customerName: c.customer?.full_name,
    }));

  const res = await sendToGoogleSheetsWebhook(
    'BULK_SYNC',
    { leads, redemptions },
    overrideUrl
  );

  return {
    success: res.success,
    message: res.message,
    count: leads.length,
  };
}
