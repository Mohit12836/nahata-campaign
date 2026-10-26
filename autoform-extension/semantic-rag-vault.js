// AutoForm AI - Dynamic Semantic RAG Vault
// Local, zero-token semantic vector matching engine for unknown/dynamic government fields
// Stores citizen knowledge base as dynamic semantic entities and retrieves best-matching values

class SemanticRAGVault {
  constructor() {
    // Universal Concept Synonyms & Semantic Clusters
    this.conceptClusters = {
      // 1. Identity & Citizneship
      aadhaar: ['aadhaar', 'uid', 'uidai', 'आधार', 'पहचान संख्या', '12 अंकों का आधार'],
      samagraMember: ['samagra', 'sssmid', 'समग्र सदस्य', 'सदस्य आईडी', '9 अंकों की समग्र'],
      samagraFamily: ['family id', 'परिवार समग्र', 'समग्र परिवार आईडी', '8 अंकों की परिवार'],
      panCard: ['pan', 'pan no', 'pancard', 'पैन कार्ड', 'स्थायी खाता संख्या'],
      voterId: ['voter', 'epic', 'मतदाता पहचान', 'पहचान पत्र क्रमांक'],

      // 2. Personal & Parents
      applicantName: ['name', 'applicant', 'candidate', 'नाम', 'आवेदक का नाम', 'उम्मीदवार', 'परीक्षार्थी'],
      nameHindi: ['hindi name', 'नाम हिंदी', 'आवेदक हिंदी', 'देवनागरी'],
      fatherName: ['father', 'pita', 'पिता का नाम', 'पिताजी', 'guardian', 'अभिभावक'],
      motherName: ['mother', 'mata', 'माता का नाम', 'माँ का नाम'],
      spouseName: ['husband', 'wife', 'spouse', 'पति', 'पत्नी'],
      dob: ['dob', 'date of birth', 'birthdate', 'जन्म तिथि', 'जन्मतिथि', 'जन्म दिनांक'],
      gender: ['gender', 'sex', 'लिंग', 'पुरुष', 'महिला', 'अन्य'],

      // 3. Social & Category
      casteCategory: ['caste', 'category', 'वर्ग', 'जाति', 'श्रेणी', 'सामान्य', 'ओबीसी', 'एससी', 'एसटी', 'ews'],
      subCaste: ['subcaste', 'sub-caste', 'उपजाति', 'जाति का नाम'],
      casteCertNo: ['caste certificate', 'जाति प्रमाण पत्र', 'अनुप्रमाणन क्रमांक', 'rs/'],
      domicileCertNo: ['domicile', 'मूल निवासी', 'स्थानीय निवासी प्रमाण'],
      incomeCertNo: ['income certificate', 'income cert', 'आय प्रमाण पत्र', 'आय प्रमाण पत्र क्रमांक', 'वार्षिक आय प्रमाण पत्र'],
      annualIncome: ['annual income', 'पारिवारिक आय', 'वार्षिक आय', 'कुल पारिवारिक आय', 'कुल वार्षिक आय', 'income in rs'],

      // 4. Welfare & Schemes
      sambalNo: ['sambal', 'संबल', 'संबल 2.0', 'संबल कार्ड', 'श्रमिक पंजीयन'],
      bplRationNo: ['bpl', 'ration card', 'राशन कार्ड', 'गरीबी रेखा', 'बीपीएल'],
      ladliBehnaId: ['ladli', 'लाडली बहना', 'आवेदन पंजीयन क्रमांक'],
      kisanCreditNo: ['kcc', 'किसान क्रेडिट', 'केसीसी'],
      pmKisanId: ['pm kisan', 'पीएम किसान', 'किसान सम्मान निधि'],

      // 5. Land & Property (Revenue)
      khasraNo: ['khasra', 'खसरा', 'रकबा', 'खसरा नंबर', 'भूमि सर्वेक्षण'],
      khatauniNo: ['khatauni', 'खतौनी', 'खाता संख्या'],
      villageHalka: ['village', 'gram', 'halka', 'गाँव', 'ग्राम', 'पटवारी हल्का'],

      // 6. Transport & Vehicles
      drivingLicenseNo: ['dl', 'driving license', 'ड्राइविंग लाइसेंस', 'डीएल नंबर'],
      vehicleClass: ['vehicle class', 'cov', 'mcwg', 'lmv', 'वाहन श्रेणी'],
      vehicleRegNo: ['vehicle reg', 'गाड़ी नंबर', 'रजिस्ट्रेशन नंबर', 'वाहन क्रमांक'],
      bloodGroup: ['blood group', 'रक्त समूह', 'ब्लड ग्रुप'],

      // 7. Academic & Qualifications
      roll10th: ['10th roll', 'highschool roll', '10वीं रोल नंबर', 'दसवीं अनुक्रमांक'],
      board10th: ['10th board', '10वीं बोर्ड', 'माध्यमिक शिक्षा मंडल'],
      year10th: ['10th year', '10वीं उत्तीर्ण वर्ष', 'पासिंग साल'],
      marks10th: ['10th marks', '10वीं प्राप्तांक', 'दसवीं प्रतिशत'],
      roll12th: ['12th roll', 'higher secondary roll', '12वीं रोल नंबर', 'बारहवीं'],
      board12th: ['12th board', '12वीं बोर्ड'],
      year12th: ['12th year', '12वीं उत्तीर्ण वर्ष'],
      marks12th: ['12th marks', '12वीं प्रतिशत'],
      graduateDegree: ['degree', 'graduation', 'स्नातक', 'बीए', 'बीएससी', 'बीकॉम', 'बीटेक'],

      // 8. Banking & DBT
      bankAccountNo: ['account no', 'खाता क्रमांक', 'बैंक खाता', 'अकाउंट नंबर'],
      bankIfsc: ['ifsc', 'आईएफएससी', 'शाखा कोड'],
      bankName: ['bank name', 'बैंक का नाम', 'स्टेट बैंक', 'बैंक ऑफ बड़ौदा'],

      // 9. Contact & Address
      phone: ['phone', 'mobile', 'contact', 'मोबाइल', 'फ़ोन', 'दूरभाष'],
      email: ['email', 'ईमेल', 'मेल आईडी'],
      addressLine: ['address', 'पता', 'मकान नंबर', 'मोहल्ला', 'ग्राम'],
      district: ['district', 'jila', 'जिला', 'जनपद'],
      tehsil: ['tehsil', 'तहसील'],
      pincode: ['pin', 'pincode', 'पिनकोड', 'डाक कोड']
    };

    this.stopwords = new Set([
      'नंबर', 'क्रमांक', 'संख्या', 'no', 'number', 'num', 'id', 'कोड', 'code',
      'दर्ज', 'करें', 'का', 'की', 'के', 'में', 'पर', 'को', 'से', 'विवरण', 'details',
      'enter', 'select', 'input', 'txt', 'ddl', 'lbl', 'ctl00', 'box'
    ]);
  }

