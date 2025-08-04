'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  paycrest, 
  PaycrestRate, 
  PaycrestCurrency, 
  PaycrestInstitution,
  PaycrestOrderRequest,
  PaycrestOrderResponse,
  PaycrestOrderStatus,
  generatePaymentReference
} from '@/lib/paycrest';

export interface UsePaycrestRateOptions {
  token: string;
  amount: string;
  currency: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UsePaycrestRateReturn {
  rate: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  fees: {
    senderFee: string;
    transactionFee: string;
    totalAmount: number;
    receiveAmount: number;
  } | null;
}

export interface UsePaycrestOrderReturn {
  createOrder: (orderData: Omit<PaycrestOrderRequest, 'reference'>) => Promise<PaycrestOrderResponse | null>;
  getOrderStatus: (orderId: string) => Promise<PaycrestOrderStatus | null>;
  isCreatingOrder: boolean;
  isCheckingStatus: boolean;
  orderError: string | null;
}

export interface UsePaycrestDataReturn {
  currencies: PaycrestCurrency[];
  institutions: PaycrestInstitution[];
  loadCurrencies: () => Promise<void>;
  loadInstitutions: (currency: string) => Promise<void>;
  isLoadingCurrencies: boolean;
  isLoadingInstitutions: boolean;
  dataError: string | null;
}

/**
 * Hook for fetching and managing exchange rates
 */
export function usePaycrestRate({
  token,
  amount,
  currency,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UsePaycrestRateOptions): UsePaycrestRateReturn {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fees, setFees] = useState<UsePaycrestRateReturn['fees']>(null);

  const fetchRate = useCallback(async () => {
    if (!token || !amount || !currency || parseFloat(amount) <= 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch rate and calculate fees
      const [rateResponse, feeCalculation] = await Promise.all([
        paycrest.getExchangeRate(token, amount, currency),
        paycrest.calculateFees(amount, token, currency),
      ]);

      const numericRate = parseFloat(rateResponse.data);
      setRate(numericRate);
      setFees({
        senderFee: feeCalculation.senderFee,
        transactionFee: feeCalculation.transactionFee,
        totalAmount: feeCalculation.totalAmount,
        receiveAmount: feeCalculation.receiveAmount,
      });
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rate';
      setError(errorMessage);
      console.error('Rate fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, amount, currency]);

  // Initial fetch
  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchRate, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchRate]);

  return {
    rate,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchRate,
    fees,
  };
}

/**
 * Hook for managing payment orders
 */
export function usePaycrestOrder(): UsePaycrestOrderReturn {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const createOrder = useCallback(async (
    orderData: Omit<PaycrestOrderRequest, 'reference'>
  ): Promise<PaycrestOrderResponse | null> => {
    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      // Generate unique reference
      const reference = generatePaymentReference();
      const fullOrderData: PaycrestOrderRequest = {
        ...orderData,
        reference,
      };

      // Validate order data
      const validation = paycrest.validateOrderData(fullOrderData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await paycrest.createPaymentOrder(fullOrderData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment order';
      setOrderError(errorMessage);
      console.error('Order creation error:', err);
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  }, []);

  const getOrderStatus = useCallback(async (orderId: string): Promise<PaycrestOrderStatus | null> => {
    setIsCheckingStatus(true);
    setOrderError(null);

    try {
      const response = await paycrest.getOrderStatus(orderId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get order status';
      setOrderError(errorMessage);
      console.error('Order status error:', err);
      return null;
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  return {
    createOrder,
    getOrderStatus,
    isCreatingOrder,
    isCheckingStatus,
    orderError,
  };
}

/**
 * Hook for managing currencies and institutions data
 */
export function usePaycrestData(): UsePaycrestDataReturn {
  const [currencies, setCurrencies] = useState<PaycrestCurrency[]>([]);
  const [institutions, setInstitutions] = useState<PaycrestInstitution[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadCurrencies = useCallback(async () => {
    setIsLoadingCurrencies(true);
    setDataError(null);

    try {
      const currencyData = await paycrest.getSupportedCurrencies();
      setCurrencies(currencyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load currencies';
      setDataError(errorMessage);
      console.error('Currency loading error:', err);
    } finally {
      setIsLoadingCurrencies(false);
    }
  }, []);

  const loadInstitutions = useCallback(async (currency: string) => {
    if (!currency) return;

    setIsLoadingInstitutions(true);
    setDataError(null);

    try {
      const institutionData = await paycrest.getInstitutions(currency);
      setInstitutions(institutionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load institutions';
      setDataError(errorMessage);
      console.error('Institution loading error:', err);
    } finally {
      setIsLoadingInstitutions(false);
    }
  }, []);

  return {
    currencies,
    institutions,
    loadCurrencies,
    loadInstitutions,
    isLoadingCurrencies,
    isLoadingInstitutions,
    dataError,
  };
}

/**
 * Utility hook for common Paycrest operations
 */
export function usePaycrestUtils() {
  const formatRate = useCallback((rate: number, fromToken: string, toCurrency: string) => {
    return `1 ${fromToken} = ${rate.toLocaleString()} ${toCurrency}`;
  }, []);

  const formatAmount = useCallback((amount: number, currency: string) => {
    if (currency === 'USDT' || currency === 'USDC') {
      return `${amount.toFixed(6)} ${currency}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'pending':
        return '🔄';
      case 'failed':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '❓';
    }
  }, []);

  return {
    formatRate,
    formatAmount,
    getStatusColor,
    getStatusIcon,
  };
}
