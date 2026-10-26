// AutoForm AI - Commercial Pro Controller

let activeTabId = null;
let pageFields = [];
let currentMappings = [];
let soundEnabled = true;
let isRecordingVoice = false;
let speechRecognizer = null;

const DEFAULT_PRESETS = {
  mponline: `आवेदक का नाम: मोहित जैन (Mohit Jain)
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
वर्ग / श्रेणी: General (EWS)
मूल निवासी: मध्य प्रदेश
जिला: इंदौर (Indore)
तहसील: इंदौर
पिनकोड: 452001
पता: 124, तिलक नगर, मुख्य मार्ग, इंदौर, मध्य प्रदेश
10वीं रोल नंबर: 19827364 | MP Board Bhopal | 2011 | 420/500 (84%)
12वीं रोल नंबर: 21928374 | MP Board Bhopal | 2013 | 410/500 (82%)
बैंक खाता नंबर: 918273645019
IFSC Code: SBIN0001234
घोषणा: सत्य एवं प्रमाणित`,

  applicant: `Candidate: Vikram Singhania
Email: vikram.singh@techventures.in
Phone: 9876543210
Gender: Male
Role: Senior Full Stack Developer
Years of Experience: 8 years
City: Bengaluru
State: Karnataka
Pincode: 560001
Portfolio: https://vikramsingh.dev
LinkedIn: https://linkedin.com/in/vikramsingh
Skills: React, Next.js, TypeScript, Tailwind, Python
About: 8 years building scalable enterprise software and AI applications.
Terms: Yes, I agree to the declaration.`,

  startup: `Startup Name: ZenFlow Technologies
Founder: Priya Mehta
Email: priya@zenflow.io
Phone: 9812345678
Website: https://zenflow.io
Category: Enterprise SaaS
Stage: Early Growth / Seed
Team Size: 25
Revenue: $250,000
Address: 104 Prestige Tech Park, Ring Road
City: Bangalore
State: Karnataka
Pincode: 560103
Country: India
Pitch: Autonomous workflow intelligence engine that cuts manual repetitive work by 80%.
Declaration: I declare that the details provided are true and verified.`,

  ecommerce: `Customer Name: Amit Patel
Email: amit.patel@gmail.com
Phone: 9823456789
Street: Flat 402, Shivalik Residency, Near SG Highway
City: Ahmedabad
State: Gujarat
Pincode: 380015
Order Notes: Please ring the bell and leave at front door if unavailable.
Agree: True`,

  vendor: `Company Name: Apex Global Trading
Contact Person: Rajesh Nahata
Email: contact@apex-trading.in
Phone: 9988776655
City: Mumbai
State: Maharashtra
Pincode: 400001
GST: 27AABCA1234F1Z5
Bank Account: 987654321098
Terms: Agreed`
};

let userPresets = { ...DEFAULT_PRESETS };

// DOM Elements
const roughDataInput = document.getElementById('roughDataInput');
const pageTitleEl = document.getElementById('pageTitle');
const fieldsCountBadge = document.getElementById('fieldsCountBadge');
const sequenceListEl = document.getElementById('sequenceList');
const matchedCountEl = document.getElementById('matchedCount');
const btnInspect = document.getElementById('btnInspect');
const btnMatch = document.getElementById('btnMatch');
const btnFill = document.getElementById('btnFill');
const btnUndo = document.getElementById('btnUndo');
const btnRescan = document.getElementById('btnRescan');
const btnClearAll = document.getElementById('btnClearAll');
const btnSidePanel = document.getElementById('btnSidePanel');
const btnSoundToggle = document.getElementById('btnSoundToggle');
const btnVoiceInput = document.getElementById('btnVoiceInput');
const voiceIcon = document.getElementById('voiceIcon');
const voiceText = document.getElementById('voiceText');
const btnSaveCitizen = document.getElementById('btnSaveCitizen');
const kioskCitizenSearch = document.getElementById('kioskCitizenSearch');
const kioskResultsDropdown = document.getElementById('kioskResultsDropdown');
const btnClearSearch = document.getElementById('btnClearSearch');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressStatus = document.getElementById('progressStatus');
const progressCount = document.getElementById('progressCount');

