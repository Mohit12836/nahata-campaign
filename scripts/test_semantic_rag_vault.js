// Test Suite: Dynamic Semantic RAG Vault for Arbitrary Government Portals
const { SemanticRAGVault } = require('../autoform-extension/semantic-rag-vault.js');
const SmartFormParser = require('../autoform-extension/smart-parser.js');

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

async function runRAGTests() {
  console.log('\n======================================================');
  console.log('🧠 RUNNING DYNAMIC SEMANTIC RAG VAULT TEST SUITE');
  console.log('======================================================\n');

  const rag = new SemanticRAGVault();

  // Citizen Raw Unstructured Dossier (Mohit Jain with 15+ arbitrary schemes & records)
  const rawCitizenText = `
नाम: मोहित जैन (Mohit Jain)
पिता: रमेश जैन
आधार: 9283-7462-8192
मोबाइल: 6263879076
खसरा / रकबा नंबर: 142/2 पटवारी हल्का 12
संबल कार्ड क्रमांक: SB/2022/98124
राशन कार्ड बीपीएल नंबर: BPL-88771122
रक्त समूह (Blood Group): O Positive (O+)
वार्षिक पारिवारिक आय: 85000 रुपये
लाडली बहना आवेदन क्रमांक: LB-2023-4411
ड्राइविंग लाइसेंस नंबर: MP09-2018-0012345
वाहन वर्ग: MCWG और LMV
10वीं रोल नंबर: 19827364
`;

  // TEST 1: Dynamic Ingestion into Semantic Vector Vault
  console.log('--- 1. Ingestion of Arbitrary Citizen Knowledge ---');
  const dossier = rag.ingestToDossier(rawCitizenText);
  assert(dossier.rawEntries.length >= 10, 'Ingested 10+ arbitrary raw entities into dossier');
  assert(dossier.semanticIndex.khasraNo === '142/2 पटवारी हल्का 12', 'Khasra No indexed semantically');
  assert(dossier.semanticIndex.sambalNo === 'SB/2022/98124', 'Sambal Card No indexed semantically');
  assert(dossier.semanticIndex.bloodGroup.includes('O+'), 'Blood Group indexed semantically');

  // TEST 2: Querying Unknown / Dynamic New Portal Fields via RAG
  console.log('\n--- 2. RAG Query on Completely New Government Portals ---');

  // Case A: MP Bhulekh (Revenue Portal) asking for Khasra Number
  const fieldBhulekh = {
    id: 'ctl00$txt_Land_Khasra_Number',
    name: 'txtKhasra',
    label: 'खसरा / भूमि सर्वेक्षण क्रमांक दर्ज करें',
    cleanId: 'txtlandkhasranumber',
    cleanName: 'txtkhasra'
  };
  const matchA = rag.queryDossier(dossier, fieldBhulekh);
  assert(matchA && matchA.value === '142/2 पटवारी हल्का 12', 'RAG successfully retrieved Khasra number for MP Bhulekh');
  assert(matchA.confidence >= 0.8, 'RAG confidence high for Khasra field');

  // Case B: Sambal 2.0 Portal asking for Sambal Shramik Registration
  const fieldSambal = {
    id: 'txtShramikPangiyanNo',
    name: 'shramik_reg_id',
    label: 'संबल कार्ड / श्रमिक पंजीयन क्रमांक',
    cleanId: 'txtshramikpangiyanno',
    cleanName: 'shramikregid'
  };
  const matchB = rag.queryDossier(dossier, fieldSambal);
  assert(matchB && matchB.value === 'SB/2022/98124', 'RAG retrieved Sambal Card Number for Sambal 2.0');

  // Case C: Transport Sarathi DL asking for Blood Group
  const fieldBlood = {
    id: 'ddlBloodGroup',
    name: 'blood_group_select',
    label: 'Blood Group (रक्त समूह)',
    cleanId: 'ddlbloodgroup',
    cleanName: 'bloodgroupselect'
  };
  const matchC = rag.queryDossier(dossier, fieldBlood);
  assert(matchC && matchC.value.includes('O+'), 'RAG retrieved Blood Group for Driving License portal');

  // Case D: Revenue Certificate asking for Annual Family Income
  const fieldIncome = {
    id: 'txtAnnualFamilyIncome',
    name: 'family_income',
    label: 'कुल वार्षिक आय (रुपये में)',
    cleanId: 'txtannualfamilyincome',
    cleanName: 'familyincome'
  };
  const matchD = rag.queryDossier(dossier, fieldIncome);
  assert(matchD && matchD.value === '85000 रुपये', 'RAG retrieved Annual Income for E-District');

  // TEST 3: End-to-End Parser Integration (SmartParser + RAG Fallback)
  console.log('\n--- 3. End-to-End SmartParser + RAG Fallback Test ---');
  const parsed = SmartFormParser.parseRoughData(rawCitizenText);
  const testDomFields = [
    { id: 'txtName', label: 'Candidate Name', selector: '#txtName' },
    { id: 'txtKhasra', label: 'खसरा रकबा क्रमांक', selector: '#txtKhasra' },
    { id: 'txtSambal', label: 'संबल पंजीयन नंबर', selector: '#txtSambal' },
    { id: 'txtBlood', label: 'Blood Group', selector: '#txtBlood' }
  ];

  const mappings = SmartFormParser.matchFields(testDomFields, parsed);
  assert(mappings.length === 4, 'Mapped all 4 fields including standard and RAG fields');
  assert(mappings[0].valueToFill.includes('Mohit Jain'), 'Standard field mapped Name');
  assert(mappings[1].valueToFill === '142/2 पटवारी हल्का 12', 'RAG augmented Khasra field in sequence');
  assert(mappings[2].valueToFill === 'SB/2022/98124', 'RAG augmented Sambal field in sequence');
  assert(mappings[3].valueToFill.includes('O+'), 'RAG augmented Blood Group field in sequence');

  console.log('\n======================================================');
  console.log(`🏁 RAG TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');
}

runRAGTests().catch(err => {
  console.error('RAG Test Crashed:', err);
  process.exit(1);
});
