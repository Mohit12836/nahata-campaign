/**
 * Google Sheets Auto-Sync Engine for Retail Offer Platform
 * Automatically synchronizes Customer Leads, Won Coupons, and Bill Redemptions
 * into Google Sheets & Google Drive in real-time.
 */

export interface GoogleSheetsLeadPayload {
  leadId?: string;
  timestamp: string;
  storeName: string;
  customerName: string;
  phone: string;
  whatsappLink: string;
  city: string;
  category: string;
  purchaseFrequency?: string;
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

let serverWebhookUrl = '';

export const setServerWebhookUrl = (url: string): void => {
  serverWebhookUrl = url ? url.trim() : '';
};

export const getServerWebhookUrl = (): string => {
  return serverWebhookUrl;
};

export const getStoredGoogleSheetsWebhookUrl = (): string => {
  if (typeof window === 'undefined') {
    return (
      serverWebhookUrl ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
      ''
    );
  }
  try {
    const local = localStorage.getItem(STORAGE_KEY_WEBHOOK);
    return (
      local ||
      serverWebhookUrl ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
      ''
    );
  } catch {
    return (
      serverWebhookUrl ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
      ''
    );
  }
};

export const saveStoredGoogleSheetsWebhookUrl = (url: string): void => {
  setServerWebhookUrl(url);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WEBHOOK, url.trim());
  } catch {}
};

export const GOOGLE_SHEETS_SYNC_SECRET =
  process.env.GOOGLE_SHEETS_SYNC_SECRET || 'NAHATA_SECURE_SYNC_2026_TOKEN';

const APPS_SCRIPT_URL_REGEX = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(\?.*)?$/;

/**
 * Validates that the provided webhook is a legitimate Google Apps Script Web App endpoint.
 * Prevents SSRF attacks and accidental requests to arbitrary hosts.
 */
export function isValidGoogleAppsScriptUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return APPS_SCRIPT_URL_REGEX.test(url.trim());
}

/**
 * Send payload to Google Sheets Web App Webhook (Google Apps Script)
 * Includes shared secret token and validates responses securely.
 */
export async function sendToGoogleSheetsWebhook(
  action: 'NEW_LEAD' | 'COUPON_REDEEMED' | 'BULK_SYNC' | 'PING',
  data: Record<string, unknown>,
  overrideUrl?: string,
  customSecret?: string
): Promise<{ success: boolean; message: string; rawResponse?: unknown }> {
  const webhookUrl =
    overrideUrl ||
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
    getStoredGoogleSheetsWebhookUrl();

  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      message: 'Google Sheets Webhook URL कॉन्फ़िगर नहीं है।',
    };
  }

  const trimmedUrl = webhookUrl.trim();
  if (!isValidGoogleAppsScriptUrl(trimmedUrl)) {
    return {
      success: false,
      message: 'अमान्य Webhook URL! केवल Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec) मान्य है।',
    };
  }

  const secretToken = customSecret || GOOGLE_SHEETS_SYNC_SECRET;

  try {
    const response = await fetch(trimmedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        authToken: secretToken,
        data,
        source: 'Nahata Retail Campaign Platform',
        sentAt: new Date().toISOString(),
      }),
      redirect: 'follow',
    });

    if (!response.ok && response.status !== 302 && response.type !== 'opaque') {
      return {
        success: false,
        message: `Google Sheets ने HTTP स्थिति कोड ${response.status} लौटाया।`,
      };
    }

    // Try parsing Apps Script response JSON
    let responseText = '';
    try {
      responseText = await response.text();
      const parsed = JSON.parse(responseText);

      if (parsed.status === 'UNAUTHORIZED') {
        return {
          success: false,
          message: `सुरक्षा त्रुटि: ${parsed.error || 'अमान्य टोकन।'}`,
          rawResponse: parsed,
        };
      }

      if (parsed.status === 'ERROR') {
        return {
          success: false,
          message: `Apps Script त्रुटि: ${parsed.error || 'अज्ञात त्रुटि'}`,
          rawResponse: parsed,
        };
      }

      if (parsed.status === 'SUCCESS' || parsed.status === 'ONLINE') {
        return {
          success: true,
          message: parsed.message || 'Google Sheet में डेटा सफलतापूर्वक सिंक हो गया!',
          rawResponse: parsed,
        };
      }
    } catch {
      // If response body is not parseable JSON (e.g. opaque redirect)
      if (response.ok || response.status === 200) {
        return {
          success: true,
          message: 'Google Sheet में डेटा सफलतापूर्वक पहुँच गया।',
        };
      }
    }

    return {
      success: true,
      message: 'Google Sheet में डेटा सफलतापूर्वक सिंक हो गया!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'नेटवर्क अनुरोध विफल';
    return {
      success: false,
      message: `Google Sheets सिंक कनेक्शन त्रुटि: ${errorMsg}`,
    };
  }
}
