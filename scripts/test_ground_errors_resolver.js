// Test Suite: Real-World Government Portal Error Resolver
const { KioskErrorResolver, KIOSK_GROUND_ERRORS } = require('../autoform-extension/kiosk-error-resolver.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runErrorTests() {
  console.log('\n======================================================');
  console.log('🚨 RUNNING REAL PORTAL GROUND ERROR RESOLVER TEST SUITE');
  console.log('======================================================\n');

  const resolver = new KioskErrorResolver();

  // SCENARIO 1: Real MPESB Profile Outdated Error
  console.log('--- 1. Testing MPESB Profile Outdated Error ---');
  const mockPage1 = `
    मध्य प्रदेश कर्मचारी चयन मंडल, भोपाल
    त्रुटि: आपकी प्रोफाइल में आधार ई-केवाईसी अद्यतन नहीं है। कृपया पहले अपनी प्रोफाइल पंजीयन आधार ई-केवाईसी द्वारा अपडेट करें, उसके बाद ही आवेदन फॉर्म भरें।
  `;
  const errors1 = resolver.detectPageErrors(mockPage1);
  assert(errors1.length === 1, 'Detected 1 blocking error on screen');
  assert(errors1[0].id === 'MPESB_EKYC_OUTDATED', 'Correctly identified MPESB_EKYC_OUTDATED error');
  assert(errors1[0].targetUrl.includes('CandidateEkycUpdate.aspx'), 'Provides direct 1-click URL to eKYC update form');

  // SCENARIO 2: Real 2025-2026 Live WebCam Photo Rule
  console.log('\n--- 2. Testing Live WebCam Photo Mandate ---');
  const mockPage2 = `
    ऑनलाइन आवेदन फॉर्म: मध्य प्रदेश पुलिस आरक्षक भर्ती 2026
    चेतावनी: लाइव फोटो कैप्चर अनिवार्य है। वेबकैम के माध्यम से आवेदक की सीधी फोटो लें।
  `;
  const errors2 = resolver.detectPageErrors(mockPage2);
  assert(errors2.length === 1, 'Detected live photo mandate on screen');
  assert(errors2[0].id === 'MPESB_LIVE_PHOTO_MANDATORY', 'Identified MPESB_LIVE_PHOTO_MANDATORY');

  // SCENARIO 3: Template 4x5cm Upload Dimension / Size Error
  console.log('\n--- 3. Testing Template File Size Mismatch ---');
  const mockPage3 = `
    Error: अपलोड की गई फ़ाइल का आकार अमान्य है। कृपया दिए गए टेम्पलेट (फोटो + हस्ताक्षर + हस्तलिखित घोषणा) को 200 KB के अंदर अपलोड करें।
  `;
  const errors3 = resolver.detectPageErrors(mockPage3);
  assert(errors3.length === 1, 'Detected template rejection error');
  assert(errors3[0].id === 'TEMPLATE_SIZE_REJECTED', 'Identified TEMPLATE_SIZE_REJECTED');

  // SCENARIO 4: Samagra UIDAI Server Timeout Error
  console.log('\n--- 4. Testing Samagra UIDAI Server Down / Timeout ---');
  const mockPage4 = `
    समग्र सामाजिक सुरक्षा मिशन (eKYC)
    त्रुटि: UIDAI सर्वर से प्रतिक्रिया प्राप्त नहीं हुई (Request Timeout). कृपया कुछ समय पश्चात पुनः प्रयास करें।
  `;
  const errors4 = resolver.detectPageErrors(mockPage4);
  assert(errors4.length === 1, 'Detected UIDAI timeout error');
  assert(errors4[0].id === 'UIDAI_SERVER_TIMEOUT', 'Identified UIDAI_SERVER_TIMEOUT');
  assert(errors4[0].severity === 'BIOMETRIC_FALLBACK', 'Flags Biometric (Mantra/Morpho) fallback immediately');

  // SCENARIO 5: Payment Deducted But Receipt Unpaid
  console.log('\n--- 5. Testing Payment Pending / Unpaid Transaction ---');
  const mockPage5 = `
    MPOnline Transaction Status: Unpaid Status. यदि आपके बैंक खाते से राशि कट गई है, तो कृपया सत्यापित करें (Verify Payment) पर क्लिक करें।
  `;
  const errors5 = resolver.detectPageErrors(mockPage5);
  assert(errors5.length === 1, 'Detected payment pending alert');
  assert(errors5[0].id === 'PAYMENT_PENDING_UNPAID', 'Identified PAYMENT_PENDING_UNPAID');
  assert(errors5[0].targetUrl.includes('DuplicateReceipt.aspx'), 'Gives direct verify transaction link');

  console.log('\n======================================================');
  console.log(`🏁 ERROR RESOLVER TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');
}

runErrorTests().catch(err => {
  console.error('Error Test Crashed:', err);
  process.exit(1);
});
