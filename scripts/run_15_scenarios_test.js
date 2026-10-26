const SmartParser = require('../autoform-extension/smart-parser.js');

// Standard form fields on a modern web page
const mockFormFields = [
  { elementIndex: 0, tagName: 'INPUT', type: 'text', id: 'fullName', name: 'fullName', label: 'Full Name *', selector: '#fullName' },
  { elementIndex: 1, tagName: 'INPUT', type: 'text', id: 'firstName', name: 'firstName', label: 'First Name', selector: '#firstName' },
  { elementIndex: 2, tagName: 'INPUT', type: 'text', id: 'lastName', name: 'lastName', label: 'Last Name', selector: '#lastName' },
  { elementIndex: 3, tagName: 'INPUT', type: 'email', id: 'email', name: 'email', label: 'Email Address *', selector: '#email' },
  { elementIndex: 4, tagName: 'INPUT', type: 'tel', id: 'phone', name: 'phone', label: 'Phone / Mobile Number *', selector: '#phone' },
  { elementIndex: 5, tagName: 'INPUT', type: 'radio', id: 'genderMale', name: 'gender', label: 'Gender', selector: '#genderMale' },
  { elementIndex: 6, tagName: 'SELECT', type: 'select-one', id: 'role', name: 'role', label: 'Job Role / Designation', selector: '#role', 
    options: [
      { value: 'Senior Full Stack Developer', text: 'Senior Full Stack Developer' },
      { value: 'Frontend Engineer', text: 'Frontend Engineer' },
      { value: 'Backend Engineer', text: 'Backend Engineer' },
      { value: 'Creative Director', text: 'Creative Director' }
    ] 
  },
  { elementIndex: 7, tagName: 'INPUT', type: 'text', id: 'experience', name: 'experience', label: 'Years of Experience', selector: '#experience' },
  { elementIndex: 8, tagName: 'INPUT', type: 'text', id: 'city', name: 'city', label: 'City', selector: '#city' },
  { elementIndex: 9, tagName: 'SELECT', type: 'select-one', id: 'state', name: 'state', label: 'State', selector: '#state',
    options: [
      { value: 'KA', text: 'Karnataka (KA)' },
      { value: 'MH', text: 'Maharashtra (MH)' },
      { value: 'DL', text: 'Delhi (DL)' },
      { value: 'GJ', text: 'Gujarat (GJ)' }
    ]
  },
  { elementIndex: 10, tagName: 'INPUT', type: 'text', id: 'pincode', name: 'pincode', label: 'Pincode / Postal Code', selector: '#pincode' },
  { elementIndex: 11, tagName: 'INPUT', type: 'date', id: 'dob', name: 'dob', label: 'Date of Birth', selector: '#dob' },
  { elementIndex: 12, tagName: 'INPUT', type: 'url', id: 'website', name: 'website', label: 'Portfolio / Website', selector: '#website' },
  { elementIndex: 13, tagName: 'INPUT', type: 'url', id: 'linkedin', name: 'linkedin', label: 'LinkedIn Profile URL', selector: '#linkedin' },
  { elementIndex: 14, tagName: 'INPUT', type: 'text', id: 'skills', name: 'skills', label: 'Key Skills', selector: '#skills' },
  { elementIndex: 15, tagName: 'TEXTAREA', type: 'textarea', id: 'about', name: 'about', label: 'About / Professional Bio', selector: '#about' },
  { elementIndex: 16, tagName: 'INPUT', type: 'checkbox', id: 'terms', name: 'terms', label: 'Terms & Conditions', selector: '#terms' }
];

