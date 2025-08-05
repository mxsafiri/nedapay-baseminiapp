'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { formatAddress } from '../lib/utils';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WalletConnection() {
  const { user, isAuthenticated, login, logout, ready } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await login();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast.success('Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Wallet Connection</span>
        </CardTitle>
        <CardDescription>
          {isAuthenticated ? 'Your wallet is connected' : 'Connect your wallet to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated && user?.walletAddress ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800">Connected Wallet</div>
              <div className="text-sm text-green-600 font-mono">
                {formatAddress(user.walletAddress)}
              </div>
            </div>
            <Button 
              onClick={handleDisconnect} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect Wallet'}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
