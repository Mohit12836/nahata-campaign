// AutoForm AI - Google Sheet & CSV Two-Way Sync Engine
// Syncs 1,000 applicant rows from Google Sheets / CSV into Kiosk Pilot Queue
// Updates live status (PENDING -> IN_PROGRESS -> HELD_OTP -> COMPLETED) back to Sheet

class GoogleSheetSync {
  constructor() {
    this.sheetWebhookUrl = '';
    this.sheetCsvUrl = '';
    this.lastSyncedAt = null;
  }

  async loadConfig() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(['kiosk_sheet_webhook', 'kiosk_sheet_csv']);
      this.sheetWebhookUrl = data.kiosk_sheet_webhook || '';
      this.sheetCsvUrl = data.kiosk_sheet_csv || '';
    }
  }

  async saveConfig(webhookUrl, csvUrl) {
    this.sheetWebhookUrl = webhookUrl || '';
    this.sheetCsvUrl = csvUrl || '';
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        kiosk_sheet_webhook: this.sheetWebhookUrl,
        kiosk_sheet_csv: this.sheetCsvUrl
      });
    }
  }

  // Parse raw CSV text exported from Google Sheets / Excel
  parseCsvToApplicants(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];
    
    // Normalize newlines
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Header row
    const headers = this.splitCsvRow(lines[0]).map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const applicants = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.splitCsvRow(lines[i]);
      if (values.length === 0 || values.every(v => !v.trim())) continue;

      const rawObj = {};
      headers.forEach((h, idx) => {
        rawObj[h] = values[idx] ? values[idx].trim() : '';
      });

      // Construct applicant profile
      const applicant = {
        rowNumber: i + 1,
        id: 'sheet_row_' + (i + 1),
        fullName: rawObj.name || rawObj.fullname || rawObj.applicantname || rawObj.candidatename || '',
        nameHindi: rawObj.namehindi || rawObj.hindiname || '',
        fatherName: rawObj.father || rawObj.fathername || '',
        motherName: rawObj.mother || rawObj.mothername || '',
        dob: rawObj.dob || rawObj.birthdate || rawObj.dateofbirth || '',
        gender: rawObj.gender || '',
        phone: rawObj.phone || rawObj.mobile || rawObj.contact || '',
        email: rawObj.email || '',
        aadhaar: rawObj.aadhaar || rawObj.aadhaarno || rawObj.uid || '',
        samagraId: rawObj.samagra || rawObj.samagraid || rawObj.sssmid || '',
        familyId: rawObj.familyid || rawObj.samagrafamily || '',
        category: rawObj.category || rawObj.caste || '',
        district: rawObj.district || rawObj.jila || 'Indore',
        pincode: rawObj.pincode || rawObj.pin || '',
        roll10th: rawObj.roll10th || rawObj.tenthroll || rawObj.rollno10 || '',
        board10th: rawObj.board10th || 'MP Board Bhopal',
        year10th: rawObj.year10th || '2020',
        marks10th: rawObj.marks10th || rawObj.percentage10th || '',
        serviceCode: rawObj.service || rawObj.servicecode || rawObj.formname || 'mpesb_vyapam',
        sheetStatus: rawObj.status || 'PENDING'
      };

      if (applicant.fullName || applicant.phone || applicant.samagraId) {
        applicants.push(applicant);
      }
    }

    return applicants;
  }

  // Handle commas inside quotes: "Jain, Mohit", 6263879076
  splitCsvRow(rowStr) {
    const result = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        result.push(entry);
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry);
    return result;
  }

  // Fetch CSV directly from Google Sheet Publish URL
  async fetchGoogleSheetCsv(csvUrl) {
    const url = csvUrl || this.sheetCsvUrl;
    if (!url) {
      throw new Error('Google Sheet CSV लिंक उपलब्ध नहीं है।');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheet लोड नहीं हो सकी (HTTP ${response.status})`);
    }

    const csvText = await response.text();
    const applicants = this.parseCsvToApplicants(csvText);
    this.lastSyncedAt = new Date().toISOString();
    return applicants;
  }

  // Sync update back to Google Sheet via Webhook (Google Apps Script)
  async pushStatusToSheet(applicantRowNumber, status, notes = '') {
    if (!this.sheetWebhookUrl) {
      // Local fallback if webhook is not configured yet
      console.log(`[GoogleSheetSync] Local Mock Update: Row ${applicantRowNumber} -> ${status} (${notes})`);
      return { success: true, localOnly: true };
    }

    try {
      const payload = {
        action: 'UPDATE_STATUS',
        row: applicantRowNumber,
        status: status,
        notes: notes,
        updatedAt: new Date().toISOString()
      };

      const resp = await fetch(this.sheetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return { success: resp.ok };
    } catch (err) {
      console.warn('[GoogleSheetSync] Webhook push failed:', err);
      return { success: false, error: err.message };
    }
  }
}

const sheetSyncEngine = new GoogleSheetSync();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GoogleSheetSync, sheetSyncEngine };
}
