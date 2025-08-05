import { ChainId } from './chains';

// Token addresses for different chains
export const TOKEN_ADDRESSES = {
  USDC: {
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
    42161: '0xA0b86a33E6441b8435b662303c0f479c7e7c6e0b', // Arbitrum
    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
    56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // BSC
  },
  USDT: {
    42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
    137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
    56: '0x55d398326f99059fF775485246999027B3197955', // BSC
  }
} as const;

// Standard ERC20 ABI for token operations
export const TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

// Gas fee estimates (in token units)
export const GAS_FEES = {
  // Normal transaction fees (paid in native token)
  NORMAL: {
    BASE: 0.0001, // ETH
    ARBITRUM: 0.0001, // ETH
    POLYGON: 0.01, // POL
    'BNB SMART CHAIN': 0.001, // BNB
  },
  // Gas abstracted fees (paid in token being sent)
  ABSTRACTED: {
    USDC: 0.1, // 0.1 USDC
    USDT: 0.1, // 0.1 USDT
  }
} as const;

// Supported tokens type
export type SupportedToken = keyof typeof TOKEN_ADDRESSES;

// Helper functions
export const getTokenAddress = (token: SupportedToken, chainId: ChainId): string | undefined => {
  return TOKEN_ADDRESSES[token]?.[chainId as keyof typeof TOKEN_ADDRESSES[SupportedToken]];
};

export const isTokenSupportedOnChain = (token: SupportedToken, chainId: ChainId): boolean => {
  return !!TOKEN_ADDRESSES[token]?.[chainId as keyof typeof TOKEN_ADDRESSES[SupportedToken]];
};

export const getSupportedTokensForChain = (chainId: ChainId): SupportedToken[] => {
  return Object.keys(TOKEN_ADDRESSES).filter(token => 
    TOKEN_ADDRESSES[token as SupportedToken]?.[chainId as keyof typeof TOKEN_ADDRESSES[SupportedToken]]
  ) as SupportedToken[];
};
