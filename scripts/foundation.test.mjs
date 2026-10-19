import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const auth = readFileSync(new URL('../src/lib/auth-server.ts', import.meta.url), 'utf8');
const control = readFileSync(new URL('../src/app/control/page.tsx', import.meta.url), 'utf8');

test('admin auth never ships the old fallback PIN or HMAC secret', () => {
  assert.doesNotMatch(auth, /'9829'/);
  assert.doesNotMatch(auth, /nahata-general-stores-admin-session-secret/);
  assert.match(auth, /ADMIN_SESSION_SECRET\?\.trim\(\)/);
  assert.match(auth, /Buffer\.byteLength\(secret, 'utf8'\) >= MIN_SECRET_LENGTH/);
  assert.match(auth, /return pin && pin\.length >= 8 \? pin : null/);
});

test('owner control center gates data before querying', () => {
  assert.match(control, /if \(!\(await isServerAdminAuthenticated\(\)\)\)/);
  assert.match(control, /redirect\('\/super-admin'\)/);
  assert.match(control, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(control, /\.from\('merchants'\)\.select\('id, status'\)/);
  assert.doesNotMatch(control, /getStoredMerchants|getSuperAdminMerchantsAction|mock-data/);
});

test('unfinished modules are accurately labeled, not exposed as active controls', () => {
  assert.match(control, /Planned · locked/);
  assert.match(control, /Merchant data unavailable/);
});
