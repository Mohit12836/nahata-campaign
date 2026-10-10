import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_SESSION_COOKIE = 'nahata_admin_auth_token';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'nahata-festive-store-secret-salt-2026';
const EXPECTED_ADMIN_PIN = process.env.ADMIN_PIN || '9829';

// Generates HMAC signed session token
export const createAdminSessionToken = (): string => {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`nahata_admin:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
};

// Verifies HMAC signed session token (24-hour expiration)
export const verifyAdminSessionToken = (token: string): boolean => {
  try {
    if (!token || !token.includes('.')) return false;
    const [timestamp, signature] = token.split('.');
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime)) return false;

    // Check 24-hour expiration
    if (Date.now() - tokenTime > 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`nahata_admin:${timestamp}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch {
    return false;
  }
};

// Server-side check for authenticated admin request
export const isServerAdminAuthenticated = async (): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return false;
    return verifyAdminSessionToken(token);
  } catch {
    return false;
  }
};

// Validates PIN securely on the server
export const validateAdminPin = (inputPin: string): boolean => {
  if (!inputPin) return false;
  const sanitized = inputPin.trim();
  const inputBuffer = Buffer.from(sanitized, 'utf8');
  const expectedBuffer = Buffer.from(EXPECTED_ADMIN_PIN, 'utf8');

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
};

export { ADMIN_SESSION_COOKIE };
