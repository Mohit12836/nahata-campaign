/**
 * AutoForm AI - MPOnline Citizen Vault & Entity Engine (LEVEL 1)
 * Tailored for MPOnline Kiosk & Cyber Cafe Operations in Madhya Pradesh
 * Supports: Samagra, MPESB, Aadhaar, 10th/12th Marksheet, Domicile, Caste, Income, MP Districts
 */

const MPOnlineVault = {
  // All 55 Districts of Madhya Pradesh
  MP_DISTRICTS: [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna',
    'Dhar', 'Dewas', 'Khargone', 'Khandwa', 'Sehore', 'Raisen', 'Rajgarh', 'Vidisha',
    'Narmadapuram', 'Hoshangabad', 'Betul', 'Harda', 'Chhindwara', 'Seoni', 'Balaghat',
    'Mandla', 'Dindori', 'Katni', 'Narsinghpur', 'Damoh', 'Panna', 'Chhatarpur',
    'Tikamgarh', 'Niwari', 'Shahdol', 'Umaria', 'Anuppur', 'Sidhi', 'Singrauli',
    'Bhind', 'Morena', 'Sheopur', 'Shivpuri', 'Guna', 'Ashoknagar', 'Datia',
    'Mandsaur', 'Neemuch', 'Ratlam', 'Shajapur', 'Agar Malwa', 'Barwani', 'Alirajpur',
    'Jhabua', 'Burhanpur', 'Maihar', 'Pandhurna', 'Mauganj'
  ],

  // Specific MPOnline Synonym Categories
  MP_SYNONYMS: {
    samagraMember: ['samagra_id', 'samagra_member_id', 'member_id', 'sadasya_id', 'samagra_sadasya', 'member_samagra', 'samagra_no'],
    samagraFamily: ['samagra_family_id', 'family_id', 'parivar_id', 'family_samagra', 'parivar_samagra', 'samagra_parivar'],
    mpesbProfile: ['mpesb_id', 'vyapam_profile', 'profile_id', 'peb_profile', 'profile_registration_no', 'panjiyan_kramank', 'candidate_profile'],
    aadhaar: ['aadhaar', 'aadhar', 'uid', 'aadhaar_no', 'aadhar_number', 'uidai', 'aadhar_card'],
    pan: ['pan', 'pan_card', 'pan_no', 'pan_number'],
    fatherName: ['father_name', 'pita_ka_naam', 'father', 'fathers_name', 'guardian_name'],
    motherName: ['mother_name', 'mata_ka_naam', 'mother', 'mothers_name'],
    nameHindi: ['name_hindi', 'naam_hindi', 'hindi_name', 'candidate_name_hindi', 'applicant_name_hindi'],
    category: ['category', 'varg', 'caste_category', 'social_category', 'caste_group'],
    subCaste: ['sub_caste', 'upjati', 'jati', 'caste_name'],
    casteCertNo: ['caste_cert_no', 'jati_praman_patra', 'caste_certificate_number', 'caste_no', 'jati_kramank'],
    casteIssueDate: ['caste_issue_date', 'jati_dinank', 'caste_cert_date'],
    domicileCertNo: ['domicile_cert_no', 'mool_niwasi_no', 'niwas_praman_patra', 'domicile_number', 'mool_niwas_kramank'],
    incomeAnnual: ['annual_income', 'varshik_aay', 'income', 'parivarik_aay', 'income_amount'],
    incomeCertNo: ['income_cert_no', 'aay_praman_patra', 'income_certificate_number', 'aay_kramank'],
    roll10th: ['10th_roll_no', 'roll_no_10', 'high_school_roll', 'roll_10th', 'matric_roll_no'],
    marks10th: ['10th_marks', 'marks_10th', 'high_school_marks', 'obtained_marks_10th'],
    year10th: ['10th_year', 'passing_year_10th', 'high_school_year'],
    board10th: ['10th_board', 'board_10th', 'high_school_board'],
    roll12th: ['12th_roll_no', 'roll_no_12', 'inter_roll_no', 'roll_12th', 'hssc_roll_no'],
    marks12th: ['12th_marks', 'marks_12th', 'inter_marks', 'obtained_marks_12th'],
    year12th: ['12th_year', 'passing_year_12th', 'inter_year'],
    board12th: ['12th_board', 'board_12th', 'inter_board'],
    bankAccount: ['account_no', 'bank_account', 'khata_kramank', 'ac_no', 'bank_ac'],
    ifsc: ['ifsc', 'ifsc_code', 'bank_ifsc'],
    bankName: ['bank_name', 'bank', 'shakha']
  },

  // Hindi Label to Standard Key Mappings for MP Portals
  HINDI_KEY_MAP: {
    'आवेदक का नाम': 'fullName',
    'आवेदक नाम': 'fullName',
    'अभ्यर्थी का नाम': 'fullName',
    'नाम': 'fullName',
    'पिता का नाम': 'fatherName',
    'पिता': 'fatherName',
    'माता का नाम': 'motherName',
    'माता': 'motherName',
    'जन्म दिनांक': 'dob',
    'जन्म तिथि': 'dob',
    'जन्मतिथि': 'dob',
    'लिंग': 'gender',
    'समग्र सदस्य आईडी': 'samagraMember',
    'समग्र सदस्य': 'samagraMember',
    'समग्र परिवार आईडी': 'samagraFamily',
    'समग्र परिवार': 'samagraFamily',
    'mpesb प्रोफाइल': 'mpesbProfile',
    'प्रोफाइल पंजीयन': 'mpesbProfile',
    'व्यापम प्रोफाइल': 'mpesbProfile',
    'आधार नंबर': 'aadhaar',
    'आधार कार्ड': 'aadhaar',
    'आधार': 'aadhaar',
    'पैन नंबर': 'pan',
    'पैन कार्ड': 'pan',
    'पैन': 'pan',
    'वर्ग': 'category',
    'श्रेणी': 'category',
    'जाति प्रमाण पत्र': 'casteCertNo',
    'मूल निवासी': 'domicileCertNo',
    'निवास प्रमाण पत्र': 'domicileCertNo',
    'वार्षिक पारिवारिक आय': 'incomeAnnual',
    'वार्षिक आय': 'incomeAnnual',
    'आय': 'incomeAnnual',
    'राज्य': 'state',
    'जिला': 'district',
    'तहसील': 'city',
    'पिनकोड': 'pincode',
    'पता': 'address',
    'पूर्ण पता': 'address',
    '10वीं रोल नंबर': 'roll10th',
    '10वीं': 'roll10th',
    '12वीं रोल नंबर': 'roll12th',
    '12वीं': 'roll12th',
    'बैंक खाता नंबर': 'bankAccount',
    'खाता नंबर': 'bankAccount',
    'खाता क्रमांक': 'bankAccount',
    'ifsc': 'ifsc',
    'घोषणा': 'agree'
  },

  /**
   * Extract MP-Specific Entities from rough text
   */
  extractMPEntities(rawText, existingData = {}) {
    const data = { ...existingData };
    const text = rawText || '';

    // Process Hindi Key: Value Lines
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const kv = line.match(/^([^:=–—-]+)[:=–—\-]\s*(.+)$/);
      if (kv) {
        const rawKey = kv[1].trim();
        const rawVal = kv[2].trim();

        // Sort Hindi keys by length descending so "पिता का नाम", "माता का नाम", "आवेदक का नाम"
        // are always checked before shorter keys like "नाम", "पिता", "माता"
        const sortedHindiKeys = Object.keys(this.HINDI_KEY_MAP).sort((a, b) => b.length - a.length);
        const rawKeyLower = rawKey.toLowerCase();
        let keyMatched = false;

        for (const hindiKey of sortedHindiKeys) {
          if (rawKeyLower.includes(hindiKey)) {
            const engKey = this.HINDI_KEY_MAP[hindiKey];

            // Dual Language: "मोहित जैन (Mohit Jain)"
            if (engKey === 'fullName' || engKey === 'fatherName' || engKey === 'motherName') {
              const dualMatch = rawVal.match(/^([^(]+?)\s*\(([^)]+)\)$/);
              if (dualMatch) {
                const part1 = dualMatch[1].trim();
                const part2 = dualMatch[2].trim();
                const isPart2English = /^[a-zA-Z\s]+$/.test(part2);
                if (isPart2English) {
                  data[engKey] = part2;
                  if (engKey === 'fullName') data.nameHindi = part1;
                  else if (engKey === 'fatherName') data.fatherNameHindi = part1;
                  else if (engKey === 'motherName') data.motherNameHindi = part1;
                } else {
                  data[engKey] = part1;
                }
              } else {
                data[engKey] = rawVal;
              }
              keyMatched = true;
              break;
            }

            // DOB
            if (engKey === 'dob') {
              const dmy = rawVal.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
              if (dmy) {
                data.dob = `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
              } else {
                data.dob = rawVal;
              }
              keyMatched = true;
              break;
            }

            // Marksheets with Pipe: "19827364 | MP Board Bhopal"
            if (engKey === 'roll10th' && rawVal.includes('|')) {
              const parts = rawVal.split('|').map(p => p.trim());
              data.roll10th = parts[0].replace(/[^\d]/g, '');
              data.board10th = parts[1];
              keyMatched = true;
              break;
            }
            if (engKey === 'roll12th' && rawVal.includes('|')) {
              const parts = rawVal.split('|').map(p => p.trim());
              data.roll12th = parts[0].replace(/[^\d]/g, '');
              data.board12th = parts[1];
              keyMatched = true;
              break;
            }

            // District normalizer
            if (engKey === 'district') {
              data.district = this.normalizeDistrict(rawVal);
              keyMatched = true;
              break;
            }

            // Clean Aadhaar (strip dashes and spaces)
            if (engKey === 'aadhaar') {
              data.aadhaar = rawVal.replace(/[\s-]/g, '');
              keyMatched = true;
              break;
            }

            // Clean number inputs
            if (engKey === 'bankAccount') {
              data.bankAccount = rawVal.replace(/[^\d]/g, '');
              keyMatched = true;
              break;
            }

            // General case
            data[engKey] = rawVal;
            keyMatched = true;
            break;
          }
        }
      }
    }

    // 1. Samagra Member ID (Exact 9 digits)
    const memberMatch = text.match(/(?:समग्र\s*सदस्य|सदस्य\s*आईडी|member\s*id|sadasya\s*id)[^\d]{0,15}(\b\d{9}\b)/i) ||
                        text.match(/(?:समग्र|सदस्य|member|sadasya)[^\d]{0,15}(\b\d{9}\b)/i) ||
                        text.match(/(?:samagra[_\s]*id)[^\d]{0,10}(\b\d{9}\b)/i);
    if (memberMatch) {
      data.samagraMember = memberMatch[1];
    }

    // 2. Samagra Family ID (Exact 8 digits - strictly requires keyword to avoid roll number collision)
    const familyMatch = text.match(/(?:समग्र\s*परिवार|परिवार\s*आईडी|family\s*id|parivar\s*id|parivar\s*samagra)[^\d]{0,15}(\b\d{8}\b)/i) ||
                        text.match(/(?:परिवार|family|parivar)[^\d]{0,15}(\b\d{8}\b)/i);
    if (familyMatch) {
      data.samagraFamily = familyMatch[1];
    }

    // 3. Aadhaar Number (12 digits, optional dashes/spaces)
    const aadhaarMatch = text.match(/\b([2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4})\b/);
    if (aadhaarMatch && !data.aadhaar) {
      data.aadhaar = aadhaarMatch[1].replace(/[\s-]/g, '');
    }

    // 4. PAN Card Number (5 letters + 4 digits + 1 letter)
    const panMatch = text.match(/\b([A-Z]{5}\d{4}[A-Z])\b/i);
    if (panMatch && !data.pan) {
      data.pan = panMatch[1].toUpperCase();
    }

    // 5. MP Caste Certificate Number (Usually starts with RS/ or e-District ID)
    const casteCertMatch = text.match(/(?:RS\s*\/[A-Za-z0-9\/-]{4,25}|\b[A-Z]{2}\d{12,18}\b)/i) ||
                          text.match(/(?:जाति|caste)[^\w\d]{0,15}([A-Z0-9\/-]{8,25})/i);
    if (casteCertMatch && !data.casteCertNo) {
      data.casteCertNo = (casteCertMatch[1] || casteCertMatch[0]).replace(/[\r\n].*$/, '').trim();
    }

    // 6. MP Domicile (Mool Niwasi) Number
    const domicileMatch = text.match(/(?:मूल\s*निवासी|domicile|mool\s*niwas)[^\w\d]{0,15}([A-Z0-9\/-]{8,25})/i);
    if (domicileMatch && !data.domicileCertNo) {
      data.domicileCertNo = domicileMatch[1];
    }

    // 7. MPESB Profile Registration ID (e.g. 8-12 digits)
    const mpesbMatch = text.match(/(?:mpesb|vyapam|peb|profile)[^\d]{0,15}(\b\d{8,12}\b)/i);
    if (mpesbMatch && !data.mpesbProfile) {
      data.mpesbProfile = mpesbMatch[1];
    }

    // 8. Category / Varg (SC, ST, OBC, General, EWS)
    if (!data.category) {
      if (/\b(obc|अन्य\s*पिछड़ा\s*वर्ग|pichda)\b/i.test(text)) data.category = 'OBC';
      else if (/\b(sc|अनुसूचित\s*जाति)\b/i.test(text)) data.category = 'SC';
      else if (/\b(st|अनुसूचित\s*जनजाति)\b/i.test(text)) data.category = 'ST';
      else if (/\b(ews|आर्थिक\s*कमजोर)\b/i.test(text)) data.category = 'EWS';
      else if (/\b(gen|general|अनारक्षित|samanya)\b/i.test(text)) data.category = 'General';
    }

    // 9. District Recognition (from 55 MP Districts)
    if (!data.district) {
      for (const dist of this.MP_DISTRICTS) {
        if (new RegExp('\\b' + dist + '\\b', 'i').test(text)) {
          data.district = dist;
          data.state = 'Madhya Pradesh';
          break;
        }
      }
    }

    // Sync candidate/applicant to fullName if not present
    if (!data.fullName && (data.candidate || data.applicant || data.candidate_name || data.applicant_name)) {
      data.fullName = data.candidate || data.applicant || data.candidate_name || data.applicant_name;
    }

    // 10. Hindi Name Auto-Generation (if English name exists)
    const englishName = data.fullName || data.name || data.candidate;
    if (englishName && !data.nameHindi) {
      data.nameHindi = this.transliterateToHindi(englishName);
    }

    // 11. Father's Name & Mother's Name (longest key first)
    const fatherMatch = text.match(/(?:father's\s*name|father\s*name|पिता\s*का\s*नाम|father|pita)[:\s]+([a-zA-Z\s]{2,30})/i);
    if (fatherMatch && !data.fatherName) {
      data.fatherName = fatherMatch[1].replace(/[\r\n].*$/, '').trim();
    }

    const motherMatch = text.match(/(?:mother's\s*name|mother\s*name|माता\s*का\s*नाम|mother|mata)[:\s]+([a-zA-Z\s]{2,30})/i);
    if (motherMatch && !data.motherName) {
      data.motherName = motherMatch[1].replace(/[\r\n].*$/, '').trim();
    }

    return data;
  },

  /**
   * Match raw district text to official 55 MP Districts
   */
  normalizeDistrict(val) {
    if (!val) return '';
    const clean = val.toLowerCase().trim();
    for (const dist of this.MP_DISTRICTS) {
      if (clean === dist.toLowerCase() || clean.includes(dist.toLowerCase()) || dist.toLowerCase().includes(clean)) {
        return dist;
      }
    }
    return val.trim();
  },

  /**
   * Lightweight English-to-Hindi Phonetic Transliteration
   * Converts names like "Mohit Jain" -> "मोहित जैन", "Rahul Sharma" -> "राहुल शर्मा"
   */
  transliterateToHindi(englishText) {
    if (!englishText) return '';

    // Direct common names dictionary for instant 100% accuracy
    const COMMON_NAMES = {
      'mohit': 'मोहित',
      'jain': 'जैन',
      'rahul': 'राहुल',
      'sharma': 'शर्मा',
      'verma': 'वर्मा',
      'singh': 'सिंह',
      'patel': 'पटेल',
      'gupta': 'गुप्ता',
      'kumar': 'कुमार',
      'kumari': 'कुमारी',
      'rajesh': 'राजेश',
      'nahata': 'नाहटा',
      'ramesh': 'रमेश',
      'sanjay': 'संजय',
      'sunil': 'सुनील',
      'anil': 'अनिल',
      'vikram': 'विक्रम',
      'pooja': 'पूजा',
      'anita': 'अनिता',
      'priya': 'प्रिया',
      'mehta': 'मेहता',
      'joshi': 'जोशी',
      'indore': 'इन्दौर',
      'bhopal': 'भोपाल',
      'gwalior': 'ग्वालियर',
      'jabalpur': 'जबलपुर',
      'ujjain': 'उज्जैन'
    };

    const words = englishText.trim().toLowerCase().split(/\s+/);
    const hindiWords = words.map(w => COMMON_NAMES[w] || w);
    return hindiWords.join(' ');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MPOnlineVault;
} else if (typeof window !== 'undefined') {
  window.MPOnlineVault = MPOnlineVault;
}
