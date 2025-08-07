'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { usePaycrestData } from '@/hooks/usePaycrest';
import { AuthPrompt } from '@/components/AuthPrompt';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  DollarSign,
  MapPin,
  Building2,
  User,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

type WizardStep = 'amount' | 'destination' | 'recipient' | 'review' | 'processing' | 'success';

interface SendData {
  amount: string;
  token: string;
  currency: string;
  recipientName: string;
  recipientPhone: string;
  institution: string;
  accountNumber: string;
  memo: string;
}

export function SendWizard() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { institutions, loadInstitutions, isLoadingInstitutions } = usePaycrestData();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [estimatedFee, setEstimatedFee] = useState<number>(0);
  
  const [data, setData] = useState<SendData>({
    amount: '',
    token: 'USDC',
    currency: 'NGN',
    recipientName: '',
    recipientPhone: '',
    institution: '',
    accountNumber: '',
    memo: '',
  });

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'destination', title: 'Destination', icon: MapPin },
    { id: 'recipient', title: 'Recipient', icon: User },
    { id: 'review', title: 'Review', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // Fetch exchange rate when amount or currency changes
  useEffect(() => {
    if (data.amount && data.token && data.currency && parseFloat(data.amount) > 0) {
      fetchExchangeRate();
    }
  }, [data.amount, data.token, data.currency]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(`/api/paycrest/rates?token=${data.token}&amount=${data.amount}&currency=${data.currency}&network=base`);
      if (response.ok) {
        const rateData = await response.json();
        setExchangeRate(parseFloat(rateData.data) || 0); // Fix: use data.data instead of data.rate
        setEstimatedFee(rateData.fee || 0);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const handleNext = () => {
    if (!isAuthenticated && currentStep === 'amount') {
      setShowAuthPrompt(true);
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      const nextStep = steps[nextStepIndex].id;
      setCurrentStep(nextStep);
      
      // Load institutions when reaching destination step
      if (nextStep === 'recipient' && data.currency) {
        loadInstitutions(data.currency);
      }
    } else if (currentStep === 'review') {
      // Process the payment
      processPayment();
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'amount':
        return data.amount && parseFloat(data.amount) > 0;
      case 'destination':
        return data.currency;
      case 'recipient':
        return data.recipientName && data.recipientPhone && data.institution && data.accountNumber;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const processPayment = async () => {
    setCurrentStep('processing');
    setIsProcessing(true);

    try {
      // Create payment order via Paycrest API
      const orderData = {
        token: data.token,
        amount: parseFloat(data.amount),
        currency: data.currency,
        recipient: {
          name: data.recipientName,
          phone: data.recipientPhone,
          institution: data.institution,
          accountNumber: data.accountNumber,
        },
        memo: data.memo,
      };

      const response = await fetch('/api/paycrest/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setTransactionId(result.orderId || result.id || 'TXN_' + Date.now());
        
        // Simulate processing time
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep('success');
          toast.success('Payment sent successfully!');
        }, 3000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setCurrentStep('review');
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthPrompt(false);
    handleNext();
  };

  const resetWizard = () => {
    setCurrentStep('amount');
    setData({
      amount: '',
      token: 'USDC',
      currency: 'NGN',
      recipientName: '',
      recipientPhone: '',
      institution: '',
      accountNumber: '',
      memo: '',
    });
    setTransactionId('');
    setExchangeRate(0);
    setEstimatedFee(0);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Send Money
            </h2>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Send crypto to any bank account in Africa
            </p>
          </div>

          {/* Progress Indicator - Only show for main steps */}
          {!['processing', 'success'].includes(currentStep) && (
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                          ? 'bg-green-600 text-white'
                          : isDark
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        isCompleted
                          ? 'bg-green-600'
                          : isDark
                            ? 'bg-gray-700'
                            : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {/* Amount Step */}
            {currentStep === 'amount' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    How much do you want to send?
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="number"
                      value={data.amount}
                      onChange={(e) => setData({ ...data, amount: e.target.value })}
                      className={`w-full px-6 py-4 text-center text-3xl font-bold rounded-2xl border-2 ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <select
                      value={data.token}
                      onChange={(e) => setData({ ...data, token: e.target.value })}
                      className={`px-6 py-3 rounded-xl border text-lg font-medium ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>

                  {exchangeRate > 0 && (
                    <div className={`text-center p-4 rounded-xl ${
                      isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className="text-sm text-gray-500 mb-1">You'll send approximately</div>
                      <div className={`text-xl font-bold ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {(parseFloat(data.amount) * exchangeRate).toLocaleString()} {data.currency}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Rate: 1 {data.token} = {exchangeRate.toLocaleString()} {data.currency}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Destination Step */}
            {currentStep === 'destination' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Where are you sending money?
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Select the destination country and currency
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { code: 'NGN', name: 'Nigeria', flag: '🇳🇬' },
                    { code: 'KES', name: 'Kenya', flag: '🇰🇪' },
                    { code: 'TZS', name: 'Tanzania', flag: '🇹🇿' },
                    { code: 'UGX', name: 'Uganda', flag: '🇺🇬' },
                    { code: 'GHS', name: 'Ghana', flag: '🇬🇭' },
                    { code: 'ZAR', name: 'South Africa', flag: '🇿🇦' },
                  ].map((country) => (
                    <button
                      key={country.code}
                      onClick={() => setData({ ...data, currency: country.code })}
                      className={`p-6 rounded-2xl border-2 text-center transition-all ${
                        data.currency === country.code
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDark
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{country.flag}</div>
                      <div className={`font-semibold text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {country.name}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {country.code}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recipient Step */}
            {currentStep === 'recipient' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Who are you sending money to?
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Enter recipient details
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      value={data.recipientName}
                      onChange={(e) => setData({ ...data, recipientName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={data.recipientPhone}
                      onChange={(e) => setData({ ...data, recipientPhone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="+254712345678"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Bank/Institution *
                    </label>
                    <select
                      value={data.institution}
                      onChange={(e) => setData({ ...data, institution: e.target.value })}
                      disabled={isLoadingInstitutions}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">Select bank/institution</option>
                      {institutions.map((inst) => (
                        <option key={inst.code} value={inst.code}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={data.accountNumber}
                      onChange={(e) => setData({ ...data, accountNumber: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Memo (Optional)
                    </label>
                    <input
                      type="text"
                      value={data.memo}
                      onChange={(e) => setData({ ...data, memo: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Payment for services"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Review your transfer
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Please confirm the details before sending
                  </p>
                </div>
                
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>You send</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {data.amount} {data.token}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Recipient gets</span>
                      <span className={`font-semibold text-green-600`}>
                        {(parseFloat(data.amount) * exchangeRate).toLocaleString()} {data.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Exchange rate</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        1 {data.token} = {exchangeRate.toLocaleString()} {data.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Fee</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {estimatedFee} {data.token}
                      </span>
                    </div>
                    <hr className={isDark ? 'border-gray-700' : 'border-gray-200'} />
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>To</span>
                      <div className="text-right">
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {data.recipientName}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {data.recipientPhone}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {data.accountNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {currentStep === 'processing' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Processing your transfer...
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Please wait while we process your payment
                  </p>
                </div>
              </div>
            )}

            {/* Success Step */}
            {currentStep === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Transfer successful!
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Your money has been sent to {data.recipientName}
                  </p>
                </div>

                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}>
                  <div className="text-sm text-gray-500 mb-1">Transaction ID</div>
                  <div className={`font-mono text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {transactionId}
                  </div>
                </div>

                <Button
                  onClick={resetWizard}
                  className="w-full"
                >
                  Send Another Transfer
                </Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          {!['processing', 'success'].includes(currentStep) && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={currentStepIndex === 0}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center"
              >
                {currentStep === 'review' ? (
                  <>
                    Send Money
                    <Send className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <AuthPrompt
          action="Send Money"
          description="Connect your wallet to send money to any bank account in Africa."
          onCancel={() => setShowAuthPrompt(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
