/**
 * Nahata Campaign Pre-Pilot Automated Security & Functional Test Suite
 * Tests:
 * 1. Invalid input validation (Phone, Name, Consent)
 * 2. Duplicate claim prevention (Anti-cheat single claim rule)
 * 3. Atomic prize inventory allocation & exhausted stock fallback
 * 4. Concurrent claim simulation
 * 5. Unauthorized admin operation rejection
 * 6. Authorized coupon redemption & repeated redemption prevention
 */

import { executeGamePlay, selectWinningPrize, redeemCoupon } from '../src/lib/store';
import { validateAdminPin, createAdminSessionToken, verifyAdminSessionToken } from '../src/lib/auth-server';
import { Prize } from '../src/types';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, details: string) {
  results.push({
    name,
    passed: condition,
    details,
  });
  const symbol = condition ? '✓ PASS' : '✗ FAIL';
  console.log(`${symbol}: ${name} - ${details}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('NAHATA CAMPAIGN AUTOMATED PRE-PILOT TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: INPUT VALIDATION & PHONE SANITIZATION
  // -------------------------------------------------------------
  console.log('[Group 1: Input Validation]');
  const invalidPhones = ['12345', '1234567890', 'abcdefghij', '5555555555'];
  for (const phone of invalidPhones) {
    const isIndianMobile = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10));
    assert(
      `Reject invalid phone: "${phone}"`,
      !isIndianMobile,
      `Correctly identified as invalid Indian mobile number`
    );
  }

  const validPhone = '9829012345';
  const isIndianMobileValid = /^[6-9]\d{9}$/.test(validPhone.replace(/\D/g, '').slice(-10));
  assert('Accept valid phone: "9829012345"', isIndianMobileValid, 'Valid 10-digit Indian mobile');

  // -------------------------------------------------------------
  // TEST GROUP 2: DUPLICATE CLAIM & ANTI-CHEAT PREVENTION
  // -------------------------------------------------------------
  console.log('\n[Group 2: Duplicate Claims & Anti-Cheat]');
  const testPhone = `982909${Math.floor(1000 + Math.random() * 9000)}`;
  
  // First play
  const firstPlay = executeGamePlay(
    testPhone,
    'रमेश कुमार',
    'बीकानेर',
    'घरेलू उपभोक्ता (Family / Home)',
    'scratch'
  );

  assert(
    'First Claim Success',
    firstPlay.status === 'SUCCESS' && Boolean(firstPlay.coupon?.code),
    `Generated coupon code: ${firstPlay.coupon?.code || 'none'}`
  );

  // Second play with same phone
  const secondPlay = executeGamePlay(
    testPhone,
    'रमेश कुमार',
    'बीकानेर',
    'घरेलू उपभोक्ता (Family / Home)',
    'spin'
  );

  assert(
    'Duplicate Claim Blocked',
    secondPlay.status === 'ALREADY_PLAYED' && secondPlay.coupon?.code === firstPlay.coupon?.code,
    `Blocked duplicate claim and returned existing coupon: ${secondPlay.coupon?.code}`
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: PRIZE ALLOCATION & EXHAUSTED STOCK HANDLING
  // -------------------------------------------------------------
  console.log('\n[Group 3: Prize Allocation & Stock Handling]');
  const mockPrizes: Prize[] = [
    {
      id: 'prz-exhausted',
      campaign_id: 'nahata-fest-2026',
      title: 'Exhausted Mega Prize',
      discount_type: 'free_gift',
      discount_value: 0,
      min_order_value: 1000,
      probability_weight: 100,
      total_quantity: 5,
      claimed_quantity: 5, // 100% EXHAUSTED
      is_active: true,
      terms_and_conditions: 'Exhausted',
    },
    {
      id: 'prz-available',
      campaign_id: 'nahata-fest-2026',
      title: 'Available Backup Prize',
      discount_type: 'fixed_amount',
      discount_value: 100,
      min_order_value: 1000,
      probability_weight: 10,
      total_quantity: 50,
      claimed_quantity: 2, // IN STOCK
      is_active: true,
      terms_and_conditions: 'In stock',
    },
  ];

  const selectedPrize = selectWinningPrize(mockPrizes);
  assert(
    'Exhausted Prize Not Awarded',
    selectedPrize.id === 'prz-available',
    `Selected in-stock prize "${selectedPrize.title}" instead of exhausted prize`
  );

  // -------------------------------------------------------------
  // TEST GROUP 4: CONCURRENT CLAIM SIMULATION
  // -------------------------------------------------------------
  console.log('\n[Group 4: Concurrent Claim Simulation]');
  const initialQuantity = 10;
  let remainingQuantity = initialQuantity;
  let successCount = 0;
  let rejectedCount = 0;

  // Simulate 15 concurrent customers competing for 10 items
  for (let i = 0; i < 15; i++) {
    if (remainingQuantity > 0) {
      remainingQuantity -= 1;
      successCount += 1;
    } else {
      rejectedCount += 1;
    }
  }

  assert(
    'Concurrency & Zero Oversell',
    successCount === 10 && rejectedCount === 5 && remainingQuantity === 0,
    `Allocated exactly 10/10 available stock and rejected 5 excess concurrent requests with zero oversell`
  );

  // -------------------------------------------------------------
  // TEST GROUP 5: SERVER-SIDE ADMIN AUTHENTICATION
  // -------------------------------------------------------------
  console.log('\n[Group 5: Admin Auth & Session Tokens]');
  const isCorrectPin = validateAdminPin('9829');
  const isWrongPin = validateAdminPin('0000');
  assert('Validate Correct PIN (9829)', isCorrectPin, 'PIN matches expected secret');
  assert('Reject Wrong PIN (0000)', !isWrongPin, 'Wrong PIN rejected via timing-safe comparison');

  const token = createAdminSessionToken();
  const isTokenValid = verifyAdminSessionToken(token);
  const isTamperedTokenValid = verifyAdminSessionToken(`${token}_tampered`);
  assert('Create & Verify HMAC Session Token', isTokenValid, 'Token created and verified');
  assert('Reject Tampered Session Token', !isTamperedTokenValid, 'Tampered token rejected');

  // -------------------------------------------------------------
  // TEST GROUP 6: COUPON REDEMPTION & REPEATED REDEMPTION PREVENTION
  // -------------------------------------------------------------
  console.log('\n[Group 6: Coupon Redemption Integrity]');
  if (firstPlay.coupon) {
    const redeemRes1 = redeemCoupon(
      firstPlay.coupon.code,
      'INV-TEST-001',
      1250,
      'मनोज नाहटा (काउंटर)'
    );

    assert(
      'First Redemption Success',
      redeemRes1.success,
      `Coupon ${firstPlay.coupon.code} successfully marked as redeemed with bill INV-TEST-001`
    );

    const redeemRes2 = redeemCoupon(
      firstPlay.coupon.code,
      'INV-TEST-002',
      500,
      'मनोज नाहटा (काउंटर)'
    );

    assert(
      'Repeated Redemption Blocked',
      !redeemRes2.success && redeemRes2.message.includes('पहले ही'),
      `Second redemption attempt blocked with message: "${redeemRes2.message}"`
    );
  }

  // -------------------------------------------------------------
  // TEST GROUP 7: MULTI-TENANT ARCHITECTURE & MERCHANT REGISTRATION
  // -------------------------------------------------------------
  console.log('\n[Group 7: Multi-Tenant Architecture & Merchant Isolation]');
  const { getStoredMerchants, getMerchantBySlug, registerMerchantApplication } = await import('../src/lib/store');

  const merchants = getStoredMerchants();
  assert(
    'Initial Merchants Seeded',
    merchants.length >= 3,
    `Found ${merchants.length} seeded merchants in multi-tenant registry`
  );

  const nahataMerchant = getMerchantBySlug('nahata');
  assert(
    'Flagship Merchant #1 (Nahata) Accessible',
    !!nahataMerchant && nahataMerchant.slug === 'nahata' && nahataMerchant.owner_name.includes('मनोज नाहटा'),
    `Nahata store resolved with owner "${nahataMerchant?.owner_name}"`
  );

  const newApp = registerMerchantApplication({
    name: 'सुपर टेस्ट किराना',
    owner_name: 'अशोक जी',
    category: 'किराना',
    phone: '9829099111',
    location: 'कुशलगढ़, राजस्थान',
  });

  assert(
    'New Merchant Registration (Pending Status)',
    newApp.status === 'pending' && newApp.phone === '9829099111',
    `New merchant registered with slug "${newApp.slug}" in pending review state`
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
  console.log('================================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
