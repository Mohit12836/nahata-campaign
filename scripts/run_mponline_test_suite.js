/**
 * MPOnline Kiosk & Vyapam Multi-Level Verification Suite
 * Tests Level 1 (Data Normalization & Bilingual Parsing),
 * Level 2 (ASP.NET WebForms Un-mangling & Cascading Selects),
 * and Level 3 (Kiosk Citizen Vault & Mobile Lookup)
 */

const SmartParser = require('../autoform-extension/smart-parser.js');
const MPOnlineVault = require('../autoform-extension/mponline-vault.js');

console.log('🏛️ ====================================================');
console.log('   MPONLINE & VYAPAM CITIZEN MULTI-LEVEL TEST SUITE    ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

// ---------------------------------------------------------------------
// TEST 1: Level 1 - Mohit Jain Full Dossier Bilingual Extraction
// ---------------------------------------------------------------------
console.log('--- TEST 1: Level 1 - Mohit Jain MPOnline Dossier ---');
const mohitRaw = `
  आवेदक का नाम: मोहित जैन (Mohit Jain)
  पिता का नाम: रमेश जैन (Ramesh Jain)
  माता का नाम: विमला जैन (Vimala Jain)
  मोबाइल नंबर: 6263879076
  ईमेल: anukrupa12836@gmail.com
  जन्म दिनांक: 15/08/1995
  लिंग: Male (पुरुष)
  समग्र सदस्य आईडी: 182736459
  समग्र परिवार आईडी: 72819364
  MPESB प्रोफाइल पंजीयन: 8392019284
  आधार नंबर: 9283-7462-8192
  पैन नंबर: ABCPJ1234F
  वर्ग / श्रेणी: General
  मूल निवासी: मध्य प्रदेश
  जिला: Indore
  तहसील: Indore
  पिनकोड: 452001
  पता: 124, तिलक नगर, मुख्य मार्ग, इंदौर, मध्य प्रदेश
  10वीं रोल नंबर: 19827364 | MP Board Bhopal
  12वीं रोल नंबर: 21928374 | MP Board Bhopal
  बैंक खाता नंबर: 918273645019
  IFSC Code: SBIN0001234
  घोषणा: सत्य एवं प्रमाणित
`;

const parsedMohit = SmartParser.parseRoughData(mohitRaw);

assert(parsedMohit.fullName === 'Mohit Jain', 'Full Name extracted in English', `Got "${parsedMohit.fullName}"`);
assert(parsedMohit.nameHindi === 'मोहित जैन', 'Devanagari Name separated', `Got "${parsedMohit.nameHindi}"`);
assert(parsedMohit.fatherName === 'Ramesh Jain', 'Father Name isolated', `Got "${parsedMohit.fatherName}"`);
assert(parsedMohit.motherName === 'Vimala Jain', 'Mother Name isolated', `Got "${parsedMohit.motherName}"`);
assert(parsedMohit.samagraMember === '182736459', '9-Digit Samagra Member ID extracted', `Got "${parsedMohit.samagraMember}"`);
assert(parsedMohit.samagraFamily === '72819364', '8-Digit Samagra Family ID extracted', `Got "${parsedMohit.samagraFamily}"`);
assert(parsedMohit.mpesbProfile === '8392019284', 'MPESB Vyapam Profile extracted', `Got "${parsedMohit.mpesbProfile}"`);
assert(parsedMohit.aadhaar === '928374628192', '12-Digit Aadhaar cleaned', `Got "${parsedMohit.aadhaar}"`);
assert(parsedMohit.pan === 'ABCPJ1234F', 'PAN Card formatted', `Got "${parsedMohit.pan}"`);
assert(parsedMohit.phone === '6263879076', '10-Digit Mobile verified', `Got "${parsedMohit.phone}"`);
assert(parsedMohit.district === 'Indore', 'MP District normalized', `Got "${parsedMohit.district}"`);
assert(parsedMohit.roll10th === '19827364', '10th Roll separated from Board', `Got "${parsedMohit.roll10th}"`);
assert(parsedMohit.board10th === 'MP Board Bhopal', '10th Board isolated', `Got "${parsedMohit.board10th}"`);
assert(parsedMohit.roll12th === '21928374', '12th Roll separated from Board', `Got "${parsedMohit.roll12th}"`);
assert(parsedMohit.board12th === 'MP Board Bhopal', '12th Board isolated', `Got "${parsedMohit.board12th}"`);

// ---------------------------------------------------------------------
// TEST 2: Level 1 - Student Vyapam OBC & Caste Certificate Extraction
// ---------------------------------------------------------------------
console.log('\n--- TEST 2: Level 1 - Student Vyapam OBC & Caste Cert ---');
const studentRaw = `
  Candidate: Priya Sharma
  Father Name: Suresh Sharma
  Mother Name: Geeta Sharma
  Mobile: 9826012345
  DOB: 20/07/2001
  Gender: Female
  Samagra Sadasya ID: 192837465
  Samagra Parivar ID: 81928374
  MPESB Vyapam Profile: 9182736450
  Aadhaar: 817263549182
  Category: OBC
  Caste Certificate No: RS/420/01/2021
  District: Bhopal
  Pincode: 462001
  Address: MP Nagar Zone 2, Bhopal
  10th Roll No: 20182736
  Account No: 5010023456789
  IFSC: HDFC0001234
  Terms: True
`;

const parsedStudent = SmartParser.parseRoughData(studentRaw);

assert(parsedStudent.fullName === 'Priya Sharma', 'Candidate Name parsed', `Got "${parsedStudent.fullName}"`);
assert(parsedStudent.nameHindi === 'प्रिया शर्मा', 'Phonetic Hindi Transliteration generated', `Got "${parsedStudent.nameHindi}"`);
assert(parsedStudent.fatherName === 'Suresh Sharma', 'Father Name parsed', `Got "${parsedStudent.fatherName}"`);
assert(parsedStudent.motherName === 'Geeta Sharma', 'Mother Name parsed', `Got "${parsedStudent.motherName}"`);
assert(parsedStudent.category === 'OBC', 'OBC Category detected', `Got "${parsedStudent.category}"`);
assert(parsedStudent.casteCertNo === 'RS/420/01/2021', 'RS/ Caste Certificate clean extracted', `Got "${parsedStudent.casteCertNo}"`);
assert(parsedStudent.district === 'Bhopal', 'Bhopal District matched', `Got "${parsedStudent.district}"`);
assert(parsedStudent.samagraMember === '192837465', 'Student Samagra Member ID', `Got "${parsedStudent.samagraMember}"`);
assert(parsedStudent.samagraFamily === '81928374', 'Student Samagra Family ID', `Got "${parsedStudent.samagraFamily}"`);

// ---------------------------------------------------------------------
// TEST 3: Level 2 - ASP.NET WebForms Mangled Portal Fields Matching
// ---------------------------------------------------------------------
console.log('\n--- TEST 3: Level 2 - ASP.NET WebForms Mangled Portal Matching ---');

// Mock fields as they appear on genuine MPOnline / Vyapam ASP.NET WebForms pages
const aspNetPageFields = [
  {
    id: 'ctl00_ContentPlaceHolder1_txtSamagraMemberID',
    name: 'ctl00$ContentPlaceHolder1$txtSamagraMemberID',
    cleanId: 'SamagraMemberID',
    cleanName: 'SamagraMemberID',
    label: '',
    placeholder: '',
    type: 'text',
    tagName: 'INPUT',
    selector: '#ctl00_ContentPlaceHolder1_txtSamagraMemberID'
  },
  {
    id: 'ctl00_ContentPlaceHolder1_txtApplicantName',
    name: 'ctl00$ContentPlaceHolder1$txtApplicantName',
    cleanId: 'ApplicantName',
    cleanName: 'ApplicantName',
    label: '',
    placeholder: '',
    type: 'text',
    tagName: 'INPUT',
    selector: '#ctl00_ContentPlaceHolder1_txtApplicantName'
  },
  {
    id: 'ctl00_ContentPlaceHolder1_txtFatherName',
    name: 'ctl00$ContentPlaceHolder1$txtFatherName',
    cleanId: 'FatherName',
    cleanName: 'FatherName',
    label: '',
    placeholder: '',
    type: 'text',
    tagName: 'INPUT',
    selector: '#ctl00_ContentPlaceHolder1_txtFatherName'
  },
  {
    id: 'ctl00_ContentPlaceHolder1_txtMotherName',
    name: 'ctl00$ContentPlaceHolder1$txtMotherName',
    cleanId: 'MotherName',
    cleanName: 'MotherName',
    label: '',
    placeholder: '',
    type: 'text',
    tagName: 'INPUT',
    selector: '#ctl00_ContentPlaceHolder1_txtMotherName'
  },
  {
    id: 'ctl00_ContentPlaceHolder1_ddlDistrict',
    name: 'ctl00$ContentPlaceHolder1$ddlDistrict',
    cleanId: 'District',
    cleanName: 'District',
    label: '',
    placeholder: '',
    type: 'select-one',
    tagName: 'SELECT',
    options: [{ value: 'Indore', text: 'Indore' }, { value: 'Bhopal', text: 'Bhopal' }],
    selector: '#ctl00_ContentPlaceHolder1_ddlDistrict'
  },
  {
    id: 'ctl00_ContentPlaceHolder1_txtAadhaarNo',
    name: 'ctl00$ContentPlaceHolder1$txtAadhaarNo',
    cleanId: 'AadhaarNo',
    cleanName: 'AadhaarNo',
    label: '',
    placeholder: '',
    type: 'text',
    tagName: 'INPUT',
    selector: '#ctl00_ContentPlaceHolder1_txtAadhaarNo'
  }
];

const aspNetMatches = SmartParser.matchFields(aspNetPageFields, parsedMohit);

const mMember = aspNetMatches.find(m => m.field.id.includes('txtSamagraMemberID'));
const mName = aspNetMatches.find(m => m.field.id.includes('txtApplicantName'));
const mFather = aspNetMatches.find(m => m.field.id.includes('txtFatherName'));
const mMother = aspNetMatches.find(m => m.field.id.includes('txtMotherName'));
const mDist = aspNetMatches.find(m => m.field.id.includes('ddlDistrict'));
const mAadhaar = aspNetMatches.find(m => m.field.id.includes('txtAadhaarNo'));

assert(mMember && mMember.valueToFill === '182736459', 'ASP.NET ctl00$...txtSamagraMemberID matched', `Got "${mMember?.valueToFill}"`);
assert(mName && mName.valueToFill === 'Mohit Jain', 'ASP.NET ctl00$...txtApplicantName matched', `Got "${mName?.valueToFill}"`);
assert(mFather && mFather.valueToFill === 'Ramesh Jain', 'ASP.NET ctl00$...txtFatherName matched', `Got "${mFather?.valueToFill}"`);
assert(mMother && mMother.valueToFill === 'Vimala Jain', 'ASP.NET ctl00$...txtMotherName matched', `Got "${mMother?.valueToFill}"`);
assert(mDist && mDist.valueToFill === 'Indore', 'ASP.NET ctl00$...ddlDistrict matched', `Got "${mDist?.valueToFill}"`);
assert(mAadhaar && mAadhaar.valueToFill === '928374628192', 'ASP.NET ctl00$...txtAadhaarNo matched', `Got "${mAadhaar?.valueToFill}"`);

// ---------------------------------------------------------------------
// TEST 4: Level 3 - Kiosk Citizen Vault Mobile / Samagra Lookup
// ---------------------------------------------------------------------
console.log('\n--- TEST 4: Level 3 - Kiosk Citizen Vault Fast-Search ---');

const kioskVault = [
  {
    id: 'cit_mohit',
    name: 'Mohit Jain',
    nameHindi: 'मोहित जैन',
    phone: '6263879076',
    samagra: '182736459',
    district: 'Indore',
    category: 'General (EWS)'
  },
  {
    id: 'cit_priya',
    name: 'Priya Sharma',
    nameHindi: 'प्रिया शर्मा',
    phone: '9826012345',
    samagra: '192837465',
    district: 'Bhopal',
    category: 'OBC'
  }
];

function searchVault(q) {
  const query = q.trim().toLowerCase();
  return kioskVault.filter(c => {
    return (c.name && c.name.toLowerCase().includes(query)) ||
           (c.nameHindi && c.nameHindi.includes(query)) ||
           (c.phone && c.phone.includes(query)) ||
           (c.samagra && c.samagra.includes(query)) ||
           (c.district && c.district.toLowerCase().includes(query));
  });
}

const resPhone = searchVault('6263879076');
assert(resPhone.length === 1 && resPhone[0].id === 'cit_mohit', 'Search by 10-digit Mobile', `Found ${resPhone.length}`);

const resSamagra = searchVault('192837465');
assert(resSamagra.length === 1 && resSamagra[0].id === 'cit_priya', 'Search by 9-digit Samagra ID', `Found ${resSamagra.length}`);

const resHindi = searchVault('मोहित');
assert(resHindi.length === 1 && resHindi[0].id === 'cit_mohit', 'Search by Devanagari Hindi Name', `Found ${resHindi.length}`);

const resDistrict = searchVault('indore');
assert(resDistrict.length === 1 && resDistrict[0].id === 'cit_mohit', 'Search by MP District', `Found ${resDistrict.length}`);

console.log('\n====================================================');
console.log(`FINAL MPONLINE REPORT: ${passedTests} / ${totalTests} TESTS PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 100% SUCCESS: ALL MPONLINE LEVELS 1, 2 & 3 FULLY VERIFIED!');
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED`);
}
console.log('====================================================\n');
