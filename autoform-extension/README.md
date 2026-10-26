# ⚡ AutoForm AI - Chrome Extension (Manifest V3)

> **Rough / Messy Data ko kisi bhi Web Form me Sequence ke sath Auto-Fill aur Select karne wala Smart Extension.**

---

## 🌟 Commercial Pro Features (कमर्शियल ग्रेड खासियतें)

1. **Messy / Rough Data Input:**
   - Chahe unstructured paragraph text ho, WhatsApp chat ka data ho, Excel/Table copy-paste ho ya Key-Value pairs:
   - Example: *"Mera naam Rahul Sharma hai, email rahul@gmail.com, phone 9876543210, Bangalore me rehta hu, Karnataka, Full Stack Developer with 8 years exp."*
2. **🎙️ Voice-to-Text Input (Speech Recognition):**
   - Direct mic button daba kar Hindi ya English me rough details bolein — text automatic box me transcribe ho jata hai!
3. **🔔 Web Audio SFX Engine (`audio-sfx.js`):**
   - Zero external audio files — pure programmatic synthesizer.
   - Matching chime, smooth tick sounds aur form fill complete hone par satisfying fanfare.
4. **↩️ 1-Click Undo & Revert Snapshot:**
   - Form fill hone ke baad agar user revert karna chahe, toh `↩️ Undo Fill` button pichle saare values ko 1-click me restore kar deta hai!
5. **⭐ Custom Profile & Preset Manager:**
   - "💾 Save" button se user apne custom business profiles (e.g. "My Agency", "GST Filing", "Candidate") save karke 1-click me recall kar sakta hai.
6. **Sequential Auto-Fill ("Sequence Se Jama De"):**
   - Active web page ke sabhi fields ko DOM order me inspect karta hai (Top-to-Bottom).
   - Har field ko visual sequence number (1, 2, 3...) aur match confidence (95%, 100% match) ke sath list karta hai.
   - User fill karne se pehle values ko review ya live edit kar sakta hai.
7. **All Input Types & Frameworks Supported:**
   - Text, Email, Tel, Number, Date (auto YYYY-MM-DD conversion), URL
   - **`<select>` Dropdowns:** Option text ya value ko fuzzy match karke automatic select karta hai.
   - **Radio Buttons:** Gender, category, options me se sahi radio button select karta hai.
   - **Checkboxes:** Terms, agreement, declarations ko auto-check karta hai.
   - **Textareas & ContentEditable:** Multi-line format me safe injection.
   - **React, Vue, Next.js, Angular, plain HTML5 compatible.**
8. **Dual Mode (Popup + Persistent Side Panel):**
   - Quick popup me use karein ya **Side Panel** me pin kar lein taaki lambe forms bharte waqt panel band na ho!
9. **🛡️ Sensitive Data Shield:**
   - Password, CVV aur sensitive OTP fields ko safety ke liye protect karta hai.

---

## 🚀 Chrome Me Install Kaise Karein (2 Minutes Setup)

1. **Google Chrome** browser kholein.
2. Address bar me type karein: `chrome://extensions` aur Enter dabayein.
3. Top-right corner par **"Developer mode"** ka toggle switch **ON** karein.
4. Top-left me **"Load unpacked"** button par click karein.
5. Is folder ko select karein:
   ```
   D:\codee\Nahata General Stores\autoform-extension
   ```
6. **Bas!** Extension Chrome toolbar me jud jayega. Extension icon par click karke use pin kar lein.

---

## 🧪 Live Test Kaise Karein (Test Ground Included)

Humne extension ke sath ek complete **Live Test Form** provide kiya hai:
1. Chrome me is file ko open karein:
   ```
   D:\codee\Nahata General Stores\autoform-extension\test-form.html
   ```
2. Chrome toolbar me **AutoForm AI** icon par click karein.
3. Quick Sample pills me se **"👤 Job Candidate"** ya **"🚀 Startup Profile"** par click karein.
4. **"⚡ Auto-Match"** dabayein — aap dekhenge ki saare fields (Name, Email, Phone, Dropdowns, Checkbox) sequence me 100% match ho jayenge!
5. **"🚀 Sequence Se Bharo (Fill Form)"** dabayein — pure form ke fields screen par sequence me animate hote hue bhar jayenge!

---

## 📁 File Structure

```
autoform-extension/
├── manifest.json         # Chrome Manifest V3 configuration
├── background.js        # Background service worker & side panel hub
├── content.js           # Page DOM scanner & sequential auto-fill execution
├── content.css          # In-page highlight animations & tooltip badges
├── smart-parser.js      # Smart NLP & fuzzy field matcher engine
├── popup.html           # Main popup UI
├── popup.js             # Popup logic & event handlers
├── popup.css            # Dark glassmorphism auto-fit styling
├── sidepanel.html       # Persistent side-by-side panel UI
├── sidepanel.js         # Side panel controller with tab tracking
├── test-form.html       # Standalone live test ground
├── icons/               # 16px, 32px, 48px, 128px PNG extension icons
└── README.md            # Detailed documentation
```
