'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { usePaycrestData } from '@/hooks/usePaycrest';
import { RateDisplay } from '@/components/RateDisplay';
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
  Hash,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OfframpWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'amount' | 'destination' | 'bank' | 'account' | 'review' | 'success';

interface OfframpData {
  amount: string;
  token: string;
  currency: string;
  institution: string;
  accountNumber: string;
  accountName: string;
  memo: string;
}

export function OfframpWizard({ isOpen, onClose }: OfframpWizardProps) {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { institutions, loadInstitutions, isLoadingInstitutions } = usePaycrestData();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [data, setData] = useState<OfframpData>({
    amount: '',
    token: 'USDC',
    currency: 'NGN',
    institution: '',
    accountNumber: '',
    accountName: '',
    memo: '',
  });

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'destination', title: 'Destination', icon: MapPin },
    { id: 'bank', title: 'Bank', icon: Building2 },
    { id: 'account', title: 'Account', icon: User },
    { id: 'review', title: 'Review', icon: Check },
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
      
      // Load institutions when reaching destination step
      if (nextStep === 'bank' && data.currency) {
        loadInstitutions(data.currency);
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
      case 'destination':
        return data.currency;
      case 'bank':
        return data.institution;
      case 'account':
        return data.accountNumber && data.accountName;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthPrompt(false);
    handleNext();
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
              Off-ramp Crypto
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
                    How much do you want to off-ramp?
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Convert your crypto to local currency
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
                      value={data.token}
                      onChange={(e) => setData({ ...data, token: e.target.value })}
                      className={`px-4 py-2 rounded-lg border ${
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
              </div>
            )}

            {/* Destination Step */}
            {currentStep === 'destination' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Where should we send your money?
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Select your local currency
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
                    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
                    { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
                    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
                    { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿' },
                    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
                  ].map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => setData({ ...data, currency: currency.code })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        data.currency === currency.code
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDark
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{currency.flag}</div>
                      <div className={`font-medium text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {currency.code}
                      </div>
                      <div className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {currency.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bank Step */}
            {currentStep === 'bank' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Select your bank
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Choose where to receive your money
                  </p>
                </div>
                
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
                  <option value="">Select your bank</option>
                  {institutions.map((inst) => (
                    <option key={inst.code} value={inst.code}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Account Step */}
            {currentStep === 'account' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Account details
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Enter your account information
                  </p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={data.accountNumber}
                    onChange={(e) => setData({ ...data, accountNumber: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Account number"
                  />
                  
                  <input
                    type="text"
                    value={data.accountName}
                    onChange={(e) => setData({ ...data, accountName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Account holder name"
                  />
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Review your off-ramp
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Confirm the details before proceeding
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {data.amount} {data.token}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>To</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {data.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Recipient</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {data.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Account</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {data.accountNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {data.amount && data.token && data.currency && (
                  <RateDisplay
                    token={data.token}
                    amount={data.amount}
                    currency={data.currency}
                    showFees={true}
                    autoRefresh={false}
                  />
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
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
                  <Send className="w-4 h-4 mr-2" />
                  Confirm Off-ramp
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <AuthPrompt
          action="Off-ramp Crypto"
          description="Connect your wallet to convert crypto to local currency."
          onCancel={() => setShowAuthPrompt(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
