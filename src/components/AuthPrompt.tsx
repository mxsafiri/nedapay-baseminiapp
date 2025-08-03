'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Wallet, Lock, ArrowRight } from 'lucide-react';

interface AuthPromptProps {
  action: string;
  description: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function AuthPrompt({ action, description, onCancel, onSuccess }: AuthPromptProps) {
  const { login, isLoading } = useAuth();
  const { isDark } = useTheme();

  const handleConnect = async () => {
    try {
      await login();
      onSuccess?.();
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect Wallet Required</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              To {action.toLowerCase()}, you need to connect your wallet.
            </p>
            {description && (
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2"
            size="lg"
          >
            <Wallet className="w-5 h-5" />
            <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          {onCancel && (
            <Button 
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Supports wallet, email, and SMS authentication
          </p>
        </div>
      </Card>
    </div>
  );
}
