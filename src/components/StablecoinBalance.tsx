'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stablecoins, getStablecoinByAddress } from '@/data/stablecoins';
import { formatBalance, formatCurrency } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { RefreshCw, TrendingUp, Eye, EyeOff, ChevronDown, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBalance } from '@/hooks/useBalance';

export function StablecoinBalance() {
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { usdc, eth, isLoading, refetch } = useBalance(user?.walletAddress);
  const [selectedCoin, setSelectedCoin] = useState(stablecoins[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Get wallet address from Privy
  const walletAddress = user?.walletAddress;
  const isConnected = isAuthenticated && walletAddress;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Use real RPC balance refetch
      refetch();
      toast.success('Balance updated successfully');
    } catch (error) {
      toast.error('Failed to refresh balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Use real RPC-fetched balance based on selected coin
  const getRealBalance = () => {
    if (!isConnected) return '0.00';
    
    // For USDC, use the fetched USDC balance
    if (selectedCoin.baseToken === 'USDC') {
      return usdc || '0.00';
    }
    
    // For ETH, use the fetched ETH balance  
    if (selectedCoin.baseToken === 'ETH') {
      return eth || '0.00';
    }
    
    // For other tokens, return 0 for now
    return '0.00';
  };

  const formattedBalance = getRealBalance();
  const balanceValue = parseFloat(formattedBalance);

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedCoin.address);
    toast.success('Contract address copied!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Compact Token Selector */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors duration-200 ${
            isDark 
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <span className="text-white text-sm font-medium">{selectedCoin.baseToken.slice(0, 2)}</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">{selectedCoin.baseToken}</div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{selectedCoin.currency}</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          } ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg border z-10 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {stablecoins.map((coin) => (
              <button
                key={coin.address}
                onClick={() => {
                  setSelectedCoin(coin);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center space-x-3 p-3 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                  selectedCoin.address === coin.address
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDark
                      ? 'hover:bg-gray-700 text-white'
                      : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <span className="text-lg">{coin.flag}</span>
                <div className="text-left">
                  <div className="font-semibold text-sm">{coin.baseToken}</div>
                  <div className={`text-xs ${
                    selectedCoin.address === coin.address
                      ? 'text-blue-100'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{coin.currency}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Balance Display */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <div className={`text-4xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {showBalance ? formattedBalance : '••••••'}
          </div>
          <div className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {selectedCoin.baseToken}
          </div>
          {showBalance && (
            <div className={`text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              ≈ {formatCurrency(balanceValue)} {selectedCoin.currency}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Toggle balance visibility"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={copyAddress}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Copy contract address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Network Info */}
      <div className={`flex justify-between items-center py-3 px-4 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Network</div>
          <div className={`font-semibold text-sm ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Base</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Decimals</div>
          <div className={`font-semibold text-sm ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{selectedCoin.decimals}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Status</div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={`text-xs font-semibold ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
