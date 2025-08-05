// Biconomy integration temporarily disabled for build stability
// import { createBundlerClient, createPaymasterClient } from 'viem/account-abstraction';
// import { createSmartAccountClient, BiconomySmartAccountV2 } from '@biconomy/account';
import { encodeFunctionData, parseUnits } from 'viem';
import { ChainId } from '@/config/chains';
import { TOKEN_ABI } from '@/config/tokenConfig';

export interface BiconomyEmbeddedClient {
  smartAccount: any; // Temporarily simplified for build stability
  bundlerClient: any;
  paymasterClient: any;
}

/**
 * Initialize Biconomy for embedded wallets (Privy embedded wallets)
 * Temporarily simplified for build stability - will be enhanced incrementally
 */
export async function initializeBiconomyEmbedded(
  wallet: any,
  chainId: ChainId
): Promise<BiconomyEmbeddedClient> {
  try {
    // Temporary stub implementation for build stability
    console.log('Biconomy embedded initialization (stub):', { wallet, chainId });
    
    return {
      smartAccount: null,
      bundlerClient: null,
      paymasterClient: null,
    };
  } catch (error) {
    console.error('Failed to initialize Biconomy for embedded wallet:', error);
    throw error;
  }
}

/**
 * Execute gas abstracted transfer using Biconomy for embedded wallets
 * Temporarily simplified for build stability - will be enhanced incrementally
 */
export async function executeBiconomyEmbeddedTransfer(
  client: BiconomyEmbeddedClient,
  tokenAddress: string,
  recipientAddress: string,
  amount: string
): Promise<{ hash: string; success: boolean }> {
  try {
    // Temporary stub implementation for build stability
    console.log('Biconomy embedded transfer (stub):', { 
      client, tokenAddress, recipientAddress, amount 
    });
    
    // Return mock success for now
    return {
      hash: '0x' + Math.random().toString(16).substring(2),
      success: false, // Mark as false since this is a stub
    };
  } catch (error) {
    console.error('Biconomy embedded transfer failed:', error);
    throw error;
  }
}

/**
 * Get smart account address
 * Temporarily simplified for build stability
 */
export async function getSmartAccountAddress(client: BiconomyEmbeddedClient): Promise<string> {
  // Temporary stub implementation
  return '0x0000000000000000000000000000000000000000';
}

/**
 * Check if gas abstraction is available for the current setup
 */
export function isGasAbstractionAvailable(chainId: ChainId): boolean {
  const supportedChains: ChainId[] = [8453]; // Base chain for now
  return supportedChains.includes(chainId);
}
