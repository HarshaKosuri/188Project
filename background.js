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
    activeTabs: 0,
    currentGoal: null
  });

  // Send notif to set tasks (chrome doesnt allow automatic popoup opening)
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/happy_bee.png',
    title: 'Welcome to Beezy!',
    message: 'Click the Beezy icon to set your goal and start tracking your session.',
    priority: 2
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
// Add a cooldown timer
let lastNotificationTime = 0;
const notificationCooldown = 10000; // in milliseconds (10 seconds)
let lastActiveUrl = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      return;
    }

    const newUrl = tab.url;
    const now = Date.now();

    // Always update tab switch count
    chrome.storage.local.get(['isTracking', 'tabSwitches', 'currentGoal'], async (result) => {
      const isTracking = result.isTracking !== false;
      const goal = result.currentGoal;

      if (!isTracking) return;

      // Update tab switch count
      const newSwitches = (result.tabSwitches || 0) + 1;
      chrome.storage.local.set({ tabSwitches: newSwitches }, broadcastStats);

      // Update active tab count too
      updateActiveTabs();

      // Skip LLM if not enough time has passed or no goal set
      if (!goal || now - lastNotificationTime < notificationCooldown || !lastActiveUrl) {
        lastActiveUrl = newUrl;
        return;
      }

      const response = await checkIfOnTask(goal, newUrl);
      console.log("[LLM Response]", response);

      if (response && response.toLowerCase().includes("no")) {
        lastNotificationTime = now;

        const reminder = await rewriteGoalAsReminder(goal);
        const domain = (new URL(newUrl).hostname || "this site").replace("www.", "");

        const message = reminder 
          ? `${reminder} ${domain} might be a distraction.` 
          : `Stay focused — ${domain} might not be on track.`;

        chrome.notifications.create({
          type: 'basic',
          iconUrl: "images/confused_bee.png",
          title: "Off Track?",
          message,
          priority: 2,
          requireInteraction: true
        });
      }

      lastActiveUrl = newUrl;
    });
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

// LLM Prompt to Check if on Task
async function checkIfOnTask(goal, newUrl) {
  const prompt = `
    I'm trying to stay focused and productive.

    My current task is: "${goal}"
    I just opened this URL: "${newUrl}"

    Would a reasonable person consider this site helpful for working on that task? Reply only with "yes" or "no".
    `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content.trim();
    } else {
      console.error("OpenRouter response malformed:", data);
      return null;
    }
  } catch (err) {
    console.error("Failed to contact OpenRouter:", err);
    return null;
  }
}

async function rewriteGoalAsReminder(goal) {
  const prompt = `
I want to remind someone about their task in a friendly, natural way. The task is:

"${goal}"

Write a one-sentence friendly question to ask if they've finished it. Do not include typos or awkward phrasing from the task. Make it flow like natural speech. Only return the sentence.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",  // faster model for quick rewrites
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;

  } catch (err) {
    console.error("Goal rewrite failed:", err);
    return null;
  }
}

