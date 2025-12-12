# Natural Language Website Interaction API

This API allows you to interact with websites using natural language commands. It combines GPT-4 for command interpretation with Playwright for browser automation.

## Features

- 🎯 **Natural Language Processing**: Uses GPT-4 to understand user intent
- 🤖 **Smart Element Detection**: Automatically finds elements without requiring selectors
- 🔄 **Session Management**: Maintain browser sessions for sequential interactions
- 📸 **Screenshots**: Capture page states for visual feedback
- 🎭 **Multi-Step Commands**: Execute complex workflows from a single command
- 🌐 **Context-Aware**: Understands page context for better element detection

## Supported Actions

- **navigate**: Go to a URL
- **click**: Click on buttons, links, or any clickable element
- **fill**: Fill in forms, search boxes, or text inputs
- **extract**: Extract data from the page
- **scroll**: Scroll in different directions
- **screenshot**: Capture screenshots
- **select**: Select from dropdowns
- **hover**: Hover over elements
- **press**: Press keyboard keys
- **wait**: Wait for specified duration

## API Endpoints

### 1. Create Session

Start a new browser session for continuous interactions.

```bash
POST /api/commands/session
```

**Response:**
```json
{
  "sessionId": "uuid-here",
  "context": {
    "url": "about:blank",
    "title": ""
  },
  "success": true
}
```

### 2. Execute Command

Execute a natural language command.

```bash
POST /api/commands
```

**Request Body:**
```json
{
  "command": "go to google.com and search for laptops",
  "url": "https://google.com",
  "sessionId": "uuid-here",
  "useContext": true
}
```

**Response:**
```json
{
  "interpretation": {
    "action": "multi-step",
    "steps": [
      {
        "action": "navigate",
        "value": "https://google.com",
        "executable": true,
        "confidence": 1.0
      },
      {
        "action": "fill",
        "target": "search box",
        "value": "laptops",
        "executable": true,
        "confidence": 0.95
      }
    ],
    "executable": true,
    "confidence": 0.95
  },
  "result": {
    "action": "multi-step",
    "steps": [...],
    "success": true
  },
  "success": true
}
```

### 3. Get Page Context

Get information about the current page in a session.

```bash
GET /api/commands/session/:sessionId/context
```

**Response:**
```json
{
  "context": {
    "url": "https://example.com",
    "title": "Example Page",
    "availableElements": [
      {
        "type": "button",
        "text": "Submit",
        "id": "submit-btn"
      }
    ]
  },
  "success": true
}
```

### 4. Close Session

Close a browser session.

```bash
DELETE /api/commands/session/:sessionId
```

## Example Commands

### Simple Navigation
```json
{
  "command": "go to reddit.com"
}
```

### Click Elements
```json
{
  "command": "click the login button"
}
```

### Fill Forms
```json
{
  "command": "fill the email field with test@example.com"
}
```

### Search
```json
{
  "command": "search for electric cars"
}
```

### Extract Data
```json
{
  "command": "extract all product titles"
}
```

### Multi-Step Workflow
```json
{
  "command": "go to amazon.com, search for headphones, and click the first result"
}
```

### Take Screenshot
```json
{
  "command": "take a screenshot"
}
```

## Usage Examples

### Using cURL

```bash
# Create a session
SESSION=$(curl -X POST http://localhost:3001/api/commands/session | jq -r '.sessionId')

# Execute commands
curl -X POST http://localhost:3001/api/commands \
  -H "Content-Type: application/json" \
  -d "{
    \"command\": \"go to github.com\",
    \"sessionId\": \"$SESSION\"
  }"

curl -X POST http://localhost:3001/api/commands \
  -H "Content-Type: application/json" \
  -d "{
    \"command\": \"search for playwright\",
    \"sessionId\": \"$SESSION\",
    \"useContext\": true
  }"

# Close session
curl -X DELETE http://localhost:3001/api/commands/session/$SESSION
```

### Using JavaScript/Fetch

```javascript
// Create session
const sessionRes = await fetch('http://localhost:3001/api/commands/session', {
  method: 'POST'
});
const { sessionId } = await sessionRes.json();

// Execute command
const commandRes = await fetch('http://localhost:3001/api/commands', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'go to google.com and search for AI',
    sessionId,
    useContext: true
  })
});

const result = await commandRes.json();
console.log(result);

// Close session
await fetch(`http://localhost:3001/api/commands/session/${sessionId}`, {
  method: 'DELETE'
});
```

### Using Python

```python
import requests

# Create session
session_resp = requests.post('http://localhost:3001/api/commands/session')
session_id = session_resp.json()['sessionId']

# Execute command
command_resp = requests.post('http://localhost:3001/api/commands', json={
    'command': 'go to wikipedia.org and search for artificial intelligence',
    'sessionId': session_id,
    'useContext': True
})

print(command_resp.json())

# Close session
requests.delete(f'http://localhost:3001/api/commands/session/{session_id}')
```

## Environment Variables

Create a `.env` file in the api directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
HEADLESS=false  # Set to 'true' for headless browser
DATABASE_URL=postgresql://user:password@localhost:5432/browsegen
```

## Smart Element Detection

The service automatically tries multiple strategies to find elements:

1. **Text matching**: `text=Login`
2. **Button text**: `button:has-text("Login")`
3. **Link text**: `a:has-text("Login")`
4. **ARIA labels**: `[aria-label*="Login"]`
5. **Titles**: `[title*="Login"]`
6. **Input values**: `input[value*="Login"]`
7. **Placeholders**: `input[placeholder*="search"]`
8. **Name attributes**: `input[name*="email"]`
9. **ID attributes**: `input[id*="username"]`

## Error Handling

The API provides detailed error messages:

```json
{
  "error": "Failed to execute command",
  "message": "Could not find clickable element for: submit button"
}
```

## Performance Tips

1. **Use Sessions**: For multiple commands on the same website, use sessions to avoid browser restarts
2. **Enable Context**: Set `useContext: true` for better element detection
3. **Be Specific**: More specific commands get better results ("click the blue submit button" vs "click submit")
4. **Headless Mode**: Set `HEADLESS=true` for better performance in production

## Advanced Features

### Custom Selectors

If GPT-4 detection isn't working, you can provide custom selectors:

```json
{
  "command": "click the button",
  "customSelector": "#submit-btn-123"
}
```

### Timeouts

All actions have default timeouts (10s for most actions). Increase if needed:

```json
{
  "command": "wait 5 seconds"
}
```

### Screenshots

Screenshots are saved in `screenshots/` directory:

```json
{
  "command": "take a full page screenshot"
}
```

## Security Considerations

- Never expose this API publicly without authentication
- Use environment variables for sensitive data
- Implement rate limiting in production
- Validate and sanitize all inputs
- Use HTTPS in production

## Troubleshooting

**Command not executing:**
- Check if OpenAI API key is set
- Verify the element exists on the page
- Try more specific commands
- Check browser console logs

**Session expired:**
- Sessions are in-memory and reset on server restart
- Implement session cleanup after inactivity

**Element not found:**
- Use `useContext: true` for better detection
- Provide more specific descriptions
- Check if page has loaded completely

## Next Steps

- Implement authentication/authorization
- Add webhook support for long-running tasks
- Implement session persistence with Redis
- Add support for file uploads/downloads
- Create visual debugging dashboard
