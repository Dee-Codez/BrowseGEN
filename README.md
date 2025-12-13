# BrowseGEN - Natural Language Website Interaction Platform

![BrowseGEN](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> Interact with websites using natural language commands through a web application and browser extension

## 🌟 Features

- **Natural Language Processing**: Use plain English to interact with any website
- **Multi-Platform**: Available as web app and browser extension
- **Real-time Automation**: Execute commands instantly with AI-powered understanding
- **Analytics & Metrics**: Track usage patterns, success rates, and popular commands
- **Marketing Insights**: Understand user behavior and optimize use cases

## 📁 Project Structure

```
naturalweb/
├── apps/
│   ├── web/                 # Next.js web application
│   ├── extension/           # Browser extension (Chrome/Firefox)
│   └── api/                 # Backend API with NLP
├── packages/
│   ├── shared/              # Shared types and utilities
│   └── ui/                  # Shared UI components
├── .github/
│   └── workflows/           # CI/CD pipelines
└── docker-compose.yml       # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- OpenAI API Key (for NLP)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd naturalweb
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # API
   cp apps/api/.env.example apps/api/.env
   # Edit apps/api/.env with your credentials

   # Web App
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Set up database**:
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   cd ../..
   ```

4. **Start development servers**:
   ```bash
   # Terminal 1: Start all services
   npm run dev
   ```

   Or start individually:
   ```bash
   # Terminal 1: API
   npm run dev --workspace=@naturalweb/api

   # Terminal 2: Web App
   npm run dev --workspace=@naturalweb/web

   # Terminal 3: Extension
   npm run dev --workspace=@naturalweb/extension
   ```

### Access the Applications

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Extension**: Load `apps/extension/dist` in browser

## 🧩 Components

### Web Application

Modern Next.js app with:
- Natural language command interface
- Real-time metrics dashboard
- Responsive design with Tailwind CSS

### Browser Extension

Cross-browser extension with:
- Popup interface for quick commands
- Content scripts for page interaction
- Background service for API communication
- Floating action button on every page

### Backend API

Express.js server with:
- OpenAI GPT integration for NLP
- Playwright for web automation
- PostgreSQL with Prisma ORM
- RESTful API endpoints

## 📊 Usage Examples

### Example Commands

- "Click on the login button"
- "Fill the email field with test@example.com"
- "Scroll to the bottom of the page"
- "Extract all product prices"
- "Navigate to the pricing page"

### API Usage

```bash
curl -X POST http://localhost:3001/api/commands \
  -H "Content-Type: application/json" \
  -d '{
    "command": "Click on the sign in button",
    "url": "https://example.com"
  }'
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_key_here

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Individual Containers

```bash
# Build and run API
docker build -f Dockerfile.api -t naturalweb-api .
docker run -p 3001:3001 naturalweb-api

# Build and run Web
docker build -f Dockerfile.web -t naturalweb-web .
docker run -p 3000:3000 naturalweb-web
```

## 🌐 Deployment

### Web App (Vercel)

```bash
cd apps/web
vercel deploy
```

Or use the GitHub Actions workflow for automatic deployment.

### API (Any Node.js host)

```bash
cd apps/api
npm run build
npm start
```

### Browser Extension

#### Chrome Web Store
1. Build extension: `npm run build --workspace=@naturalweb/extension`
2. Zip the `dist` folder
3. Upload to Chrome Web Store

#### Firefox Add-ons
1. Build extension: `npm run build --workspace=@naturalweb/extension`
2. Zip the `dist` folder
3. Upload to Firefox Add-ons

## 📈 Metrics & Analytics

The platform tracks:
- Total commands executed
- Success/failure rates
- Response times
- Most popular websites
- Command type distribution
- User growth metrics

Access analytics at: http://localhost:3000 (click "Analytics" tab)

## 🛠️ Development

### Project Scripts

```bash
# Install dependencies
npm install

# Development mode (all apps)
npm run dev

# Build all projects
npm run build

# Type checking
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

### Adding a New Feature

1. Update types in `packages/shared/src/types.ts`
2. Implement in API: `apps/api/src/services/`
3. Add UI in web app: `apps/web/src/components/`
4. Update extension if needed: `apps/extension/src/`

## 🧪 Testing

```bash
# Run tests (add your test framework)
npm test

# E2E tests
npm run test:e2e
```

## 🔐 Environment Variables

### API (.env)
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/naturalweb
OPENAI_API_KEY=your_openai_key
```

### Web App (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for GPT API
- Playwright for automation capabilities
- Next.js and Vercel for web platform
- Prisma for database ORM

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@naturalweb.app

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic NLP command processing
- ✅ Web app and extension
- ✅ Metrics tracking

### Phase 2
- [ ] User authentication
- [ ] Command history and favorites
- [ ] Multi-language support
- [ ] Advanced automation sequences

### Phase 3
- [ ] AI-powered command suggestions
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Premium features

### Phase 4
- [ ] Mobile app
- [ ] Voice commands
- [ ] Integration marketplace
- [ ] Enterprise features

---

**Built with ❤️ for better web interaction**
