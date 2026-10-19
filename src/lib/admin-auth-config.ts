/**
 * Server-only admin credential configuration.
 * No fallback passwords, PINs or signing secrets: missing/weak values MUST fail closed.
 *
 * NOTE: PIN sign-in is transitional. Production SaaS must replace the shared PIN with
 * named identities, role checks, MFA and revocable sessions before public launch.
 */
type ConfigEnv = Record<string, string | undefined>;

export const getAdminSessionSecret = (env: ConfigEnv = process.env): string | null => {
  const raw = env.ADMIN_SESSION_SECRET;
  const value = raw?.trim();
  // Length is a basic guard, not proof of entropy. Generate a random secret in a secure vault.
  return value && value.length >= 32 ? value : null;
};

export const getExpectedAdminPin = (env: ConfigEnv = process.env): string | null => {
  const raw = env.ADMIN_PIN ?? env.ADMIN_SECURITY_PIN;
  const value = raw?.trim();
  // Known legacy four-digit PINs are no longer acceptable.
  return value && /^\d{6,12}$/.test(value) ? value : null;
};
