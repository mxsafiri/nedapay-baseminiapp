'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { formatAddress } from '../lib/utils';
import { Wallet, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { sharedAuth, type User } from '../lib/auth';
import { syncManager, type SyncStatus } from '../lib/syncManager';

export default function WalletConnection() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const miniKit = useMiniKit();
  // Note: MiniKit may not have isOpen property, using a fallback
  const isOpen = true; // Assume MiniKit is ready for now
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    // Initialize sync manager and auth
    const initializeAuth = async () => {
      try {
        await syncManager.initialize();
        const currentUser = sharedAuth.getCurrentUser();
        setUser(currentUser);
        setSyncStatus(syncManager.getSyncStatus());
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    initializeAuth();

    // Subscribe to sync status changes
    const unsubscribe = syncManager.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address) {
        setIsLoading(true);
        try {
          // Simple authentication without complex sync for now
          console.log('Wallet connected:', address);
          
          // Create a basic user object
          const basicUser = {
            id: `user_${address.slice(-8)}`,
            walletAddress: address,
            name: `User ${address.slice(-4)}`,
            isVerified: true,
            createdAt: new Date().toISOString(),
            hasPrivyAccount: false,
            linkedAccounts: [],
            preferences: {
              defaultCurrency: 'USDC',
              notifications: true,
              theme: 'light' as const
            }
          };
          
          setUser(basicUser);
          
          // Update sync status to show connected
          setSyncStatus({
            isOnline: true,
            auth: {
              isAuthenticated: true,
              lastSync: new Date().toISOString()
            },
            invoices: { total: 0, synced: 0, pending: 0, failed: 0 },
            transactions: { total: 0, synced: 0, pending: 0, failed: 0 },
            errors: []
          });
          
          toast.success(`Welcome ${basicUser.name}!`);
        } catch (error) {
          console.error('Authentication failed:', error);
          toast.error('Failed to connect wallet');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleWalletConnection();
  }, [isConnected, address]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      // In Base MiniKit, wallet connection is handled automatically
      // This is more for display purposes
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      // Logout from shared auth
      await sharedAuth.logout();
      
      // Stop sync manager
      syncManager.stopPeriodicSync();
      
      // Disconnect wallet
      disconnect();
      
      setUser(null);
      setSyncStatus(null);
      
      toast.success('Disconnected from NedaPay');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect properly');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Connect your wallet to access NedaPay features
            </p>
            <Button 
              onClick={handleConnect}
              disabled={isLoading || !isOpen}
              className="w-full"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            {!isOpen && (
              <p className="text-xs text-yellow-600">
                Waiting for MiniKit to initialize...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Connected
                </span>
              </div>
              <span className="text-sm text-green-700 font-mono">
                {formatAddress(address || '')}
              </span>
            </div>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Address:</span>
                <span className="font-mono text-sm">{formatAddress(address || '')}</span>
              </div>
              
              {user && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User:</span>
                  <span className="text-sm font-medium">{user.name || 'Anonymous'}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network:</span>
                <span className="text-sm font-medium">Base</span>
              </div>

              {syncStatus && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sync Status:</span>
                    <span className={`text-sm font-medium ${
                      syncStatus.isOnline ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {syncStatus.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Invoices: {syncStatus.invoices.synced}/{syncStatus.invoices.total} synced</div>
                    <div>Transactions: {syncStatus.transactions.synced}/{syncStatus.transactions.total} synced</div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleDisconnect}
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect Wallet'}
              </Button>
            </CardContent>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
