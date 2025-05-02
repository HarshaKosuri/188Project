// Manifest V3 background service worker for Productivity Tracker

// Helper to get today's date string
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isTracking: true,
    dailyStats: {},
    tabSwitches: 0,
    activeTabs: 0
  });
});

// Listen for tracking toggle from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleTracking') {
    chrome.storage.local.set({ isTracking: message.isTracking });
  }
});

// Update active tab count
function updateActiveTabs() {
  chrome.tabs.query({}, (tabs) => {
    chrome.storage.local.set({ activeTabs: tabs.length });
    broadcastStats();
  });
}

// Track tab creation
chrome.tabs.onCreated.addListener(() => {
  updateActiveTabs();
});

// Track tab removal
chrome.tabs.onRemoved.addListener(() => {
  updateActiveTabs();
});

// Track tab activation (switches)
chrome.tabs.onActivated.addListener(() => {
  chrome.storage.local.get(['isTracking', 'tabSwitches'], (result) => {
    if (result.isTracking !== false) {
      const newSwitches = (result.tabSwitches || 0) + 1;
      chrome.storage.local.set({ tabSwitches: newSwitches }, broadcastStats);
    }
  });
});

// Track time spent per domain (every minute)
setInterval(() => {
  chrome.storage.local.get(['isTracking', 'dailyStats'], (result) => {
    if (result.isTracking === false) return;
    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
      if (!tabs[0] || !tabs[0].url) return;
      let url;
      try {
        url = new URL(tabs[0].url);
      } catch {
        return;
      }
      const domain = url.hostname;
      const today = getToday();
      const dailyStats = result.dailyStats || {};
      if (!dailyStats[today]) dailyStats[today] = {};
      dailyStats[today][domain] = (dailyStats[today][domain] || 0) + 1; // +1 minute
      chrome.storage.local.set({ dailyStats }, broadcastStats);
    });
  });
}, 60000);

// Broadcast stats to popup
function broadcastStats() {
  chrome.storage.local.get(['dailyStats', 'tabSwitches', 'activeTabs'], (result) => {
    chrome.runtime.sendMessage({
      action: 'updateStats',
      data: {
        dailyStats: result.dailyStats,
        tabSwitches: result.tabSwitches,
        activeTabs: result.activeTabs
      }
    });
  });
}

// On extension startup, update active tabs
updateActiveTabs();

// Listen for installation
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    // Initialize storage with default values on install
    chrome.storage.sync.set({
      lastAction: 'installed',
      timestamp: Date.now(),
      settings: {
        featureEnabled: true,
        notificationsEnabled: true
      }
    }, function() {
      console.log("Extension installed and storage initialized");
    });
  } else if (details.reason === "update") {
    console.log("Extension updated from version " + details.previousVersion);
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Background script received message:", message);
  
  if (message.action === "feature2") {
    // Process feature2 action in the background
    setTimeout(() => {
      sendResponse({message: "Feature 2 processed by background script!"});
    }, 300);
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
}); 