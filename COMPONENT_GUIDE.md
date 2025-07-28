# Component Guide - NedaPay Base MiniKit

## 🧩 Component Architecture Overview

The NedaPay Base MiniKit follows a modular component architecture with clear separation of concerns, reusable UI components, and context-based state management.

## 📁 Directory Structure

```
src/components/
├── ui/                     # Reusable UI components
│   ├── Button.tsx         # Consistent button styling
│   ├── Card.tsx           # Container component
│   ├── Input.tsx          # Form input with validation
│   ├── Label.tsx          # Form labels
│   └── Tabs.tsx           # Tabbed navigation
├── providers/             # Context providers
│   └── MiniKitProvider.tsx # Base MiniKit integration
├── AnalyticsDashboard.tsx  # Real-time analytics
├── CustomerPromoPage.tsx   # Customer-facing promo pages
├── CustomerRewardsHub.tsx  # Customer rewards interface
├── FiatOfframp.tsx        # Fiat conversion component
├── InvoiceGenerator.tsx   # Multi-step invoice creation
├── LoyaltyDashboard.tsx   # Loyalty program management
├── MPulseDashboard.tsx    # Main landing dashboard
├── PaymentDashboard.tsx   # Payment interface
├── PaymentProcessor.tsx   # Payment processing logic
├── PromoOffers.tsx        # Offer creation and management
├── PromoSetupWizard.tsx   # Promo setup interface
├── QRPreviewModal.tsx     # QR code display modal
├── SharePreviewModal.tsx  # Social sharing modal
├── StablecoinBalance.tsx  # Balance display component
└── WalletConnection.tsx   # Wallet integration
```

## 🎨 UI Components (`/components/ui/`)

### Button Component
**File**: `src/components/ui/Button.tsx`

**Purpose**: Consistent button styling across the application with theme support.

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

**Usage Examples**:
```tsx
// Primary button
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

// Loading state
<Button loading={isSubmitting}>
  Processing...
</Button>

// Custom styling
<Button className="w-full mt-4" variant="outline">
  Custom Button
</Button>
```

### Card Component
**File**: `src/components/ui/Card.tsx`

**Purpose**: Container component with consistent styling and theme support.

**Props**:
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}
```

**Usage Examples**:
```tsx
// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Card with custom padding
<Card padding="lg" shadow>
  <AnalyticsContent />
</Card>
```

### Input Component
**File**: `src/components/ui/Input.tsx`

**Purpose**: Form input with validation, error handling, and theme support.

**Props**:
```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email' | 'number' | 'password';
  required?: boolean;
  disabled?: boolean;
}
```

**Usage Examples**:
```tsx
// Basic input
<Input
  label="Customer Name"
  value={customerName}
  onChange={setCustomerName}
  placeholder="Enter customer name"
  required
/>

// Input with validation
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={emailError}
/>
```

## 🏠 Main Dashboard Components

### MPulseDashboard
**File**: `src/components/MPulseDashboard.tsx`

**Purpose**: Main landing page dashboard with balance display and quick actions.

**Key Features**:
- Multi-stablecoin balance display
- Balance visibility toggle
- Quick action buttons (Create Offer, Send, Off-ramp)
- Running offers display
- Responsive mobile-first design

**State Management**:
```typescript
const [selectedCoin, setSelectedCoin] = useState<Stablecoin>(stablecoins[0]);
const [balanceVisible, setBalanceVisible] = useState(true);
const [offers, setOffers] = useState<Offer[]>([]);
```

**Usage**:
```tsx
// Used in main page layout
<MPulseDashboard />
```

### AnalyticsDashboard
**File**: `src/components/AnalyticsDashboard.tsx`

**Purpose**: Real-time analytics dashboard with data fetching and visualization.

**Key Features**:
- Real data integration via analytics service
- Period filtering (24H, 7D, 30D, 90D)
- Loading states and error handling
- Interactive charts and metrics
- Top performing rewards display

**Data Flow**:
```typescript
// Fetches real data from API
const fetchAnalyticsData = async (period: string) => {
  try {
    setIsLoading(true);
    const response = await analyticsService.fetchAnalytics(period);
    setAnalytics(response.analytics);
    setChartData(response.chartData);
    setTopRewards(response.topRewards);
  } catch (error) {
    toast.error('Failed to load analytics data');
  } finally {
    setIsLoading(false);
  }
};
```

**Integration**:
- Uses `analyticsService` for data fetching
- Integrates with `sharedAuth` for user identification
- Supports real-time data refresh

## 🧾 Business Logic Components

### InvoiceGenerator
**File**: `src/components/InvoiceGenerator.tsx`

**Purpose**: Multi-step invoice creation wizard with payment integration.

**Key Features**:
- Multi-step wizard interface (Customer → Items → Settings → Review)
- Optional customer email field (recent update)
- Multi-currency support (USDC, cNGN, NGNC, ZARP)
- QR code generation for payments
- Professional invoice formatting

**Step Flow**:
```typescript
const steps = [
  { id: 1, title: 'Customer Details', component: CustomerStep },
  { id: 2, title: 'Invoice Items', component: ItemsStep },
  { id: 3, title: 'Settings', component: SettingsStep },
  { id: 4, title: 'Review & Generate', component: ReviewStep }
];
```

**Validation Logic**:
```typescript
const validateCurrentStep = () => {
  switch (currentStep) {
    case 1:
      if (!invoice.customerName.trim()) {
        toast.error('Please enter customer name');
        return false;
      }
      // Email is optional but validated if provided
      if (invoice.customerEmail && !invoice.customerEmail.includes('@')) {
        toast.error('Please enter a valid email address');
        return false;
      }
      return true;
    // ... other steps
  }
};
```

### PromoOffers
**File**: `src/components/PromoOffers.tsx`

**Purpose**: Offer creation and management system with QR code generation.

**Key Features**:
- Offer creation with percentage discounts
- Custom offer codes generation
- QR code generation for customer access
- Social sharing integration (Farcaster)
- Offer status management

**Offer Structure**:
```typescript
interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  code: string;
  isActive: boolean;
  expiresAt: Date;
  redemptions: number;
  maxRedemptions?: number;
}
```

## 🔗 Integration Components

### WalletConnection
**File**: `src/components/WalletConnection.tsx`

**Purpose**: Base network wallet integration with multi-stablecoin support.

**Key Features**:
- Coinbase Wallet connection via MiniKit
- Base network configuration
- Multi-stablecoin balance display
- Connection status management
- Error handling for connection issues

**Integration Points**:
```typescript
// MiniKit integration
import { useMiniKit } from '@/components/providers/MiniKitProvider';

