# 🚀 NaturalWeb - Quick Reference Card

## Essential Commands

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit both files with your credentials

# 3. Start PostgreSQL (Docker)
docker run --name naturalweb-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=naturalweb \
  -p 5432:5432 -d postgres:15-alpine

# 4. Initialize database
cd apps/api && npx prisma generate && npx prisma db push && cd ../..

# 5. Start development
npm run dev
```

### Daily Development
```bash
# Start everything
npm run dev

# Or individually:
npm run dev --workspace=@naturalweb/api   # Terminal 1
npm run dev --workspace=@naturalweb/web   # Terminal 2
npm run dev --workspace=@naturalweb/extension  # Terminal 3
```

## Key URLs

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3000 | Main interface |
| API | http://localhost:3001 | Backend server |
| Health Check | http://localhost:3001/health | API status |
| DB Studio | Run `cd apps/api && npx prisma studio` | Visual DB editor |

## File Locations

```
📁 Important Files
├── 🔐 apps/api/.env                    # API configuration
├── 🔐 apps/web/.env.local              # Web app config
├── 🗄️  apps/api/prisma/schema.prisma  # Database schema
├── 🎨 apps/web/src/app/page.tsx       # Main web page
├── 🧩 apps/extension/manifest.json    # Extension config
└── 📚 README.md                        # Full documentation
```

## Environment Variables Needed

### apps/api/.env
```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/naturalweb
OPENAI_API_KEY=sk-your-key-here
CORS_ORIGINS=http://localhost:3000,chrome-extension://*
```

### apps/web/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Common Tasks

### Database
```bash
cd apps/api

# View database
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Create migration
npx prisma migrate dev --name your_change

# Generate client
npx prisma generate
```

### Code Quality
```bash
# Type check all projects
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Building
```bash
# Build everything
npm run build

# Build specific app
npm run build --workspace=@naturalweb/web
npm run build --workspace=@naturalweb/api
npm run build --workspace=@naturalweb/extension
```

### Extension
```bash
# Build extension
npm run build --workspace=@naturalweb/extension

# Load in Chrome
# 1. chrome://extensions/
# 2. Developer mode ON
# 3. Load unpacked → apps/extension/dist

# Load in Firefox
# 1. about:debugging#/runtime/this-firefox
# 2. Load Temporary Add-on
# 3. Select apps/extension/dist/manifest.json
```

## Example Commands to Try

| Command | Effect |
|---------|--------|
| "Click on the login button" | Finds and clicks login button |
| "Fill email with test@example.com" | Fills email field |
| "Scroll to the bottom" | Scrolls page down |
| "Navigate to pricing page" | Goes to /pricing |
| "Extract all headings" | Gets all h1-h6 text |

## API Endpoints

```bash
# Execute command
curl -X POST http://localhost:3001/api/commands \
  -H "Content-Type: application/json" \
  -d '{"command":"Click on submit","url":"https://example.com"}'

# Get metrics
curl http://localhost:3001/api/metrics

# Get command history
curl http://localhost:3001/api/metrics/history?limit=10
```

## Troubleshooting One-Liners

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9  # Web
lsof -ti:3001 | xargs kill -9  # API

# Check PostgreSQL
pg_isready                      # Local
docker ps | grep naturalweb     # Docker

# Clean rebuild
rm -rf node_modules package-lock.json && npm install

# Reset Prisma
cd apps/api && rm -rf node_modules/.prisma && npx prisma generate
```

## Docker Quick Start

```bash
# Start everything with Docker
export OPENAI_API_KEY=your-key
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild
docker-compose up -d --build
```

## Project Structure Quick Map

```
naturalweb/
├── apps/
│   ├── web/           → Next.js (Port 3000)
│   ├── extension/     → Chrome/Firefox extension
│   └── api/           → Express API (Port 3001)
├── packages/
│   ├── shared/        → Types & utilities
│   └── ui/            → React components
└── docs/              → Documentation
```

## Key Technologies

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 15, Prisma 5
- **AI/NLP**: OpenAI GPT-4
- **Automation**: Playwright
- **Build**: Turbo (monorepo), Webpack (extension)

## Quick Links

- 📖 [Full README](./README.md)
- 🚀 [Quick Start](./QUICKSTART.md)
- 🛠️ [Setup Guide](./docs/SETUP.md)
- 🚢 [Deployment](./docs/DEPLOYMENT.md)
- 📝 [Project Summary](./PROJECT_SUMMARY.md)

## Get API Key

OpenAI: https://platform.openai.com/api-keys

## Need Help?

1. Check logs in terminal
2. Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
3. Read error messages carefully
4. Check environment variables
5. Try clean rebuild

---

**💡 Tip**: Bookmark this file for quick reference!
