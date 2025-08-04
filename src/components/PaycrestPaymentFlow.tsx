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
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  Clock,
  Wallet,
  Building2,
  User,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaycrestPaymentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: string;
  defaultToken?: string;
  defaultCurrency?: string;
}

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

export function PaycrestPaymentFlow({
  isOpen,
  onClose,
  defaultAmount = '100',
  defaultToken = 'USDC',
  defaultCurrency = 'NGN',
}: PaycrestPaymentFlowProps) {
  const { isDark } = useTheme();
  const { isAuthenticated, user, walletAddress } = useAuth();
  const { formatAmount, getStatusColor, getStatusIcon } = usePaycrestUtils();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('form');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: defaultAmount,
    token: defaultToken,
    currency: defaultCurrency,
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
    if (isOpen) {
      loadCurrencies();
      if (formData.currency) {
        loadInstitutions(formData.currency);
      }
    }
  }, [isOpen, formData.currency, loadCurrencies, loadInstitutions]);

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
        network: 'base', // Default to Base network
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
    const maxAttempts = 20; // Poll for up to 10 minutes (30s intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await getOrderStatus(orderId);
        if (status) {
          setOrderStatus(status);
          
          if (status.data.status === 'completed' || status.data.status === 'failed') {
            return; // Stop polling
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 30000); // Poll every 30 seconds
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Send Payment
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              ✕
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {['form', 'review', 'payment', 'success'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : index < ['form', 'review', 'payment', 'success'].indexOf(currentStep)
                        ? 'bg-green-600 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < ['form', 'review', 'payment', 'success'].indexOf(currentStep) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${
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
            <div className="space-y-6">
              {/* Amount and Token */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Token
                  </label>
                  <select
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Recipient Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => {
                    setFormData({ ...formData, currency: e.target.value, institution: '' });
                    loadInstitutions(e.target.value);
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
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
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Bank/Institution
                </label>
                <select
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  disabled={isLoadingInstitutions}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
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
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Payment description"
                />
              </div>

              {/* Rate Display */}
              {formData.amount && formData.token && formData.currency && (
                <RateDisplay
                  token={formData.token}
                  amount={formData.amount}
                  currency={formData.currency}
                  showFees={true}
                  autoRefresh={true}
                />
              )}

              {/* Continue Button */}
              <Button
                onClick={handleSubmit}
                className="w-full"
                size="lg"
                disabled={!formData.amount || !formData.token || !formData.currency || !formData.institution || !formData.accountNumber || !formData.accountName}
              >
                Continue to Review
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}>
                <h3 className={`font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Payment Summary
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatAmount(parseFloat(formData.amount), formData.token)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Recipient</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formData.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Account</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formData.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Institution</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
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

              <div className="flex space-x-3">
                <Button
                  onClick={() => setCurrentStep('form')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  className="flex-1"
                  disabled={isCreatingOrder}
                >
                  {isCreatingOrder ? 'Creating Order...' : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Creating Payment Order
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Please wait while we process your payment request...
                </p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && paymentOrder && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Payment Order Created!
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your payment order has been created successfully.
                </p>
              </div>

              {/* Order Details */}
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Order ID</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {paymentOrder.data.id.slice(0, 8)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(paymentOrder.data.id, 'Order ID')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Send To</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {paymentOrder.data.receiveAddress.slice(0, 6)}...{paymentOrder.data.receiveAddress.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(paymentOrder.data.receiveAddress, 'Address')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Valid Until</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {new Date(paymentOrder.data.validUntil).toLocaleString()}
                    </span>
                  </div>

                  {orderStatus && (
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status</span>
                      <div className="flex items-center space-x-2">
                        <span>{getStatusIcon(orderStatus.data.status)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderStatus.data.status)}`}>
                          {orderStatus.data.status.charAt(0).toUpperCase() + orderStatus.data.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className={`text-sm mb-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Send {formatAmount(parseFloat(paymentOrder.data.amount), paymentOrder.data.token)} to the address above to complete the payment.
                </p>
                
                <Button onClick={onClose} className="w-full">
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {currentStep === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Payment Failed
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {orderError || 'An error occurred while processing your payment.'}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setCurrentStep('form')}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

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
