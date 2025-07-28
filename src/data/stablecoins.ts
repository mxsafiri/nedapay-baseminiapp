// Stablecoin configuration for Base network
export interface Stablecoin {
  region: string;
  flag: string;
  currency: string;
  baseToken: string;
  name: string;
  address: string;
  issuer: string;
  description: string;
  website: string;
  chainId: number;
  decimals: number;
  icon: string;
}

export const stablecoins: Stablecoin[] = [
  {
    region: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    baseToken: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    issuer: 'Circle',
    description: 'Stablecoin pegged 1:1 to the US Dollar (USD)',
    website: 'https://www.centre.io/',
    chainId: 8453, // Base Mainnet
    decimals: 6,
    icon: '💵'
  },
  {
    region: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    baseToken: 'cNGN',
    name: 'Nigerian Naira Coin',
    address: '0x46C85152bFe9f96829aA94755D9f915F9B10EF5F',
    issuer: 'Convexity',
    description: 'Stablecoin pegged 1:1 to the Nigerian Naira (NGN)',
    website: 'https://stablecoins.earth',
    chainId: 8453, // Base Mainnet
    decimals: 6,
    icon: '₦'
  },
  {
    region: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    baseToken: 'NGNC',
    decimals: 18,
    name: 'Nigerian Naira Coin',
    address: '0xe743f13623e000261b634f0e5676f294475ec24d',
    issuer: 'Link',
    description: 'Stablecoin pegged 1:1 to the Nigerian Naira (NGN)',
    website: 'https://stablecoins.earth',
    chainId: 8453, // Base Mainnet
    icon: '₦'
  },
  {
    region: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    baseToken: 'ZARP',
    decimals: 18,
    name: 'South African Rand Coin',
    address: '0xb755506531786C8aC63B756BaB1ac387bACB0C04',
    issuer: 'inv.es',
    description: 'Stablecoin pegged 1:1 to the South African Rand (ZAR)',
    website: 'https://stablecoins.earth',
    chainId: 8453, // Base Mainnet
    icon: 'R'
  }
];

export const getStablecoinByAddress = (address: string): Stablecoin | undefined => {
  return stablecoins.find(coin => coin.address.toLowerCase() === address.toLowerCase());
};

export const getStablecoinBySymbol = (symbol: string): Stablecoin | undefined => {
  return stablecoins.find(coin => coin.baseToken === symbol);
};
