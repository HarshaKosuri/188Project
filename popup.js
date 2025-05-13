// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get references to UI elements
  const trackingToggle = document.getElementById('trackingToggle');
  const totalTimeElement = document.getElementById('totalTime');
  const tabSwitchesElement = document.getElementById('tabSwitches');
  const activeTabsElement = document.getElementById('activeTabs');
  const clearDataButton = document.getElementById('clearData');
  const viewDetailsButton = document.getElementById('viewDetails');
  const timeChart = document.getElementById('timeChart');

  // Helper to get today's date string
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  // Define colors for pie chart slices
  const pieChartColors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FFC107', // Amber
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FF5722', // Deep Orange
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#FF9800'  // Orange
  ];

  // Initialize Chart.js
  const ctx = timeChart.getContext('2d');
  let chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        label: 'Time Spent (seconds)',
        data: [],
        backgroundColor: pieChartColors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Scales are not typically used for pie charts
      // scales: {
      //   y: {
      //     beginAtZero: true
      //   }
      // }
    }
  });

  // Load initial state
  chrome.storage.local.get(['isTracking', 'dailyStats', 'tabSwitches', 'activeTabs'], function(result) {
    // Set tracking toggle state
    trackingToggle.checked = result.isTracking !== false; // Default to true if not set
    
    // Update stats
    updateStats(result);
    
    // Update chart
    const today = getToday();
    updateChart(result.dailyStats && result.dailyStats[today] ? result.dailyStats[today] : {});
  });

  // Handle tracking toggle
  trackingToggle.addEventListener('change', function() {
    const isTracking = this.checked;
    chrome.storage.local.set({ isTracking: isTracking });
    
    // Send message to background script
    chrome.runtime.sendMessage({ action: 'toggleTracking', isTracking: isTracking });
  });

  // Handle clear data button
  clearDataButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all tracking data?')) {
      chrome.storage.local.clear(function() {
        // Reset UI
        totalTimeElement.textContent = '0h 0m';
        tabSwitchesElement.textContent = '0';
        activeTabsElement.textContent = '0';
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.update();
        
        // Reset tracking state
        chrome.storage.local.set({ isTracking: true });
        trackingToggle.checked = true;
      });
    }
  });

  // Handle view details button
  viewDetailsButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'details.html' });
  });

  // Function to update stats display
  function updateStats(data) {
    // Update total time
    if (data.dailyStats) {
      const today = getToday();
      const todayStats = data.dailyStats[today] || {};
      const totalSeconds = Object.values(todayStats).reduce((sum, time) => sum + time, 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      // const seconds = totalSeconds % 60; // Optionally, display seconds too
      console.log("[Popup] Calculating Total Time:", 
                  "Raw todayStats (seconds):", JSON.stringify(todayStats),
                  "Total calculated seconds:", totalSeconds, 
                  "Hours:", hours, 
                  "Minutes:", minutes);
      // totalTimeElement.textContent = `${hours}h ${minutes}m`;
      totalTimeElement.textContent = `${totalSeconds} seconds`; // TEMPORARY: Display raw seconds
    }

    // Update tab switches
    tabSwitchesElement.textContent = data.tabSwitches || '0';

    // Update active tabs
    activeTabsElement.textContent = data.activeTabs || '0';
  }

  // Function to update chart
  function updateChart(dailyStats) {
    if (!dailyStats) return;

    const labels = Object.keys(dailyStats);
    const dataValues = Object.values(dailyStats); // Renamed to avoid conflict

    chart.data.labels = labels;
    chart.data.datasets[0].data = dataValues; // Use renamed variable
    chart.update();
  }

  // Listen for updates from background script
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'updateStats') {
      updateStats(message.data);
      const today = getToday();
      // Ensure message.data.dailyStats and message.data.dailyStats[today] exist
      updateChart(message.data.dailyStats && message.data.dailyStats[today] ? message.data.dailyStats[today] : {});
    }
  });

  chrome.tabs.onCreated.addListener(() => {
    console.log("Tab created");
    updateActiveTabs();
  });
  chrome.tabs.onRemoved.addListener(() => {
    console.log("Tab removed");
    updateActiveTabs();
  });
  chrome.tabs.onActivated.addListener(() => {
    console.log("Tab activated");
    // ... rest of your code
  });

  chrome.storage.local.get(null, console.log);
}); 