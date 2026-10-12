import { cookies } from 'next/headers';
import crypto from 'crypto';

export const CUSTOMER_SESSION_COOKIE = 'nahata_customer_session';

// Random opaque customer sessions in memory (sessionId -> { customerId, campaignId, createdAt })
interface CustomerSessionEntry {
  customerId: string;
  campaignId: string;
  createdAt: number;
}

const customerSessionStore = new Map<string, CustomerSessionEntry>();

/**
 * Creates an opaque cryptographically-random session identifier.
 * Crucial Rule: NO phone number, name, or PII is placed in the token or cookie.
 */
export async function setCustomerSession(customerId: string, campaignId: string): Promise<string> {
  const sessionId = crypto.randomBytes(24).toString('hex');
  const now = Date.now();

  customerSessionStore.set(sessionId, {
    customerId,
    campaignId,
    createdAt: now,
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (err) {
    // In environments where setting cookies is restricted, fail gracefully
    console.warn('Customer session cookie could not be written:', err);
  }

  return sessionId;
}

/**
 * Reads the opaque session cookie and returns the associated session record if valid.
 */
export async function getCustomerSession(): Promise<CustomerSessionEntry | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (!sessionId) return null;

    const entry = customerSessionStore.get(sessionId);
    if (!entry) return null;

    // 7-day expiration check
    if (Date.now() - entry.createdAt > 7 * 24 * 60 * 60 * 1000) {
      customerSessionStore.delete(sessionId);
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

/**
 * Clears the customer session cookie and invalidates the session in memory.
 */
export async function clearCustomerSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (sessionId) {
      customerSessionStore.delete(sessionId);
    }
    cookieStore.delete(CUSTOMER_SESSION_COOKIE);
  } catch {}
}
