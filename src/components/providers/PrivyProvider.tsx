'use client';

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { http } from 'viem';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const coinbaseRpc = process.env.NEXT_PUBLIC_COINBASE_RPC;

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is required');
  }

  // Configure custom Base chain with Coinbase RPC
  const customBase = {
    ...base,
    rpcUrls: {
      default: {
        http: [coinbaseRpc || 'https://mainnet.base.org'],
      },
      public: {
        http: [coinbaseRpc || 'https://mainnet.base.org'],
      },
    },
  };

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          logo: process.env.NEXT_PUBLIC_APP_LOGO,
        },
        // Login methods
        loginMethods: ['wallet', 'email', 'sms'],
        // Embedded wallet configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        // Default chain with custom RPC
        defaultChain: customBase,
        // Supported chains with custom RPC
        supportedChains: [customBase],
        // Legal links
        legal: {
          termsAndConditionsUrl: 'https://nedapay.xyz/terms',
          privacyPolicyUrl: 'https://nedapay.xyz/privacy',
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
