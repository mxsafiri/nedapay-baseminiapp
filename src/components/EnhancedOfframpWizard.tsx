'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import useOffRamp from '@/hooks/useOffRamp';
import { AuthPrompt } from '@/components/AuthPrompt';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BASE_CHAIN, SUPPORTED_CHAINS, type ChainConfig } from '@/config/chains';
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  DollarSign,
  MapPin,
  Building2,
  User,
  Hash,
  Send,
  Zap,
  AlertCircle,
  Loader2,
  Network,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedOfframpWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'amount' | 'destination' | 'bank' | 'account' | 'review' | 'success';

export function EnhancedOfframpWizard({ isOpen, onClose }: EnhancedOfframpWizardProps) {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Chain and token selection
  const [selectedChain, setSelectedChain] = useState<ChainConfig>(BASE_CHAIN);
  const [selectedToken] = useState<'USDC'>('USDC'); // Start with USDC only
  
  // Enhanced off-ramp hook with gas abstraction
  const {
    amount, setAmount,
    fiat, setFiat,
    rate,
    institution, setInstitution,
    accountIdentifier, setAccountIdentifier,
    accountName, setAccountName,
    memo, setMemo,
    isLoading,
    error,
    success,
    isAccountVerified,
    balance,
    currencies,
    institutions,
    receiveAmount,
    gasAbstractionActive,
    gasAbstractionInitializing,
    isCoinbaseWallet,
    gasAbstractionFailed,
    feeCurrency,
    estimatedFee,
    balanceLoading,
    handleVerifyAccount,
    handleFetchRate,
    handleSubmit,
    fetchInstitutions
  } = useOffRamp({ chain: selectedChain, token: selectedToken });
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'destination', title: 'Destination', icon: MapPin },
    { id: 'bank', title: 'Bank', icon: Building2 },
    { id: 'account', title: 'Account', icon: User },
    { id: 'review', title: 'Review', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // Load institutions when fiat currency changes
  useEffect(() => {
    if (fiat) {
      fetchInstitutions();
    }
  }, [fiat, fetchInstitutions]);

  const handleNext = () => {
    if (!isAuthenticated && currentStep === 'amount') {
      setShowAuthPrompt(true);
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      const nextStep = steps[nextStepIndex].id;
      setCurrentStep(nextStep);
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
        return amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance);
      case 'destination':
        return fiat;
      case 'bank':
        return institution;
      case 'account':
        return accountIdentifier && accountName;
      case 'review':
        return rate && receiveAmount;
      default:
        return false;
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthPrompt(false);
    handleNext();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'review') {
      await handleSubmit(e);
      if (success) {
        setCurrentStep('success');
      }
    } else {
      handleNext();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Enhanced Off-ramp
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
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
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

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {success && currentStep === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Payment Initiated!
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Your off-ramp transaction has been successfully submitted.
              </p>
              <pre className={`text-xs p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} whitespace-pre-wrap`}>
                {success}
              </pre>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {/* Step Content */}
          {currentStep !== 'success' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
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

                  {/* Chain Selection */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Network className="w-4 h-4 inline mr-2" />
                      Blockchain Network
                    </label>
                    <select
                      value={selectedChain.id}
                      onChange={(e) => {
                        const chain = SUPPORTED_CHAINS.find(c => c.id === parseInt(e.target.value));
                        if (chain) setSelectedChain(chain);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      {SUPPORTED_CHAINS.map((chain) => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name} ({chain.nativeCurrency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gas Abstraction Status */}
                  <div className={`p-3 rounded-lg border ${
                    gasAbstractionActive
                      ? isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                      : isDark ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {gasAbstractionInitializing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      ) : gasAbstractionActive ? (
                        <Zap className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          gasAbstractionActive
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {gasAbstractionInitializing
                            ? 'Initializing gasless transactions...'
                            : gasAbstractionActive
                            ? '✨ Gasless transactions enabled'
                            : isCoinbaseWallet
                            ? '⚠️ Coinbase wallet: Standard gas fees apply'
                            : '⚠️ Standard gas fees apply'
                          }
                        </p>
                        <p className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Pay fees in {feeCurrency} (≈{estimatedFee} {feeCurrency})
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Balance Display */}
                  <div className={`text-center p-3 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-center space-x-2">
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Available Balance
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowBalance(!showBalance)}
                        className={`p-1 rounded ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                      >
                        {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {balanceLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin inline" />
                      ) : showBalance ? (
                        `${balance} ${selectedToken}`
                      ) : (
                        '••••••'
                      )}
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full px-4 py-3 text-center text-2xl font-bold rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="100"
                      max={balance}
                      step="0.01"
                    />
                    <div className="text-center mt-2">
                      <span className={`text-lg font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedToken}
                      </span>
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
                      Choose your destination currency
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Select the currency you want to receive
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
                      { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
                      { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
                      { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿' },
                      { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
                      { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
                    ].map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => setFiat(currency.code)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          fiat === currency.code
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
                      Choose where to receive your {fiat}
                    </p>
                  </div>
                  
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    <option value="">Select a bank...</option>
                    {Array.isArray(institutions) ? institutions.map((inst) => (
                      <option key={inst.code} value={inst.code}>
                        {inst.name}
                      </option>
                    )) : (
                      <option disabled>Loading banks...</option>
                    )}
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
                      value={accountIdentifier}
                      onChange={(e) => setAccountIdentifier(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Account number"
                    />
                    
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Account holder name"
                    />

                    <input
                      type="text"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Memo (optional)"
                    />

                    {!isAccountVerified && accountIdentifier && accountName && (
                      <Button
                        type="button"
                        onClick={handleVerifyAccount}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Verify Account
                      </Button>
                    )}

                    {isAccountVerified && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                        <p className="text-green-700 dark:text-green-300 text-sm flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Account verified successfully
                        </p>
                      </div>
                    )}
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
                      Review your transaction
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Please confirm the details below
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{amount} {selectedToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Network:</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedChain.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>To Currency:</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{fiat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Account:</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{accountIdentifier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Gas Method:</span>
                        <span className={`${gasAbstractionActive ? 'text-green-500' : 'text-yellow-500'}`}>
                          {gasAbstractionActive ? 'Gasless' : 'Standard'}
                        </span>
                      </div>
                      {rate && (
                        <div className="flex justify-between font-semibold">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>You'll receive:</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{receiveAmount} {fiat}</span>
                        </div>
                      )}
                      {currentStep === 'review' && rate && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700 dark:text-green-300">Exchange Rate:</span>
                            <span className="font-semibold text-green-800 dark:text-green-200">
                              1 USDC = {rate} {fiat}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            You will receive approximately {(parseFloat(amount) * parseFloat(rate)).toFixed(2)} {fiat}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex space-x-3 pt-4">
                {currentStepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                <Button
                  type="submit"
                  disabled={!canProceed() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : currentStep === 'review' ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Payment
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <AuthPrompt
          action="off-ramp crypto"
          description="Please connect your wallet to continue with the off-ramp process."
          onCancel={() => setShowAuthPrompt(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
