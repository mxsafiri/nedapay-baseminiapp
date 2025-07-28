# Deployment Guide - NedaPay Base MiniKit

## 🚀 Vercel Deployment (Step-by-Step)

### Prerequisites
- GitHub repository with your code
- Vercel account (free tier available)
- Environment variables ready

### Step 1: Prepare Repository
```bash
# Ensure all code is committed and pushed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `mxsafiri/nedapay-baseminiapp`
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

#### Option B: Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: nedapay-baseminiapp
# - Directory: ./ (default)
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```bash
# Essential Variables
NEXT_PUBLIC_APP_NAME=NedaPay Base MiniKit
NEXT_PUBLIC_BASE_URL=https://your-project-name.vercel.app
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-project-name.vercel.app/api

# Feature Flags
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ENABLE_LOYALTY=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_INVOICES=true

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ENABLE_MONITORING=true
```

**Important**: Replace `your-project-name` with your actual Vercel project URL.

### Step 4: Deploy

#### Automatic Deployment
- Every push to `main` branch triggers automatic deployment
- Check deployment status in Vercel dashboard

#### Manual Deployment
```bash
# Deploy to production
vercel --prod

# Deploy preview (staging)
vercel
```

### Step 5: Verify Deployment

1. **Check Build Logs**: Ensure no build errors
2. **Test Core Features**:
   - M-Pulse dashboard loads
   - Analytics fetches data
   - Invoice generator works
   - Wallet connection functions
   - Theme switching works

3. **Performance Check**:
   - Page load times < 3 seconds
   - Mobile responsiveness
   - All images load correctly

## 🔧 Environment Configuration

### Development vs Production

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000/api` | `https://your-domain.vercel.app/api` |
| `NODE_ENV` | `development` | `production` |

### Required Environment Variables

```bash
# Copy this template to Vercel Environment Variables
NEXT_PUBLIC_APP_NAME="NedaPay Base MiniKit"
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_CHAIN_ID="8453"
NEXT_PUBLIC_RPC_URL="https://mainnet.base.org"
NEXT_PUBLIC_API_BASE_URL="https://your-domain.vercel.app/api"
NEXT_PUBLIC_ANALYTICS_ENABLED="true"
NEXT_PUBLIC_ENABLE_LOYALTY="true"
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_INVOICES="true"
```

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel
1. Go to Project → Settings → Domains
2. Add your custom domain (e.g., `nedapay.yourdomain.com`)
3. Follow DNS configuration instructions

### Step 2: Update Environment Variables
```bash
# Update base URL to your custom domain
NEXT_PUBLIC_BASE_URL="https://nedapay.yourdomain.com"
NEXT_PUBLIC_API_BASE_URL="https://nedapay.yourdomain.com/api"
```

### Step 3: SSL Certificate
- Vercel automatically provisions SSL certificates
- Verify HTTPS is working correctly

## 🔍 Monitoring & Analytics

### Vercel Analytics
```bash
# Add to environment variables
NEXT_PUBLIC_VERCEL_ANALYTICS="true"
```

### Performance Monitoring
- Check Core Web Vitals in Vercel dashboard
- Monitor function execution times
- Track deployment frequency

## 🚨 Troubleshooting Deployment Issues

### Build Failures

#### TypeScript Errors
```bash
# Check types locally
npm run type-check

# Fix type errors before deployment
```

#### Missing Dependencies
```bash
# Ensure all dependencies are in package.json
npm install --save missing-package
```

#### Environment Variable Issues
```bash
# Check variable names (must start with NEXT_PUBLIC_ for client-side)
# Verify no typos in variable names
# Ensure values are properly quoted
```

### Runtime Errors

#### API Routes Not Working
- Check file naming in `app/api/` directory
- Verify HTTP methods are properly exported
- Check request/response handling

#### Static Assets Not Loading
- Verify assets are in `public/` directory
- Check file paths and casing
- Ensure assets are committed to repository

### Performance Issues

#### Slow Page Loads
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

#### Large Images
- Optimize images before deployment
- Use Next.js Image component
- Consider using CDN for large assets

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Branch Deployments
- `main` branch → Production deployment
- Feature branches → Preview deployments
- Pull requests → Automatic preview links

## 📊 Post-Deployment Checklist

### Immediate Verification
- [ ] Application loads without errors
- [ ] All pages are accessible
- [ ] API endpoints respond correctly
- [ ] Wallet connection works
- [ ] Analytics dashboard displays data
- [ ] Invoice generation functions
- [ ] Theme switching works
- [ ] Mobile responsiveness verified

### Performance Verification
- [ ] Page load times < 3 seconds
- [ ] Core Web Vitals are green
- [ ] Images load correctly
- [ ] No console errors

### SEO & Accessibility
- [ ] Meta tags are correct
- [ ] Favicon loads
- [ ] Basic accessibility compliance

### Security Verification
- [ ] HTTPS is enforced
- [ ] No sensitive data exposed
- [ ] API routes are secure

## 🎯 Production Optimization

### Performance Optimizations
```javascript
// next.config.js optimizations
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

### Caching Strategy
- Static assets: 1 year cache
- API responses: Appropriate cache headers
- Dynamic content: Short-term caching

## 📞 Support & Maintenance

### Monitoring Checklist
- [ ] Set up Vercel alerts for deployment failures
- [ ] Monitor application performance
- [ ] Track user engagement metrics
- [ ] Set up error logging (Sentry recommended)

### Regular Maintenance
- Update dependencies monthly
- Monitor security vulnerabilities
- Review performance metrics
- Update documentation as needed

---

**Deployment completed successfully! 🎉**

Your NedaPay Base MiniKit is now live and ready for your merchants to use.
