# API Server

Backend API for BrowseGEN - Natural Language Website Interaction Platform.

## 🚀 Features

- **Natural Language Processing**: Interpret user commands with GPT-4
- **Browser Automation**: Execute commands using Playwright
- **Session Management**: Maintain browser sessions for sequential interactions
- **Smart Element Detection**: Automatically find elements without selectors
- **Multi-Step Commands**: Execute complex workflows from single commands
- **Screenshot Capture**: Visual feedback and debugging
- **Metrics & Analytics**: Track command execution and success rates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

4. Set up database:
```bash
npx prisma generate
npx prisma db push
```

## Development

```bash
npm run dev
```

Server runs on http://localhost:3001

## 📖 Documentation

See [NATURAL_LANGUAGE_API.md](./NATURAL_LANGUAGE_API.md) for comprehensive API documentation.

## Quick Start

### Create a Session

```bash
curl -X POST http://localhost:3001/api/commands/session
```

### Execute Commands

```bash
# Simple navigation
curl -X POST http://localhost:3001/api/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "go to google.com"}'

# Search
curl -X POST http://localhost:3001/api/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "search for artificial intelligence", "sessionId": "your-session-id"}'

# Click elements
curl -X POST http://localhost:3001/api/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "click the login button"}'
```

## API Endpoints

### Commands
- `POST /api/commands/session` - Create a new browser session
- `POST /api/commands` - Execute a natural language command
- `GET /api/commands/session/:sessionId/context` - Get page context
- `DELETE /api/commands/session/:sessionId` - Close a session

### Metrics
- `GET /api/metrics` - Get metrics summary
- `GET /api/metrics/history` - Get command history

## Example Commands

```javascript
// Navigate
"go to reddit.com"
"navigate to github.com"

// Click
"click the login button"
"click on the first result"

// Fill forms
"fill the email field with test@example.com"
"type my name in the username box"

// Search
"search for laptops"
"find wireless headphones"

// Extract data
"extract all product titles"
"get all the links on this page"

// Screenshots
"take a screenshot"
"capture the page"

// Multi-step
"go to amazon.com, search for books, and click the first result"
```

## Testing

Run the example tests:

```bash
npx ts-node examples/test-nlp-service.ts
```

## Environment Variables

See `.env.example` for required environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - API server port (default: 3001)
- `HEADLESS` - Run browser in headless mode (default: false)
- `DATABASE_URL` - PostgreSQL connection string

## Project Structure

```
src/
├── index.ts              # Express server setup
├── routes/
│   ├── commands.ts       # Command execution endpoints
│   └── metrics.ts        # Metrics endpoints
└── services/
    ├── nlp.ts           # GPT-4 command interpretation
    ├── automation.ts    # Playwright browser automation
    └── metrics.ts       # Metrics logging
```

## Development Tips

1. **Use Sessions**: For multiple commands on the same website, create a session to avoid browser restarts
2. **Enable Context**: Set `useContext: true` for better element detection
3. **Be Specific**: More specific commands yield better results
4. **Debugging**: Set `HEADLESS=false` to see the browser in action

## Troubleshooting

**"Could not find element":**
- Make sure the element exists on the page
- Try more specific descriptions
- Use `useContext: true` for better detection

**"No response from OpenAI":**
- Check your `OPENAI_API_KEY` in `.env`
- Verify you have API credits

**Playwright errors:**
- Run `npx playwright install` to install browsers
- Check if you have sufficient system resources

## Next Steps

- Add authentication/authorization
- Implement rate limiting
- Add webhook support
- Create session persistence with Redis
- Build visual debugging dashboard
