// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get references to UI elements
  const goalSection = document.getElementById('goalSection');
  const goalInput = document.getElementById('goalInput');
  const saveGoalBtn = document.getElementById('saveGoalBtn');
  const mainContent = document.getElementById('mainContent');
  const currentTime = document.getElementById('currentTime');
  const trackingToggle = document.getElementById('trackingToggle');
  const trackingIndicator = document.getElementById('trackingIndicator');
  const totalTimeElement = document.getElementById('totalTime');
  const tabSwitchesElement = document.getElementById('tabSwitches');
  const activeTabsElement = document.getElementById('activeTabs');
  const productivityScore = document.getElementById('productivityScore');
  const progressFill = document.getElementById('progressFill');
  const sitesList = document.getElementById('sitesList');
  const viewDetailsBtn = document.getElementById('viewDetailsBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  // Color scheme for sites
  const siteColors = [
    'color-emerald', 'color-amber', 'color-blue', 
    'color-rose', 'color-purple', 'color-cyan'
  ];

  // Update current time every second
  function updateCurrentTime() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  // Helper to get today's date string
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  // Format time from seconds to readable format
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Check if goal is set and show appropriate section
  chrome.storage.local.get('currentGoal', (result) => {
    if (result.currentGoal) {
      goalSection.classList.add('hidden');
      mainContent.classList.remove('hidden');
      loadMainContent();
    } else {
      goalSection.classList.remove('hidden');
      mainContent.classList.add('hidden');
    }
  });

  // Save goal and switch to main content
  saveGoalBtn.addEventListener('click', () => {
    const goal = goalInput.value.trim();
    if (!goal) {
      alert("Please enter a goal!");
      return;
    }
    chrome.storage.local.set({ currentGoal: goal }, () => {
      goalSection.classList.add('hidden');
      mainContent.classList.remove('hidden');
      loadMainContent();
    });
  });

  // Load main content data
  function loadMainContent() {
    chrome.storage.local.get(['isTracking', 'dailyStats', 'onTaskStats', 'offTaskStats', 'tabSwitches', 'activeTabs'], function(result) {
      // Set tracking toggle state
      const isTracking = result.isTracking !== false;
      updateTrackingUI(isTracking);
      
      // Update stats
      updateStats(result);
      
      // Update sites list
      const today = getToday();
      updateSitesList(result.dailyStats && result.dailyStats[today] ? result.dailyStats[today] : {});
    });
  }

  // Update tracking UI
  function updateTrackingUI(isTracking) {
    if (isTracking) {
      trackingToggle.classList.add('active');
      trackingIndicator.style.display = 'block';
    } else {
      trackingToggle.classList.remove('active');
      trackingIndicator.style.display = 'none';
    }
  }

  // Handle tracking toggle
  trackingToggle.addEventListener('click', function() {
    const isCurrentlyActive = this.classList.contains('active');
    const newState = !isCurrentlyActive;
    
    updateTrackingUI(newState);
    chrome.storage.local.set({ isTracking: newState });
    chrome.runtime.sendMessage({ action: 'toggleTracking', isTracking: newState });
  });

  // Update stats display
  function updateStats(data) {
    // Update total time
    if (data.dailyStats) {
      const today = getToday();
      const todayStats = data.dailyStats[today] || {};
      const totalSeconds = Object.values(todayStats).reduce((sum, time) => sum + time, 0);
      totalTimeElement.textContent = formatTime(totalSeconds);
    }

    // Update tab switches
    tabSwitchesElement.textContent = data.tabSwitches || '0';

    // Update active tabs
    activeTabsElement.textContent = data.activeTabs || '0';

    // Calculate productivity score based on on-task time vs total time
    const today = getToday();
    const onTaskStats = data.onTaskStats && data.onTaskStats[today] ? data.onTaskStats[today] : {};
    const offTaskStats = data.offTaskStats && data.offTaskStats[today] ? data.offTaskStats[today] : {};
    
    const onTaskTime = Object.values(onTaskStats).reduce((sum, time) => sum + time, 0);
    const offTaskTime = Object.values(offTaskStats).reduce((sum, time) => sum + time, 0);
    const totalTrackedTime = onTaskTime + offTaskTime;
    
    let score = 100; // Default to 100% if no data
    let message = "Set a goal and start browsing to see your focus score! 🎯";
    
    if (totalTrackedTime > 0) {
      score = Math.round((onTaskTime / totalTrackedTime) * 100);
      
      if (score >= 80) {
        message = "Excellent focus! You're crushing your goals! 🔥";
      } else if (score >= 60) {
        message = "Good work! Stay focused on your task 💪";
      } else if (score >= 40) {
        message = "Getting distracted? Try to refocus on your goal 🎯";
      } else {
        message = "Lots of distractions detected. Time to refocus! 🐝";
      }
    }
    
    productivityScore.textContent = `${score}%`;
    progressFill.style.width = `${score}%`;
    
    // Update the productivity message
    const productivityMessage = document.querySelector('.productivity-message');
    if (productivityMessage) {
      productivityMessage.textContent = message;
    }
  }

  // Update sites list
  function updateSitesList(dailyStats) {
    sitesList.innerHTML = '';
    
    if (!dailyStats || Object.keys(dailyStats).length === 0) {
      sitesList.innerHTML = '<div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px;">No sites tracked yet today</div>';
      return;
    }

    // Sort sites by time spent
    const sortedSites = Object.entries(dailyStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4); // Show top 4 sites

    const totalTime = Object.values(dailyStats).reduce((sum, time) => sum + time, 0);

    sortedSites.forEach(([site, time], index) => {
      const percentage = totalTime > 0 ? Math.round((time / totalTime) * 100) : 0;
      const colorClass = siteColors[index % siteColors.length];

      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';
      siteItem.innerHTML = `
        <div class="site-color ${colorClass}"></div>
        <div class="site-details">
          <div class="site-row">
            <div class="site-name">${site}</div>
            <div class="site-time">${formatTime(time)}</div>
          </div>
          <div class="site-progress">
            <div class="site-progress-fill ${colorClass}" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
      sitesList.appendChild(siteItem);
    });
  }

  // Handle clear data button
  clearDataBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all tracking data?')) {
      chrome.storage.local.clear(function() {
        // Reset UI
        totalTimeElement.textContent = '0h 0m';
        tabSwitchesElement.textContent = '0';
        activeTabsElement.textContent = '0';
        productivityScore.textContent = '100%';
        progressFill.style.width = '100%';
        sitesList.innerHTML = '<div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px;">No sites tracked yet today</div>';
        
        // Reset tracking state and show goal prompt
        chrome.storage.local.set({ isTracking: true });
        updateTrackingUI(true);
        
        // Return to goal setting
        goalSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
        goalInput.value = '';
      });
    }
  });

  // Handle view details button
  viewDetailsBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('details.html') });
  });

  // Handle settings button
  settingsBtn.addEventListener('click', function() {
    // For now, just show an alert - you can implement a settings page later
    alert('Settings coming soon! 🛠️');
  });

  // Listen for updates from background script
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'updateStats') {
      updateStats(message.data);
      const today = getToday();
      updateSitesList(message.data.dailyStats && message.data.dailyStats[today] ? message.data.dailyStats[today] : {});
    }
  });
}); 