const SCENARIOS = [
  {
    id: 1,
    title: 'Hinglish WhatsApp Chat Message',
    raw: `bhai mera name rahul verma h, contact number 9811223344 de dena, email h rahul.v@gmail.com, bangalore me rehta hu, role senior backend developer ka h, 6 saal ka exp, purush, haan terms manzoor h`
  },
  {
    id: 2,
    title: 'Messy Narrative Bio / Application Paragraph',
    raw: `Hi team, I am writing to apply. I'm Anita Roy based out of Mumbai (400050), Maharashtra. Reached at +91 9820012345 or anita.roy@tech.co. Looking for Frontend Engineer roles. 4.5 yrs experience with React/TS. Female. Portfolio is https://anitaroy.dev and linkedin is https://linkedin.com/in/anitaroy. Agreed to conditions.`
  },
  {
    id: 3,
    title: 'Tab-Separated Excel / Google Sheets Raw Copy',
    raw: "Candidate Name\tRohit Mehta\nEmail Address\trohit.mehta@corp.com\nMobile\t9876543210\nCity\tDelhi\nExperience\t5 years\nTerms\tYes"
  },
  {
    id: 4,
    title: 'Mixed Delimiters & Weird Punctuation (pipes, slashes, arrows)',
    raw: `Name => John Doe | Email -> john@doe.com | Tel /// 9876543210 | Loc: Pune [Maharashtra] ~ 411001 | Role :: Senior Full Stack Developer | Agree -> true`
  },
  {
    id: 5,
    title: 'First Name & Last Name Split Extraction',
    raw: `Full Name: Sunita Arvind Deshmukh\nEmail: sunita.d@gmail.com\nCity: Mumbai`
  },
  {
    id: 6,
    title: 'Inverted / Reverse Format [Value (Key)]',
    raw: `rahul.sharma@example.com (Email)\n9876543210 (Mobile Number)\nRahul Sharma (Full Name)\nSenior Full Stack Developer (Designation)`
  },
  {
    id: 7,
    title: 'Dirty Phone Numbers with International / Bracket format',
    raw: `Name: Alex Turner\nPhone: +91 (080) 98765-43210\nEmail: alex@turner.co\nPin: 560001`
  },
  {
    id: 8,
    title: 'Dropdown Synonym & Option Value Matching (MH -> Maharashtra)',
    raw: `Name: Rajesh Shinde\nState: Maharashtra\nRole: Backend Engineer\nCity: Pune`
  },
  {
    id: 9,
    title: 'Comma Separated Multi-Skills',
    raw: `Name: Dev Patel\nKey Skills: React.js, Next.js, Node.js, TypeScript, PostgreSQL\nEmail: dev@patel.in`
  },
  {
    id: 10,
    title: 'Date of Birth in Indian / Standard Formats (DD/MM/YYYY)',
    raw: `Name: Pooja Joshi\nDOB: 15/08/1995\nEmail: pooja@joshi.com\nGender: Female`
  },
  {
    id: 11,
    title: 'ALL CAPS & Chaotic Mixed Capitalization',
    raw: `FULL NAME: SANJAY SINGHANIA\nE-MAIL: SANJAY@SINGHANIA.ORG\nPHONE: 9822334455\nCITY: BENGALURU\nSTATE: KARNATAKA\nGENDER: MALE\nTERMS: YES`
  },
  {
    id: 12,
    title: 'Business & Startup Registration Details',
    raw: `Company Name: Nahata General Stores\nFounder: Rajesh Nahata\nEmail: billing@nahata.in\nPhone: 9820011223\nCity: Mumbai\nState: Maharashtra\nPincode: 400001\nAbout: 25 year old retail and wholesale distribution network.\nTerms: Accepted`
  },
  {
    id: 13,
    title: 'Raw Resume Header (Zero Labels, Pure Text)',
    raw: `Amitabh Bachchan\namitabh@abcorp.in | +91 9820098200 | Mumbai, Maharashtra | 400049\nhttps://linkedin.com/in/amitabh\nhttps://abcorp.in\nCreative Director with 40 years experience in media.`
  },
  {
    id: 14,
    title: 'Partial Data (Only 2 or 3 fields provided)',
    raw: `Email: only.email@gmail.com\nPhone: 9811223344`
  },
  {
    id: 15,
    title: 'JSON Raw Object Copy-Paste',
    raw: JSON.stringify({
      fullName: "Kunal Shah",
      email: "kunal@cred.club",
      phone: "9876500000",
      city: "Bengaluru",
      state: "Karnataka",
      role: "Senior Full Stack Developer",
      about: "Fintech innovator and product leader.",
      terms: true
    })
  }
];

console.log('====================================================');
console.log('🧪 RUNNING 15 STRESS-TEST SCENARIOS FOR AUTOFORM AI');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;
const issues = [];

