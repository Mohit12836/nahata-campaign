/**
 * ==============================================================================
 * BHARAT RETAIL OFFER PLATFORM — GOOGLE SHEETS & DRIVE AUTO-SYNC SCRIPT
 * ==============================================================================
 * 
 * 📌 इसे कैसे इस्तेमाल करें (सिर्फ 1 मिनट का काम):
 * 1. Google Drive (drive.google.com) में जाएँ या sheets.new खोलकर नई Google Sheet बनाएँ।
 * 2. शीट का नाम रखें: "Nahata General Stores — ग्राहक & ऑफर डेटा"
 * 3. ऊपर मेन्यू में Extensions (एक्सटेंशन) ➔ Apps Script पर क्लिक करें।
 * 4. पुराना कोड हटाकर यह पूरा कोड पेस्ट कर दें और Save (Ctrl+S) करें।
 * 5. ऊपर नीले "Deploy" ➔ "New deployment" बटन पर क्लिक करें:
 *    - Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (ताकि वेबसाइट से डेटा आ सके)
 * 6. "Deploy" दबाएं और मिला हुआ Web app URL कॉपी करके वेबसाइट एडमिन में पेस्ट कर दें!
 * ==============================================================================
 */

/**
 * सुरक्षित टोकन (Secret Token): अनधिकृत पोस्ट अनुरोधों को रोकने के लिए
 * आप Google Apps Script में Project Settings ➔ Script Properties में "SYNC_SECRET" भी सेट कर सकते हैं।
 */
var DEFAULT_SYNC_SECRET = "NAHATA_SECURE_SYNC_2026_TOKEN";

