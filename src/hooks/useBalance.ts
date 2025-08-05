'use client';

import { useState, useEffect } from 'react';
import { createPublicClient, http, formatEther, Address } from 'viem';
import { base } from 'viem/chains';

// USDC contract address on Base
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

export interface BalanceData {
  eth: string;
  usdc: string;
  isLoading: boolean;
  error: string | null;
}

export function useBalance(walletAddress?: string) {
  const [balanceData, setBalanceData] = useState<BalanceData>({
    eth: '0',
    usdc: '0',
    isLoading: false,
    error: null,
  });

  const coinbaseRpc = process.env.NEXT_PUBLIC_COINBASE_RPC;

  // Create public client with Coinbase RPC
  const publicClient = createPublicClient({
    chain: {
      ...base,
      rpcUrls: {
        default: {
          http: [coinbaseRpc || 'https://mainnet.base.org'],
        },
        public: {
          http: [coinbaseRpc || 'https://mainnet.base.org'],
        },
      },
    },
    transport: http(coinbaseRpc || 'https://mainnet.base.org'),
  });

  const fetchBalances = async () => {
    if (!walletAddress) {
      setBalanceData({
        eth: '0',
        usdc: '0',
        isLoading: false,
        error: null,
      });
      return;
    }

    setBalanceData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch ETH balance
      const ethBalance = await publicClient.getBalance({
        address: walletAddress as Address,
      });

      // Fetch USDC balance
      const usdcBalance = await publicClient.readContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as Address],
      });

      // Format balances
      const ethFormatted = formatEther(ethBalance);
      const usdcFormatted = (Number(usdcBalance) / 1e6).toString(); // USDC has 6 decimals

      setBalanceData({
        eth: parseFloat(ethFormatted).toFixed(4),
        usdc: parseFloat(usdcFormatted).toFixed(2),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      setBalanceData({
        eth: '0',
        usdc: '0',
        isLoading: false,
        error: 'Failed to fetch balances',
      });
    }
  };

  // Fetch balances when wallet address changes
  useEffect(() => {
    fetchBalances();
  }, [walletAddress]);

  // Refetch function for manual refresh
  const refetch = () => {
    fetchBalances();
  };

  return {
    ...balanceData,
    refetch,
  };
}
