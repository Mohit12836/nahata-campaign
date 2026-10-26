// AutoForm AI - Kiosk Pilot Orchestration Engine
// Handles: 1-Click Launch, Checkpoint Detection, Smart Hold & Resume Queue, and WhatsApp Alert Hooks

class KioskPilotEngine {
  constructor() {
    this.currentApplicant = null;
    this.currentRecipe = null;
    this.currentStep = 1;
    this.activeQueue = [];
    this.heldQueue = [];
    this.historyQueue = [];
    this.init();
  }

  async init() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(['kiosk_held_queue', 'kiosk_active_queue', 'kiosk_history_queue']);
      this.heldQueue = data.kiosk_held_queue || [];
      this.activeQueue = data.kiosk_active_queue || [];
      this.historyQueue = data.kiosk_history_queue || [];
    }
  }

  // Set queue of applicants (e.g. from Google Sheet or CSV)
  async loadBatchQueue(applicants) {
    this.activeQueue = applicants.map((app, idx) => ({
      ...app,
      id: app.id || 'app_' + Date.now() + '_' + idx,
      queueStatus: 'PENDING',
      addedAt: new Date().toISOString()
    }));
    await this.persist();
    return this.activeQueue;
  }

  // Launch the next pending applicant or a specific applicant
  async launchApplicant(applicantId = null, tabId = null) {
    let applicant = null;
    if (applicantId) {
      applicant = this.activeQueue.find(a => a.id === applicantId);
    } else {
      applicant = this.activeQueue.find(a => a.queueStatus === 'PENDING');
    }

    if (!applicant) {
      return { success: false, message: 'कतार में कोई नया आवेदक नहीं बचा है!' };
    }

    this.currentApplicant = applicant;
    applicant.queueStatus = 'IN_PROGRESS';
    applicant.startedAt = new Date().toISOString();

    // Determine Portal Recipe
    const recipeKey = applicant.serviceCode || applicant.service || 'mpesb_vyapam';
    let recipesMap = (typeof KIOSK_PORTAL_RECIPES !== 'undefined') ? KIOSK_PORTAL_RECIPES : null;
    if (!recipesMap && typeof require === 'function') {
      try { recipesMap = require('./kiosk-recipes.js').KIOSK_PORTAL_RECIPES; } catch(e) {}
    }
    this.currentRecipe = (recipesMap && recipesMap[recipeKey]) ? recipesMap[recipeKey] : null;

    // Pick launch URL
    const targetUrl = applicant.resumeUrl || 
      (this.currentRecipe ? Object.values(this.currentRecipe.directLinks)[0] : null) || 
      'https://esb.mponline.gov.in';

    applicant.targetUrl = targetUrl;
    await this.persist();

    // Open or Navigate Tab
    let activeTabId = tabId;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      if (activeTabId) {
        await chrome.tabs.update(activeTabId, { url: targetUrl });
      } else {
        const newTab = await chrome.tabs.create({ url: targetUrl });
        activeTabId = newTab.id;
      }
    }

    return {
      success: true,
      applicant: this.currentApplicant,
      recipe: this.currentRecipe,
      targetUrl,
      tabId: activeTabId
    };
  }

  // HOLD CURRENT APPLICANT (अगर OTP नहीं आया, या ग्राहक अभी उपलब्ध नहीं है)
  async holdCurrentApplicant(reason = 'Awaiting OTP from Customer', currentUrl = null, stepNum = 1) {
    if (!this.currentApplicant) {
      return { success: false, message: 'कोई सक्रिय आवेदक नहीं है जिसे होल्ड किया जा सके।' };
    }

    const heldItem = {
      ...this.currentApplicant,
      queueStatus: 'HELD',
      holdReason: reason,
      heldAt: new Date().toISOString(),
      stepPausedAt: stepNum,
      resumeUrl: currentUrl || this.currentApplicant.targetUrl,
      recipeId: this.currentRecipe ? this.currentRecipe.id : null
    };

    // Remove from activeQueue and push to heldQueue
    this.activeQueue = this.activeQueue.filter(a => a.id !== heldItem.id);
    // Replace if already exists in heldQueue
    this.heldQueue = this.heldQueue.filter(h => h.id !== heldItem.id);
    this.heldQueue.unshift(heldItem);

    const pausedApplicant = this.currentApplicant;
    this.currentApplicant = null;
    this.currentRecipe = null;

    await this.persist();

    return {
      success: true,
      heldApplicant: heldItem,
      message: `${pausedApplicant.fullName || pausedApplicant.applicantName || 'आवेदक'} को होल्ड पर डाल दिया गया है। अगला फॉर्म शुरू कर सकते हैं।`
    };
  }

  // RESUME HELD APPLICANT (जब ग्राहक ने 15 मिनट बाद OTP दे दिया)
  async resumeHeldApplicant(heldId, tabId = null) {
    const heldIndex = this.heldQueue.findIndex(h => h.id === heldId);
    if (heldIndex === -1) {
      return { success: false, message: 'होल्ड लिस्ट में यह आवेदक नहीं मिला।' };
    }

    const applicant = this.heldQueue[heldIndex];
    // Remove from heldQueue
    this.heldQueue.splice(heldIndex, 1);

    // Put back as current
    applicant.queueStatus = 'RESUMED';
    applicant.resumedAt = new Date().toISOString();
    this.currentApplicant = applicant;

    const recipeKey = applicant.recipeId || applicant.serviceCode || 'mpesb_vyapam';
    this.currentRecipe = (typeof KIOSK_PORTAL_RECIPES !== 'undefined' && KIOSK_PORTAL_RECIPES[recipeKey])
      ? KIOSK_PORTAL_RECIPES[recipeKey]
      : null;

    await this.persist();

    const targetUrl = applicant.resumeUrl || (this.currentRecipe ? Object.values(this.currentRecipe.directLinks)[0] : 'https://esb.mponline.gov.in');

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      if (tabId) {
        await chrome.tabs.update(tabId, { url: targetUrl });
      } else {
        await chrome.tabs.create({ url: targetUrl });
      }
    }

    return {
      success: true,
      applicant: this.currentApplicant,
      recipe: this.currentRecipe,
      resumeUrl: targetUrl
    };
  }

  // COMPLETE APPLICANT (जब फॉर्म सबमिट हो गया और आवेदन नंबर मिल गया)
  async markCompleted(applicationNumber, receiptData = {}) {
    if (!this.currentApplicant) {
      return { success: false, message: 'कोई सक्रिय आवेदक नहीं है।' };
    }

    const completed = {
      ...this.currentApplicant,
      queueStatus: 'COMPLETED',
      applicationNumber: applicationNumber || 'GENERATED_' + Date.now(),
      completedAt: new Date().toISOString(),
      receiptData
    };

    // Remove from activeQueue if present
    this.activeQueue = this.activeQueue.filter(a => a.id !== completed.id);
    this.historyQueue.unshift(completed);

    const finishedName = completed.fullName || completed.applicantName || 'आवेदक';
    this.currentApplicant = null;
    this.currentRecipe = null;

    await this.persist();

    return {
      success: true,
      completed,
      message: `बधाई! ${finishedName} का फॉर्म सफलतापूर्वक पूरा हुआ। आवेदन क्रमांक: ${completed.applicationNumber}`
    };
  }

  // Get WhatsApp quick message link for the current applicant
  getWhatsAppShareUrl(stepInfo = null) {
    if (!this.currentApplicant || !this.currentApplicant.phone) return null;
    
    let cleanPhone = String(this.currentApplicant.phone).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    let text = '';
    if (typeof generateWhatsAppOtpPrompt === 'function') {
      text = generateWhatsAppOtpPrompt(this.currentApplicant, this.currentRecipe, stepInfo);
    } else {
      text = `नमस्ते, नाहटा कियोस्क से आपका सरकारी फॉर्म भरा जा रहा है। कृपया प्राप्त OTP तुरंत बताएं।`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  // Save to Chrome Local Storage
  async persist() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        kiosk_active_queue: this.activeQueue,
        kiosk_held_queue: this.heldQueue,
        kiosk_history_queue: this.historyQueue,
        kiosk_current_applicant: this.currentApplicant
      });
    }
  }
}

// Global instance
const kioskPilot = new KioskPilotEngine();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KioskPilotEngine, kioskPilot };
}
