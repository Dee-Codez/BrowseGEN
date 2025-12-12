# Deployment Guide

Complete guide for deploying NaturalWeb to production.

## Overview

NaturalWeb can be deployed in multiple ways:
- **Web App**: Vercel, Netlify, or any Node.js host
- **API**: Docker, Cloud Run, App Service, or VPS
- **Extension**: Chrome Web Store, Firefox Add-ons
- **Database**: Managed PostgreSQL (AWS RDS, Azure, Supabase)

## Prerequisites

- Production database (PostgreSQL)
- OpenAI API key
- Hosting accounts
- Domain names (optional)

## 1. Database Setup

### Option A: Supabase (Recommended for Quick Start)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

### Option B: AWS RDS

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier naturalweb-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourPassword123 \
  --allocated-storage 20
```

### Option C: Azure Database

```bash
az postgres server create \
  --resource-group naturalweb-rg \
  --name naturalweb-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password YourPassword123 \
  --sku-name B_Gen5_1
```

### Run Migrations

```bash
DATABASE_URL=your_production_url npm run build --workspace=@naturalweb/api
cd apps/api
npx prisma migrate deploy
```

## 2. API Deployment

### Option A: Docker + Cloud Run (Google Cloud)

1. **Build and push image**:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/naturalweb-api
   ```

2. **Deploy**:
   ```bash
   gcloud run deploy naturalweb-api \
     --image gcr.io/PROJECT_ID/naturalweb-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL=your_db_url,OPENAI_API_KEY=your_key
   ```

### Option B: Azure Container Apps

1. **Create container registry**:
   ```bash
   az acr create \
     --resource-group naturalweb-rg \
     --name naturalwebacr \
     --sku Basic
   ```

2. **Build and push**:
   ```bash
   az acr build \
     --registry naturalwebacr \
     --image naturalweb-api:latest \
     --file Dockerfile.api .
   ```

3. **Deploy**:
   ```bash
   az containerapp create \
     --name naturalweb-api \
     --resource-group naturalweb-rg \
     --image naturalwebacr.azurecr.io/naturalweb-api:latest \
     --environment naturalweb-env \
     --ingress external \
     --target-port 3001 \
     --env-vars DATABASE_URL=your_db_url OPENAI_API_KEY=your_key
   ```

### Option C: DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - **Dockerfile**: `Dockerfile.api`
   - **Port**: 3001
   - **Environment Variables**: Add DATABASE_URL, OPENAI_API_KEY
3. Deploy

### Option D: VPS (Ubuntu)

```bash
# On server
git clone your-repo
cd naturalweb

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies and build
npm install
npm run build --workspace=@naturalweb/api

# Set up PM2
npm install -g pm2
pm2 start apps/api/dist/index.js --name naturalweb-api

# Set up nginx reverse proxy
sudo nano /etc/nginx/sites-available/naturalweb
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.yoursite.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. Web App Deployment

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd apps/web
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your API URL

### Option B: Netlify

1. **Build command**: `npm run build --workspace=@naturalweb/web`
2. **Publish directory**: `apps/web/.next`
3. **Environment variables**: `NEXT_PUBLIC_API_URL`

### Option C: Docker

```bash
docker build -f Dockerfile.web -t naturalweb-web .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yoursite.com \
  naturalweb-web
```

## 4. Browser Extension Deployment

### Chrome Web Store

1. **Build extension**:
   ```bash
   cd apps/extension
   npm run build
   ```

2. **Create ZIP**:
   ```bash
   cd dist
   zip -r ../extension.zip *
   ```

3. **Upload to Chrome Web Store**:
   - Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Create new item
   - Upload `extension.zip`
   - Fill in store listing
   - Submit for review

### Firefox Add-ons

1. **Build and zip** (same as Chrome)

2. **Submit**:
   - Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Submit new add-on
   - Upload ZIP file
   - Fill in listing information

## 5. CI/CD Setup

### GitHub Actions (Already configured)

1. **Add secrets** in GitHub repo settings:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`

2. **Push to main** branch triggers deployment

### Custom CI/CD

See `.github/workflows/ci-cd.yml` for reference.

## 6. Monitoring & Maintenance

### Health Checks

```bash
# API health
curl https://api.yoursite.com/health

# Response: {"status":"ok","timestamp":"..."}
```

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Automated (cron)
0 2 * * * pg_dump $DATABASE_URL > /backups/naturalweb-$(date +\%Y\%m\%d).sql
```

### Logging

Set up logging service:
- **Vercel**: Built-in logging
- **Cloud Run**: Cloud Logging
- **VPS**: PM2 logs or Winston + LogDNA

### Performance Monitoring

- Set up Sentry for error tracking
- Use New Relic or DataDog for APM
- Monitor database performance

## 7. Security Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Set up CORS correctly
- [ ] Rotate API keys regularly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Use environment variables (never commit secrets)
- [ ] Enable database encryption
- [ ] Regular security updates

## 8. Scaling

### Horizontal Scaling (API)

```bash
# Cloud Run auto-scales
# For manual scaling on VPS:
pm2 start apps/api/dist/index.js -i max
```

### Database Scaling

- Enable connection pooling
- Use read replicas for analytics
- Implement caching (Redis)

### CDN Setup

```bash
# Vercel has built-in CDN
# For custom setup, use Cloudflare:
- Point DNS to Cloudflare
- Enable CDN and caching
```

## Environment Variables Checklist

### Production API
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
CORS_ORIGINS=https://yoursite.com,chrome-extension://*
```

### Production Web
```env
NEXT_PUBLIC_API_URL=https://api.yoursite.com
NODE_ENV=production
```

## Post-Deployment

1. **Test all features** in production
2. **Monitor logs** for errors
3. **Set up alerts** for downtime
4. **Create backup schedule**
5. **Document custom configurations**

## Rollback Plan

### Vercel
```bash
vercel rollback
```

### Docker
```bash
# Redeploy previous image
docker pull naturalweb-api:previous-tag
docker-compose up -d
```

### Database
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Support

For deployment issues:
1. Check logs first
2. Review environment variables
3. Test database connectivity
4. Verify API endpoints
5. Contact support if needed

---

**Deployment checklist**: [deployment-checklist.md](./deployment-checklist.md)
