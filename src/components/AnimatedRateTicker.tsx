'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface RateItem {
  currency: string;
  rate: number;
  flag: string;
  name: string;
}

export function AnimatedRateTicker() {
  const { isDark } = useTheme();
  const [currentRates, setCurrentRates] = useState<RateItem[]>([]);

  // Loading and error states for production
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Define the currencies we want to show in the ticker
  const currencies = [
    { code: 'NGN', flag: '🇳🇬', name: 'Nigerian Naira' },
    { code: 'KES', flag: '🇰🇪', name: 'Kenyan Shilling' },
    { code: 'UGX', flag: '🇺🇬', name: 'Ugandan Shilling' },
    { code: 'GHS', flag: '🇬🇭', name: 'Ghanaian Cedi' },
    { code: 'TZS', flag: '🇹🇿', name: 'Tanzanian Shilling' },
    { code: 'ZAR', flag: '🇿🇦', name: 'South African Rand' },
    { code: 'EGP', flag: '🇪🇬', name: 'Egyptian Pound' },
    { code: 'MAD', flag: '🇲🇦', name: 'Moroccan Dirham' },
  ];

  // Fetch rates for each currency
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      setHasError(false);
      
      const ratePromises = currencies.map(async (currency) => {
        try {
          const response = await fetch(`/api/paycrest/rates?token=USDC&amount=1&currency=${currency.code}&network=base`);
          if (response.ok) {
            const data = await response.json();
            return {
              currency: currency.code,
              rate: parseFloat(data.data) || 0,
              flag: currency.flag,
              name: currency.name,
            };
          }
        } catch (error) {
          console.error(`Error fetching rate for ${currency.code}:`, error);
        }
        return null; // Return null for failed requests
      });

      const rates = await Promise.all(ratePromises);
      const validRates = rates.filter((rate): rate is RateItem => rate !== null && rate.rate > 0);
      
      if (validRates.length > 0) {
        setCurrentRates(validRates);
        setHasError(false);
      } else {
        setHasError(true);
      }
      
      setIsLoading(false);
    };

    fetchRates();
    
    // Refresh rates every 30 seconds
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  // Only show rates if we have real data
  const displayRates = currentRates;

  // Duplicate the rates array to create seamless infinite scroll
  const duplicatedRates = [...displayRates, ...displayRates];

  return (
    <div className={`w-full overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600'
    } text-white py-2`}>
      <div className="relative">
        <div className="flex animate-scroll whitespace-nowrap">
          {duplicatedRates.map((rate, index) => (
            <div
              key={`${rate.currency}-${index}`}
              className="flex items-center mx-6 flex-shrink-0"
            >
              <span className="text-lg mr-2">{rate.flag}</span>
              <span className="font-semibold mr-2">{rate.currency}</span>
              <span className="text-green-300 font-bold">
                {rate.rate.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom CSS for smooth infinite scroll animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactRateTicker() {
  const { isDark } = useTheme();
  const [currentRates, setCurrentRates] = useState<RateItem[]>([]);

  const topCurrencies = [
    { code: 'NGN', flag: '🇳🇬' },
    { code: 'KES', flag: '🇰🇪' },
    { code: 'TZS', flag: '🇹🇿' },
    { code: 'UGX', flag: '🇺🇬' },
  ];

  useEffect(() => {
    const fetchRates = async () => {
      const ratePromises = topCurrencies.map(async (currency) => {
        try {
          const response = await fetch(`/api/paycrest/rates?token=USDC&amount=1&currency=${currency.code}&network=base`);
          if (response.ok) {
            const data = await response.json();
            return {
              currency: currency.code,
              rate: parseFloat(data.data) || 0, // Fix: use data.data instead of data.rate
              flag: currency.flag,
              name: '',
            };
          }
        } catch (error) {
          console.error(`Error fetching rate for ${currency.code}:`, error);
        }
        return {
          currency: currency.code,
          rate: 0,
          flag: currency.flag,
          name: '',
        };
      });

      const rates = await Promise.all(ratePromises);
      setCurrentRates(rates.filter(rate => rate.rate > 0));
    };

    fetchRates();
    const interval = setInterval(fetchRates, 45000);
    return () => clearInterval(interval);
  }, []);

  const duplicatedRates = [...currentRates, ...currentRates, ...currentRates];

  if (currentRates.length === 0) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
        : 'bg-gradient-to-r from-gray-100 to-gray-200'
    } py-1.5`}>
      <div className="relative">
        <div className="flex animate-scroll-fast whitespace-nowrap">
          {duplicatedRates.map((rate, index) => (
            <div
              key={`${rate.currency}-${index}`}
              className="flex items-center mx-4 flex-shrink-0"
            >
              <span className="text-sm mr-1">{rate.flag}</span>
              <span className={`font-medium text-sm mr-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {rate.currency}
              </span>
              <span className="text-green-600 font-bold text-sm">
                {rate.rate.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll-fast {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-scroll-fast {
          animation: scroll-fast 30s linear infinite;
        }
        
        .animate-scroll-fast:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
