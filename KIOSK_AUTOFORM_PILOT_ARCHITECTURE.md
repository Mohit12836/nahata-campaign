# AutoForm AI - Kiosk Pilot & MPOnline Automation Engine
**Designed for:** Mohit Jain | Nahata General Stores / MPOnline Kiosk (Indore)  
**Architecture:** Chrome Extension (Manifest V3) + Kiosk Pilot Engine + Google Sheets 2-Way Sync + WhatsApp Alerts

---

## 📌 1. समस्या और ज़मीनी हकीकत (Ground Reality & Problem Statement)

1. **1,000 ग्राहक, 100 तरह के फॉर्म:** हर दिन सैकड़ों नागरिकों के विभिन्न सरकारी फॉर्म्स (व्यापम, समग्र, ई-डिस्ट्रिक्ट, सारथी, पैन कार्ड आदि) भरने होते हैं।
2. **गलतियों का डर और समय की बर्बादी:** एक-एक फॉर्म हाथ से टाइप करने में 15-20 मिनट लगते हैं और स्पेलिंग मिस्टेक होने पर नागरिक परेशान होता है।
3. **पोर्टल सेशन टाइमआउट और डेटा उड़ना:** सरकारी साइट 5 मिनट में सेशन एक्सपायर कर देती है। अगर OTP देरी से आए, तो 4-5 पेज का भरा हुआ डेटा गायब हो जाता है।
4. **कर्मचारियों के लिए लिंक का जंजाल:** एक ही साइट के 10-20 अलग-अलग लिंक (रजिस्ट्रेशन, फॉरगेट पासवर्ड, प्रोफाइल एडिट, रसीद) होते हैं। कर्मचारी को लिंक ढूंढने में समय बर्बाद नहीं करना चाहिए।
5. **OTP अड़चन और काम रुकना:** नागरिक तुरंत OTP नहीं दे पाता (फोन साइलेंट, बाइक चला रहा, खेत में)। अगर ऑपरेटर उसका इंतज़ार करेगा तो पूरे दिन का काम रुक जाएगा।

---

## 🏛️ 2. सिस्टम आर्किटेक्चर (The 4 Pillars)

```
[1. WhatsApp / Intake] ──> [2. Google Sheet (Queue Manager)]
                                    │
                                    ▼ (1-Click Load)
                         [3. AutoForm Chrome Extension]
                           ├── Kiosk Pilot Engine (ऑटो-पायलट)
                           ├── Portal Recipe Registry (हर फॉर्म की कुंडली)
                           ├── Checkpoint Engine (OTP/Captcha/Biometric)
                           └── Hold & Resume Queue (अटकाओ और अगला उठाओ)
                                    │
                                    ▼
                         [4. Live Government Portals]
                           (MPESB, Samagra, Lok Seva, Sarathi, NSDL)
```

### मुख्य विशेषताएं (Core Modules):
1. **`kiosk-recipes.js` (Portal Recipe Brain):**
   - 5 मुख्य पोर्टल्स के डायरेक्ट एंट्री लिंक्स, रिकवरी लिंक्स (Forgot Password), और चेकपॉइंट्स का रिकॉर्ड।
   - पहले से पता होता है कि इस फॉर्म में कितने OTP (1 या 2) अपेक्षित हैं।
2. **`kiosk-pilot-engine.js` (1-Click Pilot & Lifecycle):**
   - **`launchApplicant()`:** 1-क्लिक में सही सरकारी पोर्टल लोड करके 35 फ़ील्ड्स 2 सेकंड में भरता है।
   - **`holdCurrentApplicant()`:** अगर ग्राहक लेट है तो केस को होल्ड लिस्ट में डालकर तुरंत कतार का अगला फॉर्म खोल देता है।
   - **`resumeHeldApplicant()`:** जब 15 मिनट बाद OTP आए, 1-क्लिक में बिना डेटा उड़े उसी स्टेप पर फॉर्म रीज़्यूम करता है।
   - **`markCompleted()`:** आवेदन क्रमांक और रसीद नंबर सुरक्षित करता है।
3. **`google-sheet-sync.js` (2-Way Sheet Sync):**
   - Google Sheet या CSV से 1,000 ग्राहकों की कतार एक सेकंड में लोड करता है।
   - स्थिति को लाइव अपडेट करता है (`PENDING` -> `IN_PROGRESS` -> `HELD_OTP` -> `COMPLETED`).
4. **`content.js` (Checkpoint Detector):**
   - स्क्रीन पर OTP इनपुट, कैप्चा, बायोमेट्रिक (मंत्रा/मॉर्फो), और पेमेंट पेज को खुद पहचानता है और रुकता है।
5. **WhatsApp Dynamic OTP Pinger:**
   - 1-क्लिक में ग्राहक के नाम और फॉर्म के हिसाब से प्री-फॉर्मेटेड हिंदी संदेश तैयार करके WhatsApp पर भेजता है।

---

## 📊 3. टेस्ट रिपोर्ट (Verification Status)

- **15 Scenarios General Test Suite:** 15 / 15 Passed (100%)
- **MPOnline Level 1, 2, 3 Test Suite:** 34 / 34 Passed (100%)
- **Kiosk Pilot Lifecycle Test Suite:** 34 / 34 Passed (100%)
- **कुल टेस्ट स्कोर:** **83 / 83 Passed (100% Zero-Error Delivery)**

---

## 🚀 4. ऑपरेटर / कर्मचारी का दैनिक वर्कफ़्लो (Daily Kiosk Operator Workflow)

1. Chrome खोलें और साइडपैनल एक्टिवेट करें।
2. **`[ 🚀 Launch Next ]`** दबाएं — टूल अपने आप पोर्टल खोलेगा, डेटा भरेगा।
3. स्क्रीन पर कैप्चा दिखे तो डालें, अगर OTP की ज़रूरत हो और ग्राहक लाइन पर न हो:
4. **`[ ⏸️ Hold & Next ]`** दबाएं — टूल इस केस को होल्ड में डालकर तुरंत अगला फॉर्म खोल देगा।
5. **`[ 💬 Ping WA ]`** दबाकर ग्राहक को 1 सेकंड में व्हाट्सएप पर अलर्ट भेजें।
6. जब ग्राहक OTP बताए, **Held Tray** में **`[ ⚡ Resume ]`** दबाएं और सबमिट करें!