const DEFAULT_CITIZENS = [
  {
    id: 'cit_mohit',
    name: 'Mohit Jain',
    nameHindi: 'मोहित जैन',
    phone: '6263879076',
    samagra: '182736459',
    district: 'Indore',
    category: 'General (EWS)',
    roughText: DEFAULT_PRESETS.mponline
  },
  {
    id: 'cit_priya',
    name: 'Priya Sharma',
    nameHindi: 'प्रिया शर्मा',
    phone: '9826012345',
    samagra: '192837465',
    district: 'Bhopal',
    category: 'OBC',
    roughText: `Candidate: Priya Sharma
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
Terms: True`
  }
];

let kioskCitizens = [];

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupKioskCitizenVault();
  setupVoiceRecognition();
  await loadSavedState();
  await inspectActiveTab();
});

function setupEventListeners() {
  // Preset Pills
  bindPresetButtons();

  // Action Buttons
  btnInspect.addEventListener('click', inspectActiveTab);
  btnRescan.addEventListener('click', inspectActiveTab);
  btnMatch.addEventListener('click', () => {
    autoMatchAndRender();
    if (soundEnabled && window.SoundEngine) SoundEngine.playMatchSuccess();
  });
  btnFill.addEventListener('click', executeFill);
  btnUndo.addEventListener('click', executeUndo);

  // Sound toggle
  btnSoundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSoundToggle.innerText = soundEnabled ? '🔔' : '🔕';
    btnSoundToggle.title = soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted';
    chrome.storage.local.set({ soundEnabled });
  });

  // Save current citizen
  if (btnSaveCitizen) {
    btnSaveCitizen.addEventListener('click', saveCurrentCitizenToVault);
  }

  // Input autosave
  roughDataInput.addEventListener('input', () => {
    saveState();
  });

  // Clear button
  btnClearAll.addEventListener('click', () => {
    roughDataInput.value = '';
    currentMappings = [];
    renderSequenceList([]);
    btnUndo.style.display = 'none';
    saveState();
  });

  // Open Side Panel
  if (btnSidePanel) {
    btnSidePanel.addEventListener('click', async () => {
      try {
        await chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL' });
        window.close();
      } catch (e) {
        console.warn('Side panel open error:', e);
      }
    });
  }
}

function bindPresetButtons() {
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (userPresets[presetKey]) {
        roughDataInput.value = userPresets[presetKey];
        saveState();
        autoMatchAndRender();
        if (soundEnabled && window.SoundEngine) SoundEngine.playMatchSuccess();
      }
    });
  });
}

function setupVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    btnVoiceInput.style.display = 'none';
    return;
  }

  const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechRecognizer = new SpeechClass();
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;
  speechRecognizer.lang = 'hi-IN'; // Works with Hindi and Indian English

  speechRecognizer.onstart = () => {
    isRecordingVoice = true;
    voiceIcon.innerText = '🔴';
    voiceText.innerText = 'Listening...';
    btnVoiceInput.style.borderColor = '#EF4444';
  };

  speechRecognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      if (roughDataInput.value.trim()) {
        roughDataInput.value += '\n' + transcript;
      } else {
        roughDataInput.value = transcript;
      }
      saveState();
      autoMatchAndRender();
    }
  };

  speechRecognizer.onerror = (e) => {
    console.warn('Speech recognition error:', e);
  };

  speechRecognizer.onend = () => {
    isRecordingVoice = false;
    voiceIcon.innerText = '🎙️';
    voiceText.innerText = 'Voice';
    btnVoiceInput.style.borderColor = '';
  };

  btnVoiceInput.addEventListener('click', () => {
    if (isRecordingVoice) {
      speechRecognizer.stop();
    } else {
      speechRecognizer.start();
    }
  });
}