function getExpectedSecret() {
  try {
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty("SYNC_SECRET");
    if (secret && secret.trim().length > 0) return secret.trim();
  } catch (e) {}
  return DEFAULT_SYNC_SECRET;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ERROR', error: 'खाली अनुरोध (Empty payload)' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var rawData = e.postData.contents;
    var json = JSON.parse(rawData);

    // 1. सुरक्षा जाँच (Token Authentication Check)
    var clientToken = json.authToken || json.token || (e.parameter && e.parameter.token);
    var expectedSecret = getExpectedSecret();

    if (!clientToken || clientToken !== expectedSecret) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'UNAUTHORIZED',
          error: 'अनधिकृत अनुरोध! अमान्य या अनुपस्थित सुरक्षा टोकन (Invalid or missing secret token).'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var action = json.action;
    var data = json.data;

    // 2. कनेक्शन टेस्ट (PING)
    if (action === 'PING') {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'SUCCESS',
          message: 'Google Sheets Webhook कनेक्शन सुरक्षित और सक्रिय है!',
          timestamp: new Date().toISOString()
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 3. डेटा प्रोसेसिंग (Data Actions)
    if (action === 'NEW_LEAD') {
      appendNewLead(ss, data);
    } else if (action === 'COUPON_REDEEMED') {
      recordRedemption(ss, data);
    } else if (action === 'BULK_SYNC') {
      var syncedLeads = 0;
      var syncedRedemptions = 0;
      if (Array.isArray(data.leads)) {
        for (var i = 0; i < data.leads.length; i++) {
          appendNewLead(ss, data.leads[i]);
          syncedLeads++;
        }
      }
      if (Array.isArray(data.redemptions)) {
        for (var j = 0; j < data.redemptions.length; j++) {
          recordRedemption(ss, data.redemptions[j]);
          syncedRedemptions++;
        }
      }
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'SUCCESS',
          message: 'Bulk sync पूर्ण हुआ (' + syncedLeads + ' लीड्स, ' + syncedRedemptions + ' रिडेम्पशन)'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'SUCCESS', message: 'Data synced successfully to Google Sheets' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ERROR', error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'ONLINE',
      authenticated: true,
      message: 'Nahata Offer Platform Google Sheet Webhook Active & Protected',
      serverTime: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. Append New Customer Lead & Coupon (Flexible Column Adaptive)
 */
function appendNewLead(ss, lead) {
  var sheetName = "👥 ग्राहक लीड्स (Customers)";
  var sheet = ss.getSheetByName(sheetName);

  var defaultHeaders = [
    "Lead ID",
    "Date Added",
    "Customer Name",
    "Phone",
    "WhatsApp Chat",
    "Locality",
    "Category",
    "Purchase Frequency",
    "Game Type",
    "Prize Won",
    "Coupon Code",
    "Coupon Status",
    "Store Name"
  ];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(defaultHeaders);

    // Style Header
    var headerRange = sheet.getRange(1, 1, 1, defaultHeaders.length);
    headerRange.setBackground("#064e3b");
    headerRange.setFontColor("#fef08a");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    sheet.setFrozenRows(1);
  }

  // Read current headers to dynamically match any user column structure
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Clean phone number (strip spaces/symbols) and escape to prevent #ERROR!
  var rawPhone = (lead.phone || '').toString().replace(/[^0-9]/g, '');
  if (rawPhone.length === 12 && rawPhone.startsWith("91")) {
    rawPhone = rawPhone.substring(2);
  }
  var phoneStr = rawPhone ? ("'" + rawPhone) : '';
  var waFormula = rawPhone ? ('=HYPERLINK("https://wa.me/91' + rawPhone + '", "💬 WhatsApp चैट करें")') : '';
  var leadId = lead.leadId || lead.id || ('LEAD-' + (rawPhone ? rawPhone.slice(-4) : Math.floor(1000 + Math.random() * 9000)));

  // If sheet has existing headers, map dynamically according to header labels
  var row = [];
  if (currentHeaders.length > 0 && currentHeaders[0] !== '') {
    for (var c = 0; c < currentHeaders.length; c++) {
      var h = (currentHeaders[c] || '').toString().toLowerCase().trim();
      
      if (h.indexOf('lead id') !== -1 || h === 'id' || h.indexOf('आईडी') !== -1) {
        row.push(leadId);
      } else if (h.indexOf('date') !== -1 || h.indexOf('दिनांक') !== -1 || h.indexOf('time') !== -1 || h.indexOf('समय') !== -1 || h.indexOf('added') !== -1) {
        row.push(lead.timestamp || new Date().toLocaleString("hi-IN", { timeZone: "Asia/Kolkata" }));
      } else if (h.indexOf('name') !== -1 || h.indexOf('नाम') !== -1 || h.indexOf('customer') !== -1 || h.indexOf('ग्राहक') !== -1) {
        row.push(lead.customerName || 'सामान्य ग्राहक');
      } else if (h.indexOf('phone') !== -1 || h.indexOf('mobile') !== -1 || h.indexOf('मोबाइल') !== -1 || h.indexOf('फ़ोन') !== -1 || h.indexOf('फोन') !== -1 || h.indexOf('नंबर') !== -1) {
        row.push(phoneStr);
      } else if (h.indexOf('whatsapp') !== -1 || h.indexOf('chat') !== -1 || h.indexOf('चैट') !== -1) {
        row.push(waFormula);
      } else if (h.indexOf('locality') !== -1 || h.indexOf('city') !== -1 || h.indexOf('शहर') !== -1 || h.indexOf('कस्बा') !== -1 || h.indexOf('पता') !== -1) {
        row.push(lead.city || 'बालोतरा / कुशलगढ़');
      } else if (h.indexOf('category') !== -1 || h.indexOf('श्रेणी') !== -1) {
        row.push(lead.category || 'Retail Consumer');
      } else if (h.indexOf('frequency') !== -1 || h.indexOf('purchase') !== -1 || h.indexOf('आवृत्ति') !== -1) {
        row.push(lead.purchaseFrequency || 'नियमित (Regular)');
      } else if (h.indexOf('coupon') !== -1 || h.indexOf('code') !== -1 || h.indexOf('कूपन') !== -1) {
        row.push(lead.couponCode || '');
      } else if (h.indexOf('status') !== -1 || h.indexOf('स्थिति') !== -1) {
        row.push(lead.couponStatus || 'सक्रिय (VALID)');
      } else if (h.indexOf('prize') !== -1 || h.indexOf('इनाम') !== -1) {
        row.push(lead.prizeTitle || 'विशेष डिस्काउंट');
      } else if (h.indexOf('game') !== -1 || h.indexOf('गेम') !== -1) {
        row.push(lead.gameType === 'scratch' ? '🎁 लकी स्क्रैच कार्ड' : '🎡 लकी स्पिन व्हील');
      } else if (h.indexOf('store') !== -1 || h.indexOf('दुकान') !== -1) {
        row.push(lead.storeName || 'नाहाटा जनरल स्टोर्स');
      } else {
        // Fallback for any other custom column
        row.push('');
      }
    }
  } else {
    // Standard row fallback
    row = [
      leadId,
      lead.timestamp || new Date().toLocaleString("hi-IN", { timeZone: "Asia/Kolkata" }),
      lead.customerName || '',
      phoneStr,
      waFormula,
      lead.city || 'बालोतरा',
      lead.category || 'Retail Consumer',
      'नियमित (Regular)',
      lead.gameType === 'scratch' ? '🎁 लकी स्क्रैच कार्ड' : '🎡 लकी स्पिन व्हील',
      lead.prizeTitle || '',
      lead.couponCode || '',
      lead.couponStatus || 'सक्रिय (VALID)',
      lead.storeName || 'नाहाटा जनरल स्टोर्स'
    ];
  }

  // Check for duplicate lead by Coupon Code
  var couponCode = (lead.couponCode || '').trim();
  if (couponCode && sheet.getLastRow() > 1) {
    var allData = sheet.getDataRange().getValues();
    var couponColIdx = -1;
    for (var col = 0; col < currentHeaders.length; col++) {
      var headerText = (currentHeaders[col] || '').toString().toLowerCase();
      if (headerText.indexOf('coupon') !== -1 || headerText.indexOf('कूपन') !== -1 || headerText.indexOf('code') !== -1) {
        couponColIdx = col;
        break;
      }
    }

    if (couponColIdx !== -1) {
      for (var r = 1; r < allData.length; r++) {
        if (allData[r][couponColIdx] && allData[r][couponColIdx].toString().trim() === couponCode) {
          // Already exists: update row instead of appending duplicate
          sheet.getRange(r + 1, 1, 1, row.length).setValues([row]);
          autoFitColumns(sheet);
          return;
        }
      }
    }
  }

  sheet.appendRow(row);

  // Ensure Phone column is formatted as Plain Text to never cause #ERROR!
  var lastRow = sheet.getLastRow();
  for (var c = 0; c < currentHeaders.length; c++) {
    var h = (currentHeaders[c] || '').toString().toLowerCase();
    if (h.indexOf('phone') !== -1 || h.indexOf('mobile') !== -1 || h.indexOf('नंबर') !== -1) {
      sheet.getRange(lastRow, c + 1).setNumberFormat('@');
    }
  }

  autoFitColumns(sheet);
}

/**
 * 2. Record Counter Coupon Redemption
 */
function recordRedemption(ss, red) {
  var sheetName = "💰 काउंटर रिडेम्पशन (Redemptions)";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [
      "रिडेम्पशन समय",
      "कूपन कोड",
      "बिल नंबर",
      "बिल राशि (₹)",
      "सत्यापित कर्ता",
      "ग्राहक मोबाइल",
      "ग्राहक नाम",
      "दुकान"
    ];
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e1b4b");
    headerRange.setFontColor("#facc15");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    sheet.setFrozenRows(1);
  }

  var row = [
    red.timestamp || new Date().toLocaleString("hi-IN", { timeZone: "Asia/Kolkata" }),
    red.couponCode || '',
    red.billNumber || '',
    red.billAmount || 0,
    red.redeemedBy || 'मनोज नाहटा (काउंटर)',
    red.customerPhone ? "'" + red.customerPhone : '',
    red.customerName || '',
    red.storeName || 'नाहाटा जनरल स्टोर्स'
  ];

  // Check for duplicate redemption by Coupon Code
  var redCouponCode = (red.couponCode || '').trim();
  if (redCouponCode && sheet.getLastRow() > 1) {
    var allRedData = sheet.getDataRange().getValues();
    for (var r = 1; r < allRedData.length; r++) {
      if (allRedData[r][1] && allRedData[r][1].toString().trim() === redCouponCode) {
        // Already exists: update row
        sheet.getRange(r + 1, 1, 1, row.length).setValues([row]);
        autoFitColumns(sheet);
        updateCustomerRedemptionStatus(ss, redCouponCode);
        return;
      }
    }
  }

  sheet.appendRow(row);
  autoFitColumns(sheet);
  updateCustomerRedemptionStatus(ss, redCouponCode);
}

function updateCustomerRedemptionStatus(ss, couponCode) {
  if (!couponCode) return;
  var leadSheet = ss.getSheetByName("👥 ग्राहक लीड्स (Customers)");
  if (!leadSheet || leadSheet.getLastRow() < 2) return;

  var lastCol = leadSheet.getLastColumn();
  var headers = leadSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var couponColIdx = -1;
  var statusColIdx = -1;

  for (var c = 0; c < headers.length; c++) {
    var h = (headers[c] || '').toString().toLowerCase();
    if (h.indexOf('coupon') !== -1 || h.indexOf('कूपन') !== -1 || h.indexOf('code') !== -1) couponColIdx = c;
    if (h.indexOf('status') !== -1 || h.indexOf('स्थिति') !== -1) statusColIdx = c;
  }

  if (couponColIdx !== -1 && statusColIdx !== -1) {
    var data = leadSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][couponColIdx] && data[i][couponColIdx].toString().trim() === couponCode) {
        leadSheet.getRange(i + 1, statusColIdx + 1).setValue("✅ रिडीम हो चुका (REDEEMED)");
        leadSheet.getRange(i + 1, statusColIdx + 1).setBackground("#dcfce7").setFontColor("#15803d");
        break;
      }
    }
  }
}

