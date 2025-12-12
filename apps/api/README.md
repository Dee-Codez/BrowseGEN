# API Server

Backend API for NaturalWeb platform with NLP and automation capabilities.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Set up database:
```bash
npx prisma generate
npx prisma db push
```

## Development

```bash
npm run dev
```

Server runs on http://localhost:3001

## API Endpoints

### Commands
- `POST /api/commands` - Execute a natural language command
  ```json
  {
    "command": "Click on the login button",
    "url": "https://example.com"
  }
  ```

### Metrics
- `GET /api/metrics` - Get metrics summary
- `GET /api/metrics/history` - Get command history

## Environment Variables

See `.env.example` for required environment variables.
