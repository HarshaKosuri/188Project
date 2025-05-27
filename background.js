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
    onTaskStats: {},
    offTaskStats: {},
    domainClassifications: {}, // Cache LLM responses for domains
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
const notificationCooldown = 60000; // in milliseconds (60 seconds - increased from 10 seconds)
let lastActiveUrl = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("[Tab Switch] Listener triggered. ActiveInfo:", activeInfo);

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log("[Tab Switch] Tab info:", tab);

    if (!tab || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      console.log("[Tab Switch] Skipping internal or missing tab.");
      return;
    }

    const newUrl = tab.url;
    const now = Date.now();

    chrome.storage.local.get(['isTracking', 'tabSwitches', 'currentGoal'], async (result) => {
      const isTracking = result.isTracking !== false;
      const goal = result.currentGoal;

      console.log("[Tab Switch] isTracking:", isTracking, "goal:", goal, "lastActiveUrl:", lastActiveUrl);

      if (!isTracking) return;

      // Update tab switch count
      const newSwitches = (result.tabSwitches || 0) + 1;
      chrome.storage.local.set({ tabSwitches: newSwitches }, broadcastStats);

      // Update active tab count too
      updateActiveTabs();

      // Skip LLM if not enough time has passed or no goal set
      if (!goal || now - lastNotificationTime < notificationCooldown || !lastActiveUrl) {
        console.log("[Tab Switch] Skipping LLM check. Reason:", !goal ? "No goal" : now - lastNotificationTime < notificationCooldown ? "Cooldown" : "No lastActiveUrl");
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

        console.log("[Notification] Attempting to create notification. Message:", message);

        chrome.notifications.create({
          type: 'basic',
          iconUrl: "images/confused_bee.png",
          title: "Off Track?",
          message: message,
          priority: 2,
          requireInteraction: true
        }, function(notificationId) {
          if (chrome.runtime.lastError) {
            console.error("[Notification] Error creating notification:", chrome.runtime.lastError.message);
          } else {
            console.log("[Notification] Successfully created. ID:", notificationId);
          }
        });
      }

      lastActiveUrl = newUrl;
    });
  });
});

// Track time spent per domain (every 10 seconds)
setInterval(async () => {
  console.log("[Tracker] Interval triggered.");
  
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['isTracking', 'dailyStats', 'onTaskStats', 'offTaskStats', 'domainClassifications', 'currentGoal'], resolve);
  });
  
  console.log("[Tracker] isTracking:", result.isTracking);
  if (result.isTracking === false) return;

  const tabs = await new Promise((resolve) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, resolve);
  });

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
  const goal = result.currentGoal;

  // Update general daily stats
  const dailyStats = result.dailyStats || {};
  if (!dailyStats[today]) dailyStats[today] = {};
  dailyStats[today][domain] = (dailyStats[today][domain] || 0) + 10;

  // Initialize task-specific stats
  const onTaskStats = result.onTaskStats || {};
  const offTaskStats = result.offTaskStats || {};
  const domainClassifications = result.domainClassifications || {};
  
  if (!onTaskStats[today]) onTaskStats[today] = {};
  if (!offTaskStats[today]) offTaskStats[today] = {};

  // Check if we need to classify this domain
  let isOnTask = null;
  const cacheKey = `${goal}:${domain}`;
  
  if (goal && domainClassifications[cacheKey] !== undefined) {
    // Use cached classification
    isOnTask = domainClassifications[cacheKey];
    console.log("[Tracker] Using cached classification for", domain, ":", isOnTask);
  } else if (goal) {
    // Classify domain using LLM
    console.log("[Tracker] Classifying domain:", domain);
    const response = await checkIfOnTask(goal, tabs[0].url);
    isOnTask = response && response.toLowerCase().includes("yes");
    
    // Cache the result
    domainClassifications[cacheKey] = isOnTask;
    console.log("[Tracker] Classified", domain, "as", isOnTask ? "on-task" : "off-task");
  }

  // Update task-specific stats
  if (isOnTask === true) {
    onTaskStats[today][domain] = (onTaskStats[today][domain] || 0) + 10;
  } else if (isOnTask === false) {
    offTaskStats[today][domain] = (offTaskStats[today][domain] || 0) + 10;
  }

  console.log("[Tracker] Updating domain:", domain, "General time:", dailyStats[today][domain], "On-task:", isOnTask);

  // Save all stats
  chrome.storage.local.set({ 
    dailyStats, 
    onTaskStats, 
    offTaskStats, 
    domainClassifications 
  }, () => {
    console.log("[Tracker] All stats saved to storage.");
    broadcastStats();
  });
}, 10000);

// Broadcast stats to popup
function broadcastStats() {
  chrome.storage.local.get(['dailyStats', 'onTaskStats', 'offTaskStats', 'tabSwitches', 'activeTabs'], (result) => {
    chrome.runtime.sendMessage({
      action: 'updateStats',
      data: {
        dailyStats: result.dailyStats,
        onTaskStats: result.onTaskStats,
        offTaskStats: result.offTaskStats,
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

  // TODO: Add your OpenAI API key here
  // Get your API key from: https://platform.openai.com/api-keys
  const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";
  
  if (OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    console.warn("OpenAI API key not configured. Please add your key to background.js");
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content.trim();
    } else {
      console.error("OpenAI response malformed:", data);
      return null;
    }
  } catch (err) {
    console.error("Failed to contact OpenAI:", err);
    return null;
  }
}

async function rewriteGoalAsReminder(goal) {
  const prompt = `
I want to remind someone about their task in a friendly, natural way. The task is:

"${goal}"

Write a one-sentence friendly question to ask if they've finished it. Do not include typos or awkward phrasing from the task. Make it flow like natural speech. Only return the sentence.
`;

  // TODO: Add your OpenAI API key here
  // Get your API key from: https://platform.openai.com/api-keys
  const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";
  
  if (OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    console.warn("OpenAI API key not configured. Please add your key to background.js");
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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