// Wallet connection logic
const connectWallet = async () => {
  try {
    const { address } = await miniKit.connect();
    setWalletAddress(address);
    setIsConnected(true);
  } catch (error) {
    toast.error('Failed to connect wallet');
  }
};
```

### StablecoinBalance
**File**: `src/components/StablecoinBalance.tsx`

**Purpose**: Multi-stablecoin balance display with currency switching.

**Supported Currencies**:
- USDC (USD Coin)
- cNGN (Celo Nigerian Naira)
- NGNC (Naira Token)
- ZARP (South African Rand Peg)

**Balance Display Logic**:
```typescript
const formatBalance = (balance: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'USDC' ? 'USD' : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(balance);
};
```

## 🎯 Customer-Facing Components

### CustomerPromoPage
**File**: `src/components/CustomerPromoPage.tsx`

**Purpose**: Customer-facing promotional page for offer redemption.

**Features**:
- Offer details display
- QR code scanning interface
- Redemption tracking
- Mobile-optimized design

### CustomerRewardsHub
**File**: `src/components/CustomerRewardsHub.tsx`

**Purpose**: Customer rewards and loyalty program interface.

**Features**:
- Reward points display
- Available rewards catalog
- Redemption history
- NFT milestone tracking

## 🔧 Utility Components

### QRPreviewModal
**File**: `src/components/QRPreviewModal.tsx`

**Purpose**: Modal for displaying and sharing QR codes.

**Features**:
- QR code generation and display
- Download functionality
- Social sharing options
- Mobile-responsive modal

### SharePreviewModal
**File**: `src/components/SharePreviewModal.tsx`

**Purpose**: Social sharing modal with multiple platform support.

**Supported Platforms**:
- Farcaster
- Twitter/X
- Facebook
- LinkedIn
- Copy link functionality

## 🎨 Styling Guidelines

### Theme Integration
All components support light/dark theme switching:

```typescript
import { useTheme } from '@/contexts/ThemeContext';

export function Component() {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
      transition-colors duration-200
    `}>
      {/* Component content */}
    </div>
  );
}
```

### Responsive Design
All components follow mobile-first responsive design:

```css
/* Mobile first */
.component {
  @apply p-4 text-sm;
}

/* Tablet */
@screen md {
  .component {
    @apply p-6 text-base;
  }
}

/* Desktop */
@screen lg {
  .component {
    @apply p-8 text-lg;
  }
}
```

## 🔄 State Management Patterns

### Local State
Use `useState` for component-specific state:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState<DataType[]>([]);
const [error, setError] = useState<string | null>(null);
```

### Context State
Use React Context for shared state:

```typescript
// Theme context usage
const { isDark, toggleTheme } = useTheme();

// Offers context usage
const { offers, addOffer, updateOffer } = useOffers();
```

### API State
Use service layer for API interactions:

```typescript
// Analytics service usage
const analytics = await analyticsService.fetchAnalytics('7d');

// Auth service usage
const user = sharedAuth.getCurrentUser();
```

## 🧪 Testing Components

### Component Testing Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const mockHandler = jest.fn();
    render(<Component onAction={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

## 🚀 Performance Optimization

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
```

### Memoization
```typescript
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  return <div>{/* Render processed data */}</div>;
});
```

## 📝 Component Development Checklist

When creating new components:

- [ ] Follow TypeScript strict mode
- [ ] Include proper prop interfaces
- [ ] Support theme switching
- [ ] Implement responsive design
- [ ] Add error handling
- [ ] Include loading states
- [ ] Write component documentation
- [ ] Add unit tests
- [ ] Optimize for performance
- [ ] Follow accessibility guidelines

---

**Component Guide Version**: 1.0  
**Last Updated**: January 2024  
**Maintained by**: NedaPay Development Team
