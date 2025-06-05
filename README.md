# 🐝 Beezy - Smart Productivity Tracker

A beautiful Chrome extension that helps you stay focused and productive with AI-powered insights.

## Features

✨ **Smart Productivity Tracking** - AI determines if sites are on-task or off-task based on your goals
🎯 **Goal-Setting Workflow** - Set daily goals and get focus reminders  
📊 **Real-time Analytics** - Track time spent, tab switches, and productivity scores
🐝 **Beautiful Custom UI** - Modern design with custom bee branding
⚡ **LLM Integration** - OpenAI-powered focus suggestions and task classification
🔔 **Smart Notifications** - Gentle reminders to stay on track (60s cooldown)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/HarshaKosuri/188Project.git
cd 188Project
```

### 2. Configure OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open `background.js`
3. Find the line: `const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";`
4. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual API key

### 3. Install Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the project folder
5. Beezy should now appear in your Chrome toolbar! 🐝

## How to Use

1. **Set Your Goal**: Click the Beezy icon and enter what you're working on
2. **Start Tracking**: Toggle tracking on to monitor your productivity
3. **Stay Focused**: Beezy will analyze your browsing and give you insights
4. **Check Progress**: View your productivity score and time breakdowns
5. **Get Reminders**: Receive gentle focus nudges when needed

## File Structure

```
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.js              # Popup functionality
├── background.js         # Background tracking & AI logic
├── details.html          # Detailed analytics page
├── details.js            # Details page functionality  
├── content.js            # Content script (placeholder)
└── images/              # Custom bee logos and icons
    ├── beezy-logo-16.png   # 16x16 icon
    ├── beezy-logo-48.png   # 48x48 icon
    ├── beezy-logo-128.png  # 128x128 icon
    ├── happy_bee.png       # on-task notif icon
    ├── angry_bee.png       # off-task notif icon
    ├── confused_bee.png    # tab switch to off-task notif icon
    └── logo.png            # bee logo transparent background
```

## Technologies Used

- **Vanilla JavaScript** - Core functionality
- **Chrome Extensions API** - Browser integration
- **OpenAI GPT-3.5** - AI-powered task classification
- **HTML/CSS** - Modern UI with gradients & animations
- **Chrome Storage API** - Data persistence

## Development

The extension uses:
- 10-second intervals for time tracking
- 60-second cooldowns for LLM API calls to prevent rate limiting
- Local storage for caching LLM responses
- Real-time productivity scoring based on on-task vs off-task time

## Privacy

- All data stored locally in Chrome storage
- OpenAI API calls only include goal and URL domain
- No personal data transmitted or stored externally

## Contributing

Feel free to submit issues and pull requests! This is a class project but open for improvements.

---

Made with 🐝 and lots of ☕ for Stanford CS 188
