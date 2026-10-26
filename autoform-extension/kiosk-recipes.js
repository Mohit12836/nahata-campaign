// AutoForm AI - MPOnline & Government Portal Kiosk Recipe Registry
// Master SOPs, Direct URLs, OTP Checkpoints, and Recovery Trees for MP Kiosks

const KIOSK_PORTAL_RECIPES = {
  // 1. MPESB Vyapam (कर्मचारी चयन मंडल, भोपाल)
  "mpesb_vyapam": {
    id: "mpesb_vyapam",
    portalName: "MPESB (व्यापम) मंडल भोपाल",
    category: "Recruitment",
    totalOtps: 2, // 1 Mobile OTP for Profile/Login + 1 Aadhaar eKYC OTP
    hasBiometricOption: true,
    draftSavedOnServer: true,
    directLinks: {
      activeForms: "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/ExamsList.aspx",
      profileLogin: "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/Candidate/CandidateProfile.aspx",
      findProfileId: "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/Candidate/SearchCandidateProfile.aspx",
      forgetPassword: "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/Candidate/Forgot_Password.aspx",
      ekycUpdate: "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/Candidate/CandidateEkycUpdate.aspx",
      unpaidReceipt: "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/Reports/DuplicateReceipt.aspx"
    },
    steps: [
      {
        stepNumber: 1,
        stepName: "Candidate Login / Registration ID",
        expectedUrlPattern: "/CandidateProfile|/CandidateLogin",
        checkpoints: ["PROFILE_ID_INPUT", "PASSWORD_INPUT", "CAPTCHA"],
        requiresOtp: false,
        notes: "अगर प्रोफाइल नंबर नहीं है, तो SearchCandidateProfile लिंक पर जाएं।"
      },
      {
        stepNumber: 2,
        stepName: "Aadhaar eKYC Verification",
        expectedUrlPattern: "/CandidateEkyc|/AadhaarAuth",
        checkpoints: ["AADHAAR_OTP", "BIOMETRIC_MANTRA_MORPHO"],
        requiresOtp: true,
        otpType: "AADHAAR_LINKED_MOBILE",
        notes: "आधार से जुड़े मोबाइल पर 6 अंकों का OTP आता है। अगर मोबाइल खो गया है तो मंत्रा/मॉर्फो फिंगरप्रिंट लगाएं।"
      },
      {
        stepNumber: 3,
        stepName: "Application Form Filling (Post Preference, Education)",
        expectedUrlPattern: "/Apply|/ApplicationForm",
        checkpoints: ["10TH_ROLL", "CATEGORY_DOMICILE", "POST_PREFERENCE"],
        requiresOtp: false,
        notes: "टूल 10वीं रोल, संबल कार्ड, भूतपूर्व सैनिक, और पोस्ट कोड ऑटो-फिल करता है।"
      },
      {
        stepNumber: 4,
        stepName: "Photo, Signature & Declaration Upload",
        expectedUrlPattern: "/UploadDoc|/PhotoSign",
        checkpoints: ["PHOTO_SIGN_TEMPLATE"],
        requiresOtp: false,
        notes: "व्यापam का 4x5 cm टेम्पलेट चाहिए जिसमें नीचे नाम और तारीख हो।"
      },
      {
        stepNumber: 5,
        stepName: "Kiosk Wallet Payment & Final Receipt",
        expectedUrlPattern: "/Payment|/KioskPayment|/Receipt",
        checkpoints: ["KIOSK_WALLET_PIN", "APPLICATION_NUMBER"],
        requiresOtp: false,
        notes: "भुगतान रसीद नंबर और आवेदन क्रमांक सीधे शीट में सेव होगा।"
      }
    ]
  },

  // 2. Samagra Portal eKYC & DBT (समग्र सामाजिक सुरक्षा मिशन)
  "samagra_ekyc": {
    id: "samagra_ekyc",
    portalName: "समग्र eKYC & DBT लिंकिंग (samagra.gov.in)",
    category: "Citizen Services",
    totalOtps: 2, // 1 Samagra Mobile OTP + 1 Aadhaar OTP
    hasBiometricOption: true,
    draftSavedOnServer: false,
    directLinks: {
      ekycStart: "https://samagra.gov.in/Citizen/eKYC/e_kyc.aspx",
      searchFamilyId: "https://samagra.gov.in/Citizen/Pages/SearchFamily.aspx",
      searchMemberId: "https://samagra.gov.in/Citizen/Pages/SearchMember.aspx",
      dbtStatus: "https://samagra.gov.in/Citizen/Pages/DBTStatus.aspx"
    },
    steps: [
      {
        stepNumber: 1,
        stepName: "Samagra Member ID & Captcha",
        expectedUrlPattern: "/e_kyc|/eKYC",
        checkpoints: ["SAMAGRA_9_DIGIT", "CAPTCHA"],
        requiresOtp: true,
        otpType: "SAMAGRA_MOBILE_OTP",
        notes: "समग्र सदस्य आईडी दर्ज करने पर समग्र में दर्ज मोबाइल पर 4 या 6 डिजिट OTP आता है।"
      },
      {
        stepNumber: 2,
        stepName: "Aadhaar Number & UIDAI Verification",
        expectedUrlPattern: "/AadhaarKYC",
        checkpoints: ["AADHAAR_12_DIGIT", "AADHAAR_OTP", "BIOMETRIC"],
        requiresOtp: true,
        otpType: "AADHAAR_LINKED_MOBILE",
        notes: "UIDAI से 6 अंकों का OTP आएगा। नाम और जन्मतिथि समग्र में अपडेट करने की अनुमति मांगेगा।"
      },
      {
        stepNumber: 3,
        stepName: "Land Record (Bhulekh) & Final Submit",
        expectedUrlPattern: "/LandVerification|/FinalSubmit",
        checkpoints: ["LAND_OWNER_FLAG", "SUBMIT_REQUEST"],
        requiresOtp: false,
        notes: "ग्राम पंचायत / वार्ड प्रभारी द्वारा सत्यापन हेतु अनुरोध क्रमांक जनरेट होता है।"
      }
    ]
  },

  // 3. MP e-District Lok Seva (लोक सेवा केंद्र - जाति, मूल निवासी, आय)
  "mp_edistrict": {
    id: "mp_edistrict",
    portalName: "MP ई-डिस्ट्रिक्ट (लोक सेवा प्रबंधन)",
    category: "Certificates",
    totalOtps: 1,
    hasBiometricOption: false,
    draftSavedOnServer: true,
    directLinks: {
      citizenLogin: "https://mpedistrict.gov.in/MPL/Citizen_Registration.aspx",
      casteCertificate: "https://mpedistrict.gov.in/MPL/Services.aspx?id=1",
      domicileCertificate: "https://mpedistrict.gov.in/MPL/Services.aspx?id=2",
      incomeCertificate: "https://mpedistrict.gov.in/MPL/Services.aspx?id=3",
      trackApplication: "https://mpedistrict.gov.in/MPL/ApplicationStatus.aspx"
    },
    steps: [
      {
        stepNumber: 1,
        stepName: "Citizen Login / Kiosk Channel",
        expectedUrlPattern: "/Citizen_Registration|/KioskLogin",
        checkpoints: ["USER_PASS", "OTP_LOGIN"],
        requiresOtp: false
      },
      {
        stepNumber: 2,
        stepName: "Samagra & General Information Fetch",
        expectedUrlPattern: "/ServiceApply|/FillForm",
        checkpoints: ["SAMAGRA_ID", "FATHER_MOTHER_HINDI", "ADDRESS_WARD"],
        requiresOtp: false,
        notes: "समग्र आईडी से डेटा ऑटोमैटिक फेच होता है। शेष विवरण टूल भरेगा।"
      },
      {
        stepNumber: 3,
        stepName: "Affidavit (स्व-प्रमाणित घोषणा पत्र) & Documents",
        expectedUrlPattern: "/Upload|/Affidavit",
        checkpoints: ["AFFIDAVIT_CHECKBOX", "PHOTO_UPLOAD"],
        requiresOtp: false
      },
      {
        stepNumber: 4,
        stepName: "Submission & Registration Receipt (RS Number)",
        expectedUrlPattern: "/Acknowledgement|/Receipt",
        checkpoints: ["RS_REFERENCE_NUMBER"],
        requiresOtp: false,
        notes: "RS/420/XXXXX नंबर जनरेट होता है, जिसकी स्थिति 15 दिनों में ट्रैक की जा सकती है।"
      }
    ]
  },

  // 4. Parivahan Sarathi (ड्राइविंग लाइसेंस - Sarathi Parivahan)
  "parivahan_sarathi": {
    id: "parivahan_sarathi",
    portalName: "परिवहन सारथी (ड्राइविंग लाइसेंस - MP)",
    category: "Transport",
    totalOtps: 2,
    hasBiometricOption: false,
    draftSavedOnServer: true,
    directLinks: {
      stateSelection: "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
      newLearnerLicense: "https://sarathi.parivahan.gov.in/sarathiservice/newLLDet.do",
      slotBooking: "https://sarathi.parivahan.gov.in/sarathiservice/slotbooking.do",
      feePayment: "https://sarathi.parivahan.gov.in/sarathiservice/feepayment.do"
    },
    steps: [
      {
        stepNumber: 1,
        stepName: "Aadhaar Authentication (Contactless LL)",
        expectedUrlPattern: "/sarathiservice|/newLL",
        checkpoints: ["AADHAAR_OTP"],
        requiresOtp: true,
        otpType: "AADHAAR_LINKED_MOBILE",
        notes: "अगर आधार से किया तो घर बैठे टेस्ट दे सकते हैं (RTO जाने की जरूरत नहीं)।"
      },
      {
        stepNumber: 2,
        stepName: "Vehicle Class Selection (MCWG / LMV)",
        expectedUrlPattern: "/covDetails",
        checkpoints: ["VEHICLE_CLASS_SELECT", "BLOOD_GROUP"],
        requiresOtp: false
      },
      {
        stepNumber: 3,
        stepName: "Fee Payment & LL Slot",
        expectedUrlPattern: "/feepayment",
        checkpoints: ["PAYMENT_GATEWAY", "APPLICATION_NUMBER"],
        requiresOtp: false
      }
    ]
  },

  // 5. NSDL / UTI PAN Card
  "pan_card_nsdl": {
    id: "pan_card_nsdl",
    portalName: "NSDL / UTIITSL पैन कार्ड (Form 49A)",
    category: "Identity & Taxation",
    totalOtps: 2, // Aadhaar eSign OTPs
    hasBiometricOption: true,
    draftSavedOnServer: true,
    directLinks: {
      onlinePan: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
      utiitPan: "https://www.pan.utiitsl.com/PAN/newAOA.do"
    },
    steps: [
      {
        stepNumber: 1,
        stepName: "Token Generation & Applicant Details",
        expectedUrlPattern: "/endUserRegisterContact",
        checkpoints: ["NAME_DOB_PHONE_EMAIL", "CAPTCHA"],
        requiresOtp: false,
        notes: "टोकन नंबर जनरेट होता है जो 30 दिनों के लिए वैध रहता है।"
      },
      {
        stepNumber: 2,
        stepName: "Personal Details & Parents Name",
        expectedUrlPattern: "/personalDetails",
        checkpoints: ["FATHER_NAME", "CARD_NAME_SELECT"],
        requiresOtp: false
      },
      {
        stepNumber: 3,
        stepName: "AO Code (Assessing Officer Code)",
        expectedUrlPattern: "/aoCode",
        checkpoints: ["CITY_SEARCH", "WARD_AO_CODE"],
        requiresOtp: false,
        notes: "टूल जिले (जैसे इंदौर) के हिसाब से सही Ward AO Code चुनता है।"
      },
      {
        stepNumber: 4,
        stepName: "Aadhaar e-KYC / e-Sign Authentication",
        expectedUrlPattern: "/eSign|/authenticate",
        checkpoints: ["AADHAAR_OTP", "BIOMETRIC"],
        requiresOtp: true,
        otpType: "AADHAAR_LINKED_MOBILE",
        notes: "e-Sign के लिए UIDAI से 6 अंकों का OTP आता है।"
      }
    ]
  }
};