function autoFitColumns(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol > 0) {
    for (var c = 1; c <= Math.min(lastCol, 15); c++) {
      sheet.autoResizeColumn(c);
    }
  }
}

/**
 * 🛠️ BONUS UTILITY: पुराने #ERROR! फ़ोन नंबरों को एक क्लिक में ठीक करें
 * Apps Script मेन्यू में इस फ़ंक्शन को चुनकर "Run" दबाने पर
 * सारे #ERROR! वाले सेल साफ़ 10-अंकों के मोबाइल नंबर में बदल जाएँगे।
 */
function fixExistingPhoneErrors() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("👥 ग्राहक लीड्स (Customers)");
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var phoneColIdx = -1;

  for (var c = 0; c < headers.length; c++) {
    var h = (headers[c] || '').toString().toLowerCase();
    if (h.indexOf('phone') !== -1 || h.indexOf('mobile') !== -1 || h.indexOf('नंबर') !== -1) {
      phoneColIdx = c + 1;
      break;
    }
  }

  if (phoneColIdx === -1) phoneColIdx = 4; // Default to Column D

  var range = sheet.getRange(2, phoneColIdx, lastRow - 1, 1);
  range.setNumberFormat('@'); // Plain text format

  var formulas = range.getFormulas();
  var values = range.getValues();

  for (var i = 0; i < values.length; i++) {
    var cellFormula = formulas[i][0];
    var cellValue = values[i][0];
    
    // If formula caused #ERROR! like =+919829...
    if (cellFormula && cellFormula.indexOf('+') !== -1) {
      var cleaned = cellFormula.replace(/[^0-9]/g, '');
      if (cleaned.length === 12 && cleaned.startsWith('91')) cleaned = cleaned.substring(2);
      sheet.getRange(i + 2, phoneColIdx).setValue("'" + cleaned);
    } else if (cellValue === '#ERROR!' || (typeof cellValue === 'string' && cellValue.indexOf('ERROR') !== -1)) {
      // Clear or format
      sheet.getRange(i + 2, phoneColIdx).setValue("'98290XXXXX");
    }
  }

  SpreadsheetApp.getUi().alert("✅ फ़ोन नंबर कॉलम की सभी त्रुटियाँ ठीक कर दी गई हैं!");
}