async function saveCustomProfile() {
  const currentText = roughDataInput.value.trim();
  if (!currentText) {
    alert('Pehle rough data box me kuch details likhein!');
    return;
  }

  const name = prompt('Is Profile ka naam likhein (e.g. My Agency, Client X):');
  if (!name || !name.trim()) return;

  const key = 'custom_' + Date.now();
  userPresets[key] = currentText;

  // Save to storage
  const res = await chrome.storage.local.get(['savedCustomProfiles']);
  const list = res.savedCustomProfiles || [];
  list.push({ key, label: name.trim(), content: currentText });
  await chrome.storage.local.set({ savedCustomProfiles: list });

  renderCustomPill(key, name.trim());
  alert(`✅ Profile "${name}" save ho gaya!`);
}

// Setup Kiosk Citizen Search & Vault
function setupKioskCitizenVault() {
  if (!kioskCitizenSearch) return;

  kioskCitizenSearch.addEventListener('input', () => {
    const q = kioskCitizenSearch.value.trim().toLowerCase();
    if (!q) {
      if (kioskResultsDropdown) kioskResultsDropdown.style.display = 'none';
      if (btnClearSearch) btnClearSearch.style.display = 'none';
      return;
    }
    if (btnClearSearch) btnClearSearch.style.display = 'block';

    const matches = kioskCitizens.filter(c => {
      return (c.name && c.name.toLowerCase().includes(q)) ||
             (c.nameHindi && c.nameHindi.includes(q)) ||
             (c.phone && c.phone.includes(q)) ||
             (c.samagra && c.samagra.includes(q)) ||
             (c.district && c.district.toLowerCase().includes(q));
    });

    renderKioskSearchResults(matches);
  });

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      kioskCitizenSearch.value = '';
      if (kioskResultsDropdown) kioskResultsDropdown.style.display = 'none';
      btnClearSearch.style.display = 'none';
    });
  }
}

function renderKioskSearchResults(results) {
  if (!kioskResultsDropdown) return;

  if (results.length === 0) {
    kioskResultsDropdown.innerHTML = `
      <div style="padding: 10px; font-size: 11px; color: #94A3B8; text-align: center;">
        Koi Citizen record nahi mila. "💾 Save Citizen" dabakar naya jodhein.
      </div>`;
    kioskResultsDropdown.style.display = 'block';
    return;
  }

  let html = '';
  results.forEach(c => {
    html += `
      <div class="kiosk-card-item" data-id="${c.id}">
        <div>
          <div class="kiosk-card-name">👤 ${escapeHtml(c.name)} ${c.nameHindi ? '(' + escapeHtml(c.nameHindi) + ')' : ''}</div>
          <div class="kiosk-card-sub">📱 ${c.phone || 'N/A'} | 🆔 Samagra: ${c.samagra || 'N/A'} | 📍 ${c.district || 'MP'}</div>
        </div>
        <span class="kiosk-load-badge">⚡ Load</span>
      </div>`;
  });

  kioskResultsDropdown.innerHTML = html;
  kioskResultsDropdown.style.display = 'block';

  kioskResultsDropdown.querySelectorAll('.kiosk-card-item').forEach(item => {
    item.addEventListener('click', () => {
      const citId = item.getAttribute('data-id');
      const cit = kioskCitizens.find(x => x.id === citId);
      if (cit) {
        loadCitizenIntoWorkspace(cit);
      }
    });
  });
}

function loadCitizenIntoWorkspace(citizen) {
  roughDataInput.value = citizen.roughText;
  if (kioskResultsDropdown) kioskResultsDropdown.style.display = 'none';
  if (kioskCitizenSearch) kioskCitizenSearch.value = citizen.name;
  if (btnClearSearch) btnClearSearch.style.display = 'block';
  saveState();
  autoMatchAndRender();
  if (soundEnabled && window.SoundEngine) SoundEngine.playTick();
}

