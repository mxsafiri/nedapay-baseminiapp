import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  usePrivy,
  useWallets,
} from '@privy-io/react-auth';
import {
  initializeBiconomyEmbedded,
  executeBiconomyEmbeddedTransfer,
  type BiconomyEmbeddedClient,
} from '@/utils/biconomyEmbedded';
import {
  initializeBiconomyExternal,
  executeGasAbstractedTransferExternal,
  type BiconomyExternalClient,
  type WalletType,
} from '@/utils/biconomyExternal';
import { ChainConfig, ChainId, formatChainName } from '@/config/chains';
import { TOKEN_ADDRESSES, TOKEN_ABI, GAS_FEES, type SupportedToken } from '@/config/tokenConfig';

interface UseOffRampProps {
  chain: ChainConfig;
  token: SupportedToken;
}

const useOffRamp = ({ chain, token }: UseOffRampProps) => {
  // Validate token parameter
  if (!TOKEN_ADDRESSES[token]) {
    throw new Error(`Invalid token: ${token}`);
  }

  // Authentication and wallet state
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  // Note: signAuthorization would be available for EIP-7702 support when needed
  const activeWallet = wallets[0] as WalletType | undefined;
  const isEmbeddedWallet = activeWallet?.walletClientType === 'privy';
  const isCoinbaseWallet = activeWallet?.walletClientType === 'coinbase_wallet';

  // Form state
  const [amount, setAmount] = useState('');
  const [fiat, setFiat] = useState('NGN');
  const [rate, setRate] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memo, setMemo] = useState('');
  const [institutions, setInstitutions] = useState<
    Array<{ name: string; code: string; type: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [usdcToFiatRate, setUsdcToFiatRate] = useState<number | null>(null);
  
  // Biconomy state
  const [biconomyEmbeddedClient, setBiconomyEmbeddedClient] =
    useState<BiconomyEmbeddedClient | null>(null);
  const [biconomyExternalClient, setBiconomyExternalClient] =
    useState<BiconomyExternalClient | null>(null);
  const [gasAbstractionFailed, setGasAbstractionFailed] = useState(false);
  const [gasAbstractionInitializing, setGasAbstractionInitializing] =
    useState(false);

  // Derived values
  const gasAbstractionActive =
    !gasAbstractionFailed &&
    (biconomyEmbeddedClient || biconomyExternalClient) &&
    !isCoinbaseWallet;
  
  const chainName = chain.name.toUpperCase() as keyof typeof GAS_FEES.NORMAL;
  const estimatedFee = gasAbstractionActive
    ? GAS_FEES.ABSTRACTED[token]
    : GAS_FEES.NORMAL[chainName];
  
  const feeCurrency = gasAbstractionActive ? token : chain.nativeCurrency.symbol;
  const supportedAbstractionChains = ["BASE"];

  // Calculate receive amount
  const receiveAmount = amount && rate
    ? ((parseFloat(amount) - parseFloat(amount) * 0.005) * parseFloat(rate)).toFixed(2)
    : "0.00";

  // Initialize Biconomy
  useEffect(() => {
    const initBiconomy = async () => {
      if (!activeWallet?.address || isCoinbaseWallet || !supportedAbstractionChains.includes(chainName)) return;

      setGasAbstractionInitializing(true);
      setGasAbstractionFailed(false);

      try {
        // Switch to selected chain
        await activeWallet.switchChain(chain.id);
        
        if (isEmbeddedWallet) {
          const client = await initializeBiconomyEmbedded(
            activeWallet,
            chain.id
          );
          setBiconomyEmbeddedClient(client);
        } else if (!isEmbeddedWallet) {
          const client = await initializeBiconomyExternal(activeWallet, chain.id);
          setBiconomyExternalClient(client);
        }
      } catch (err) {
        console.warn("Biconomy initialization failed:", err);
        setGasAbstractionFailed(true);
      } finally {
        setGasAbstractionInitializing(false);
      }
    };

    initBiconomy();
  }, [activeWallet, isEmbeddedWallet, isCoinbaseWallet, chain, chainName]);

  // Fetch supported currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await fetch('/api/paycrest/currencies');
        const data = await response.json();
        setCurrencies(data);
      } catch (err) {
        setError("Failed to load currencies");
      }
    };
    loadCurrencies();
  }, []);

  // Fetch balance for selected token and chain
  useEffect(() => {
    const fetchBalance = async () => {
      if (!activeWallet?.address) {
        setBalance("0");
        return;
      }

      try {
        setBalanceLoading(true);
        const provider = new ethers.providers.Web3Provider(
          await activeWallet.getEthereumProvider()
        );
        
        const tokenAddress = TOKEN_ADDRESSES[token]?.[chain.id as keyof typeof TOKEN_ADDRESSES[SupportedToken]];
        if (!tokenAddress) {
          setError(`Token ${token} not supported on ${chain.name}`);
          return;
        }

        const tokenContract = new ethers.Contract(
          tokenAddress,
          TOKEN_ABI,
          provider
        );

        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(activeWallet.address);
        setBalance(ethers.utils.formatUnits(balance, decimals));
      } catch (err) {
        console.error("Failed to fetch balance", err);
        setError("Failed to load balance");
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [activeWallet, token, chain]);

  // Fetch token to fiat rate
  useEffect(() => {
    const fetchTokenToFiatRate = async () => {
      try {
        const response = await fetch(`/api/paycrest/rates?token=${token}&amount=1&currency=${fiat}&network=${formatChainName(chain.name)}`);
        const data = await response.json();
        setUsdcToFiatRate(parseFloat(data.rate));
      } catch (err) {
        console.error("Failed to fetch token rate", err);
      }
    };

    if (fiat) fetchTokenToFiatRate();
  }, [fiat, token, chain]);

  // Fetch institutions for selected fiat
  const fetchInstitutions = useCallback(async () => {
    try {
      const response = await fetch(`/api/paycrest/institutions?currency=${fiat}`);
      const data = await response.json();
      setInstitutions(data);
    } catch (err) {
      setError("Failed to fetch institutions");
    }
  }, [fiat]);

  // Verify account details
  const handleVerifyAccount = async () => {
    if (!institution || !accountIdentifier) return;

    try {
      setIsLoading(true);
      // Use your existing Paycrest verification logic
      const response = await fetch('/api/paycrest/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institution, accountIdentifier }),
      });
      
      if (response.ok) {
        setIsAccountVerified(true);
        setError("");
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      setError("Account verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exchange rate
  const handleFetchRate = async () => {
    if (!amount || !fiat) return;

    try {
      const response = await fetch(`/api/paycrest/rates?token=${token}&amount=${amount}&currency=${fiat}&network=${formatChainName(chain.name)}`);
      const data = await response.json();
      setRate(data.rate);
      setError("");
    } catch (err) {
      setError("Failed to fetch rate");
    }
  };

  // Clear rate when amount or currency changes
  useEffect(() => {
    setRate("");
    setError("");
  }, [amount, fiat]);

  // Execute normal transaction (without gas abstraction)
  const executeNormalTransaction = async (
    receiveAddress: string,
    amountInWei: ethers.BigNumber
  ) => {
    if (!activeWallet?.address) {
      throw new Error("No wallet connected");
    }

    const provider = new ethers.providers.Web3Provider(
      await activeWallet.getEthereumProvider()
    );
    const signer = provider.getSigner();

    const tokenAddress = TOKEN_ADDRESSES[token]?.[chain.id as keyof typeof TOKEN_ADDRESSES[SupportedToken]];
    if (!tokenAddress) {
      throw new Error(`Token ${token} not supported on ${chain.name}`);
    }

    const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    try {
      const gasPrice = await provider.getGasPrice();
      const gasLimit = await contract.estimateGas.transfer(
        receiveAddress,
        amountInWei
      );
      const safeGasLimit = gasLimit.mul(120).div(100);

      const txResponse = await contract.transfer(receiveAddress, amountInWei, {
        gasPrice,
        gasLimit: safeGasLimit,
      });

      return txResponse;
    } catch (error: any) {
      console.warn(
        "Gas estimation failed, trying without gas parameters:",
        error
      );
      const txResponse = await contract.transfer(receiveAddress, amountInWei);
      return txResponse;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated) return;
    if (!activeWallet?.address) return setError("Wallet not connected");
    if (!isAccountVerified) return setError("Please verify account first");
    if (!rate) return setError("Please fetch exchange rate first");

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Get token address
      const tokenAddress = TOKEN_ADDRESSES[token]?.[chain.id as keyof typeof TOKEN_ADDRESSES[SupportedToken]];
      if (!tokenAddress) {
        throw new Error(`Token ${token} not supported on ${chain.name}`);
      }

      // Prepare provider and contract
      const provider = new ethers.providers.Web3Provider(
        await activeWallet.getEthereumProvider()
      );
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

      // Convert amount to wei
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);

      // Check balance with fee consideration
      const balance = await tokenContract.balanceOf(activeWallet.address);
      const requiredBalance = gasAbstractionActive
        ? amountInWei.add(
            ethers.utils.parseUnits(
              estimatedFee.toString(),
              decimals
            )
          )
        : amountInWei;

      if (balance.lt(requiredBalance)) {
        throw new Error(
          `Insufficient ${token} balance. Need ${ethers.utils.formatUnits(requiredBalance, decimals)} ${token}`
        );
      }

      // Create payment order
      const orderResponse = await axios.post("/api/paycrest/orders", {
        amount: parseFloat(amount),
        rate: parseFloat(rate),
        network: formatChainName(chain.name),
        token: token,
        recipient: { institution, accountIdentifier, accountName, memo },
        returnAddress: activeWallet.address,
        reference: `order-${Date.now()}`,
      });

      const {
        receiveAddress,
        amount: orderAmount,
        reference,
        senderFee,
        transactionFee,
        validUntil,
      } = orderResponse.data.data;

      // Execute transaction
      if (gasAbstractionActive && !isCoinbaseWallet) {
        try {
          if (isEmbeddedWallet && biconomyEmbeddedClient) {
            await executeBiconomyEmbeddedTransfer(
              biconomyEmbeddedClient,
              tokenAddress as string,
              receiveAddress,
              amount
            );
          } else if (!isEmbeddedWallet && biconomyExternalClient) {
            await executeGasAbstractedTransferExternal(
              biconomyExternalClient,
              receiveAddress as `0x${string}`,
              amountInWei.toBigInt(),
              tokenAddress as `0x${string}`,
              chain.id
            );
          }
        } catch (gasError) {
          console.warn(
            "Gas abstracted transfer failed, falling back to normal transaction:",
            gasError
          );
          await executeNormalTransaction(receiveAddress, amountInWei);
        }
      } else {
        // Normal transaction for Coinbase wallet and other cases
        await executeNormalTransaction(receiveAddress, amountInWei);
      }

      setSuccess(
        `Payment order initiated! 
        Reference: ${reference}
        Amount: ${orderAmount} ${token}
        Network: ${chain.name}
        Fee: ${senderFee}
        Transaction Fee: ${transactionFee}
        Valid Until: ${validUntil}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Render fee information
  const renderFeeInfo = useCallback(() => {
    return {
      chain,
      token,
      gasAbstractionActive,
      gasAbstractionInitializing,
      isCoinbaseWallet,
      gasAbstractionFailed,
      feeCurrency,
      estimatedFee,
      balance,
      balanceLoading,
      fiat,
      usdcToFiatRate
    };
  }, [
    chain,
    token,
    gasAbstractionActive,
    gasAbstractionInitializing,
    isCoinbaseWallet,
    gasAbstractionFailed,
    feeCurrency,
    estimatedFee,
    balance,
    balanceLoading,
    fiat,
    usdcToFiatRate
  ]);

  return {
    // Form state
    amount,
    setAmount,
    fiat,
    setFiat,
    rate,
    setRate,
    institution,
    setInstitution,
    accountIdentifier,
    setAccountIdentifier,
    accountName,
    setAccountName,
    memo,
    setMemo,
    isLoading,
    error,
    success,
    isAccountVerified,
    setIsAccountVerified,
    balance,
    currencies,
    institutions,
    receiveAmount,
    
    // Fee information
    renderFeeInfo,
    gasAbstractionActive,
    gasAbstractionInitializing,
    isCoinbaseWallet,
    gasAbstractionFailed,
    feeCurrency,
    estimatedFee,
    balanceLoading,
    usdcToFiatRate,
    
    // Handlers
    handleVerifyAccount,
    handleFetchRate,
    handleSubmit,
    fetchInstitutions
  };
};

export default useOffRamp;
