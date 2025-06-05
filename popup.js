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

  // List of productive sites
  const productiveSites = [
    'github.com',
    'docs.google.com',
    'stackoverflow.com',
    'vercel.com',
    'notion.so',
    'linear.app',
    'figma.com',
    'leetcode.com',
    'developer.mozilla.org'
  ];

  // Color scheme for pie chart
  const pieColors = {
    productive: '#4CAF50',  // Green
    unproductive: '#F44336' // Red
  };

  // Initialize pie chart
  let sitesPieChart = null;
  let activeCategory = null;

  function initializePieChart() {
    const canvas = document.getElementById('sitesPieChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    sitesPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Productive', 'Unproductive'],
        datasets: [{
          data: [0, 0],
          backgroundColor: [pieColors.productive, pieColors.unproductive],
          borderWidth: 0,
          borderRadius: 3,
          spacing: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        onClick: function(event, elements) {
          if (elements.length > 0) {
            const index = elements[0].index;
            const category = this.data.labels[index];
            showDetailedBreakdown(category);
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            position: 'nearest',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${formatTime(value)} (${percentage}%)`;
              }
            }
          }
        },
        onHover: function(event, elements) {
          const chartArea = this.chartArea;
          if (!chartArea) return;
          
          // Only trigger if mouse is within chart area
          if (event.x >= chartArea.left && 
              event.x <= chartArea.right && 
              event.y >= chartArea.top && 
              event.y <= chartArea.bottom) {
            
            if (elements.length > 0) {
              const index = elements[0].index;
              const category = this.data.labels[index];
              if (activeCategory !== category) {
                activeCategory = category;
                updateSitesListForCategory(category);
              }
            } else if (activeCategory !== null) {
              activeCategory = null;
              showHoverInstruction();
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        }
      }
    });
  }

  // Store current sites data
  let currentSitesData = [];

  // Helper function to get sites for a category
  function getSitesForCategory(category, sitesData) {
    return sitesData.filter(site => {
      const isProductive = productiveSites.includes(site.site);
      return category.toLowerCase() === (isProductive ? 'productive' : 'unproductive');
    }).sort((a, b) => b.time - a.time);
  }

  function showHoverInstruction() {
    sitesList.innerHTML = '<div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 10px;">Hover over chart sections to see website details</div>';
  }

  function updateSitesListForCategory(category) {
    const sites = getSitesForCategory(category, currentSitesData);
    const totalTime = sites.reduce((sum, site) => sum + site.time, 0);
    
    sitesList.innerHTML = `
      <div class="category-header">
        <span class="category-icon">${category === 'Productive' ? '✓' : '×'}</span>
        <span class="category-title">${category} Sites</span>
      </div>
      <div class="sites-container">
        ${sites.map((site, index) => {
          const percentage = Math.round((site.time / totalTime) * 100);
          const colorSet = category.toLowerCase() === 'productive' ? siteColors.productive : siteColors.unproductive;
          const color = colorSet[index % colorSet.length];
          
          return `
            <div class="site-item">
              <div class="site-color" style="background-color: ${color}"></div>
              <div class="site-details">
                <div class="site-row">
                  <div class="site-name">${site.site}</div>
                  <div class="site-time">${formatTime(site.time)}</div>
                </div>
                <div class="site-progress">
                  <div class="site-progress-fill" style="background-color: ${color}; width: ${percentage}%"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

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
    // Initialize pie chart if not already done
    if (!sitesPieChart) {
      initializePieChart();
    }
    
    chrome.storage.local.get(['isTracking', 'dailyStats', 'onTaskStats', 'offTaskStats', 'tabSwitches', 'activeTabs'], function(result) {
      // Set tracking toggle state
      const isTracking = result.isTracking !== false;
      updateTrackingUI(isTracking);
      
      // Update stats
      updateStats(result);
      
      // Update sites list and pie chart
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
    if (!dailyStats || Object.keys(dailyStats).length === 0) {
      sitesList.innerHTML = '<div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px;">No sites tracked yet today</div>';
      
      if (sitesPieChart) {
        sitesPieChart.data.datasets[0].data = [0, 0];
        sitesPieChart.update();
      }
      return;
    }

    // Convert stats to array of site objects
    currentSitesData = Object.entries(dailyStats).map(([site, time]) => ({
      site,
      time,
      isProductive: productiveSites.includes(site)
    }));

    // Calculate totals
    const productiveTime = currentSitesData
      .filter(site => site.isProductive)
      .reduce((sum, site) => sum + site.time, 0);
    
    const unproductiveTime = currentSitesData
      .filter(site => !site.isProductive)
      .reduce((sum, site) => sum + site.time, 0);

    // Update pie chart
    if (sitesPieChart) {
      sitesPieChart.data.datasets[0].data = [productiveTime, unproductiveTime];
      sitesPieChart.update();
    }

    // Show hover instruction initially
    showHoverInstruction();
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

  function showDetailedBreakdown(category) {
    // Remove any existing modal
    const existingModal = document.querySelector('.breakdown-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const sites = getSitesForCategory(category, currentSitesData);
    const totalTime = sites.reduce((sum, site) => sum + site.time, 0);
    const totalAllTime = currentSitesData.reduce((sum, site) => sum + site.time, 0);
    const categoryPercentage = Math.round((totalTime / totalAllTime) * 100);
    
    const modal = document.createElement('div');
    modal.className = 'breakdown-modal';
    
    // Create the modal content
    modal.innerHTML = `
      <div class="breakdown-content">
        <div class="breakdown-header">
          <h2>${category} Sites Breakdown</h2>
          <div class="breakdown-summary">
            Total Time: ${formatTime(totalTime)} (${categoryPercentage}% of all activity)
          </div>
          <button class="close-button" type="button">×</button>
        </div>
        <div class="breakdown-sites">
          ${sites.map((site, index) => {
            const percentage = Math.round((site.time / totalTime) * 100);
            const colorSet = category.toLowerCase() === 'productive' ? siteColors.productive : siteColors.unproductive;
            const color = colorSet[index % colorSet.length];
            
            return `
              <div class="breakdown-site-item">
                <div class="site-color" style="background-color: ${color}"></div>
                <div class="site-details">
                  <div class="site-row">
                    <div class="site-name">${site.site}</div>
                    <div class="site-time">${formatTime(site.time)}</div>
                  </div>
                  <div class="site-progress">
                    <div class="site-progress-fill" style="background-color: ${color}; width: ${percentage}%"></div>
                  </div>
                  <div class="site-percentage">${percentage}% of ${category.toLowerCase()} time</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Add the modal to the container element
    const container = document.querySelector('.container') || document.body;
    container.appendChild(modal);

    // Add click handler to close button
    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      container.removeChild(modal);
    });

    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        container.removeChild(modal);
      }
    });
  }
}); 