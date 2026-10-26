// AutoForm AI - Content Script
// Scans form fields in visual sequence and performs framework-safe auto-filling

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__AUTOFORM_AI_INJECTED__) return;
  window.__AUTOFORM_AI_INJECTED__ = true;

  console.log('[AutoForm AI] Content script loaded and active.');

  /**
   * Helper: Generate a reliable, unique CSS selector for any element
   */
  function getUniqueSelector(el) {
    if (el.id && !/^\d/.test(el.id) && !el.id.includes(':')) {
      try {
        if (document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) {
          return '#' + CSS.escape(el.id);
        }
      } catch (e) {}
    }

    if (el.name && el.form) {
      const nameMatch = el.form.querySelectorAll(`[name="${CSS.escape(el.name)}"]`);
      if (nameMatch.length === 1) {
        return `[name="${CSS.escape(el.name)}"]`;
      }
    }

    // Build hierarchical path
    const path = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id && !/^\d/.test(current.id)) {
        selector += '#' + CSS.escape(current.id);
        path.unshift(selector);
        break;
      } else {
        let sibling = current;
        let nth = 1;
        while ((sibling = sibling.previousElementSibling)) {
          if (sibling.tagName.toLowerCase() === selector) nth++;
        }
        if (nth > 1) selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  /**
   * Helper: Find the best human-readable label for a form field
   */
  function getFieldLabel(el) {
    // 1. Check for linked <label for="...">
    if (el.id) {
      const linkedLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (linkedLabel && linkedLabel.innerText.trim()) {
        return linkedLabel.innerText.replace(/[*:\s]+$/, '').trim();
      }
    }

    // 2. Check enclosing parent <label>
    const parentLabel = el.closest('label');
    if (parentLabel) {
      // Clone label and remove inner input text to avoid duplicate text
      const clone = parentLabel.cloneNode(true);
      const childInput = clone.querySelector('input, select, textarea');
      if (childInput) childInput.remove();
      const txt = clone.innerText.trim();
      if (txt) return txt.replace(/[*:\s]+$/, '').trim();
    }

    // 3. Check aria-label / aria-labelledby
    if (el.getAttribute('aria-label')) {
      return el.getAttribute('aria-label').trim();
    }
    const labelledby = el.getAttribute('aria-labelledby');
    if (labelledby) {
      const labelEl = document.getElementById(labelledby);
      if (labelEl && labelEl.innerText.trim()) return labelEl.innerText.trim();
    }

    // 4. Check placeholder
    if (el.placeholder && el.placeholder.trim()) {
      return el.placeholder.trim();
    }

    // 5. Check preceding sibling element or nearest heading/div
    let prev = el.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'P') {
        const txt = prev.innerText.trim();
        if (txt && txt.length < 50) return txt.replace(/[*:\s]+$/, '').trim();
      }
      prev = prev.previousElementSibling;
    }

    // 6. Check closest container heading
    const container = el.closest('.form-group, .form-row, .field, .input-group, div');
    if (container) {
      const heading = container.querySelector('label, h3, h4, h5, .label, .title');
      if (heading && heading !== el && heading.innerText.trim()) {
        return heading.innerText.replace(/[*:\s]+$/, '').trim();
      }
    }

    // Fallback: name or id formatted cleanly
    const fallback = el.name || el.id || '';
    return fallback.replace(/[_-]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Strip ASP.NET WebForms mangled prefixes and Hungarian notation
   * e.g. "ctl00$ContentPlaceHolder1$txtApplicantName" -> "ApplicantName"
   * e.g. "ctl00_ContentPlaceHolder1_ddlDistrict" -> "District"
   */
  function cleanASPNetIdentifier(str) {
    if (!str) return '';
    let s = str;
    // Strip ASP.NET container prefixes: ctl00$, ctl00_, ContentPlaceHolder1$, MainContent$, etc.
    s = s.replace(/(?:ctl\d+[_$]|ContentPlaceHolder\d*[_$]|MainContent[_$]|SubContent[_$]|BodyContent[_$]|Content[_$])+/gi, '');
    // Strip ASP.NET Hungarian control prefixes: txt, ddl, chk, rbl, rdo, btn, lbl, hdn, drp
    s = s.replace(/^(?:txt|ddl|chk|rbl|rdo|btn|lbl|hdn|drp)_?/i, '');
    // Strip trailing radio index _0, _1
    s = s.replace(/_\d+$/, '');
    return s.trim();
  }

  /**
   * Scan DOM and collect all interactive form fields in reading sequence
   */
  function scanPageFormFields() {
    const rawElements = Array.from(document.querySelectorAll('input, select, textarea'));
    const fields = [];
    let sequenceIndex = 0;

    for (const el of rawElements) {
      const tagName = el.tagName.toUpperCase();
      const type = (el.type || 'text').toLowerCase();

      // Skip non-fillable inputs
      if (['submit', 'reset', 'button', 'image', 'hidden'].includes(type)) continue;

      // Skip invisibles (display:none, visibility:hidden, opacity:0, or disconnected)
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const isVisible = (rect.width > 0 || rect.height > 0) && style.display !== 'none' && style.visibility !== 'hidden';

      // Still include if parent container is visible
      if (!isVisible && !el.offsetParent) continue;

      // Extract options if SELECT
      let options = [];
      if (tagName === 'SELECT') {
        options = Array.from(el.options).map(opt => ({
          value: opt.value,
          text: opt.text.trim()
        }));
      }

      // Radio group or Checkbox label
      let optionGroup = null;
      if (type === 'radio' && el.name) {
        optionGroup = el.name;
      }

      const selector = getUniqueSelector(el);
      const label = getFieldLabel(el);

      fields.push({
        elementIndex: sequenceIndex++,
        tagName,
        type,
        id: el.id || '',
        name: el.name || '',
        cleanId: cleanASPNetIdentifier(el.id),
        cleanName: cleanASPNetIdentifier(el.name),
        placeholder: el.placeholder || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        label: label,
        required: el.required || false,
        disabled: el.disabled || el.readOnly || false,
        currentValue: el.value || '',
        isChecked: el.checked || false,
        options,
        optionGroup,
        selector
      });
    }

    return fields;
  }

  /**
   * Framework-safe value setter (Works with React, Vue, Angular, Svelte)
   */
  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
  }

  /**
   * Dispatch full synthetic event chain so all reactive listeners update
   */
  function dispatchInputEvents(element) {
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  /**
   * Show temporary floating badge on filled field
   */
  function showFloatingBadge(element, message = '✨ AutoFilled') {
    const rect = element.getBoundingClientRect();
    const badge = document.createElement('div');
    badge.className = 'autoform-badge-tooltip';
    badge.innerHTML = message;
    badge.style.top = `${window.scrollY + rect.top - 28}px`;
    badge.style.left = `${window.scrollX + rect.left}px`;

    document.body.appendChild(badge);
    requestAnimationFrame(() => badge.classList.add('visible'));

    setTimeout(() => {
      badge.classList.remove('visible');
      setTimeout(() => badge.remove(), 300);
    }, 1500);
  }

  /**
   * Fill a single form field with intelligent type handling
   */
  function fillSingleField(fieldInfo, value) {
    const el = document.querySelector(fieldInfo.selector);
    if (!el) return false;

    // Scroll smoothly to the field
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el.classList.add('autoform-field-active');

    const tagName = el.tagName.toUpperCase();
    const type = (el.type || 'text').toLowerCase();

    // Date formatting helper for <input type="date">
    if (type === 'date' && typeof value === 'string') {
      const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (dmy) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const day = dmy[1].padStart(2, '0');
        const month = dmy[2].padStart(2, '0');
        const year = dmy[3];
        value = `${year}-${month}-${day}`;
      }
    }

    if (tagName === 'SELECT') {
      // Find matching option
      const options = Array.from(el.options);
      const valLower = String(value).toLowerCase().trim();
      let matchedIndex = -1;

      // 1. Exact value or text
      for (let i = 0; i < options.length; i++) {
        if (options[i].value.toLowerCase().trim() === valLower || options[i].text.toLowerCase().trim() === valLower) {
          matchedIndex = i;
          break;
        }
      }

      // 2. Partial match
      if (matchedIndex === -1) {
        for (let i = 0; i < options.length; i++) {
          const optText = options[i].text.toLowerCase().trim();
          if (optText.includes(valLower) || valLower.includes(optText)) {
            matchedIndex = i;
            break;
          }
        }
      }

      if (matchedIndex !== -1) {
        el.selectedIndex = matchedIndex;
        dispatchInputEvents(el);
      }
    } else if (type === 'checkbox') {
      const truthyValues = ['true', '1', 'yes', 'agree', 'y', 'haan', 'checked'];
      const shouldCheck = truthyValues.includes(String(value).toLowerCase().trim());
      el.checked = shouldCheck;
      dispatchInputEvents(el);
    } else if (type === 'radio') {
      // Radio group matching
      const radioGroup = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`);
      const valLower = String(value).toLowerCase().trim();
      let picked = false;

      for (const radio of radioGroup) {
        const radioVal = radio.value.toLowerCase().trim();
        const radioLabel = getFieldLabel(radio).toLowerCase().trim();
        if (radioVal === valLower || radioLabel === valLower || radioLabel.includes(valLower)) {
          radio.checked = true;
          dispatchInputEvents(radio);
          picked = true;
          break;
        }
      }

      if (!picked) {
        el.checked = true;
        dispatchInputEvents(el);
      }
    } else if (el.isContentEditable) {
      el.innerText = value;
      dispatchInputEvents(el);
    } else {
      // Regular text, email, number, tel, date, textarea
      setNativeValue(el, value);
      dispatchInputEvents(el);
    }

    // Success feedback
    setTimeout(() => {
      el.classList.remove('autoform-field-active');
      el.classList.add('autoform-field-success');
      showFloatingBadge(el);
      setTimeout(() => el.classList.remove('autoform-field-success'), 2000);
    }, 150);

    return true;
  }

  // Snapshot for 1-click Undo / Revert functionality
  let lastFillSnapshot = [];

  function recordSnapshot(itemsToFill) {
    lastFillSnapshot = [];
    for (const item of itemsToFill) {
      const el = document.querySelector(item.field.selector);
      if (el) {
        lastFillSnapshot.push({
          selector: item.field.selector,
          tagName: el.tagName,
          type: (el.type || '').toLowerCase(),
          value: el.value,
          checked: el.checked,
          selectedIndex: el.selectedIndex,
          innerText: el.isContentEditable ? el.innerText : undefined
        });
      }
    }
  }

  function revertLastFill() {
    if (!lastFillSnapshot.length) return false;
    for (const snap of lastFillSnapshot) {
      const el = document.querySelector(snap.selector);
      if (!el) continue;
      if (snap.tagName === 'SELECT') {
        el.selectedIndex = snap.selectedIndex;
      } else if (snap.type === 'checkbox' || snap.type === 'radio') {
        el.checked = snap.checked;
      } else if (snap.innerText !== undefined) {
        el.innerText = snap.innerText;
      } else {
        setNativeValue(el, snap.value || '');
      }
      dispatchInputEvents(el);
    }
    return true;
  }

  /**
   * Execute sequential filling of mapped fields with micro-delay
   */
  async function executeSequentialFill(itemsToFill, delayMs = 100) {
    recordSnapshot(itemsToFill);
    let successCount = 0;
    for (let i = 0; i < itemsToFill.length; i++) {
      const item = itemsToFill[i];
      if (!item.valueToFill) continue;
      const success = fillSingleField(item.field, item.valueToFill);
      if (success) successCount++;

      // Cascading dropdown wait: if current field is SELECT and next field is also SELECT
      // Wait for ASP.NET / AJAX child options to populate before proceeding
      if (item.field.tagName === 'SELECT' && i < itemsToFill.length - 1 && itemsToFill[i + 1].field.tagName === 'SELECT') {
        const nextEl = document.querySelector(itemsToFill[i + 1].field.selector);
        if (nextEl) {
          let waited = 0;
          while (waited < 1200 && (nextEl.disabled || nextEl.options.length <= 1)) {
            await new Promise(r => setTimeout(r, 100));
            waited += 100;
          }
        }
      }

      // Wait micro-delay to let dynamic scripts/validations process
      await new Promise(r => setTimeout(r, delayMs));
    }
    return { successCount, total: itemsToFill.length };
  }

  /**
   * Checkpoint Detection Engine: Detects OTPs, Captcha, Biometrics, and Submissions
   */
  function detectPortalCheckpoints() {
    const checkpoints = [];

    // 1. OTP Check
    const otpInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')).filter(el => {
      const txt = ((el.id || '') + ' ' + (el.name || '') + ' ' + (el.placeholder || '')).toLowerCase();
      return txt.includes('otp') || txt.includes('one time password') || txt.includes('ओटीपी');
    });

    if (otpInputs.length > 0) {
      checkpoints.push({
        type: 'OTP_REQUIRED',
        severity: 'HIGH_PAUSE',
        label: 'OTP इनपुट मिला (ग्राहक से OTP आवश्यक है)',
        selector: getUniqueSelector(otpInputs[0]),
        count: otpInputs.length
      });
    }

    // 2. Captcha Check
    const captchaImgs = Array.from(document.querySelectorAll('img')).filter(img => {
      const src = (img.src || '').toLowerCase();
      const id = (img.id || '').toLowerCase();
      return src.includes('captcha') || id.includes('captcha') || src.includes('validateimage');
    });
    const captchaInputs = Array.from(document.querySelectorAll('input')).filter(el => {
      const txt = ((el.id || '') + ' ' + (el.name || '') + ' ' + (el.placeholder || '')).toLowerCase();
      return txt.includes('captcha') || txt.includes('कैप्चा') || txt.includes('securitycode');
    });

    if (captchaImgs.length > 0 || captchaInputs.length > 0) {
      checkpoints.push({
        type: 'CAPTCHA_REQUIRED',
        severity: 'MEDIUM_INPUT',
        label: 'कैप्चा कोड दर्ज करें',
        inputSelector: captchaInputs[0] ? getUniqueSelector(captchaInputs[0]) : null
      });
    }

    // 3. Biometric Check (Mantra / Morpho)
    const bioButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a')).filter(el => {
      const txt = (el.innerText || el.value || el.id || '').toLowerCase();
      return txt.includes('biometric') || txt.includes('बायोमेट्रिक') || txt.includes('finger') || txt.includes('capture') || txt.includes('मंत्रा');
    });

    if (bioButtons.length > 0) {
      checkpoints.push({
        type: 'BIOMETRIC_REQUIRED',
        severity: 'HIGH_PAUSE',
        label: 'बायोमेट्रिक (फिंगरप्रिंट) आवश्यक है',
        selector: getUniqueSelector(bioButtons[0])
      });
    }

    // 4. Payment Gateway Reached
    const isPaymentPage = /payment|kioskpayment|feepayment|challan/i.test(window.location.href) || 
      /भुगतान करें|Proceed to Pay|Kiosk Wallet/i.test(document.body.innerText);

    if (isPaymentPage) {
      checkpoints.push({
        type: 'PAYMENT_PENDING',
        severity: 'HIGH_PAUSE',
        label: 'कियोस्क वॉलेट / पेमेंट गेटवे पेज'
      });
    }

    // 5. Success / Application No Generated
    const bodyText = document.body.innerText || '';
    const appMatch = bodyText.match(/(?:आवेदन\s*क्रमांक|Application\s*(?:No|Number)|पंजीयन\s*क्रमांक|Reference\s*No)[\s:]*([A-Za-z0-9\/-]{6,30})/i);
    if (appMatch) {
      checkpoints.push({
        type: 'APPLICATION_COMPLETED',
        severity: 'SUCCESS',
        label: `आवेदन सफलतापूर्वक सबमिट हुआ: ${appMatch[1]}`,
        applicationNumber: appMatch[1]
      });
    }

    // 6. Ground Reality Portal Errors (eKYC Outdated, Live Photo, UIDAI Timeout, Payment Pending)
    if (typeof kioskErrorResolver !== 'undefined' && kioskErrorResolver.detectPageErrors) {
      const pageErrors = kioskErrorResolver.detectPageErrors(bodyText);
      pageErrors.forEach(err => {
        checkpoints.push({
          type: 'PORTAL_ERROR_ACTION',
          severity: err.severity,
          label: err.title,
          solutionText: err.solutionText,
          actionButtonText: err.actionButtonText,
          targetUrl: err.targetUrl,
          errorId: err.id
        });
      });
    }

    return checkpoints;
  }

  // Export methods to global scope
  window.__AutoFormContentEngine = {
    scanPageFormFields,
    executeSequentialFill,
    fillSingleField,
    revertLastFill,
    detectPortalCheckpoints
  };

  // Message Listener from Popup / Side Panel (Safe Chrome Extension Context)
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'SCAN_PAGE') {
        try {
          const fields = scanPageFormFields();
          const checkpoints = detectPortalCheckpoints();
          sendResponse({ success: true, fields, checkpoints, url: window.location.href, title: document.title });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
        return true;
      }

      if (request.action === 'DETECT_CHECKPOINTS') {
        try {
          const checkpoints = detectPortalCheckpoints();
          sendResponse({ success: true, checkpoints, url: window.location.href });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
        return true;
      }

      if (request.action === 'EXECUTE_FILL') {
        executeSequentialFill(request.items, request.delayMs || 100).then(result => {
          const checkpoints = detectPortalCheckpoints();
          sendResponse({ success: true, result, checkpoints });
        }).catch(err => {
          sendResponse({ success: false, error: err.message });
        });
        return true;
      }

      if (request.action === 'REVERT_FORM') {
        const reverted = revertLastFill();
        sendResponse({ success: true, reverted });
        return true;
      }

      if (request.action === 'HIGHLIGHT_FIELD') {
        const el = document.querySelector(request.selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          el.classList.add('autoform-field-active');
        }
        sendResponse({ success: true });
        return true;
      }

      if (request.action === 'CLEAR_HIGHLIGHTS') {
        document.querySelectorAll('.autoform-field-active, .autoform-field-success').forEach(el => {
          el.classList.remove('autoform-field-active', 'autoform-field-success');
        });
        sendResponse({ success: true });
        return true;
      }
    });
  }

})();
