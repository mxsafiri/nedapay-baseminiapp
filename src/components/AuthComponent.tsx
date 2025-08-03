'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Wallet, Mail, Smartphone, LogOut, User, Building } from 'lucide-react';
import { useState } from 'react';

export function AuthComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout,
    walletAddress,
    updateBusinessName
  } = useAuth();
  const { isDark } = useTheme();
  const [businessName, setBusinessName] = useState('');
  const [isUpdatingBusiness, setIsUpdatingBusiness] = useState(false);

  const handleUpdateBusinessName = async () => {
    if (!businessName.trim()) return;
    
    setIsUpdatingBusiness(true);
    const success = await updateBusinessName(businessName.trim());
    if (success) {
      setBusinessName('');
    }
    setIsUpdatingBusiness(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to NedaPay</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to access your merchant dashboard and start accepting payments
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={login}
            className="w-full flex items-center justify-center space-x-2"
            size="lg"
          >
            <Wallet className="w-5 h-5" />
            <span>Connect with Wallet or Email</span>
          </Button>
          
          <div className="text-center">
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Supports wallet connection, email, and SMS authentication
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <Wallet className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Wallet</p>
          </div>
          <div className="text-center">
            <Mail className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
          </div>
          <div className="text-center">
            <Smartphone className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">SMS</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">
              {user?.businessName || 'Merchant Account'}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email || 'Wallet-based account'}
            </p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Account Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {user?.email && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.email}
                </p>
              </div>
            </div>
          )}
          
          {walletAddress && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Wallet className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Wallet</p>
                <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Business Name Setup */}
        {!user?.businessName && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Complete Your Profile
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Add your business name to personalize your merchant experience
                  </p>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdatingBusiness}
                  />
                  <Button
                    onClick={handleUpdateBusinessName}
                    size="sm"
                    disabled={!businessName.trim() || isUpdatingBusiness}
                  >
                    {isUpdatingBusiness ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
