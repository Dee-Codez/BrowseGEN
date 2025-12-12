# Quick Start Guide

Get NaturalWeb running in 5 minutes!

## 1. Install Prerequisites

```bash
# Check Node.js version (need 18+)
node --version

# Install if needed
nvm install 18
nvm use 18
```

## 2. Clone and Install

```bash
git clone <your-repo>
cd naturalweb
npm install
```

## 3. Set Up Environment

### Minimum Required Setup

```bash
# API environment
cat > apps/api/.env << EOF
PORT=3001
DATABASE_URL=postgresql://postgres@localhost:5432/naturalweb
OPENAI_API_KEY=your-key-here
EOF

# Web environment
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
```

## 4. Database (Quick Option)

### Using Docker (Easiest)

```bash
docker run --name naturalweb-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=naturalweb \
  -p 5432:5432 \
  -d postgres:15-alpine
```

Update `apps/api/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/naturalweb
```

### Setup Schema

```bash
cd apps/api
npx prisma generate
npx prisma db push
cd ../..
```

## 5. Start Everything

```bash
# Terminal 1: API
npm run dev --workspace=@naturalweb/api

# Terminal 2: Web (in new terminal)
npm run dev --workspace=@naturalweb/web

# Terminal 3: Extension (optional, in new terminal)
npm run dev --workspace=@naturalweb/extension
```

## 6. Verify It Works

1. **Open Web App**: http://localhost:3000
2. **Try a command**: "Click on the sign in button"
3. **Check API**: http://localhost:3001/health
4. **View Metrics**: Click "Analytics" tab

## 7. Load Extension (Optional)

### Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `apps/extension/dist`

### Try It
1. Visit any website
2. Click the extension icon
3. Enter: "Scroll to the bottom"

## Troubleshooting

### Port in use
```bash
# Kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
```bash
# Check PostgreSQL is running
docker ps
# or
pg_isready
```

### Missing OpenAI key
Get one at: https://platform.openai.com/api-keys

## Next Steps

✅ **You're ready to develop!**

- Read the [full setup guide](./docs/SETUP.md)
- Check [API documentation](./docs/API.md)
- Review [examples](./docs/EXAMPLES.md)
- Start customizing features

## Common Tasks

```bash
# View database
cd apps/api && npx prisma studio

# Type checking
npm run type-check

# Format code
npm run format

# Build for production
npm run build
```

---

Need help? Check [FAQ](./docs/FAQ.md) or open an issue.
