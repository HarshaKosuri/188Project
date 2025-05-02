# Chrome Productivity Tracker

A Chrome extension that helps users track their browser activity, improve mindfulness, and boost productivity.

## Features

- Track time spent on different websites
- Monitor tab switching behavior
- View daily, weekly, and monthly statistics
- Privacy-focused (all data stored locally)
- Beautiful and intuitive dashboard

## Installation

1. Clone or download this repository
2. Create icon files (see "Creating Icons" section below)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click "Load unpacked" and select the directory containing these files
6. The extension should now appear in your Chrome toolbar

## Creating Icons

The extension requires three icon sizes:
- 16x16 pixels (icon16.png)
- 48x48 pixels (icon48.png)
- 128x128 pixels (icon128.png)

You can create these icons using any image editor (like Photoshop, GIMP, or online tools). Here's a simple design suggestion:

1. Create a square canvas with a light blue background (#4285f4)
2. Add a simple clock or productivity icon in white
3. Save the image in three different sizes
4. Place them in the `images` directory with the following names:
   - `images/icon16.png`
   - `images/icon48.png`
   - `images/icon128.png`

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.js` - Popup functionality
- `background.js` - Background tracking
- `details.html` - Detailed statistics page
- `details.js` - Details page functionality
- `images/` - Directory for extension icons

## Usage

1. Click the extension icon to open the popup
2. Toggle tracking on/off using the switch
3. View your daily statistics in the popup
4. Click "View Details" for more comprehensive statistics
5. Use the time period selector to view different time ranges

## Privacy

All data is stored locally in your browser. No data is sent to any servers or third parties.

## Development

To modify the extension:
1. Make changes to the relevant files
2. Reload the extension in Chrome (click the refresh icon in chrome://extensions/)
3. Test your changes

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Overview](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/) 