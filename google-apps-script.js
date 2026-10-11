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

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var json = JSON.parse(rawData);
    var action = json.action;
    var data = json.data;

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'NEW_LEAD') {
      appendNewLead(ss, data);
    } else if (action === 'COUPON_REDEEMED') {
      recordRedemption(ss, data);
    } else if (action === 'BULK_SYNC') {
      if (Array.isArray(data.leads)) {
        for (var i = 0; i < data.leads.length; i++) {
          appendNewLead(ss, data.leads[i]);
        }
      }
      if (Array.isArray(data.redemptions)) {
        for (var j = 0; j < data.redemptions.length; j++) {
          recordRedemption(ss, data.redemptions[j]);
        }
      }
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
    JSON.stringify({ status: 'ONLINE', message: 'Nahata Offer Platform Google Sheet Webhook Active' })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. Append New Customer Lead & Coupon
 */
function appendNewLead(ss, lead) {
  var sheetName = "👥 ग्राहक लीड्स (Customers)";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [
      "दिनांक & समय",
      "ग्राहक का नाम",
      "मोबाइल नंबर",
      "WhatsApp चैट लिंक",
      "शहर / कस्बा",
      "ग्राहक श्रेणी",
      "गेम प्रकार",
      "जीता हुआ इनाम",
      "कूपन कोड",
      "कूपन स्थिति",
      "वैधता (Expiry)",
      "दुकान का नाम"
    ];
    sheet.appendRow(headers);

    // Style Header
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#064e3b");
    headerRange.setFontColor("#fef08a");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    sheet.setFrozenRows(1);
  }

  // Format phone as plain text with clean prefix
  var phoneStr = "'" + (lead.phone || '').toString();
  var waFormula = '=HYPERLINK("https://wa.me/91' + (lead.phone || '') + '", "💬 WhatsApp चैट करें")';

  var row = [
    lead.timestamp || new Date().toLocaleString("hi-IN", { timeZone: "Asia/Kolkata" }),
    lead.customerName || '',
    phoneStr,
    waFormula,
    lead.city || '',
    lead.category || '',
    lead.gameType === 'scratch' ? '🎁 लकी स्क्रैच कार्ड' : '🎡 लकी स्पिन व्हील',
    lead.prizeTitle || '',
    lead.couponCode || '',
    lead.couponStatus || 'सक्रिय (VALID)',
    lead.expiresAt || '',
    lead.storeName || 'नाहाटा जनरल स्टोर्स'
  ];

  sheet.appendRow(row);
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

  sheet.appendRow(row);
  autoFitColumns(sheet);

  // Update Status in Customers sheet if found
  var leadSheet = ss.getSheetByName("👥 ग्राहक लीड्स (Customers)");
  if (leadSheet && red.couponCode) {
    var data = leadSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][8] === red.couponCode) { // Column 9 is Coupon Code
        leadSheet.getRange(i + 1, 10).setValue("✅ रिडीम हो चुका (REDEEMED)");
        leadSheet.getRange(i + 1, 10).setBackground("#dcfce7").setFontColor("#15803d");
        break;
      }
    }
  }
}

function autoFitColumns(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol > 0) {
    for (var c = 1; c <= Math.min(lastCol, 12); c++) {
      sheet.autoResizeColumn(c);
    }
  }
}
