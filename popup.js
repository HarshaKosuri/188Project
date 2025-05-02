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

  // Initialize Chart.js
  const ctx = timeChart.getContext('2d');
  let chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Time Spent (minutes)',
        data: [],
        backgroundColor: '#4285f4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Load initial state
  chrome.storage.local.get(['isTracking', 'dailyStats', 'tabSwitches', 'activeTabs'], function(result) {
    // Set tracking toggle state
    trackingToggle.checked = result.isTracking !== false; // Default to true if not set
    
    // Update stats
    updateStats(result);
    
    // Update chart
    updateChart(result.dailyStats);
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
      const totalMinutes = Object.values(data.dailyStats).reduce((sum, time) => sum + time, 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      totalTimeElement.textContent = `${hours}h ${minutes}m`;
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
    const data = Object.values(dailyStats);

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }

  // Listen for updates from background script
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'updateStats') {
      updateStats(message.data);
      updateChart(message.data.dailyStats);
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