SCENARIOS.forEach((sc) => {
  console.log(`--- [Scenario ${sc.id}: ${sc.title}] ---`);
  const parsed = SmartParser.parseRoughData(sc.raw);
  const matches = SmartParser.matchFields(mockFormFields, parsed);
  const filled = matches.filter(m => m.valueToFill);

  console.log(`Parsed Keys (${Object.keys(parsed).length}):`, Object.keys(parsed).join(', '));
  console.log(`Fields Matched (${filled.length}/${mockFormFields.length}):`);
  filled.forEach(f => {
    console.log(`  ✓ ${f.field.id} (${f.field.label}) -> "${f.valueToFill}" [${f.confidence}%]`);
  });

  // Evaluate expectations
  let scenarioIssues = [];

  // Check specific scenario requirements:
  if (sc.id === 1) { // WhatsApp Hinglish
    if (!parsed.fullName || !parsed.fullName.toLowerCase().includes('rahul')) scenarioIssues.push('Name missing from Hinglish text');
    if (!parsed.email) scenarioIssues.push('Email missing from Hinglish text');
    if (!parsed.phone) scenarioIssues.push('Phone missing from Hinglish text');
    if (!parsed.gender) scenarioIssues.push('Gender (purush) missing');
  }

  if (sc.id === 2) { // Narrative bio
    if (!parsed.fullName || !parsed.fullName.toLowerCase().includes('anita')) scenarioIssues.push('Name missing from bio');
    if (!parsed.pincode) scenarioIssues.push('Pincode 400050 missing');
    if (!parsed.city) scenarioIssues.push('City Mumbai missing');
    if (!parsed.gender) scenarioIssues.push('Gender Female missing');
  }

  if (sc.id === 5) { // First & Last name split
    const fNameMatch = matches.find(m => m.field.id === 'firstName');
    const lNameMatch = matches.find(m => m.field.id === 'lastName');
    if (!fNameMatch || !fNameMatch.valueToFill) scenarioIssues.push('firstName was not matched');
    if (!lNameMatch || !lNameMatch.valueToFill) scenarioIssues.push('lastName was not matched');
  }

  if (sc.id === 6) { // Inverted format
    if (!parsed.email) scenarioIssues.push('Inverted email failed to parse');
    if (!parsed.phone && !parsed.mobile_number) scenarioIssues.push('Inverted phone failed to parse');
  }

  if (sc.id === 7) { // Dirty phone with brackets & dashes
    if (!parsed.phone) scenarioIssues.push('Phone with brackets (+91 (080) ...) failed');
  }

  if (sc.id === 8) { // State dropdown matching
    const stateMatch = matches.find(m => m.field.id === 'state');
    if (!stateMatch || !stateMatch.valueToFill) scenarioIssues.push('State Maharashtra did not match option "Maharashtra (MH)"');
  }

  if (sc.id === 10) { // Date of birth
    if (!parsed.dob && !parsed.date_of_birth) scenarioIssues.push('DOB 15/08/1995 failed to parse');
  }

  if (sc.id === 13) { // Raw Resume Header (no labels)
    if (!parsed.email) scenarioIssues.push('Raw email failed');
    if (!parsed.phone) scenarioIssues.push('Raw phone failed');
    if (!parsed.pincode) scenarioIssues.push('Raw pincode failed');
  }

  if (scenarioIssues.length === 0) {
    console.log(`⭐ RESULT: PASSED 100%\n`);
    passCount++;
  } else {
    console.log(`⚠️ RESULT: ISSUES DETECTED:`, scenarioIssues.join(' | '), '\n');
    failCount++;
    issues.push({ scenario: sc.id, title: sc.title, problems: scenarioIssues });
  }
});

console.log('====================================================');
console.log(`FINAL REPORT: ${passCount} PASSED / ${failCount} NEED IMPROVEMENTS`);
console.log('====================================================');
if (issues.length > 0) {
  console.log('\nDetailed Issues to Fix:');
  issues.forEach(i => console.log(`Scenario ${i.scenario} (${i.title}): ${i.problems.join(', ')}`));
}
