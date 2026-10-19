import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminSessionSecret, getExpectedAdminPin } from '../src/lib/admin-auth-config.ts';

const validSecret = 'test-only-unique-random-looking-value-32-characters-minimum';

test('missing admin signing secret fails closed', () => {
  assert.equal(getAdminSessionSecret({}), null);
});
test('empty admin signing secret fails closed', () => {
  assert.equal(getAdminSessionSecret({ ADMIN_SESSION_SECRET: '  ' }), null);
});
test('short admin signing secret is refused', () => {
  assert.equal(getAdminSessionSecret({ ADMIN_SESSION_SECRET: 'too-short' }), null);
});
test('sufficient length session secret is accepted', () => {
  assert.equal(getAdminSessionSecret({ ADMIN_SESSION_SECRET: validSecret }), validSecret);
});
test('session secret whitespace is normalized', () => {
  assert.equal(getAdminSessionSecret({ ADMIN_SESSION_SECRET: '  ' + validSecret + '  ' }), validSecret);
});
test('missing and blank PIN fail closed', () => {
  assert.equal(getExpectedAdminPin({}), null);
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: '' }), null);
});
test('legacy weak PIN length is rejected', () => {
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: '1234' }), null);
});
test('PIN must be numeric and within length bounds', () => {
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: 'abc123' }), null);
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: '12345' }), null);
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: '1234567890123' }), null);
});
test('configured six digit PIN accepted', () => {
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: '314159' }), '314159');
});
test('legacy ADMIN_SECURITY_PIN variable works only if valid', () => {
  assert.equal(getExpectedAdminPin({ ADMIN_SECURITY_PIN: '271828' }), '271828');
});
test('invalid explicitly configured primary PIN cannot fall back to secondary', () => {
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: '', ADMIN_SECURITY_PIN: '271828' }), null);
});
test('primary PIN takes precedence over secondary PIN', () => {
  assert.equal(getExpectedAdminPin({ ADMIN_PIN: '314159', ADMIN_SECURITY_PIN: '271828' }), '314159');
});
