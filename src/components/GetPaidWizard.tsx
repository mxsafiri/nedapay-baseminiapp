'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthPrompt } from '@/components/AuthPrompt';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  DollarSign,
  Link2,
  CreditCard,
  Smartphone,
  Copy,
  Share2,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GetPaidWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'amount' | 'payment-method' | 'details' | 'link-generated';

interface PaymentLinkData {
  amount: string;
  currency: string;
  paymentMethod: 'crypto' | 'fiat' | 'both';
  description: string;
  payBillNo?: string;
  accountReference?: string;
  expiryHours: string;
}

export function GetPaidWizard({ isOpen, onClose }: GetPaidWizardProps) {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  
  const [data, setData] = useState<PaymentLinkData>({
    amount: '',
    currency: 'USD',
    paymentMethod: 'both',
    description: '',
    payBillNo: '',
    accountReference: '',
    expiryHours: '24',
  });

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'payment-method', title: 'Payment Method', icon: CreditCard },
    { id: 'details', title: 'Details', icon: Smartphone },
    { id: 'link-generated', title: 'Payment Link', icon: Link2 },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    if (!isAuthenticated && currentStep === 'amount') {
      setShowAuthPrompt(true);
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      const nextStep = steps[nextStepIndex].id;
      setCurrentStep(nextStep);
      
      // Generate payment link when reaching the final step
      if (nextStep === 'link-generated') {
        generatePaymentLink();
      }
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
      case 'payment-method':
        return data.paymentMethod;
      case 'details':
        return data.description.trim().length > 0;
      case 'link-generated':
        return true;
      default:
        return false;
    }
  };

  const generatePaymentLink = () => {
    // Generate a unique payment link ID
    const linkId = Math.random().toString(36).substring(2, 15);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/pay/${linkId}`;
    setGeneratedLink(link);
  };

  const handleAuthSuccess = () => {
    setShowAuthPrompt(false);
    handleNext();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('Payment link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `Please pay ${data.amount} ${data.currency} for: ${data.description}`,
          url: generatedLink,
        });
      } catch (error) {
        // Fallback to copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Get Paid
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

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${
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

          {/* Step Content */}
          <div className="space-y-6">
            {/* Amount Step */}
            {currentStep === 'amount' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    How much do you want to get paid?
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Set the amount for your payment request
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="number"
                      value={data.amount}
                      onChange={(e) => setData({ ...data, amount: e.target.value })}
                      className={`w-full px-4 py-3 text-center text-2xl font-bold rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <select
                      value={data.currency}
                      onChange={(e) => setData({ ...data, currency: e.target.value })}
                      className={`px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="USD">USD</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="NGN">NGN</option>
                      <option value="KES">KES</option>
                      <option value="TZS">TZS</option>
                      <option value="UGX">UGX</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Step */}
            {currentStep === 'payment-method' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    How do you want to get paid?
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Choose your preferred payment method
                  </p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { 
                      id: 'crypto', 
                      title: 'Crypto Only', 
                      description: 'Accept USDC, USDT, ETH payments',
                      icon: '₿'
                    },
                    { 
                      id: 'fiat', 
                      title: 'Fiat Only', 
                      description: 'Accept bank transfers, mobile money',
                      icon: '💳'
                    },
                    { 
                      id: 'both', 
                      title: 'Both Crypto & Fiat', 
                      description: 'Maximum flexibility for your customers',
                      icon: '🌍'
                    },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setData({ ...data, paymentMethod: method.id as any })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        data.paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDark
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{method.icon}</div>
                        <div>
                          <div className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {method.title}
                          </div>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {method.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Details Step */}
            {currentStep === 'details' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Payment details
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Add details for your payment request
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Description *
                    </label>
                    <input
                      type="text"
                      value={data.description}
                      onChange={(e) => setData({ ...data, description: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Payment for services, products, etc."
                    />
                  </div>

                  {(data.paymentMethod === 'fiat' || data.paymentMethod === 'both') && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          Pay Bill No (Optional)
                        </label>
                        <input
                          type="text"
                          value={data.payBillNo}
                          onChange={(e) => setData({ ...data, payBillNo: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            isDark
                              ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          placeholder="e.g., 174379 (M-Pesa)"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          Account Reference (Optional)
                        </label>
                        <input
                          type="text"
                          value={data.accountReference}
                          onChange={(e) => setData({ ...data, accountReference: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            isDark
                              ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          placeholder="Invoice number, order ID, etc."
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Link expires in
                    </label>
                    <select
                      value={data.expiryHours}
                      onChange={(e) => setData({ ...data, expiryHours: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="1">1 hour</option>
                      <option value="6">6 hours</option>
                      <option value="24">24 hours</option>
                      <option value="72">3 days</option>
                      <option value="168">1 week</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Link Generated Step */}
            {currentStep === 'link-generated' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Payment link created!
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Share this link to receive {data.amount} {data.currency}
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {data.amount} {data.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Payment Method</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {data.paymentMethod === 'both' ? 'Crypto & Fiat' : 
                         data.paymentMethod === 'crypto' ? 'Crypto Only' : 'Fiat Only'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Description</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {data.description}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-mono truncate mr-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {generatedLink}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={shareLink}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Link
                  </Button>
                  <Button
                    onClick={() => {/* TODO: Generate QR code */}}
                    variant="outline"
                    className="flex items-center justify-center px-4"
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {currentStep !== 'link-generated' && (
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
                {currentStep === 'details' ? (
                  <>
                    Create Link
                    <Link2 className="w-4 h-4 ml-2" />
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

          {currentStep === 'link-generated' && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={onClose}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <AuthPrompt
          action="Create Payment Link"
          description="Connect your wallet to create payment links and receive payments."
          onCancel={() => setShowAuthPrompt(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