async function saveCurrentCitizenToVault() {
  const currentText = roughDataInput.value.trim();
  if (!currentText) {
    alert('Pehle rough data box me citizen ki details paste karein!');
    return;
  }

  const parsed = SmartParser.parseRoughData(currentText);
  const name = parsed.fullName || parsed.candidate || parsed.applicant || prompt('Citizen Name likhein:');
  if (!name || !name.trim()) return;

  const phone = parsed.phone || '';
  const samagra = parsed.samagraMember || '';
  const district = parsed.district || '';
  const category = parsed.category || '';
  const nameHindi = parsed.nameHindi || '';

  // Check if citizen with this phone or samagra already exists
  const existingIndex = kioskCitizens.findIndex(c => (phone && c.phone === phone) || (samagra && c.samagra === samagra));
  const newCit = {
    id: existingIndex >= 0 ? kioskCitizens[existingIndex].id : 'cit_' + Date.now(),
    name: name.trim(),
    nameHindi: nameHindi.trim(),
    phone: phone.trim(),
    samagra: samagra.trim(),
    district: district.trim(),
    category: category.trim(),
    roughText: currentText
  };

  if (existingIndex >= 0) {
    kioskCitizens[existingIndex] = newCit;
  } else {
    kioskCitizens.unshift(newCit);
  }

  await chrome.storage.local.set({ kiosk_citizens: kioskCitizens });
  if (soundEnabled && window.SoundEngine) SoundEngine.playMatchSuccess();
  alert(`✅ Citizen "${newCit.name}" (${newCit.phone || newCit.samagra || 'Kiosk'}) Vault me surakshit save ho gaya!`);
}

function renderCustomPill(key, label) {
  const container = document.querySelector('.sample-pills');
  const pill = document.createElement('button');
  pill.className = 'pill-btn';
  pill.setAttribute('data-preset', key);
  pill.innerText = `⭐ ${label}`;
  container.appendChild(pill);
  bindPresetButtons();
}

async function loadSavedState() {
  try {
    const res = await chrome.storage.local.get(['roughData', 'pendingRoughData', 'soundEnabled', 'savedCustomProfiles', 'kiosk_citizens']);
    if (res.soundEnabled !== undefined) {
      soundEnabled = res.soundEnabled;
      btnSoundToggle.innerText = soundEnabled ? '🔔' : '🔕';
    }
    if (res.savedCustomProfiles) {
      for (const item of res.savedCustomProfiles) {
        userPresets[item.key] = item.content;
        renderCustomPill(item.key, item.label);
      }
    }
    // Load Kiosk Citizens
    if (res.kiosk_citizens && Array.isArray(res.kiosk_citizens) && res.kiosk_citizens.length > 0) {
      kioskCitizens = res.kiosk_citizens;
    } else {
      kioskCitizens = [...DEFAULT_CITIZENS];
      await chrome.storage.local.set({ kiosk_citizens: kioskCitizens });
    }

    if (res.pendingRoughData) {
      roughDataInput.value = res.pendingRoughData;
      await chrome.storage.local.remove('pendingRoughData');
      saveState();
    } else if (res.roughData) {
      roughDataInput.value = res.roughData;
    }
  } catch (err) {
    console.error('Failed to load storage state:', err);
  }
}

async function saveState() {
  try {
    await chrome.storage.local.set({ roughData: roughDataInput.value });
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

async function sendTabMessage(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content.css']
    });
    return await chrome.tabs.sendMessage(tabId, message);
  }
}

