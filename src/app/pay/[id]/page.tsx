'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeft, 
  Check, 
  Copy, 
  ExternalLink,
  Clock,
  DollarSign,
  CreditCard,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentRequest {
  id: string;
  amount: string;
  currency: string;
  description: string;
  paymentMethod: 'crypto' | 'fiat' | 'both';
  payBillNo?: string;
  accountReference?: string;
  expiryHours: string;
  createdAt: string;
  status: 'pending' | 'paid' | 'expired';
}

export default function PaymentPage() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'fiat' | null>(null);

  useEffect(() => {
    const fetchPaymentRequest = async () => {
      try {
        const response = await fetch(`/api/payment-requests?id=${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setPaymentRequest(null);
          } else {
            throw new Error('Failed to fetch payment request');
          }
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        setPaymentRequest(result.paymentRequest);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment request:', error);
        setPaymentRequest(null);
        setLoading(false);
      }
    };

    if (id) {
      fetchPaymentRequest();
    }
  }, [id]);

  const handlePayment = async (method: 'crypto' | 'fiat') => {
    if (!paymentRequest) return;
    
    try {
      if (method === 'crypto') {
        // For crypto payments, redirect to main app with payment context
        const paymentUrl = `/?payment_id=${paymentRequest.id}&amount=${paymentRequest.amount}&method=crypto`;
        window.location.href = paymentUrl;
      } else if (method === 'fiat') {
        // For fiat payments, show coming soon or redirect to fiat flow
        toast.success('Redirecting to bank transfer payment...');
        // Could redirect to a fiat payment processor or show bank details
        const paymentUrl = `/?payment_id=${paymentRequest.id}&amount=${paymentRequest.amount}&method=fiat`;
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    }
  };

  const copyPaymentId = async () => {
    try {
      await navigator.clipboard.writeText(id as string);
      toast.success('Payment ID copied!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-4`}>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!paymentRequest) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-4`}>
        <Card className="w-full max-w-md text-center p-8">
          <h1 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Payment Not Found
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            This payment link is invalid or has expired.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => window.history.back()}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-lg font-semibold ml-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Payment Request
          </h1>
        </div>

        {/* Payment Details Card */}
        <Card className="mb-6">
          <div className="p-6">
            {/* Amount */}
            <div className="text-center mb-6">
              <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${paymentRequest.amount} {paymentRequest.currency}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {paymentRequest.description}
              </p>
            </div>

            {/* Payment ID */}
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            } mb-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Payment ID
                  </div>
                  <div className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {id}
                  </div>
                </div>
                <button
                  onClick={copyPaymentId}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expiry */}
            <div className="flex items-center justify-center text-sm text-orange-600 dark:text-orange-400 mb-6">
              <Clock className="w-4 h-4 mr-1" />
              Expires in {paymentRequest.expiryHours} hours
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card>
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Choose Payment Method
            </h3>

            <div className="space-y-3">
              {/* Crypto Payment */}
              {(paymentRequest.paymentMethod === 'crypto' || paymentRequest.paymentMethod === 'both') && (
                <button
                  onClick={() => handlePayment('crypto')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isDark
                      ? 'border-gray-700 hover:border-blue-500 bg-gray-800'
                      : 'border-gray-200 hover:border-blue-500 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <img 
                        src="/other icons /Circle_USDC_Logo.svg.png" 
                        alt="Crypto" 
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Pay with Crypto
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        USDC, USDT, ETH
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              )}

              {/* Fiat Payment */}
              {(paymentRequest.paymentMethod === 'fiat' || paymentRequest.paymentMethod === 'both') && (
                <button
                  onClick={() => handlePayment('fiat')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isDark
                      ? 'border-gray-700 hover:border-blue-500 bg-gray-800'
                      : 'border-gray-200 hover:border-blue-500 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                      <img 
                        src="/other icons /fast-settlements.png" 
                        alt="Fiat" 
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Pay with Bank Transfer
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Bank transfer, M-Pesa
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              )}
            </div>

            {/* Powered by NedaPay */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <img 
                  src="/other icons /nedapay-logo.svg" 
                  alt="NedaPay" 
                  className="w-4 h-4 mr-2"
                />
                Powered by NedaPay
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
