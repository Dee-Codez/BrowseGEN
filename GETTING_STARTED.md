# Getting Started with NaturalWeb

Welcome! This guide will help you get NaturalWeb up and running.

## What is NaturalWeb?

NaturalWeb allows you to interact with websites using natural language. Instead of clicking through menus and filling forms manually, just describe what you want in plain English.

## Choose Your Path

### 🚀 I want to try it quickly
→ Follow the [Quick Start](./QUICKSTART.md) (5 minutes)

### 💻 I want to develop
→ Read the [Development Setup](./docs/SETUP.md) (15 minutes)

### 🚢 I want to deploy
→ Check the [Deployment Guide](./docs/DEPLOYMENT.md)

### 🔌 I just want the extension
→ Load from `apps/extension/dist` after quick start

## What Can It Do?

### Example Commands

- **Navigation**: "Go to the pricing page"
- **Forms**: "Fill the email field with test@example.com"
- **Clicks**: "Click on the submit button"
- **Data**: "Extract all product names"
- **Scrolling**: "Scroll to the footer"

### Use Cases

1. **Automated Testing**: Write tests in natural language
2. **Data Extraction**: Pull data from websites quickly
3. **Form Filling**: Auto-fill repetitive forms
4. **Web Scraping**: Extract information systematically
5. **Accessibility**: Navigate websites with voice commands

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   Browser   │◄────►│   Extension  │◄────►│     API    │
│             │      │              │      │            │
│   Website   │      │   Popup UI   │      │ NLP Engine │
└─────────────┘      └──────────────┘      └────────────┘
                                                   ▲
                     ┌──────────────┐             │
                     │   Web App    │◄────────────┘
                     │              │
                     │  Dashboard   │      ┌────────────┐
                     └──────────────┘      │  Database  │
                            │              │            │
                            └──────────────►│  Metrics   │
                                            └────────────┘
```

## Core Components

### 1. Web Application
- Built with Next.js 14
- Command interface
- Analytics dashboard
- Real-time metrics

### 2. Browser Extension
- Works in Chrome & Firefox
- Popup for commands
- Content scripts for page interaction
- Floating action button

### 3. Backend API
- Express.js server
- OpenAI GPT integration
- Playwright automation
- PostgreSQL database

### 4. Shared Packages
- Common types
- Utilities
- UI components

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **AI**: OpenAI GPT-4
- **Automation**: Playwright
- **Extension**: Chrome Extension API
- **Deployment**: Docker, Vercel, Cloud Run

## Project Structure

```
naturalweb/
├── apps/
│   ├── web/           # Next.js web app
│   ├── extension/     # Browser extension
│   └── api/           # Backend server
├── packages/
│   ├── shared/        # Shared types & utils
│   └── ui/            # UI components
├── docs/              # Documentation
└── .github/           # CI/CD workflows
```

## Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 15+
- **OpenAI API Key**
- Git

Optional:
- Docker Desktop
- VS Code

## Quick Commands

```bash
# Install everything
npm install

# Start development
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Format code
npm run format

# Clean build artifacts
npm run clean
```

## First Steps

1. ✅ Complete [Quick Start](./QUICKSTART.md)
2. 📚 Read [Setup Guide](./docs/SETUP.md)
3. 🔧 Try [Examples](./docs/EXAMPLES.md)
4. 💡 Check [API Docs](./docs/API.md)
5. 🚀 Review [Deployment](./docs/DEPLOYMENT.md)

## Common Issues

### Can't connect to database
→ Make sure PostgreSQL is running: `pg_isready`

### Port already in use
→ Kill the process: `lsof -ti:3000 | xargs kill -9`

### OpenAI API errors
→ Verify your API key has credits

### Extension not loading
→ Rebuild: `npm run build --workspace=@naturalweb/extension`

## Getting Help

- 📖 Check the [FAQ](./docs/FAQ.md)
- 🐛 Open an issue on GitHub
- 💬 Join our Discord
- 📧 Email: support@naturalweb.app

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT License - see [LICENSE](./LICENSE)

## What's Next?

After getting everything running:

1. **Customize**: Modify the UI, add features
2. **Extend**: Add new command types
3. **Integrate**: Connect to other services
4. **Deploy**: Put it in production
5. **Share**: Publish your extension

---

**Ready to start?** → [Quick Start](./QUICKSTART.md)