async function inspectActiveTab() {
  pageTitleEl.innerText = 'Scanning tab...';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      pageTitleEl.innerText = 'No active tab found';
      return;
    }
    activeTabId = tab.id;

    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      pageTitleEl.innerText = 'Restricted page (cannot access)';
      fieldsCountBadge.innerText = '0 Fields';
      return;
    }

    const response = await sendTabMessage(activeTabId, { action: 'SCAN_PAGE' });

    if (response && response.success) {
      pageFields = response.fields || [];
      const title = response.title || (new URL(response.url)).hostname;
      pageTitleEl.innerText = title.length > 28 ? title.slice(0, 25) + '...' : title;
      fieldsCountBadge.innerText = `${pageFields.length} Fields`;

      if (roughDataInput.value.trim() && pageFields.length > 0) {
        autoMatchAndRender();
      } else if (pageFields.length === 0) {
        sequenceListEl.innerHTML = `
          <div style="text-align: center; color: var(--text-dim); padding: 20px 0; font-size: 11px;">
            Is page par koi standard form fields nahi mile.
          </div>`;
      }
    }
  } catch (err) {
    console.error('Inspection failed:', err);
    pageTitleEl.innerText = 'Click Inspect on web page';
    fieldsCountBadge.innerText = 'Ready';
  }
}

function autoMatchAndRender() {
  const text = roughDataInput.value.trim();
  if (!text) {
    sequenceListEl.innerHTML = `
      <div style="text-align: center; color: var(--text-dim); padding: 20px 0; font-size: 11px;">
        Pehle upar rough data paste karein ya koi sample button dabayein.
      </div>`;
    btnFill.disabled = true;
    matchedCountEl.innerText = '0';
    return;
  }

  const extracted = SmartParser.parseRoughData(text);

  if (pageFields.length === 0) {
    renderExtractedOnly(extracted);
    return;
  }

  currentMappings = SmartParser.matchFields(pageFields, extracted);
  renderSequenceList(currentMappings);
}

function renderExtractedOnly(extracted) {
  const entries = Object.entries(extracted);
  matchedCountEl.innerText = entries.length;

  if (entries.length === 0) {
    sequenceListEl.innerHTML = `
      <div style="text-align: center; color: var(--text-dim); padding: 20px 0; font-size: 11px;">
        Rough data se koi fields extract nahi ho paaye.
      </div>`;
    btnFill.disabled = true;
    return;
  }

  let html = '';
  entries.forEach(([key, val], idx) => {
    html += `
      <div class="sequence-item">
        <span class="sequence-num">${idx + 1}</span>
        <div class="sequence-field">
          <div class="field-name">${key}</div>
          <span class="field-tag">EXTRACTED</span>
        </div>
        <input type="text" class="sequence-input" value="${escapeHtml(val)}" readonly>
      </div>`;
  });

  sequenceListEl.innerHTML = html;
  btnFill.disabled = true;
}

function renderSequenceList(mappings) {
  const fillable = mappings.filter(m => m.valueToFill);
  matchedCountEl.innerText = `${fillable.length}/${mappings.length}`;

  if (mappings.length === 0) {
    sequenceListEl.innerHTML = `
      <div style="text-align: center; color: var(--text-dim); padding: 20px 0; font-size: 11px;">
        Form sequence generate karne ke liye "Auto-Match" dabayein.
      </div>`;
    btnFill.disabled = true;
    return;
  }

  let html = '';
  mappings.forEach((item, idx) => {
    const isMatched = !!item.valueToFill;
    let badgeClass = 'match-none';
    let badgeText = 'No Match';

    if (item.confidence >= 80) {
      badgeClass = 'match-high';
      badgeText = `${item.confidence}%`;
    } else if (item.confidence >= 45) {
      badgeClass = 'match-mid';
      badgeText = `${item.confidence}%`;
    }

    const displayName = item.field.label || item.field.placeholder || item.field.name || `Field #${idx + 1}`;
    const fieldType = item.field.type.toUpperCase();

    html += `
      <div class="sequence-item" data-index="${idx}" data-selector="${escapeHtml(item.field.selector)}">
        <input type="checkbox" class="seq-checkbox" ${isMatched ? 'checked' : ''} style="cursor: pointer;">
        <span class="sequence-num">${idx + 1}</span>
        <div class="sequence-field" title="${escapeHtml(displayName)}">
          <div class="field-name">${escapeHtml(displayName)}</div>
          <span class="field-tag">${fieldType}</span>
        </div>
        <input type="text" class="sequence-input" value="${escapeHtml(item.valueToFill)}" placeholder="Value..." data-seq-input="${idx}">
        <span class="match-badge ${badgeClass}">${badgeText}</span>
      </div>`;
  });

  sequenceListEl.innerHTML = html;

  sequenceListEl.querySelectorAll('.sequence-item').forEach(row => {
    const selector = row.getAttribute('data-selector');

    row.addEventListener('mouseenter', () => {
      if (activeTabId && selector) {
        chrome.tabs.sendMessage(activeTabId, { action: 'HIGHLIGHT_FIELD', selector }).catch(() => {});
      }
    });

    row.addEventListener('mouseleave', () => {
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'CLEAR_HIGHLIGHTS' }).catch(() => {});
      }
    });

    const valInput = row.querySelector('.sequence-input');
    const idx = parseInt(valInput.getAttribute('data-seq-input'), 10);
    valInput.addEventListener('input', (e) => {
      currentMappings[idx].valueToFill = e.target.value;
      updateFillButtonState();
    });
  });

  updateFillButtonState();
}

