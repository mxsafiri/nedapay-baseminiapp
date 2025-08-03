'use client';

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is required');
  }

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
        // Default chain
        defaultChain: base,
        // Supported chains
        supportedChains: [base],
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