// Helper function to detect which recipe applies to current URL
function detectActiveRecipe(currentUrl) {
  if (!currentUrl) return null;
  const urlLower = currentUrl.toLowerCase();
  
  if (urlLower.includes("esb.mponline.gov.in") || urlLower.includes("vyapam")) {
    return KIOSK_PORTAL_RECIPES.mpesb_vyapam;
  }
  if (urlLower.includes("samagra.gov.in")) {
    return KIOSK_PORTAL_RECIPES.samagra_ekyc;
  }
  if (urlLower.includes("mpedistrict.gov.in") || urlLower.includes("lokseva")) {
    return KIOSK_PORTAL_RECIPES.mp_edistrict;
  }
  if (urlLower.includes("sarathi.parivahan.gov.in")) {
    return KIOSK_PORTAL_RECIPES.parivahan_sarathi;
  }
  if (urlLower.includes("onlineservices.nsdl.com") || urlLower.includes("utiitsl.com")) {
    return KIOSK_PORTAL_RECIPES.pan_card_nsdl;
  }
  return null;
}

// Generate pre-formatted WhatsApp message for requesting OTP from citizen
function generateWhatsAppOtpPrompt(applicant, recipe, stepInfo) {
  const name = applicant.fullName || applicant.applicantName || "ग्राहक महोदय";
  const portal = recipe?.portalName || "सरकारी पोर्टल";
  const otpType = stepInfo?.otpType === "AADHAAR_LINKED_MOBILE" 
    ? "आधार कार्ड से जुड़े मोबाइल" 
    : "आपके मोबाइल";

  return `नमस्ते ${name} जी,\n\nमैं नाहटा कियोस्क (Nahata General Stores) से बोल रहा हूँ। आपका ${portal} का फॉर्म ऑनलाइन भरा जा रहा है।\n\n📌 कृपया ध्यान दें: अभी ${otpType} पर एक 6-अंकों का OTP (ओटीपी) आया होगा।\n\nकृपया वो OTP तुरंत यहाँ रिप्लाई में भेजें ताकि आपका फॉर्म बिना रुके सबमिट हो सके। (यह OTP सिर्फ 10 मिनट के लिए मान्य है)।\n\nधन्यवाद!`;
}

// Export for extension scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KIOSK_PORTAL_RECIPES, detectActiveRecipe, generateWhatsAppOtpPrompt };
}