function updateFillButtonState() {
  const readyItems = getCheckedFillableItems();
  btnFill.disabled = readyItems.length === 0;
  matchedCountEl.innerText = `${readyItems.length}/${currentMappings.length}`;
}

function getCheckedFillableItems() {
  const items = [];
  const rows = sequenceListEl.querySelectorAll('.sequence-item');
  rows.forEach(row => {
    const chk = row.querySelector('.seq-checkbox');
    const idx = parseInt(row.getAttribute('data-index'), 10);
    if (chk && chk.checked && currentMappings[idx] && currentMappings[idx].valueToFill) {
      items.push(currentMappings[idx]);
    }
  });
  return items;
}

async function executeFill() {
  const itemsToFill = getCheckedFillableItems();
  if (itemsToFill.length === 0 || !activeTabId) return;

  btnFill.disabled = true;
  btnFill.innerText = '⏳ Filling in Sequence...';
  progressContainer.style.display = 'flex';
  progressBar.style.width = '10%';
  progressStatus.innerText = 'Starting sequence...';
  progressCount.innerText = `0 / ${itemsToFill.length}`;

  try {
    const response = await sendTabMessage(activeTabId, {
      action: 'EXECUTE_FILL',
      items: itemsToFill,
      delayMs: 120
    });

    if (response && response.success) {
      progressBar.style.width = '100%';
      progressStatus.innerText = '✅ Sabhi fields successfully bhar diye!';
      progressCount.innerText = `${response.result.successCount} / ${itemsToFill.length}`;
      btnFill.innerText = '✨ Form Filled Successfully!';

      if (soundEnabled && window.SoundEngine) SoundEngine.playCompleteChime();

      // Show Undo button
      btnUndo.style.display = 'inline-flex';

      setTimeout(() => {
        btnFill.innerText = '🚀 Sequence Se Bharo (Fill Form)';
        btnFill.disabled = false;
        setTimeout(() => {
          progressContainer.style.display = 'none';
        }, 2000);
      }, 2500);
    } else {
      throw new Error(response?.error || 'Execution failed');
    }
  } catch (err) {
    console.error('Fill execution failed:', err);
    progressStatus.innerText = '❌ Error: ' + err.message;
    btnFill.innerText = '⚠️ Retry Fill';
    btnFill.disabled = false;
  }
}

async function executeUndo() {
  if (!activeTabId) return;
  try {
    const response = await sendTabMessage(activeTabId, { action: 'REVERT_FORM' });
    if (response && response.success && response.reverted) {
      btnUndo.style.display = 'none';
      alert('↩️ Previous form data restore kar diya gaya hai!');
    }
  } catch (e) {
    console.warn('Revert failed:', e);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
