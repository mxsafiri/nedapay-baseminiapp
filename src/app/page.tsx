'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthComponent } from '@/components/AuthComponent';
import { StablecoinBalance } from '@/components/StablecoinBalance';
import { PaymentProcessor } from '@/components/PaymentProcessor';
import { InvoiceGenerator } from '@/components/InvoiceGenerator';
import { FiatOfframp } from '@/components/FiatOfframp';
import MPulseDashboard from '@/components/MPulseDashboard';
import PromoOffers from '@/components/PromoOffers';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useTheme } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { 
  ArrowUpDown, 
  CreditCard, 
  FileText, 
  Coins,
  Wallet, 
  Gift, 
  BarChart3, 
  Send, 
  ArrowDownToLine, 
  TrendingUp,
  Sun, 
  Moon 
} from 'lucide-react';

type FeatureType = 'm-pulse' | 'promo-offers' | 'send' | 'invoice' | 'offramp' | 'analytics';

export default function Home() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeFeature, setActiveFeature] = useState<FeatureType>('m-pulse');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const features = [
    { id: 'm-pulse' as FeatureType, label: 'M-Pulse', icon: TrendingUp },
    { id: 'promo-offers' as FeatureType, label: 'Promo & Offers', icon: Gift },
    { id: 'invoice' as FeatureType, label: 'Invoice', icon: FileText },
    { id: 'analytics' as FeatureType, label: 'Analytics', icon: BarChart3 },
    { id: 'send' as FeatureType, label: 'Send', icon: Send },
    { id: 'offramp' as FeatureType, label: 'Offramp', icon: ArrowDownToLine },
  ];

  const handleFeatureSelect = (featureId: FeatureType, buttonElement: HTMLButtonElement) => {
    setActiveFeature(featureId);
    
    // Auto-scroll just enough to bring the selected tab into view
    if (scrollContainerRef.current && buttonElement) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = buttonElement.getBoundingClientRect();
      
      // Check if button is already fully visible
      const isFullyVisible = 
        buttonRect.left >= containerRect.left && 
        buttonRect.right <= containerRect.right;
      
      if (!isFullyVisible) {
        // Scroll just enough to bring the button into view
        let scrollLeft = container.scrollLeft;
        
        if (buttonRect.left < containerRect.left) {
          // Button is cut off on the left, scroll left
          scrollLeft += buttonRect.left - containerRect.left - 16; // 16px padding
        } else if (buttonRect.right > containerRect.right) {
          // Button is cut off on the right, scroll right
          scrollLeft += buttonRect.right - containerRect.right + 16; // 16px padding
        }
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'm-pulse':
        return <MPulseDashboard />;
      case 'promo-offers':
        return <PromoOffers />;
      case 'send':
        return <PaymentProcessor />;
      case 'invoice':
        return <InvoiceGenerator />;
      case 'offramp':
        return <FiatOfframp />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <MPulseDashboard />;
    }
  };

  return (
    <main className={`min-h-screen ${
      isDark 
        ? 'bg-gray-950 text-white' 
        : 'bg-white text-gray-900'
    }`}>
        {/* Header */}
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/NEDApayLogo.png" 
                alt="NEDApay Logo" 
                className="w-8 h-8" 
              />
              <div>
                <h1 className={`text-xl font-bold font-display ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>NEDApay</h1>
                <p className={`text-sm font-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Base MiniKit</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Wallet Connect Button */}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    // Show wallet info or disconnect option
                  } else {
                    login();
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                  isAuthenticated
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                }`}
              >
                <Wallet className="w-3 h-3" />
                <span>
                  {isAuthenticated 
                    ? user?.walletAddress 
                      ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`
                      : 'Connected'
                    : 'Connect'
                  }
                </span>
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              {/* Network Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Base</span>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Feature Toggle - Scrollable */}
            <div className="p-1">
              <div 
                ref={scrollContainerRef}
                className="flex space-x-1 overflow-x-auto scrollbar-hide"
              >
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={(e) => handleFeatureSelect(feature.id, e.currentTarget)}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 whitespace-nowrap min-w-fit ${
                        activeFeature === feature.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : isDark
                            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{feature.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Feature Content */}
            <div className={`rounded-2xl overflow-hidden transition-colors duration-300 backdrop-blur-sm ${
              isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
            }`}>
              {renderActiveFeature()}
            </div>

            {/* Footer Info */}
            <div className="text-center py-4">
              <p className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Pay with crypto. Buy and sell instantly on Base and other supported chains.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#fff' : '#1f2937',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          },
        }}
      />
    </main>
  );
}
