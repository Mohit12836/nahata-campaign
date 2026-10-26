// AutoForm AI - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AutoForm AI] Extension installed successfully.');
  
  // Create context menu for quick fill & data grabbing
  chrome.contextMenus.create({
    id: 'autoform-fill-selection',
    title: 'Fill with AutoForm: "%s"',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'autoform-open-panel',
    title: 'Open AutoForm Side Panel',
    contexts: ['page', 'editable']
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'autoform-open-panel' && tab?.id) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } else if (info.menuItemId === 'autoform-fill-selection' && tab?.id) {
    const selectedText = info.selectionText || '';
    // Store selected text into storage for popup / side panel to pick up
    await chrome.storage.local.set({ pendingRoughData: selectedText });
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Message hub between popup, side panel, and content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_SIDE_PANEL') {
    (async () => {
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.windowId) {
          await chrome.sidePanel.open({ windowId: activeTab.windowId });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'No active window found' });
        }
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
