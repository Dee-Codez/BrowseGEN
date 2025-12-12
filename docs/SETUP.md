# Development Setup Guide

This guide will help you set up the NaturalWeb development environment.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   # Check version
   node --version
   
   # Install via nvm (recommended)
   nvm install 18
   nvm use 18
   ```

2. **PostgreSQL** (v15 or higher)
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Create database
   createdb naturalweb
   ```

3. **Git**
   ```bash
   git --version
   ```

### Optional but Recommended

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
- **Docker Desktop** (for containerized development)

## Step-by-Step Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd naturalweb
npm install
```

### 2. Configure Environment Variables

#### API Configuration
```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env`:
```env
PORT=3001
DATABASE_URL=postgresql://YOUR_USER@localhost:5432/naturalweb
OPENAI_API_KEY=sk-your-actual-key-here
CORS_ORIGINS=http://localhost:3000,chrome-extension://*
```

#### Web App Configuration
```bash
cd apps/web
cp .env.example .env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Set Up Database

```bash
cd apps/api
npx prisma generate
npx prisma db push
cd ../..
```

### 4. Build Shared Packages

```bash
npm run build --workspace=@naturalweb/shared
npm run build --workspace=@naturalweb/ui
```

### 5. Start Development Servers

Option A: All at once (in separate terminals)
```bash
# Terminal 1: API
npm run dev --workspace=@naturalweb/api

# Terminal 2: Web App
npm run dev --workspace=@naturalweb/web

# Terminal 3: Extension (optional)
npm run dev --workspace=@naturalweb/extension
```

Option B: Using turbo (single terminal)
```bash
npm run dev
```

### 6. Load Browser Extension

#### Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `apps/extension/dist` folder

#### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in `apps/extension/dist`

## Verification

### Check Services

1. **API Health**: 
   ```bash
   curl http://localhost:3001/health
   ```
   Expected: `{"status":"ok","timestamp":"..."}`

2. **Web App**: 
   Open http://localhost:3000
   Should see NaturalWeb interface

3. **Database Connection**:
   ```bash
   cd apps/api
   npx prisma studio
   ```
   Opens Prisma Studio on http://localhost:5555

### Test Commands

1. In web app, enter: "Click on the login button"
2. In extension popup, enter a test command
3. Check API logs for processing

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -ti:3000
lsof -ti:3001

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql@15

# Check connection string in .env
```

### OpenAI API Errors

- Verify API key is valid
- Check account has credits
- Ensure no typos in `.env` file

### Module Not Found

```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### Extension Not Loading

```bash
# Rebuild extension
cd apps/extension
npm run build

# Check for errors in dist/
ls -la dist/
```

## Development Workflow

### Making Changes

1. **Code Changes**: Hot reload is enabled for web and API
2. **Extension Changes**: Rebuild and reload extension manually
3. **Shared Package Changes**: Rebuild package and restart dependents

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Database Migrations

```bash
# After schema changes
cd apps/api
npx prisma db push

# Or create migration
npx prisma migrate dev --name your_migration_name
```

## IDE Setup

### VS Code

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Recommended Extensions

- `dbaeumer.vscode-eslint`
- `esbenp.prettier-vscode`
- `Prisma.prisma`
- `bradlc.vscode-tailwindcss`

## Next Steps

1. Read [Architecture Documentation](./docs/ARCHITECTURE.md)
2. Review [API Documentation](./docs/API.md)
3. Check [Contributing Guidelines](./CONTRIBUTING.md)
4. Explore [Examples](./docs/EXAMPLES.md)

## Getting Help

- Check the [FAQ](./docs/FAQ.md)
- Open an issue on GitHub
- Join our Discord community