  /**
   * Tokenize and normalize any string for semantic comparison
   */
  tokenize(text, removeStopwords = true) {
    if (!text || typeof text !== 'string') return [];
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\u0900-\u097F\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);

    if (removeStopwords && this.stopwords) {
      const filtered = tokens.filter(t => !this.stopwords.has(t));
      return filtered.length > 0 ? filtered : tokens; // Keep original if all were stopwords
    }
    return tokens;
  }

  /**
   * Ingest any raw, unstructured citizen text into a dynamic semantic vault
   * Parses arbitrary key-value pairs without hardcoding columns
   */
  ingestToDossier(rawText) {
    const vault = {
      rawEntries: [], // Array of { key, value, tokens }
      semanticIndex: {} // Cluster -> best matching value
    };

    if (!rawText || typeof rawText !== 'string') return vault;

    // Split lines or delimiters
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      // Matches: "Key : Value" or "Key - Value" or "Key = Value"
      const match = line.match(/^([^:\-–=]+)[:\-–=]\s*(.+)$/);
      if (match) {
        const rawKey = match[1].trim();
        const rawVal = match[2].trim();
        const tokens = this.tokenize(rawKey);

        vault.rawEntries.push({
          rawKey,
          value: rawVal,
          tokens
        });
      } else {
        // If no colon, extract standalone entities (Aadhaar 12-digit, Phone 10-digit, etc.)
        this.extractStandaloneEntities(line, vault);
      }
    });

    // Build Semantic Index for known concept clusters
    this.indexConcepts(vault);

    return vault;
  }

  /**
   * Extract standalone phone, aadhaar, email, pan from unlabelled text
   */
  extractStandaloneEntities(text, vault) {
    // Aadhaar 12 digits
    const aadhaarMatch = text.match(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/);
    if (aadhaarMatch) {
      vault.rawEntries.push({
        rawKey: 'aadhaar_extracted',
        value: aadhaarMatch[0].replace(/\D/g, ''),
        tokens: ['aadhaar', 'आधार']
      });
    }

    // Phone 10 digits
    const phoneMatch = text.match(/\b[6-9]\d{9}\b/);
    if (phoneMatch) {
      vault.rawEntries.push({
        rawKey: 'phone_extracted',
        value: phoneMatch[0],
        tokens: ['phone', 'mobile', 'मोबाइल']
      });
    }

    // Email
    const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    if (emailMatch) {
      vault.rawEntries.push({
        rawKey: 'email_extracted',
        value: emailMatch[0],
        tokens: ['email', 'ईमेल']
      });
    }

    // PAN Card 10 chars
    const panMatch = text.match(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/i);
    if (panMatch) {
      vault.rawEntries.push({
        rawKey: 'pan_extracted',
        value: panMatch[0].toUpperCase(),
        tokens: ['pan', 'पैन']
      });
    }
  }

  /**
   * Precise Value Sanitizer: Extracts exact form-acceptable values
   * E.g. "142/2 पटवारी हल्का 12" -> khasra: "142/2", halka: "12"
   * E.g. "85000 रुपये" -> income: "85000"
   * E.g. "O Positive (O+)" -> bloodGroup: "O+"
   */
  sanitizePreciseEntityValue(conceptKey, rawVal, vault) {
    if (!rawVal || typeof rawVal !== 'string') return rawVal;
    const cleanStr = rawVal.trim();

    // 1. Khasra / Land Revenue
    if (conceptKey === 'khasraNo') {
      // Extract Khasra survey number: "142/2", "142/2/1", "54", "124-क"
      const khasraMatch = cleanStr.match(/\b\d+(?:[\/\-][\d\u0900-\u097Fa-zA-Z]+)?\b/);
      // Check if Patwari Halka or Village is present in same string
      const halkaMatch = cleanStr.match(/(?:हल्का|पटवारी\s*हल्का|halka)[\s:]*([0-9\u0900-\u097Fa-zA-Z]+)/i);
      if (halkaMatch && vault) {
        vault.semanticIndex['patwariHalka'] = halkaMatch[1].trim();
      }
      return khasraMatch ? khasraMatch[0] : cleanStr;
    }

    // 2. Annual Family Income (Government forms strictly need numbers only)
    if (conceptKey === 'annualIncome') {
      const numMatch = cleanStr.replace(/,/g, '').match(/\b\d{3,9}\b/);
      return numMatch ? numMatch[0] : cleanStr;
    }

    // 3. Blood Group
    if (conceptKey === 'bloodGroup') {
      const bgMatch = cleanStr.match(/\b(A|B|AB|O)\s*(?:[\+\-]|Positive|Negative|पॉजिटिव|नेगेटिव)?\b/i);
      if (bgMatch) {
        const type = bgMatch[1].toUpperCase();
        const isNeg = /negative|नेगेटिव|\-/i.test(cleanStr);
        return type + (isNeg ? '-' : '+');
      }
      return cleanStr;
    }

    // 4. Aadhaar
    if (conceptKey === 'aadhaar') {
      return cleanStr.replace(/\D/g, '');
    }

    // 5. Phone / Mobile
    if (conceptKey === 'phone') {
      const phoneDigits = cleanStr.replace(/\D/g, '');
      return phoneDigits.length === 10 ? phoneDigits : (phoneDigits.slice(-10) || cleanStr);
    }

    // 6. 10th / 12th Roll Number
    if (conceptKey === 'roll10th' || conceptKey === 'roll12th') {
      const rollMatch = cleanStr.match(/\b\d{6,12}\b/);
      return rollMatch ? rollMatch[0] : cleanStr;
    }

    return cleanStr;
  }

  /**
   * Index raw entries into semantic clusters
   */
  indexConcepts(vault) {
    for (const [conceptKey, synonyms] of Object.entries(this.conceptClusters)) {
      let bestMatch = null;
      let highestScore = 0;

      vault.rawEntries.forEach(entry => {
        const score = this.calculateSimilarity(entry.tokens, synonyms);
        if (score > highestScore && score >= 0.7) {
          highestScore = score;
          bestMatch = entry.value;
        }
      });

      if (bestMatch) {
        vault.semanticIndex[conceptKey] = this.sanitizePreciseEntityValue(conceptKey, bestMatch, vault);
      }
    }
  }

  /**
   * Compute token-level overlap and Jaccard similarity score with stopword filtering
   */
  calculateSimilarity(tokensA, synonymsList) {
    if (!tokensA || tokensA.length === 0) return 0;

    const hasCertA = tokensA.some(t => t.includes('cert') || t.includes('प्रमाण') || t.includes('पत्र'));
    
    // Check direct substring or token match in synonyms, ignoring generic stopwords
    for (const token of tokensA) {
      if (this.stopwords && this.stopwords.has(token)) continue; // Never match purely on stopword!

      for (const syn of synonymsList) {
        const isCertSyn = syn.includes('cert') || syn.includes('प्रमाण');
        // If one is certificate and other is not, forbid matching
        if (isCertSyn && !hasCertA) continue;
        if (!isCertSyn && hasCertA) continue;

        const synTokens = this.tokenize(syn);
        for (const sToken of synTokens) {
          if (this.stopwords && this.stopwords.has(sToken)) continue;

          if (sToken === token) return 1.0;
          if (sToken.length >= 4 && token.length >= 4) {
            if (sToken.includes(token) || token.includes(sToken)) return 0.85;
          }
        }
      }
    }
    return 0;
  }

  /**
   * RAG Query: Given any unknown target field from ANY new portal,
   * search the citizen's dynamic vault and retrieve the most relevant value
   */
  queryDossier(vault, fieldDescriptor) {
    if (!vault || !fieldDescriptor) return null;

    const targetQuery = [
      fieldDescriptor.label || '',
      fieldDescriptor.id || '',
      fieldDescriptor.name || '',
      fieldDescriptor.placeholder || '',
      fieldDescriptor.cleanId || '',
      fieldDescriptor.cleanName || ''
    ].join(' ').toLowerCase();

    const targetTokens = this.tokenize(targetQuery);
    if (targetTokens.length === 0) return null;

    // 1. First check in indexed semantic concepts
    for (const [conceptKey, synonyms] of Object.entries(this.conceptClusters)) {
      if (this.calculateSimilarity(targetTokens, synonyms) >= 0.8) {
        if (vault.semanticIndex[conceptKey]) {
          return {
            value: vault.semanticIndex[conceptKey],
            confidence: 0.95,
            sourceConcept: conceptKey
          };
        }
      }
    }

    // 2. Dynamic Raw Entry Similarity Search (Zero-Token Local RAG)
    let bestEntry = null;
    let highestScore = 0;

    vault.rawEntries.forEach(entry => {
      let score = 0;
      entry.tokens.forEach(tok => {
        if (targetTokens.includes(tok)) score += 0.5;
        if (targetQuery.includes(tok)) score += 0.3;
      });

      if (score > highestScore && score >= 0.5) {
        highestScore = score;
        bestEntry = entry;
      }
    });

    if (bestEntry) {
      return {
        value: bestEntry.value,
        confidence: Math.min(0.9, highestScore),
        sourceKey: bestEntry.rawKey
      };
    }

    return null;
  }
}

// Global Export
const semanticRagVault = new SemanticRAGVault();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SemanticRAGVault, semanticRagVault };
}
