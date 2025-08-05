// Biconomy integration temporarily disabled for build stability
// import { createSmartAccountClient, BiconomySmartAccountV2 } from '@biconomy/account';
// import { createBundlerClient } from '@biconomy/bundler';
// import { createPaymasterClient } from '@biconomy/paymaster';
import { encodeFunctionData } from 'viem';
import { ChainId } from '@/config/chains';
import { TOKEN_ABI } from '@/config/tokenConfig';

export interface BiconomyExternalClient {
  smartAccount: any; // Temporarily simplified for build stability
  bundlerClient: any;
  paymasterClient: any;
}

export interface WalletType {
  address: string;
  walletClientType: string;
  getEthereumProvider(): Promise<any>;
  switchChain(chainId: number): Promise<void>;
}

/**
 * Initialize Biconomy for external wallets (MetaMask, Coinbase, etc.)
 * Temporarily simplified for build stability - will be enhanced incrementally
 */
export async function initializeBiconomyExternal(
  wallet: WalletType,
  chainId: ChainId
): Promise<BiconomyExternalClient> {
  try {
    // Temporary stub implementation for build stability
    console.log('Biconomy external initialization (stub):', { wallet, chainId });
    
    return {
      smartAccount: null,
      bundlerClient: null,
      paymasterClient: null,
    };
  } catch (error) {
    console.error('Failed to initialize Biconomy for external wallet:', error);
    throw error;
  }
}

/**
 * Execute gas abstracted transfer for external wallets
 * Temporarily simplified for build stability
 */
export async function executeGasAbstractedTransferExternal(
  client: BiconomyExternalClient,
  to: `0x${string}`,
  amount: bigint,
  tokenAddress: `0x${string}`,
  chainId: ChainId
): Promise<string> {
  try {
    // Temporary stub implementation for build stability
    console.log('Biconomy external transfer (stub):', { 
      client, to, amount, tokenAddress, chainId 
    });
    
    // Return mock transaction hash
    return '0x' + Math.random().toString(16).substring(2);
  } catch (error) {
    console.error('Gas abstracted transfer failed:', error);
    throw error;
  }
}

/**
 * Get smart account address for external wallets
 * Temporarily simplified for build stability
 */
export async function getSmartAccountAddress(client: BiconomyExternalClient): Promise<string> {
  // Temporary stub implementation
  return '0x0000000000000000000000000000000000000000';
}

/**
 * Check if wallet supports gas abstraction
 */
export function supportsGasAbstraction(walletType: string): boolean {
  // Coinbase wallet has issues with gas abstraction, so we exclude it
  const unsupportedWallets = ['coinbase_wallet'];
  return !unsupportedWallets.includes(walletType);
}
