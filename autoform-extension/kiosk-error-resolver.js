// AutoForm AI - Ground Reality Error Resolver for MP Government Portals
// Detects exact real-world portal errors (eKYC outdated, Live Photo required, UIDAI Timeout, Payment Pending)
// Provides 1-click automatic remediation routing without losing user data

const KIOSK_GROUND_ERRORS = [
  // 1. MPESB Profile eKYC Outdated
  {
    id: 'MPESB_EKYC_OUTDATED',
    patterns: [
      /प्रोफाइल\s*में\s*आधार\s*ई[-]?केवाईसी\s*अद्यतन\s*नहीं/i,
      /आधार\s*ई[-]?केवाईसी\s*के\s*द्वारा\s*अपग्रेड\s*करें/i,
      /profile\s*is\s*not\s*updated\s*with\s*ekyc/i,
      /profile\s*update\s*required/i
    ],
    severity: 'BLOCKING_REVERT',
    title: '⚠️ प्रोफाइल में आधार eKYC अद्यतन नहीं है',
    solutionText: 'नया फॉर्म भरने से पहले प्रोफाइल को आधार eKYC और लाइव फोटो से अपडेट करना अनिवार्य है।',
    actionButtonText: '⚡ Open Profile eKYC Update',
    targetUrl: 'https://esb.mponline.gov.in/Portal/Examinations/Vyapam/Candidate/CandidateEkycUpdate.aspx'
  },

  // 2. MPESB Live Photo & WebCam Required (2025-2026 Mandate)
  {
    id: 'MPESB_LIVE_PHOTO_MANDATORY',
    patterns: [
      /लाइव\s*फोटो\s*(?:कैप्चर)?\s*अनिवार्य/i,
      /live\s*photo\s*(?:capture)?\s*mandatory/i,
      /वेबकैम\s*के\s*माध्यम\s*से\s*फोटो/i
    ],
    severity: 'INPUT_ACTION',
    title: '📸 लाइव फोटो (Live WebCam Photo) अनिवार्य है',
    solutionText: 'पोर्टल के नए नियम के अनुसार वेबकैम से लाइव फोटो लेना जरूरी है। चश्मा और टोपी हटाकर चेहरा सीधा रखें।',
    actionButtonText: '📷 Focus Camera Trigger'
  },

  // 3. Template Size / Dimensions Mismatch
  {
    id: 'TEMPLATE_SIZE_REJECTED',
    patterns: [
      /फ़ाइल\s*का\s*आकार\s*अमान्य/i,
      /कृपया\s*दिए\s*गए\s*टेम्पलेट/i,
      /image\s*(?:size|dimension)\s*exceeded/i,
      /file\s*size\s*must\s*be\s*between/i
    ],
    severity: 'INPUT_ACTION',
    title: '🖼️ फोटो-साइन टेम्पलेट साइज एरर (Must be < 200 KB)',
    solutionText: 'व्यापम 4x5cm का आधिकारिक टेम्पलेट (फोटो + हस्ताक्षर + हस्तलिखित घोषणा) 200 KB के अंदर ही लेता है।',
    actionButtonText: '✂️ Auto-Crop & Compress Template'
  },

  // 4. Samagra UIDAI Server Timeout
  {
    id: 'UIDAI_SERVER_TIMEOUT',
    patterns: [
      /uidai\s*सर्वर\s*से\s*प्रतिक्रिया\s*प्राप्त\s*नहीं/i,
      /request\s*timeout/i,
      /aadhaar\s*server\s*(?:down|busy)/i,
      /सर्वर\s*धीमा\s*है/i
    ],
    severity: 'BIOMETRIC_FALLBACK',
    title: '⏳ UIDAI आधार सर्वर डाउन / टाइमआउट (OTP नहीं आ रहा)',
    solutionText: 'आधार ओटीपी सर्वर व्यस्त है। ग्राहक यदि काउंटर पर है तो बायोमेट्रिक (मंत्रा/मॉर्फो फिंगरप्रिंट) से तुरंत ई-केवाईसी करें।',
    actionButtonText: '👆 Switch to Biometric Fingerprint'
  },

  // 5. Payment Debited But Receipt Unpaid
  {
    id: 'PAYMENT_PENDING_UNPAID',
    patterns: [
      /transaction\s*pending/i,
      /unpaid\s*status/i,
      /सत्यापित\s*करें\s*\(verify\s*payment\)/i,
      /भुगतान\s*सत्यापन\s*लंबित/i
    ],
    severity: 'PAYMENT_RECOVERY',
    title: '💳 पेमेंट कट गया पर रसीद नहीं निकली (Pending Transaction)',
    solutionText: 'दोबारा तुरंत भुगतान न करें! MPOnline के "Double Verification / Verify Unpaid" से 1-क्लिक में रसीद पुनः प्राप्त करें।',
    actionButtonText: '🔄 Verify Payment & Fetch Receipt',
    targetUrl: 'https://esb.mponline.gov.in/Portal/Examinations/Vyapam/Reports/DuplicateReceipt.aspx'
  }
];

class KioskErrorResolver {
  /**
   * Scans current DOM / Page body text for known real-world portal errors
   */
  detectPageErrors(domText = null) {
    const textToScan = domText || (typeof document !== 'undefined' ? document.body?.innerText : '') || '';
    if (!textToScan) return [];

    const detected = [];

    for (const errDef of KIOSK_GROUND_ERRORS) {
      for (const pattern of errDef.patterns) {
        if (pattern.test(textToScan)) {
          detected.push({
            id: errDef.id,
            title: errDef.title,
            solutionText: errDef.solutionText,
            actionButtonText: errDef.actionButtonText,
            targetUrl: errDef.targetUrl || null,
            severity: errDef.severity
          });
          break; // Avoid duplicate triggers for same error definition
        }
      }
    }

    return detected;
  }

  /**
   * Auto-execute remediation action
   */
  async executeRemediation(errorId, tabId = null) {
    const errDef = KIOSK_GROUND_ERRORS.find(e => e.id === errorId);
    if (!errDef) return { success: false, message: 'अज्ञात एरर कोड।' };

    // Case 1: Route to fix URL (e.g. Profile eKYC or Verify Payment)
    if (errDef.targetUrl) {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        if (tabId) {
          await chrome.tabs.update(tabId, { url: errDef.targetUrl });
        } else {
          await chrome.tabs.create({ url: errDef.targetUrl });
        }
        return { success: true, action: 'NAVIGATED', url: errDef.targetUrl };
      }
    }

    // Case 2: Switch to Biometric Radio
    if (errDef.severity === 'BIOMETRIC_FALLBACK') {
      if (typeof document !== 'undefined') {
        const bioRadio = document.querySelector('input[type="radio"][value*="Bio" i], input[type="radio"][id*="Bio" i], input[value*="बायोमेट्रिक" i]');
        if (bioRadio) {
          bioRadio.click();
          return { success: true, action: 'SWITCHED_TO_BIOMETRIC' };
        }
      }
    }

    return { success: true, action: 'MANUAL_INSTRUCTION', solution: errDef.solutionText };
  }
}

const kioskErrorResolver = new KioskErrorResolver();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KIOSK_GROUND_ERRORS, KioskErrorResolver, kioskErrorResolver };
}
