import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_SESSION_COOKIE = 'nahata_admin_auth_token';

// Minimum entropy length required for production session secret (32 chars)
const MIN_SECRET_LENGTH = 32;

/**
 * Returns the session secret.
 * In production: strictly requires ADMIN_SESSION_SECRET with >= 32 chars; returns null if missing/weak (fail-closed).
 * In development: allows dev fallback with an explicit warning if unset.
 */
export const getAdminSessionSecret = (): string | null => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (secret && secret.trim().length >= MIN_SECRET_LENGTH) {
    return secret.trim();
  }

  if (isProd) {
    console.error('[SECURITY CRITICAL] ADMIN_SESSION_SECRET is missing or shorter than 32 characters in production. Authentication is disabled (fail-closed).');
    return null;
  }

  // Non-production fallback with warning
  console.warn('[DEV WARNING] Running with development session secret fallback. Set ADMIN_SESSION_SECRET in .env.local.');
  return 'dev-only-secret-do-not-use-in-production-salt-nahata-2026';
};

/**
 * Returns the expected admin PIN.
 * In production: strictly requires ADMIN_PIN; returns null if missing (fail-closed).
 * In development: falls back to ADMIN_PIN or ADMIN_SECURITY_PIN or null (fail-closed).
 */
export const getExpectedAdminPin = (): string | null => {
  const pin = process.env.ADMIN_PIN || process.env.ADMIN_SECURITY_PIN;
  const isProd = process.env.NODE_ENV === 'production';

  if (pin && pin.trim().length > 0) {
    return pin.trim();
  }

  if (isProd) {
    console.error('[SECURITY CRITICAL] ADMIN_PIN environment variable is missing in production. Admin login is disabled (fail-closed).');
    return null;
  }

  // Non-production fallback with warning
  console.warn('[DEV WARNING] ADMIN_PIN unset in development. Defaulting to 9829 for local testing.');
  return '9829';
};

// In-memory sliding window rate limiter for admin login (max 5 attempts per 15 mins per IP)
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_ADMIN_LOGIN_ATTEMPTS = 5;
const adminLoginAttempts = new Map<string, { count: number; resetAt: number }>();

export const checkAdminLoginRateLimit = (
  ip: string
): { allowed: boolean; remainingMinutes?: number } => {
  const now = Date.now();
  const entry = adminLoginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    adminLoginAttempts.set(ip, { count: 1, resetAt: now + ADMIN_LOGIN_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ADMIN_LOGIN_ATTEMPTS) {
    const remainingMinutes = Math.max(1, Math.ceil((entry.resetAt - now) / 60000));
    return { allowed: false, remainingMinutes };
  }

  entry.count += 1;
  return { allowed: true };
};

export const resetAdminLoginRateLimit = (ip: string): void => {
  adminLoginAttempts.delete(ip);
};

// Generates HMAC signed session token
export const createAdminSessionToken = (): string | null => {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`nahata_admin:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
};

// Verifies HMAC signed session token (24-hour expiration)
export const verifyAdminSessionToken = (token: string | null | undefined): boolean => {
  try {
    if (!token || typeof token !== 'string' || !token.includes('.')) return false;
    const secret = getAdminSessionSecret();
    if (!secret) return false;

    const [timestamp, signature] = token.split('.');
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime)) return false;

    // Check 24-hour expiration
    if (Date.now() - tokenTime > 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
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

// Validates PIN securely on the server with constant-time equality
export const validateAdminPin = (inputPin: string): boolean => {
  if (!inputPin) return false;
  const expectedPin = getExpectedAdminPin();
  if (!expectedPin) return false;

  const sanitized = inputPin.trim();
  const inputBuffer = Buffer.from(sanitized, 'utf8');
  const expectedBuffer = Buffer.from(expectedPin, 'utf8');

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
};

export { ADMIN_SESSION_COOKIE };
