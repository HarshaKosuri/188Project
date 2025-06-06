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
const notificationCooldown = 60000;
let lastActiveUrl = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      return;
    }

    const newUrl = tab.url;
    const now = Date.now();

    chrome.storage.local.get(['isTracking', 'tabSwitches', 'currentGoal'], async (result) => {
      const isTracking = result.isTracking !== false;
      const goal = result.currentGoal;

      if (!isTracking) return;

      const newSwitches = (result.tabSwitches || 0) + 1;
      chrome.storage.local.set({ tabSwitches: newSwitches }, broadcastStats);

      updateActiveTabs();

      if (!goal || now - lastNotificationTime < notificationCooldown || !lastActiveUrl) {
        lastActiveUrl = newUrl;
        return;
      }

      const response = await checkIfOnTask(goal, newUrl);

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
          message: message,
          priority: 2,
          requireInteraction: true
        });
      }

      lastActiveUrl = newUrl;
    });
  });
});

let currentDomain = null;
let onTaskDuration = 0;
let offTaskDuration = 0;
let streakOnTask = null;
let streakDuration = 0;

setInterval(async () => {
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['isTracking', 'dailyStats', 'onTaskStats', 'offTaskStats', 'domainClassifications', 'currentGoal'], resolve);
  });

  if (result.isTracking === false) return;

  const tabs = await new Promise((resolve) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, resolve);
  });

  if (!tabs[0] || !tabs[0].url || tabs[0].url.startsWith('chrome://') || tabs[0].url.startsWith('chrome-extension://')) {
    return;
  }

  let url;
  try {
    url = new URL(tabs[0].url);
  } catch (e) {
    return;
  }

  const domain = url.hostname;
  const fullUrl = url.href;
  const today = getToday();
  const goal = result.currentGoal;

  const dailyStats = result.dailyStats || {};
  if (!dailyStats[today]) dailyStats[today] = {};
  dailyStats[today][domain] = (dailyStats[today][domain] || 0) + 10;

  const onTaskStats = result.onTaskStats || {};
  const offTaskStats = result.offTaskStats || {};
  const domainClassifications = result.domainClassifications || {};
  if (!onTaskStats[today]) onTaskStats[today] = {};
  if (!offTaskStats[today]) offTaskStats[today] = {};

  let cacheKey;
  if (domain.includes("youtube.com")) {
    cacheKey = `${goal}:${fullUrl}`;
  } else {
    const pathname = url.pathname.split('?')[0];
    cacheKey = `${goal}:${domain}${pathname}`;
  }

  let isOnTask = null;
  if (goal && domainClassifications[cacheKey] !== undefined) {
    isOnTask = domainClassifications[cacheKey];
  } else if (goal) {
    const response = await checkIfOnTask(goal, tabs[0].url);
    isOnTask = response && response.toLowerCase().includes("yes");
    domainClassifications[cacheKey] = isOnTask;
  }

  if (isOnTask === true) {
    onTaskStats[today][domain] = (onTaskStats[today][domain] || 0) + 10;
  } else if (isOnTask === false) {
    offTaskStats[today][domain] = (offTaskStats[today][domain] || 0) + 10;
  }

  if (isOnTask === streakOnTask) {
    streakDuration += 10;
  } else {
    streakOnTask = isOnTask;
    streakDuration = 0;
  }

  if (streakOnTask === true && streakDuration >= 3000) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/happy_bee.png',
      title: 'Good Work!',
      message: 'Nice work staying on task and focused! Keep the momentum going!',
      priority: 2
    });
  } else if (streakOnTask == false && streakDuration >= 1200) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/angry_bee.png',
      title: 'Stay Focused!',
      message: 'Buzz buzz! You\'ve drifted off task, refocus?',
      priority: 2
    });
  }

  chrome.storage.local.set({ 
    dailyStats, 
    onTaskStats, 
    offTaskStats, 
    domainClassifications 
  }, broadcastStats);
}, 10000);

function broadcastStats() {
  chrome.storage.local.get(['dailyStats', 'onTaskStats', 'offTaskStats', 'tabSwitches', 'activeTabs'], (result) => {
    chrome.runtime.sendMessage({
      action: 'updateStats',
      data: result
    }).catch(() => {});
  });
}

updateActiveTabs();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "feature2") {
    setTimeout(() => {
      sendResponse({message: "Feature 2 processed by background script!"});
    }, 300);
    return true;
  }
});

async function checkIfOnTask(goal, newUrl) {
  const prompt = `
You are helping someone stay focused on their goal.

Current goal: "${goal}"  
Recently visited site: "${newUrl}"

Would a reasonable person consider this site helpful for staying focused on that goal? Judge based on the site’s purpose and how likely it is to support productive work on that goal. Assume the person wants to avoid distractions like entertainment or unrelated content.

**Important guidelines:**
- If the goal is academic (e.g., writing a paper, doing homework, studying), then:
  - Educational platforms (e.g., Canvas, BruinLearn, Blackboard, Coursera, edX, university portals) are "yes".
  - Social media, news, or general browsing sites are usually "no".

**Examples:**
- Goal: "Finish my history essay"
  - Site: bruinlearn.com — **yes** (course platform)
  - Site: youtube.com — **no** (unless for research)
  - Site: reddit.com — **no**

- Goal: "Apply for jobs"
  - Site: linkedin.com — **yes**
  - Site: netflix.com — **no**

Reply only with **"yes"** or **"no"**.
`;

  const OPENAI_API_KEY = "ENTER_OPENAI_API_KEY";

  if (!OPENAI_API_KEY || OPENAI_API_KEY === "ENTER_OPENAI_API_KEY") return null;

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
    return null;
  }
}

async function rewriteGoalAsReminder(goal) {
  const prompt = `
You are a friendly and supportive coach helping someone stay focused.

Their goal is: "${goal}"

Write one powerful but friendly sentence to remind them of the goal. Make it sound like a gentle check-in, not a command. Use motivational psychology (e.g., autonomy, purpose, momentum).

Make it sound like something you'd hear from a mindful productivity app. Avoid awkward phrasing, just a single smooth sentence to help them realign.

Return just the one sentence only.
`;

  const OPENAI_API_KEY = "ENTER_OPENAI_API_KEY";
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "ENTER_OPENAI_API_KEY") return null;

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
    return null;
  }
}
