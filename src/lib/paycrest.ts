'use client';

// Paycrest API Integration Service
// Handles rate fetching, order creation, and payment processing

export interface PaycrestRate {
  status: string;
  message: string;
  data: string; // Rate as string (e.g., "1250.50")
}

export interface PaycrestCurrency {
  code: string;
  name: string;
  symbol: string;
  type: 'fiat' | 'crypto';
  networks?: string[];
}

export interface PaycrestInstitution {
  code: string;
  name: string;
  country: string;
  currency: string;
}

export interface PaycrestRecipient {
  institution: string;
  accountIdentifier: string;
  accountName: string;
  currency: string;
  memo?: string;
}

export interface PaycrestOrderRequest {
  amount: string;
  token: string;
  network: string;
  rate: string;
  recipient: PaycrestRecipient;
  reference: string;
  returnAddress: string;
}

export interface PaycrestOrderResponse {
  status: string;
  message: string;
  data: {
    id: string;
    amount: string;
    token: string;
    network: string;
    receiveAddress: string;
    validUntil: string;
    senderFee: string;
    transactionFee: string;
    reference: string;
  };
}

export interface PaycrestOrderStatus {
  status: string;
  message: string;
  data: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    amount: string;
    token: string;
    network: string;
    recipient: PaycrestRecipient;
    createdAt: string;
    updatedAt: string;
    transactionHash?: string;
    reference: string;
  };
}

class PaycrestService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PAYCREST_API_URL || 'https://api.paycrest.io';
    this.clientId = process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '';
    this.clientSecret = process.env.NEXT_PUBLIC_PAYCREST_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('Paycrest API credentials not found in environment variables');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'API-Key': this.clientId,
      'Content-Type': 'application/json',
    };
  }

  // Removed makeRequest method - all methods now use direct API routes

  /**
   * Get exchange rate for a specific token amount to fiat currency
   * @param token - Token symbol (e.g., 'USDT', 'USDC')
   * @param amount - Amount to convert
   * @param currency - Target fiat currency (e.g., 'NGN', 'KES')
   * @returns Promise<PaycrestRate>
   */
  async getExchangeRate(
    token: string,
    amount: string | number,
    currency: string
  ): Promise<PaycrestRate> {
    try {
      const response = await fetch(
        `/api/paycrest/rates?token=${token}&amount=${amount}&currency=${currency}`
      );
      
      if (!response.ok) {
        throw new Error(`Rate fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw error;
    }
  }

  /**
   * Get list of supported currencies
   * @returns Promise<PaycrestCurrency[]>
   */
  async getSupportedCurrencies(): Promise<PaycrestCurrency[]> {
    try {
      const response = await fetch('/api/paycrest/currencies');
      
      if (!response.ok) {
        throw new Error(`Currencies fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Fallback to essential African currencies if API fails
      return [
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', type: 'fiat' },
        { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', type: 'fiat' },
        { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', type: 'fiat' },
        { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', type: 'fiat' },
        { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', type: 'fiat' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R', type: 'fiat' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', type: 'fiat' },
        { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', type: 'fiat' },
      ];
    }
  }

  /**
   * Get institutions for a specific currency
   * @param currency - Currency code (e.g., 'NGN', 'KES')
   * @returns Promise<PaycrestInstitution[]>
   */
  async getInstitutions(currency: string): Promise<PaycrestInstitution[]> {
    try {
      const response = await fetch(`/api/paycrest/institutions?currency=${currency}`);
      
      if (!response.ok) {
        throw new Error(`Institutions fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return [];
    }
  }

  /**
   * Create a payment order
   * @param orderData - Payment order details
   * @returns Promise<PaycrestOrderResponse>
   */
  async createOrder(orderData: PaycrestOrderRequest): Promise<PaycrestOrderResponse> {
    try {
      const response = await fetch('/api/paycrest/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error(`Order creation failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get payment order status
   * @param orderId - Order ID
   * @returns Promise<PaycrestOrderResponse>
   */
  async getOrderStatus(orderId: string): Promise<PaycrestOrderResponse> {
    try {
      const response = await fetch(`/api/paycrest/orders?id=${orderId}`);
      
      if (!response.ok) {
        throw new Error(`Order status fetch failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw error;
    }
  }

  /**
   * Calculate total fees for a payment
   * @param amount - Payment amount
   * @param token - Token symbol
   * @param currency - Target currency
   * @returns Promise with fee breakdown
   */
  async calculateFees(amount: string, token: string, currency: string) {
    try {
      const rate = await this.getExchangeRate(token, amount, currency);
      if (!rate) {
        throw new Error('Failed to fetch exchange rate');
      }
      const numericRate = parseFloat(rate.data);
      const numericAmount = parseFloat(amount);
      
      // Estimated fees (actual fees come from order creation)
      const estimatedSenderFee = numericAmount * 0.005; // 0.5%
      const estimatedTransactionFee = numericRate * 0.02; // ~2% of fiat amount
      
      return {
        rate: numericRate,
        senderFee: estimatedSenderFee.toFixed(6),
        transactionFee: estimatedTransactionFee.toFixed(2),
        totalAmount: numericAmount + estimatedSenderFee,
        receiveAmount: numericRate - estimatedTransactionFee,
      };
    } catch (error) {
      console.error('Error calculating fees:', error);
      throw error;
    }
  }

  /**
   * Validate payment order data before submission
   * @param orderData - Order data to validate
   * @returns Validation result
   */
  validateOrderData(orderData: Partial<PaycrestOrderRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!orderData.amount || parseFloat(orderData.amount) <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!orderData.token) {
      errors.push('Token is required');
    }

    if (!orderData.network) {
      errors.push('Network is required');
    }

    if (!orderData.rate || parseFloat(orderData.rate) <= 0) {
      errors.push('Valid exchange rate is required');
    }

    if (!orderData.recipient) {
      errors.push('Recipient information is required');
    } else {
      if (!orderData.recipient.institution) {
        errors.push('Recipient institution is required');
      }
      if (!orderData.recipient.accountIdentifier) {
        errors.push('Recipient account identifier is required');
      }
      if (!orderData.recipient.accountName) {
        errors.push('Recipient account name is required');
      }
      if (!orderData.recipient.currency) {
        errors.push('Recipient currency is required');
      }
    }

    if (!orderData.reference) {
      errors.push('Payment reference is required');
    }

    if (!orderData.returnAddress) {
      errors.push('Return address is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const paycrest = new PaycrestService();

// Export utility functions
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'NGN' ? 'NGN' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatToken = (amount: number, token: string): string => {
  return `${amount.toFixed(6)} ${token}`;
};

export const generatePaymentReference = (prefix: string = 'nedapay'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
};
