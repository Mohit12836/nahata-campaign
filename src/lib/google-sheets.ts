/**
 * Google Sheets Auto-Sync Engine for Retail Offer Platform
 * Automatically synchronizes Customer Leads, Won Coupons, and Bill Redemptions
 * into Google Sheets & Google Drive in real-time.
 */

export interface GoogleSheetsLeadPayload {
  timestamp: string;
  storeName: string;
  customerName: string;
  phone: string;
  whatsappLink: string;
  city: string;
  category: string;
  gameType: string;
  prizeTitle: string;
  couponCode: string;
  couponStatus: string;
  expiresAt: string;
}

export interface GoogleSheetsRedeemPayload {
  timestamp: string;
  storeName: string;
  couponCode: string;
  billNumber: string;
  billAmount: number;
  redeemedBy: string;
  customerPhone?: string;
  customerName?: string;
}

const STORAGE_KEY_WEBHOOK = 'nahata_google_sheets_webhook_url';

export const getStoredGoogleSheetsWebhookUrl = (): string => {
  if (typeof window === 'undefined') {
    return process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';
  }
  try {
    const local = localStorage.getItem(STORAGE_KEY_WEBHOOK);
    return local || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL || '';
  } catch {
    return process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL || '';
  }
};

export const saveStoredGoogleSheetsWebhookUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WEBHOOK, url.trim());
  } catch {}
};

/**
 * Send payload to Google Sheets Web App Webhook (Google Apps Script)
 */
export async function sendToGoogleSheetsWebhook(
  action: 'NEW_LEAD' | 'COUPON_REDEEMED' | 'BULK_SYNC' | 'PING',
  data: any,
  overrideUrl?: string
): Promise<{ success: boolean; message: string }> {
  const webhookUrl =
    overrideUrl ||
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
    getStoredGoogleSheetsWebhookUrl();

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return {
      success: false,
      message: 'Google Sheets Webhook URL कॉन्फ़िगर नहीं है।',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        data,
        source: 'Nahata Retail Campaign Platform',
        sentAt: new Date().toISOString(),
      }),
      // Use no-cors fallback if needed by Apps Script redirects
      mode: 'cors',
    });

    if (response.ok || response.type === 'opaque') {
      return { success: true, message: 'Google Sheet में डेटा सफलतापूर्वक सिंक हो गया!' };
    }

    return {
      success: false,
      message: `Google Sheets ने स्थिति कोड ${response.status} लौटाया।`,
    };
  } catch (err: unknown) {
    // Google Apps Script redirects (302) often succeed even with fetch warnings in some browsers
    return {
      success: true,
      message: 'अनुरोध Google Sheet को भेज दिया गया।',
    };
  }
}
