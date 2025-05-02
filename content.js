// Content script for Chrome extension
// This script runs in the context of web pages

console.log("Background service worker loaded");
console.log('Chrome Extension Content Script loaded');
console.log("Service worker is alive!");

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Content script received message:", message);
  
  // Handle Feature 1 action
  if (message.action === "feature1") {
    // Example: Highlight all headings on the page
    const headings = document.querySelectorAll('h1, h2, h3');
    const originalColors = [];
    
    headings.forEach(heading => {
      originalColors.push(heading.style.backgroundColor);
      heading.style.backgroundColor = '#ffff99';
    });
    
    // Revert after 2 seconds
    setTimeout(() => {
      headings.forEach((heading, index) => {
        heading.style.backgroundColor = originalColors[index];
      });
    }, 2000);
    
    sendResponse({message: `Highlighted ${headings.length} headings on the page!`});
  }
  
  // Handle context menu action
  else if (message.action === "contextMenu") {
    if (message.selectedText) {
      // Example: Search for selected text on the page
      const searchText = message.selectedText;
      const textNodes = [];
      const walker = document.createTreeWalker(
        document.body, 
        NodeFilter.SHOW_TEXT, 
        null, 
        false
      );
      
      let node;
      let count = 0;
      
      // Find all text nodes containing the search text
      while (node = walker.nextNode()) {
        if (node.nodeValue.includes(searchText)) {
          textNodes.push(node);
          count++;
        }
      }
      
      // Highlight the first 10 instances
      const maxHighlights = Math.min(10, count);
      for (let i = 0; i < maxHighlights; i++) {
        const node = textNodes[i];
        const content = node.nodeValue;
        const parts = content.split(searchText);
        
        if (parts.length > 1) {
          const span = document.createElement('span');
          span.innerHTML = parts.join(`<span style="background-color: #ffff99; font-weight: bold;">${searchText}</span>`);
          
          node.parentNode.replaceChild(span, node);
        }
      }
      
      // Create a notification element
      const notification = document.createElement('div');
      notification.textContent = `Found ${count} instances of "${searchText}" (highlighted ${maxHighlights})`;
      notification.style.position = 'fixed';
      notification.style.top = '10px';
      notification.style.right = '10px';
      notification.style.backgroundColor = '#4285f4';
      notification.style.color = 'white';
      notification.style.padding = '10px';
      notification.style.borderRadius = '4px';
      notification.style.zIndex = '9999';
      
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  }
});

chrome.tabs.onCreated.addListener(() => {
  console.log("Tab created event fired!");
}); 