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

// Track time spent per domain (every 10 seconds)
setInterval(() => {
  console.log("[Tracker] Interval triggered.");
  chrome.storage.local.get(['isTracking', 'dailyStats'], (result) => {
    console.log("[Tracker] isTracking:", result.isTracking);
    if (result.isTracking === false) return;

    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
      if (!tabs[0] || !tabs[0].url) {
        console.log("[Tracker] No active tab or URL found.");
        return;
      }

      // Prevent tracking for chrome:// and chrome-extension:// URLs
      if (tabs[0].url.startsWith('chrome://') || tabs[0].url.startsWith('chrome-extension://')) {
        console.log("[Tracker] Ignoring internal URL:", tabs[0].url);
        return;
      }

      console.log("[Tracker] Active tab URL:", tabs[0].url);

      let url;
      try {
        url = new URL(tabs[0].url);
      } catch (e) {
        console.error("[Tracker] Invalid URL:", tabs[0].url, e);
        return;
      }

      const domain = url.hostname;
      const today = getToday();
      const dailyStats = result.dailyStats || {};
      if (!dailyStats[today]) dailyStats[today] = {};
      dailyStats[today][domain] = (dailyStats[today][domain] || 0) + 10;
      console.log("[Tracker] Updating domain:", domain, "New time (seconds):", dailyStats[today][domain]);

      chrome.storage.local.set({ dailyStats }, () => {
        console.log("[Tracker] dailyStats saved to storage.");
        broadcastStats();
      });
    });
  });
}, 10000);

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
    }).catch(error => {
      // Optional: Log a less intrusive message or do nothing
      // console.log("Popup not open to receive stats update.");
    });
  });
}

// On extension startup, update active tabs
updateActiveTabs();

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