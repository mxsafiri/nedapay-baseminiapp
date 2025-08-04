'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePaycrestRate, usePaycrestUtils } from '@/hooks/usePaycrest';
import { RefreshCw, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RateDisplayProps {
  token: string;
  amount: string;
  currency: string;
  showFees?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export function RateDisplay({
  token,
  amount,
  currency,
  showFees = true,
  autoRefresh = true,
  className = '',
}: RateDisplayProps) {
  const { isDark } = useTheme();
  const { formatRate, formatAmount } = usePaycrestUtils();
  const [previousRate, setPreviousRate] = useState<number | null>(null);
  const [rateDirection, setRateDirection] = useState<'up' | 'down' | 'same'>('same');

  const {
    rate,
    isLoading,
    error,
    lastUpdated,
    refresh,
    fees,
  } = usePaycrestRate({
    token,
    amount,
    currency,
    autoRefresh,
    refreshInterval: 30000, // 30 seconds
  });

  // Track rate changes for visual feedback
  useEffect(() => {
    if (rate !== null && previousRate !== null) {
      if (rate > previousRate) {
        setRateDirection('up');
      } else if (rate < previousRate) {
        setRateDirection('down');
      } else {
        setRateDirection('same');
      }
    }
    setPreviousRate(rate);
  }, [rate, previousRate]);

  const getRateDirectionIcon = () => {
    switch (rateDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  if (error) {
    return (
      <div className={`p-4 rounded-xl border ${
        isDark 
          ? 'bg-red-900/20 border-red-800/40 text-red-400' 
          : 'bg-red-50 border-red-200 text-red-600'
      } ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Rate Fetch Error</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl transition-all duration-200 ${
      isDark 
        ? 'bg-gray-800/50 border border-gray-700/50' 
        : 'bg-white border border-gray-200'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Exchange Rate
          </h3>
          {getRateDirectionIcon()}
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{getTimeAgo(lastUpdated)}</span>
            </div>
          )}
          
          <Button
            onClick={refresh}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="p-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Rate Display */}
      <div className="space-y-3">
        {isLoading && rate === null ? (
          <div className="animate-pulse">
            <div className={`h-8 rounded ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>
        ) : rate !== null ? (
          <>
            {/* Main Rate */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {formatRate(rate, token, currency)}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Current exchange rate
              </div>
            </div>

            {/* Amount Conversion */}
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatAmount(parseFloat(amount), token)}
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    You send
                  </div>
                </div>
                
                <div className={`text-2xl ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  →
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatAmount(rate * parseFloat(amount), currency)}
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Recipient gets
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            {showFees && fees && (
              <div className={`p-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800/30 border-gray-700/30' 
                  : 'bg-blue-50/50 border-blue-200/50'
              }`}>
                <div className={`text-sm font-medium mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Fee Breakdown
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Sender Fee ({((parseFloat(fees.senderFee) / parseFloat(amount)) * 100).toFixed(2)}%)
                    </span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatAmount(parseFloat(fees.senderFee), token)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Transaction Fee
                    </span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatAmount(parseFloat(fees.transactionFee), currency)}
                    </span>
                  </div>
                  
                  <div className={`flex justify-between pt-1 border-t ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Total Cost
                    </span>
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatAmount(fees.totalAmount, token)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Recipient Receives
                    </span>
                    <span className={`font-medium text-green-600`}>
                      {formatAmount(fees.receiveAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className={`mt-3 text-xs text-center ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshing every 30s</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard display
export function CompactRateDisplay({
  token,
  currency,
  className = '',
}: {
  token: string;
  currency: string;
  className?: string;
}) {
  const { isDark } = useTheme();
  const { formatRate } = usePaycrestUtils();
  
  const { rate, isLoading, error } = usePaycrestRate({
    token,
    amount: '1',
    currency,
    autoRefresh: true,
  });

  if (error) {
    return (
      <div className={`text-xs text-red-500 ${className}`}>
        Rate unavailable
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isLoading ? (
        <div className={`animate-pulse h-4 w-20 rounded ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
      ) : rate !== null ? (
        <>
          <span className={`text-sm font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {formatRate(rate, token, currency)}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </>
      ) : null}
    </div>
  );
}
