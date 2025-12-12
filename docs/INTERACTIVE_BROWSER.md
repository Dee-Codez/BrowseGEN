# Interactive Browser Control - Setup Guide

## 🎯 Overview

You can now control a **real browser** using natural language and see it execute commands in real-time! The browser runs visibly on the server, and you can:

- Watch AI agent actions with visual highlights
- See live activity logs via WebSocket
- Intervene manually using Chrome DevTools
- Execute commands and see instant results

## 🚀 Quick Start

### 1. Start the API Server

```bash
cd apps/api
npm run dev
```

The server will start on `http://localhost:3001` with:
- REST API endpoints
- WebSocket server at `ws://localhost:3001/ws`
- Swagger docs at `http://localhost:3001/api/docs`

### 2. Start the Web App

```bash
cd apps/web
npm run dev
```

Visit `http://localhost:3000/interactive` to access the interactive browser control interface.

### 3. Create a Browser Session

1. Click **"Create Browser Session"**
2. A real Chrome browser window will open on your computer (server)
3. You'll see the debug URL in the interface

### 4. Execute Commands

Type natural language commands like:
- `"go to google.com"`
- `"search for artificial intelligence"`
- `"click the first result"`
- `"scroll down"`
- `"take a screenshot"`

## 🎬 How It Works

### Architecture

```
Frontend (React)
    ↓ WebSocket
WebSocket Server
    ↓
Automation Service (Playwright)
    ↓
Real Chrome Browser (Visible, with Remote Debugging)
```

### Features

1. **Headful Browser**: Browser runs in visible mode (not headless)
2. **Remote Debugging**: Chrome launched with `--remote-debugging-port=9222`
3. **Visual Highlights**: Elements are highlighted before interaction
4. **WebSocket Updates**: Real-time action logs streamed to frontend
5. **Manual Intervention**: Open DevTools to interact directly

## 📡 API Endpoints

### Create Session
```bash
POST /api/commands/session
```

Response:
```json
{
  "sessionId": "uuid",
  "context": {
    "url": "about:blank",
    "title": "",
    "debugUrl": "http://localhost:9222",
    "wsUrl": "ws://localhost:9222/devtools/page/..."
  }
}
```

### Execute Command
```bash
POST /api/commands
Content-Type: application/json

{
  "command": "go to google.com and search for AI",
  "sessionId": "uuid",
  "useContext": true
}
```

### Close Session
```bash
DELETE /api/commands/session/:sessionId
```

## 🔌 WebSocket Events

Connect to `ws://localhost:3001/ws` and subscribe:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.send(JSON.stringify({ 
  type: 'subscribe', 
  sessionId: 'your-session-id' 
}));

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'action':    // AI is performing an action
    case 'log':       // Activity log message
    case 'complete':  // Command completed
    case 'error':     // Error occurred
  }
};
```

## 🖥️ Intervening Manually

### Option 1: Click "Open Browser DevTools"

The frontend provides a link to open Chrome DevTools in a new tab. This gives you:
- Full access to the browser's DOM
- Console to run JavaScript
- Network tab to see requests
- Ability to manually click/type while AI is running

### Option 2: Direct DevTools URL

Open `http://localhost:9222` in Chrome to see all debuggable pages and select the one you want to interact with.

## 🎨 Visual Highlights

When the AI performs actions, elements are automatically highlighted:
- **Red outline**: Element about to be interacted with
- **Red background**: Semi-transparent highlight
- **Duration**: 800ms before action executes

This is implemented in the `highlightElement` function:

```typescript
await page.evaluate((selector) => {
  const element = document.querySelector(selector);
  element.style.outline = '3px solid #ff6b6b';
  element.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
}, selector);
```

## 📝 Example Commands

### Navigation
- `"go to reddit.com"`
- `"navigate to github.com"`
- `"visit wikipedia.org"`

### Search
- `"search for machine learning"`
- `"type 'electric cars' in the search box"`
- `"find wireless headphones"`

### Interaction
- `"click the login button"`
- `"click on the first result"`
- `"fill the email field with test@example.com"`

### Multi-Step
- `"go to amazon.com, search for books, and click the first result"`
- `"navigate to google.com, search for AI, and scroll down"`

### Utility
- `"scroll down"`
- `"scroll to top"`
- `"take a screenshot"`
- `"wait 3 seconds"`

## 🛠️ Configuration

### Environment Variables (.env)

```env
PORT=3001
OPENAI_API_KEY=your-key-here
DATABASE_URL=postgresql://...
```

### Browser Options

The browser is launched with these settings:

```typescript
chromium.launch({
  headless: false,  // Visible browser
  args: [
    '--remote-debugging-port=9222',
    '--remote-allow-origins=*',
    '--no-sandbox'
  ]
})
```

To change the debug port, update the `debugPort` variable in `automation.ts`.

## 🔒 Security Notes

⚠️ **Important**: This setup is for development only!

- Browser runs with remote debugging enabled
- No authentication on debug endpoints
- Do NOT expose port 9222 publicly
- Do NOT use in production without proper security

## 🐛 Troubleshooting

### Browser doesn't open
- Check if Playwright browsers are installed: `npx playwright install chromium`
- Ensure no other process is using port 9222
- Check server logs for errors

### WebSocket not connecting
- Verify API server is running
- Check browser console for WebSocket errors
- Ensure firewall allows WebSocket connections

### Commands not executing
- Check if OPENAI_API_KEY is set in .env
- Verify the element exists on the page
- Use more specific commands
- Check the activity log for errors

### Can't see the browser
- The browser opens on the server machine
- If running remotely (e.g., cloud server), you'll need VNC/remote desktop
- For remote access, consider using `xvfb` with VNC

## 🚀 Advanced Usage

### Using CDP directly

You can connect to the browser using Chrome DevTools Protocol:

```javascript
const CDP = require('chrome-remote-interface');

const client = await CDP({ port: 9222 });
const { Network, Page, DOM } = client;

await Network.enable();
await Page.enable();

// Your custom CDP commands
```

### Recording Sessions

Add this to capture all actions:

```typescript
// In automation.ts
await page.video({ 
  dir: './recordings/',
  size: { width: 1920, height: 1080 }
});
```

### Custom Highlighting

Modify the `highlightElement` function to customize appearance:

```typescript
htmlEl.style.outline = '5px solid blue';  // Change color
htmlEl.style.animation = 'pulse 1s infinite';  // Add animation
```

## 📚 Next Steps

- [ ] Add authentication to protect debug endpoints
- [ ] Implement session recording/playback
- [ ] Add voice control integration
- [ ] Create browser session sharing
- [ ] Add collaborative control (multiple users)
- [ ] Implement browser pool for multiple sessions
- [ ] Add VNC/noVNC for remote visual access

## 🎓 Learn More

- [Playwright Documentation](https://playwright.dev)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
