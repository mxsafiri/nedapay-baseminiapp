# NedaPay Base MiniKit - MerchantPulse Loyalty Program

A comprehensive Next.js 14 application built for Base network, integrating payment processing with loyalty program features for SMB merchants.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/mxsafiri/nedapay-baseminiapp.git
cd nedapay-baseminiapp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Setup](#environment-setup)
- [Deployment Guide](#deployment-guide)
- [API Documentation](#api-documentation)
- [Component Structure](#component-structure)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

NedaPay Base MiniKit is a merchant-focused payment and customer loyalty retention platform that combines payment processing with loyalty(offers) program features for merchants helping them to grow their business:

- **Payment Processing**: USDC and multi-stablecoin support on Base network
- **Loyalty Programs**: Customer rewards, NFT milestones, and engagement tracking
- **Analytics Dashboard**: Real-time business metrics and performance insights
- **Invoice Management**: Professional invoice generation with optional customer details
- **Promo System**: Dynamic offer creation and QR code generation

### Target Users
- Small to Medium Business (SMB) merchants
- Crypto-native businesses
- Merchants seeking integrated payment + loyalty solutions

## 🏗️ Architecture

### Application Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── promo/             # Dynamic promo pages
│   └── rewards/           # Customer rewards pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── providers/        # Context providers
├── contexts/             # React contexts
├── data/                 # Static data and configurations
└── lib/                  # Utilities and services
```

### Key Design Patterns
- **Server Components**: Leveraging Next.js 14 RSC for performance
- **Context-based State**: Theme and offers management
- **Service Layer**: Centralized API communication
- **Component Composition**: Reusable UI building blocks

## ✨ Features

### 🏠 M-Pulse Dashboard (Landing Page)
- **Balance Display**: Multi-stablecoin balance with visibility toggle
- **Quick Actions**: Create Offer, Send, Off-ramp buttons
- **Running Offers**: Card-based display of active promotions
- **Responsive Design**: Mobile-first approach

### 📊 Analytics Dashboard
- **Real Data Integration**: Fetches from `/api/analytics`
- **Time Period Filtering**: 24H, 7D, 30D, 90D views
- **Key Metrics**: Revenue, customers, redemptions, engagement
- **Interactive Charts**: Revenue trend visualization
- **Top Performing Rewards**: Performance-based ranking

### 🎁 Promo & Offers
- **Offer Creation**: Percentage-based discounts with custom codes
- **QR Code Generation**: Instant customer-facing QR codes
- **Social Sharing**: Farcaster integration for promotion
- **Dynamic Routing**: `/promo/[offerId]` for customer access

### 📄 Invoice Generator
- **Multi-step Wizard**: Customer details → Items → Settings → Review
- **Optional Email**: Customer email field is optional (recent update)
- **Multi-currency**: Support for USDC, cNGN, NGNC, ZARP
- **Professional Output**: Downloadable invoice with payment links

### 🔗 Wallet Integration
- **Base Network**: Primary network support
- **MiniKit Integration**: Coinbase Wallet compatibility
- **Multi-stablecoin**: USDC, cNGN, NGNC, ZARP support
- **Authentication**: Wallet-based user sessions

### 🎨 Theme System
- **Light/Dark Mode**: System-wide theme switching
- **Consistent Design**: Unified color scheme and typography
- **Responsive**: Mobile-first design principles

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useState
- **Authentication**: Wallet-based (Base MiniKit)

### Blockchain Integration
- **Network**: Base (Ethereum L2)
- **Wallet**: Coinbase Wallet via MiniKit
- **Tokens**: USDC, cNGN, NGNC, ZARP stablecoins
- **Libraries**: wagmi, viem

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **VS Code**: Configured with Tailwind CSS IntelliSense

## 🔧 Environment Setup

### Required Environment Variables

Create `.env.local` file:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="NedaPay Base MiniKit"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Base Network Configuration
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL="https://mainnet.base.org"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"

# Authentication (Optional - for production)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Feature Flags
NEXT_PUBLIC_ENABLE_LOYALTY=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_INVOICES=true
```

### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

#### Method 1: GitHub Integration (Automatic)
1. **Push to GitHub**: Ensure your code is in the repository
2. **Connect Vercel**: Link your GitHub repository to Vercel
3. **Configure Environment**: Add environment variables in Vercel dashboard
4. **Deploy**: Automatic deployment on every push to main

#### Method 2: Vercel CLI (Manual)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Vercel Configuration

Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_BASE_URL": "https://your-domain.vercel.app"
  }
}
```

#### Environment Variables for Production
In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_APP_NAME=NedaPay Base MiniKit
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ENABLE_LOYALTY=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_INVOICES=true
```

### Alternative Deployment Options

#### Netlify
```bash
# Build command
npm run build

# Publish directory
out

# Environment variables
# Same as Vercel configuration
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📡 API Documentation

### Analytics API (`/api/analytics`)
**GET** `/api/analytics?period=7d&userId=user_id`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "period": "7 days",
    "revenue": 1250,
    "customers": 45,
    "redemptions": 89,
    "engagement": 72,
    "trend": "up",
    "chartData": [...],
    "topRewards": [...]
  }
}
```

### Mock Endpoints (Development)
- `POST /api/mock/transactions` - Transaction simulation
- `GET /api/mock/invoices/sync` - Invoice data
- `POST /api/mock/auth/wallet` - Wallet authentication
- `GET /api/mock/health` - Health check

## 🧩 Component Structure

### Core Components

#### `MPulseDashboard.tsx`
- Main landing page component
- Balance display with stablecoin selection
- Quick action buttons
- Running offers display

#### `AnalyticsDashboard.tsx`
- Real-time analytics with API integration
- Period filtering (24H, 7D, 30D, 90D)
- Revenue charts and metrics
- Loading states and error handling

#### `InvoiceGenerator.tsx`
- Multi-step wizard interface
- Optional customer email (recent update)
- Multi-currency support
- PDF generation and payment links

#### `PromoOffers.tsx`
- Offer creation and management
- QR code generation
- Social sharing integration

#### `WalletConnection.tsx`
- Base network wallet integration
- Connection status management
- Multi-stablecoin support

### UI Components (`/components/ui/`)
- `Button.tsx` - Consistent button styling
- `Card.tsx` - Container component
- `Input.tsx` - Form input with validation
- `Label.tsx` - Form labels
- `Tabs.tsx` - Tabbed navigation

### Context Providers
- `ThemeContext.tsx` - Light/dark theme management
- `OffersContext.tsx` - Offers state management
- `MiniKitProvider.tsx` - Base MiniKit integration

## 👨‍💻 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js and React
- **Prettier**: Code formatting (configure as needed)
- **File Naming**: PascalCase for components, camelCase for utilities

### Component Guidelines
```typescript
// Component template
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ComponentProps {
  title: string;
  children?: React.ReactNode;
}

export function Component({ title, children }: ComponentProps) {
  const { isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark-styles' : 'light-styles'}>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### API Route Guidelines
```typescript
// API route template
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### State Management
- Use React Context for global state
- useState for component-level state
- Avoid prop drilling with context providers

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Type checking
npm run type-check
```

#### 2. Environment Variables Not Loading
- Ensure `.env.local` exists
- Check variable names start with `NEXT_PUBLIC_` for client-side
- Restart development server after changes

#### 3. Tailwind CSS Not Working
- Check `tailwind.config.js` configuration
- Ensure VS Code has Tailwind CSS IntelliSense extension
- Verify `@tailwind` directives in `globals.css`

#### 4. Wallet Connection Issues
- Verify Base network configuration
- Check MiniKit integration
- Ensure correct chain ID (8453 for Base)

#### 5. API Routes Not Working
- Check file naming in `app/api/` directory
- Verify HTTP methods are exported
- Check request/response handling

### Performance Optimization
- Use Next.js Image component for images
- Implement lazy loading for heavy components
- Optimize bundle size with dynamic imports
- Enable compression in production

### Security Considerations
- Never expose private keys in environment variables
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting for API routes

## 📞 Support & Maintenance

### Monitoring
- Check Vercel deployment logs
- Monitor API response times
- Track user engagement metrics

### Updates
- Keep dependencies updated
- Monitor Next.js releases
- Update Base network configurations as needed

### Team Handover Checklist
- [ ] Repository access granted
- [ ] Environment variables configured
- [ ] Vercel project setup
- [ ] Documentation reviewed
- [ ] Local development tested
- [ ] Production deployment verified

---

## 🎯 Next Steps

1. **Complete Repository Setup**: Resolve large file push issues
2. **Production Deployment**: Deploy to Vercel with proper environment variables
3. **Team Onboarding**: Share repository access and documentation
4. **Feature Enhancement**: Add real blockchain integration
5. **Testing**: Implement comprehensive test suite

---

**Built with ❤️ by the NedaPay team**

For questions or support, contact the development team or refer to this documentation.
