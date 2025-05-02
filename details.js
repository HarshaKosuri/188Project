// Initialize Chart.js
const ctx = document.getElementById('timeChart').getContext('2d');
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

// Get DOM elements
const timePeriodSelect = document.getElementById('timePeriod');
const totalTimeElement = document.getElementById('totalTime');
const tabSwitchesElement = document.getElementById('tabSwitches');
const uniqueDomainsElement = document.getElementById('uniqueDomains');
const domainListElement = document.getElementById('domainList');

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadData('today');
});

// Handle time period changes
timePeriodSelect.addEventListener('change', function() {
  loadData(this.value);
});

// Load data based on selected time period
function loadData(period) {
  chrome.storage.local.get(['dailyStats', 'tabSwitches'], function(result) {
    const stats = result.dailyStats || {};
    const tabSwitches = result.tabSwitches || 0;
    
    let filteredStats = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Filter stats based on selected period
    Object.keys(stats).forEach(date => {
      if (period === 'today' && date === today) {
        filteredStats[date] = stats[date];
      } else if (period === 'week') {
        const dateObj = new Date(date);
        const todayObj = new Date(today);
        const diffTime = Math.abs(todayObj - dateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          filteredStats[date] = stats[date];
        }
      } else if (period === 'month') {
        const dateObj = new Date(date);
        const todayObj = new Date(today);
        const diffTime = Math.abs(todayObj - dateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          filteredStats[date] = stats[date];
        }
      }
    });
    
    updateUI(filteredStats, tabSwitches);
  });
}

// Update UI with filtered data
function updateUI(stats, tabSwitches) {
  // Calculate total time and unique domains
  let totalMinutes = 0;
  let uniqueDomains = new Set();
  let domainTimes = {};
  
  Object.values(stats).forEach(dayStats => {
    Object.entries(dayStats).forEach(([domain, minutes]) => {
      totalMinutes += minutes;
      uniqueDomains.add(domain);
      domainTimes[domain] = (domainTimes[domain] || 0) + minutes;
    });
  });
  
  // Update total time
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  totalTimeElement.textContent = `${hours}h ${minutes}m`;
  
  // Update tab switches
  tabSwitchesElement.textContent = tabSwitches;
  
  // Update unique domains
  uniqueDomainsElement.textContent = uniqueDomains.size;
  
  // Update chart
  const sortedDomains = Object.entries(domainTimes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  chart.data.labels = sortedDomains.map(([domain]) => domain);
  chart.data.datasets[0].data = sortedDomains.map(([, minutes]) => minutes);
  chart.update();
  
  // Update domain list
  updateDomainList(domainTimes);
}

// Update domain list
function updateDomainList(domainTimes) {
  domainListElement.innerHTML = '';
  
  const sortedDomains = Object.entries(domainTimes)
    .sort(([, a], [, b]) => b - a);
  
  sortedDomains.forEach(([domain, minutes]) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    
    const domainItem = document.createElement('div');
    domainItem.className = 'domain-item';
    domainItem.innerHTML = `
      <span class="domain-name">${domain}</span>
      <span class="domain-time">${timeString}</span>
    `;
    
    domainListElement.appendChild(domainItem);
  });
} 