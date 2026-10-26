/**
 * AutoForm AI - Smart Parser & Fuzzy Field Matcher
 * Parses any unstructured/rough text into structured entities and matches them
 * against DOM form fields in optimal sequence.
 */

const SmartParser = {
  // Common synonym groups for intelligent semantic mapping
  SYNONYMS: {
    fullName: ['name', 'full_name', 'fullname', 'applicant_name', 'applicantname', 'candidate_name', 'candidatename', 'candidate', 'applicant', 'customer_name', 'client_name', 'client', 'user_name', 'username', 'naam', 'owner_name', 'contact_person', 'founder_name', 'person'],
    firstName: ['first_name', 'fname', 'first', 'given_name', 'pehla_naam'],
    lastName: ['last_name', 'lname', 'surname', 'family_name', 'sirname'],
    email: ['email', 'e-mail', 'mail', 'email_address', 'user_email', 'contact_email', 'work_email'],
    phone: ['phone', 'mobile', 'cell', 'telephone', 'phone_number', 'mobile_no', 'contact_no', 'phone_no', 'whatsapp', 'tel'],
    gender: ['gender', 'sex', 'ling'],
    dob: ['dob', 'date_of_birth', 'birthdate', 'birth_date', 'janm_din'],
    address: ['address', 'addr', 'street', 'street_address', 'full_address', 'pata', 'location', 'residential_address'],
    city: ['city', 'shahar', 'town', 'district', 'shehar'],
    state: ['state', 'province', 'pradesh', 'region', 'state_ut'],
    country: ['country', 'desh', 'nation', 'nationality'],
    pincode: ['pincode', 'pin', 'zip', 'zipcode', 'postal', 'postal_code'],
    company: ['company', 'organization', 'organisation', 'startup', 'startup_name', 'business_name', 'company_name', 'firm', 'employer'],
    role: ['role', 'designation', 'position', 'job_title', 'title', 'post', 'occupation'],
    experience: ['experience', 'exp', 'years_of_experience', 'total_experience', 'work_ex'],
    skills: ['skills', 'key_skills', 'tech_stack', 'technologies', 'expertise', 'primary_skills', 'tools', 'languages'],
    website: ['website', 'site', 'url', 'web', 'portfolio', 'link', 'company_website'],
    linkedin: ['linkedin', 'linkedin_url', 'linkedin_profile'],
    github: ['github', 'github_url', 'github_profile'],
    twitter: ['twitter', 'x', 'twitter_handle', 'x_handle'],
    description: ['description', 'bio', 'about', 'details', 'pitch', 'summary', 'message', 'remarks', 'comments', 'startup_pitch', 'cover_letter'],
    category: ['category', 'sector', 'industry', 'domain', 'vertical', 'business_category', 'varg', 'caste_category'],
    stage: ['stage', 'startup_stage', 'funding_stage', 'growth_stage'],
    teamSize: ['team_size', 'team', 'employees', 'members', 'company_size', 'number_of_employees'],
    amount: ['funding', 'amount', 'salary', 'ctc', 'revenue', 'budget', 'investment', 'raise_amount'],
    agree: ['agree', 'terms', 'terms_conditions', 'consent', 'declaration', 'accept', 'privacy_policy'],
    
    // MPOnline & Government Kiosk Specific Groups
    samagraMember: ['samagra_id', 'samagra_member_id', 'samagramemberid', 'member_id', 'sadasya_id', 'samagra_sadasya', 'member_samagra', 'samagra_no', 'sadasya_samagra'],
    samagraFamily: ['samagra_family_id', 'samagrafamilyid', 'family_id', 'parivar_id', 'family_samagra', 'parivar_samagra', 'samagra_parivar'],
    mpesbProfile: ['mpesb_id', 'vyapam_profile', 'profile_id', 'peb_profile', 'profile_registration_no', 'panjiyan_kramank', 'candidate_profile'],
    aadhaar: ['aadhaar', 'aadhar', 'uid', 'aadhaar_no', 'aadhaarno', 'aadhar_number', 'aadharno', 'uidai', 'aadhar_card'],
    pan: ['pan', 'pan_card', 'pan_no', 'pan_number'],
    fatherName: ['father_name', 'fathername', 'pita_ka_naam', 'father', 'fathers_name', 'fathersname', 'guardian_name', 'guardianname', 'pitaji'],
    motherName: ['mother_name', 'mothername', 'mata_ka_naam', 'mother', 'mothers_name', 'mothersname', 'mataji'],
    nameHindi: ['name_hindi', 'naam_hindi', 'hindi_name', 'candidate_name_hindi', 'applicant_name_hindi'],
    casteCertNo: ['caste_cert_no', 'jati_praman_patra', 'caste_certificate_number', 'caste_no', 'jati_kramank'],
    domicileCertNo: ['domicile_cert_no', 'mool_niwasi_no', 'niwas_praman_patra', 'domicile_number', 'mool_niwas_kramank'],
    incomeAnnual: ['annual_income', 'varshik_aay', 'income', 'parivarik_aay', 'income_amount'],
    roll10th: ['10th_roll_no', 'roll_no_10', 'high_school_roll', 'roll_10th', 'matric_roll_no', 'roll_number_10th'],
    board10th: ['10th_board', 'board_10th', 'board10th', 'high_school_board', 'matric_board'],
    roll12th: ['12th_roll_no', 'roll_no_12', 'inter_roll_no', 'roll_12th', 'hssc_roll_no', 'roll_number_12th'],
    board12th: ['12th_board', 'board_12th', 'board12th', 'inter_board', 'hssc_board'],
    bankAccount: ['account_no', 'bank_account', 'khata_kramank', 'ac_no', 'bank_ac', 'account_number'],
    ifsc: ['ifsc', 'ifsc_code', 'bank_ifsc']
  },

  /**
   * Parse rough unstructured text into key-value data map
   */
  parseRoughData(rawText) {
    if (!rawText || !rawText.trim()) return {};
    const text = rawText.trim();
    const data = {};

    // 1. Try parsing as JSON first
    if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed === 'object' && parsed !== null) {
          const flat = Array.isArray(parsed) ? parsed[0] : parsed;
          for (const [k, v] of Object.entries(flat)) {
            data[this.normalizeKey(k)] = String(v).trim();
          }
          return data;
        }
      } catch (e) {
        // Fall back to line parsing
      }
    }

    // 2. Extract strong entities globally (Email, Phone, URLs, Pincode)
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    if (emailMatch && !data.email) data.email = emailMatch[0].trim();

    const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}|\b(?:\+1[\s-]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
    if (phoneMatch && !data.phone) data.phone = phoneMatch[0].replace(/[^0-9+]/g, '');

    const urlMatches = text.match(/https?:\/\/[^\s,]+/gi);
    if (urlMatches) {
      for (const u of urlMatches) {
        const lowerU = u.toLowerCase();
        if (lowerU.includes('linkedin.com') && !data.linkedin) data.linkedin = u;
        else if (lowerU.includes('github.com') && !data.github) data.github = u;
        else if (lowerU.includes('twitter.com') || lowerU.includes('x.com')) data.twitter = u;
        else if (!data.website) data.website = u;
      }
    }

    const pinMatch = text.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch && !data.pincode) data.pincode = pinMatch[1];

    // 3. Process line-by-line and segment-by-segment (handling newlines, pipes, semicolons)
    const rawSegments = [];
    text.split(/\r?\n/).forEach(l => {
      const segs = l.split(/\s*(?:\||;|\/\/\/)\s*/);
      rawSegments.push(...segs);
    });
    const lines = rawSegments.map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Inverted format: "value (key)" e.g. "rahul@gmail.com (Email)"
      // Only applicable if line does NOT already contain key-value colon
      if (!line.includes(':') && !line.includes('=>') && !line.includes('->') && !line.includes('=')) {
        const invertedMatch = line.match(/^([^(]+?)\s*\(([^)]+)\)$/);
        if (invertedMatch) {
          const rawVal = invertedMatch[1].trim();
          const rawKey = invertedMatch[2].trim();
          if (rawKey && rawVal) {
            const normKey = this.normalizeKey(rawKey);
            if (!data[normKey]) data[normKey] = rawVal;
            continue;
          }
        }
      }

      // Key: Value or Key => Value or Key -> Value or Key = Value or Key :: Value (supports Devanagari / Unicode)
      const kvMatch = line.match(/^([a-zA-Z0-9_\s\u0900-\u097F-]{2,40}?)(?:\s*(?:=>|->|::|:|=|\s-\s)\s*)(.+)$/u);
      if (kvMatch) {
        const rawKey = kvMatch[1].trim();
        const rawVal = kvMatch[2].trim();
        if (rawKey && rawVal) {
          let normKey = this.normalizeKey(rawKey);
          // If rawKey was Hindi/Devanagari, or normKey turned out purely numeric (e.g. "10", "12"), check HINDI_KEY_MAP
          if (!normKey || /^\d+$/.test(normKey)) {
            let vault = (typeof MPOnlineVault !== 'undefined') ? MPOnlineVault : null;
            if (!vault && typeof require !== 'undefined') {
              try { vault = require('./mponline-vault.js'); } catch (e) {}
            }
            if (vault && vault.HINDI_KEY_MAP) {
              const rkLower = rawKey.toLowerCase();
              const sortedHKeys = Object.keys(vault.HINDI_KEY_MAP).sort((a, b) => b.length - a.length);
              for (const hKey of sortedHKeys) {
                if (rkLower.includes(hKey)) {
                  normKey = vault.HINDI_KEY_MAP[hKey];
                  break;
                }
              }
            }
          }
          if (normKey && !/^\d+$/.test(normKey)) {
            data[normKey] = rawVal;
            continue;
          }
        }
      }

      // Tab delimited row (like copied from Excel / Google Sheets)
      if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length >= 2) {
          data[this.normalizeKey(parts[0])] = parts.slice(1).join(' ');
          continue;
        }
      }

      // If line contains keywords, extract inline
      this.extractInlinePatterns(line, data);
    }

    // 4. Run MPOnline Specialized Entity Extractor (Level 1)
    let vault = null;
    if (typeof MPOnlineVault !== 'undefined') {
      vault = MPOnlineVault;
    } else if (typeof require !== 'undefined') {
      try { vault = require('./mponline-vault.js'); } catch (e) {}
    }

    if (vault && typeof vault.extractMPEntities === 'function') {
      const mpData = vault.extractMPEntities(text, data);
      Object.assign(data, mpData);
    }

    // 5. If name was not explicitly parsed via key:value or MPOnline vault, check free text heuristics
    if (!data.fullName && !data.firstName) {
      const allMatches = Array.from(text.matchAll(/(?:my name is|i'm|i am|mera naam|naam[:\s]+|name[:\s]+)\s*([a-zA-Z\s]{2,40})/gi));
      for (const m of allMatches) {
        let val = m[1].replace(/[\r\n].*$/, '').trim();
        // Cut off at prepositions or connecting words
        val = val.split(/\b(based|from|living|working|at|resident|currently|here|an?|the)\b/i)[0].trim();
        val = val.replace(/\b(hai|h|here|is|am|tha|thi|hu|hoon)\b/gi, '').trim();

        if (!/^(writing|applying|looking|reaching|excited|pleased|thrilled)\b/i.test(val) && val.length >= 2) {
          data.fullName = val;
          break;
        }
      }

      // If still no name, check if first line is a 2-3 word capitalized proper name (like in raw resumes)
      if (!data.fullName && lines.length > 0) {
        const firstLine = lines[0].trim();
        if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(firstLine)) {
          data.fullName = firstLine;
        }
      }
    }

    // Clean up role if it contains experience
    if (data.role && data.role.includes(',')) {
      const parts = data.role.split(',');
      data.role = parts[0].trim();
      const expMatch = parts.slice(1).join(' ').match(/(\d+(?:\.\d+)?)\s*(?:years|yrs|saal)/i);
      if (expMatch && !data.experience) data.experience = expMatch[1];
    }

    // Split fullName into firstName / lastName if not set
    if (data.fullName && (!data.firstName || !data.lastName)) {
      const parts = data.fullName.split(/\s+/);
      if (parts.length === 1 && !data.firstName) {
        data.firstName = parts[0];
      } else if (parts.length >= 2) {
        if (!data.firstName) data.firstName = parts[0];
        if (!data.lastName) data.lastName = parts.slice(1).join(' ');
      }
    }

    data.__rawText = rawText;
    return data;
  },

  /**
   * Helper to normalize a key string
   */
  normalizeKey(key) {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '');
  },

  /**
   * Extract semantic values from free text lines
   */
  extractInlinePatterns(line, data) {
    const lower = line.toLowerCase();

    // Gender (Check female before male to avoid substring collision)
    if (!data.gender) {
      if (/\b(female|mahila|woman)\b/i.test(lower)) data.gender = 'Female';
      else if (/\b(male|purush|man)\b/i.test(lower)) data.gender = 'Male';
      else if (/\b(other|non-binary)\b/i.test(lower)) data.gender = 'Other';
    }

    // Agreement / Terms
    if (!data.agree && (lower.includes('i agree') || lower.includes('accept terms') || lower.includes('yes, agree') || lower.includes('ha, sahmat') || lower.includes('agreed to conditions'))) {
      data.agree = 'true';
    }

    // State
    if (!data.state) {
      const stateMatch = line.match(/(?:state|pradesh)[:\s]+([a-zA-Z\s]{3,20})/i);
      if (stateMatch) {
        data.state = stateMatch[1].replace(/[,.()].*$/, '').trim();
      } else {
        const commonStates = ['Karnataka', 'Maharashtra', 'Gujarat', 'Delhi', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Rajasthan', 'Kerala', 'West Bengal', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar', 'Goa'];
        for (const st of commonStates) {
          if (new RegExp('\\b' + st + '\\b', 'i').test(line)) {
            data.state = st;
            break;
          }
        }
      }
    }

    // City heuristic
    if (!data.city) {
      const cityMatch = line.match(/(?:city|location|shahar|shehar|living in|based out of|based in|from|at)[:\s]+([a-zA-Z\s]{3,20})/i) ||
                        line.match(/([a-zA-Z]+)\s+me\s+rehta/i);
      if (cityMatch) {
        data.city = cityMatch[1].replace(/[,.()].*$/, '').trim();
      } else {
        const commonCities = ['Bengaluru', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Ahmedabad', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Noida', 'Gurugram', 'Gurgaon', 'Surat'];
        for (const ct of commonCities) {
          if (new RegExp('\\b' + ct + '\\b', 'i').test(line)) {
            data.city = ct;
            break;
          }
        }
      }
    }

    // Experience: "5 years experience"
    if (!data.experience) {
      const expMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years|yrs|saal)/i);
      if (expMatch) data.experience = expMatch[1];
    }

    // Team Size
    if (!data.teamSize) {
      const teamMatch = line.match(/(?:team size|employees|members)[:\s]+([0-9\+\-\s]+)/i);
      if (teamMatch) data.teamSize = teamMatch[1].trim();
    }
  },

  /**
   * Match an extracted dictionary of rough data against a list of DOM form fields.
   * Returns an array of mapped actions in the visual order of the form fields.
   */
  matchFields(pageFields, extractedData) {
    const mappings = [];
    const usedKeys = new Set();

    // Loop through each field detected on the active webpage (already in DOM sequence)
    for (const field of pageFields) {
      const fieldDescriptor = {
        id: field.id || '',
        name: field.name || '',
        cleanId: field.cleanId || '',
        cleanName: field.cleanName || '',
        label: field.label || '',
        placeholder: field.placeholder || '',
        ariaLabel: field.ariaLabel || '',
        type: field.type || 'text',
        tagName: field.tagName || 'INPUT',
        options: field.options || [],
        selector: field.selector,
        required: field.required || false,
        elementIndex: field.elementIndex
      };

      // Search all keys in extractedData to find best match
      let bestMatch = null;
      let highestScore = 0;

      for (const [key, value] of Object.entries(extractedData)) {
        if (!value || typeof value !== 'string') continue;

        const score = this.calculateMatchScore(fieldDescriptor, key, value);
        if (score > highestScore && score >= 45) { // 45+ confidence threshold
          highestScore = score;
          bestMatch = { key, value, score };
        }
      }

      if (bestMatch) {
        mappings.push({
          field: fieldDescriptor,
          matchedKey: bestMatch.key,
          valueToFill: bestMatch.value,
          confidence: highestScore,
          status: 'ready'
        });
      } else {
        // Fallback to Dynamic Semantic RAG Vault for unknown/arbitrary government fields
        let ragMatch = null;
        let ragEngine = (typeof semanticRagVault !== 'undefined') ? semanticRagVault : null;
        if (!ragEngine && typeof require === 'function') {
          try { ragEngine = require('./semantic-rag-vault.js').semanticRagVault; } catch(e) {}
        }

        if (ragEngine && ragEngine.queryDossier) {
          const rawSource = extractedData.__rawText || Object.entries(extractedData).map(([k, v]) => `${k}: ${v}`).join('\n');
          const dossier = ragEngine.ingestToDossier(rawSource);
          ragMatch = ragEngine.queryDossier(dossier, fieldDescriptor);
        }

        if (ragMatch && ragMatch.value) {
          mappings.push({
            field: fieldDescriptor,
            matchedKey: ragMatch.sourceConcept || ragMatch.sourceKey || 'rag_semantic',
            valueToFill: ragMatch.value,
            confidence: Math.round(ragMatch.confidence * 100),
            status: 'ready',
            isRagAugmented: true
          });
        } else {
          // Field exists on page, but rough data didn't have a value for it
          mappings.push({
            field: fieldDescriptor,
            matchedKey: null,
            valueToFill: '',
            confidence: 0,
            status: 'unmatched'
          });
        }
      }
    }

    return mappings;
  },

  /**
   * Match scoring between a form field descriptor and an extracted data key
   */
  calculateMatchScore(field, dataKey, dataValue) {
    const combinedTarget = (
      (field.label || '') + ' ' +
      (field.placeholder || '') + ' ' +
      (field.name || '') + ' ' +
      (field.id || '')
    ).toLowerCase();

    const normKey = this.normalizeKey(dataKey);

    // Reject purely numeric or empty keys (like "10", "12") from matching form fields
    if (!normKey || /^\d+$/.test(normKey)) return 0;
    // 1. Father fields must ONLY match fatherName / pita
    if (combinedTarget.includes('father') || combinedTarget.includes('pita')) {
      if (normKey !== 'fathername' && normKey !== 'father_name' && normKey !== 'pita') {
        return 0;
      }
    }
    // 2. Mother fields must ONLY match motherName / mata
    if (combinedTarget.includes('mother') || combinedTarget.includes('mata')) {
      if (normKey !== 'mothername' && normKey !== 'mother_name' && normKey !== 'mata') {
        return 0;
      }
    }
    // 3. Hindi name fields must ONLY match nameHindi
    if (combinedTarget.includes('namehindi') || combinedTarget.includes('name_hindi') || combinedTarget.includes('हिन्दी') || (combinedTarget.includes('hindi') && combinedTarget.includes('name'))) {
      if (normKey !== 'namehindi' && normKey !== 'name_hindi' && normKey !== 'naam_hindi') {
        return 0;
      }
    }
    // 4. Candidate English full name must NOT match father or mother fields
    if (normKey === 'fullname' || normKey === 'full_name' || normKey === 'name') {
      if (combinedTarget.includes('father') || combinedTarget.includes('mother') || combinedTarget.includes('spouse') || combinedTarget.includes('husband') || combinedTarget.includes('wife')) {
        return 0;
      }
    }

    // 5. Gender fields (and male/female/other radio items) must ONLY match gender
    if (combinedTarget.includes('gender') || combinedTarget.includes('ling') || (field.type === 'radio' && (combinedTarget.includes('male') || combinedTarget.includes('female') || combinedTarget.includes('other')))) {
      if (normKey !== 'gender' && normKey !== 'sex' && normKey !== 'ling') {
        return 0;
      }
    }

    let score = 0;
    const targetTexts = [
      field.label,
      field.placeholder,
      field.ariaLabel,
      field.name,
      field.id,
      field.cleanName,
      field.cleanId
    ].map(t => (t || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()).filter(Boolean);

    // 1. Direct key match with label/placeholder/name/id
    for (const text of targetTexts) {
      if (text === normKey || text === dataKey.toLowerCase()) {
        score = Math.max(score, 100);
      } else if (new RegExp('\\b' + normKey + '\\b', 'i').test(text)) {
        score = Math.max(score, 95);
      } else if (normKey.length > 3 && text.length > 3 && (text.includes(normKey) || (normKey.includes(text) && !normKey.includes('mother')))) {
        score = Math.max(score, 70);
      }
    }

    // 2. Check Synonyms table
    for (const [synCategory, synonyms] of Object.entries(this.SYNONYMS)) {
      const keyMatchesCategory = synonyms.includes(normKey) || synCategory.toLowerCase() === normKey;

      if (keyMatchesCategory) {
        for (const text of targetTexts) {
          for (const syn of synonyms) {
            const synClean = syn.replace(/_/g, ' ');
            if (text === synClean) {
              score = Math.max(score, 95);
            } else if (new RegExp('\\b' + synClean + '\\b', 'i').test(text)) {
              score = Math.max(score, 90);
            }
          }
        }

        // Special input type & tag boosts
        if (synCategory === 'email' && field.type === 'email') score = Math.max(score, 98);
        if (synCategory === 'phone' && (field.type === 'tel' || field.type === 'number')) score = Math.max(score, 95);
        if (synCategory === 'website' && field.type === 'url') score = Math.max(score, 95);
        if (synCategory === 'agree' && field.type === 'checkbox') score = Math.max(score, 98);
        if (synCategory === 'description' && field.tagName === 'TEXTAREA') score = Math.max(score, 96);
      }
    }

    // 3. For SELECT dropdowns, check if value matches any of the available options
    if (field.tagName === 'SELECT' && field.options && field.options.length > 0) {
      const valLower = dataValue.toLowerCase().trim();
      for (const opt of field.options) {
        const optText = (opt.text || '').toLowerCase().trim();
        const optVal = (opt.value || '').toLowerCase().trim();

        if (optText === valLower || optVal === valLower) {
          score = Math.max(score, 85);
          break;
        } else if (optText.includes(valLower) || valLower.includes(optText)) {
          score = Math.max(score, 70);
          break;
        }
      }
    }

    return score;
  }
};

// Export for usage in ES module or standalone script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartParser;
} else if (typeof window !== 'undefined') {
  window.SmartParser = SmartParser;
}
