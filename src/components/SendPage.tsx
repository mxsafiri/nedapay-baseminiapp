'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { usePaycrestRate, usePaycrestOrder, usePaycrestData, usePaycrestUtils } from '@/hooks/usePaycrest';
import { RateDisplay } from '@/components/RateDisplay';
import { AuthPrompt } from '@/components/AuthPrompt';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Send, 
  ArrowRight, 
  Check, 
  Copy, 
  AlertCircle,
  Clock,
  Wallet,
  Building2,
  User,
  Hash,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentFormData {
  amount: string;
  token: string;
  currency: string;
  institution: string;
  accountNumber: string;
  accountName: string;
  memo: string;
}

type FlowStep = 'form' | 'review' | 'payment' | 'success' | 'error';

export function SendPage() {
  const { isDark } = useTheme();
  const { isAuthenticated, user, walletAddress } = useAuth();
  const { formatAmount, getStatusColor, getStatusIcon } = usePaycrestUtils();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('form');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    token: 'USDC',
    currency: 'NGN',
    institution: '',
    accountNumber: '',
    accountName: '',
    memo: '',
  });
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  // Paycrest hooks
  const { currencies, institutions, loadCurrencies, loadInstitutions, isLoadingInstitutions } = usePaycrestData();
  const { createOrder, getOrderStatus, isCreatingOrder, orderError } = usePaycrestOrder();

  // Load initial data
  useEffect(() => {
    loadCurrencies();
    if (formData.currency) {
      loadInstitutions(formData.currency);
    }
  }, [formData.currency, loadCurrencies, loadInstitutions]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!walletAddress) {
      toast.error('Wallet address not found');
      return;
    }

    setCurrentStep('review');
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!walletAddress) return;

    setCurrentStep('payment');

    try {
      // Get current rate for the order
      const rateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_PAYCREST_API_URL}/v1/rates/${formData.token}/${formData.amount}/${formData.currency}`,
        {
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '',
          },
        }
      );
      
      if (!rateResponse.ok) {
        throw new Error('Failed to get current rate');
      }
      
      const rateData = await rateResponse.json();

      // Create payment order
      const orderData = {
        amount: formData.amount,
        token: formData.token,
        network: 'base',
        rate: rateData.data,
        recipient: {
          institution: formData.institution,
          accountIdentifier: formData.accountNumber,
          accountName: formData.accountName,
          currency: formData.currency,
          memo: formData.memo || `Payment from ${user?.businessName || 'NedaPay user'}`,
        },
        returnAddress: walletAddress,
      };

      const order = await createOrder(orderData);
      
      if (order) {
        setPaymentOrder(order);
        setCurrentStep('success');
        toast.success('Payment order created successfully!');
        
        // Start polling for order status
        pollOrderStatus(order.data.id);
      } else {
        throw new Error(orderError || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setCurrentStep('error');
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  // Poll order status
  const pollOrderStatus = async (orderId: string) => {
    const maxAttempts = 20;
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await getOrderStatus(orderId);
        if (status) {
          setOrderStatus(status);
          
          // Since PaycrestOrderResponse doesn't have status field in data,
          // we'll check the main status field or implement a different polling strategy
          if (status.status === 'success' || status.status === 'error') {
            return; // Stop polling
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 30000);
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    };

    poll();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleAuthSuccess = () => {
    setShowAuthPrompt(false);
    setCurrentStep('review');
  };

  const resetForm = () => {
    setCurrentStep('form');
    setFormData({
      amount: '',
      token: 'USDC',
      currency: 'NGN',
      institution: '',
      accountNumber: '',
      accountName: '',
      memo: '',
    });
    setPaymentOrder(null);
    setOrderStatus(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${
          isDark ? 'bg-blue-900/20' : 'bg-blue-100'
        }`}>
          <Send className={`w-8 h-8 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        <h1 className={`text-3xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Send Payment
        </h1>
        <p className={`text-lg ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Send crypto to bank accounts worldwide with real-time rates
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {['form', 'review', 'payment', 'success'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step
                  ? 'bg-blue-600 text-white'
                  : index < ['form', 'review', 'payment', 'success'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-600'
              }`}>
                {index < ['form', 'review', 'payment', 'success'].indexOf(currentStep) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div className={`w-16 h-0.5 mx-3 ${
                  index < ['form', 'review', 'payment', 'success'].indexOf(currentStep)
                    ? 'bg-green-600'
                    : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Step */}
      {currentStep === 'form' && (
        <Card className="p-8">
          <div className="space-y-8">
            {/* Amount and Token */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-lg ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <Wallet className="w-4 h-4 inline mr-2" />
                  Token
                </label>
                <select
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-lg ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Recipient Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => {
                  setFormData({ ...formData, currency: e.target.value, institution: '' });
                  loadInstitutions(e.target.value);
                }}
                className={`w-full px-4 py-3 rounded-xl border text-lg ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="NGN">🇳🇬 NGN - Nigerian Naira</option>
                <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                <option value="UGX">🇺🇬 UGX - Ugandan Shilling</option>
                <option value="GHS">🇬🇭 GHS - Ghanaian Cedi</option>
                <option value="TZS">🇹🇿 TZS - Tanzanian Shilling</option>
                <option value="ZAR">🇿🇦 ZAR - South African Rand</option>
                <option value="EGP">🇪🇬 EGP - Egyptian Pound</option>
                <option value="MAD">🇲🇦 MAD - Moroccan Dirham</option>
              </select>
            </div>

            {/* Institution */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <Building2 className="w-4 h-4 inline mr-2" />
                Bank/Institution
              </label>
              <select
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                disabled={isLoadingInstitutions}
                className={`w-full px-4 py-3 rounded-xl border text-lg ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
              >
                <option value="">Select Institution</option>
                {institutions.map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <Hash className="w-4 h-4 inline mr-2" />
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-lg ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <User className="w-4 h-4 inline mr-2" />
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-lg ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Memo (Optional)
              </label>
              <input
                type="text"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border text-lg ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Payment description"
              />
            </div>

            {/* Rate Display */}
            {formData.amount && formData.token && formData.currency && (
              <div className="mt-8">
                <RateDisplay
                  token={formData.token}
                  amount={formData.amount}
                  currency={formData.currency}
                  showFees={true}
                  autoRefresh={true}
                />
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleSubmit}
              className="w-full py-4 text-lg"
              size="lg"
              disabled={!formData.amount || !formData.token || !formData.currency || !formData.institution || !formData.accountNumber || !formData.accountName}
            >
              Continue to Review
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Other steps remain the same as PaycrestPaymentFlow but with better spacing */}
      {currentStep === 'review' && (
        <Card className="p-8">
          <div className="space-y-8">
            <div className={`p-6 rounded-xl ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`font-bold text-xl mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Payment Summary
              </h3>
              
              <div className="space-y-4 text-base">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatAmount(parseFloat(formData.amount), formData.token)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Recipient</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formData.accountName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Account</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formData.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Institution</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {institutions.find(i => i.code === formData.institution)?.name || formData.institution}
                  </span>
                </div>
              </div>
            </div>

            <RateDisplay
              token={formData.token}
              amount={formData.amount}
              currency={formData.currency}
              showFees={true}
              autoRefresh={false}
            />

            <div className="flex space-x-4">
              <Button
                onClick={() => setCurrentStep('form')}
                variant="outline"
                className="flex-1 py-4 text-lg"
                size="lg"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmPayment}
                className="flex-1 py-4 text-lg"
                size="lg"
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? 'Creating Order...' : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Payment, Success, and Error steps similar to PaycrestPaymentFlow but with better styling */}
      {currentStep === 'payment' && (
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Creating Payment Order
              </h3>
              <p className={`text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Please wait while we process your payment request...
              </p>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'success' && paymentOrder && (
        <Card className="p-8">
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Payment Order Created!
              </h3>
              <p className={`text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your payment order has been created successfully.
              </p>
            </div>

            {/* Order details and other success content */}
            <div className="text-center">
              <Button onClick={resetForm} className="w-full py-4 text-lg" size="lg">
                Create Another Payment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'error' && (
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Payment Failed
              </h3>
              <p className={`text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {orderError || 'An error occurred while processing your payment.'}
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setCurrentStep('form')}
                variant="outline"
                className="flex-1 py-4 text-lg"
                size="lg"
              >
                Try Again
              </Button>
              <Button
                onClick={resetForm}
                className="flex-1 py-4 text-lg"
                size="lg"
              >
                Start Over
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <AuthPrompt
          action="Create Payment Order"
          description="Connect your wallet to create and send payment orders through Paycrest."
          onCancel={() => setShowAuthPrompt(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
