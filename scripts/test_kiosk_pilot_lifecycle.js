// Test Suite: Kiosk Pilot Engine, Checkpoints, Hold & Resume, and Sheet Sync
const { KIOSK_PORTAL_RECIPES, detectActiveRecipe, generateWhatsAppOtpPrompt } = require('../autoform-extension/kiosk-recipes.js');
const { KioskPilotEngine } = require('../autoform-extension/kiosk-pilot-engine.js');
const { GoogleSheetSync } = require('../autoform-extension/google-sheet-sync.js');
const MPOnlineVault = require('../autoform-extension/mponline-vault.js');

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

async function runTests() {
  console.log('\n======================================================');
  console.log('🏛️ RUNNING KIOSK GROUND-REALITY PILOT TEST SUITE');
  console.log('======================================================\n');

  // TEST SUITE 1: Recipe Detection & SOPs
  console.log('--- 1. Recipe & Portal Knowledge Detection ---');
  const vyapamRecipe = detectActiveRecipe('https://esb.mponline.gov.in/Portal/Examinations/Vyapam/ExamsList.aspx');
  assert(vyapamRecipe && vyapamRecipe.id === 'mpesb_vyapam', 'Vyapam portal recipe detected correctly');
  assert(vyapamRecipe.totalOtps === 2, 'Vyapam totalOtps matches reality (2 OTPs)');
  assert(vyapamRecipe.directLinks.forgetPassword.includes('Forgot_Password'), 'Vyapam Forget Password link registered');

  const samagraRecipe = detectActiveRecipe('https://samagra.gov.in/Citizen/eKYC/e_kyc.aspx');
  assert(samagraRecipe && samagraRecipe.id === 'samagra_ekyc', 'Samagra eKYC recipe detected');
  assert(samagraRecipe.directLinks.searchMemberId.includes('SearchMember'), 'Samagra Member Search link registered');

  const edistrictRecipe = detectActiveRecipe('https://mpedistrict.gov.in/MPL/Citizen_Registration.aspx');
  assert(edistrictRecipe && edistrictRecipe.id === 'mp_edistrict', 'MP e-District Lok Seva recipe detected');

  const sarathiRecipe = detectActiveRecipe('https://sarathi.parivahan.gov.in/sarathiservice/newLLDet.do');
  assert(sarathiRecipe && sarathiRecipe.id === 'parivahan_sarathi', 'Sarathi DL recipe detected');

  // TEST SUITE 2: WhatsApp OTP Prompt Generator
  console.log('\n--- 2. WhatsApp OTP Dynamic Prompts ---');
  const applicantMock = {
    fullName: 'राहुल जैन',
    phone: '9826012345'
  };
  const waMsg = generateWhatsAppOtpPrompt(applicantMock, vyapamRecipe, { otpType: 'AADHAAR_LINKED_MOBILE' });
  assert(waMsg.includes('राहुल जैन'), 'WhatsApp message contains applicant name');
  assert(waMsg.includes('MPESB (व्यापम)'), 'WhatsApp message contains portal name');
  assert(waMsg.includes('आधार कार्ड से जुड़े मोबाइल'), 'WhatsApp message correctly states Aadhaar mobile OTP');

  // TEST SUITE 3: Google Sheet CSV Ingestion
  console.log('\n--- 3. Google Sheet CSV Bulk Parsing (1000 Applicants) ---');
  const sheetSync = new GoogleSheetSync();
  const sampleCsv = `Name,Phone,SamagraId,Aadhaar,District,Roll10th,Service,Status
"Mohit Jain, Indore",6263879076,182736459,928374628192,Indore,19827364,mpesb_vyapam,PENDING
"Priya Sharma",9826012345,293847102,817293840192,Bhopal,21928374,samagra_ekyc,PENDING
"Sunil Verma",9111223344,384729104,716253490182,Ujjain,39281726,mp_edistrict,PENDING`;

  const parsedQueue = sheetSync.parseCsvToApplicants(sampleCsv);
  assert(parsedQueue.length === 3, 'Parsed 3 applicants from CSV successfully');
  assert(parsedQueue[0].fullName === 'Mohit Jain, Indore', 'CSV handled quotes with commas correctly');
  assert(parsedQueue[0].phone === '6263879076', 'Parsed mobile number correctly');
  assert(parsedQueue[1].serviceCode === 'samagra_ekyc', 'Parsed service code correctly');

  // TEST SUITE 4: Kiosk Pilot Lifecycle (Launch -> Hold -> Next -> Resume -> Done)
  console.log('\n--- 4. Full Kiosk Pilot Lifecycle: Hold & Next ---');
  const pilot = new KioskPilotEngine();
  await pilot.loadBatchQueue(parsedQueue);
  assert(pilot.activeQueue.length === 3, 'Batch loaded into active queue (3 pending)');

  // Step 1: Launch Applicant 1 (Mohit Jain)
  const launch1 = await pilot.launchApplicant();
  assert(launch1.success === true, 'Launched Applicant 1 successfully');
  assert(pilot.currentApplicant.fullName === 'Mohit Jain, Indore', 'Current applicant is Mohit Jain');
  assert(launch1.targetUrl.includes('esb.mponline.gov.in'), 'Auto-navigated to Vyapam URL without operator typing');

  // Step 2: Applicant 1 is not giving OTP! Operator clicks HOLD & NEXT
  const holdRes = await pilot.holdCurrentApplicant('Customer phone switched off for OTP', launch1.targetUrl, 2);
  assert(holdRes.success === true, 'Applicant 1 put on HOLD successfully');
  assert(pilot.heldQueue.length === 1, 'Held queue has 1 applicant');
  assert(pilot.heldQueue[0].holdReason === 'Customer phone switched off for OTP', 'Hold reason recorded');
  assert(pilot.currentApplicant === null, 'Active slot is cleared for next');

  // Step 3: Launch Applicant 2 (Priya Sharma)
  const launch2 = await pilot.launchApplicant();
  assert(launch2.success === true, 'Launched Applicant 2 (Priya Sharma)');
  assert(pilot.currentApplicant.fullName === 'Priya Sharma', 'Current applicant is Priya Sharma');
  assert(launch2.targetUrl.includes('samagra.gov.in'), 'Auto-navigated to Samagra URL');

  // Step 4: Priya completes form successfully
  const doneRes = await pilot.markCompleted('SAMAGRA_EKYC_982710');
  assert(doneRes.success === true, 'Applicant 2 marked COMPLETED');
  assert(pilot.historyQueue.length === 1, 'History queue recorded 1 completed form');
  assert(pilot.historyQueue[0].applicationNumber === 'SAMAGRA_EKYC_982710', 'Application number saved');

  // Step 5: Mohit Jain calls back with OTP! Operator clicks RESUME
  console.log('\n--- 5. 1-Click Resume from Held Checkpoint ---');
  const resumeRes = await pilot.resumeHeldApplicant(pilot.heldQueue[0].id);
  assert(resumeRes.success === true, 'Applicant 1 RESUMED successfully from exact step');
  assert(pilot.currentApplicant.fullName === 'Mohit Jain, Indore', 'Mohit Jain is active again');
  assert(pilot.heldQueue.length === 0, 'Held queue is now 0');
  assert(resumeRes.resumeUrl.includes('esb.mponline.gov.in'), 'Resumed at exact saved URL');

  // Mohit Jain Final Submit
  const finalSubmit = await pilot.markCompleted('MPESB_POLICE_2026_09871');
  assert(finalSubmit.success === true, 'Mohit Jain marked COMPLETED with Vyapam App Number');
  assert(pilot.historyQueue.length === 2, 'History queue has 2 completed forms');

  console.log('\n======================================================');
  console.log(`🏁 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Test Suite Crashed:', err);
  process.exit(1);
});
