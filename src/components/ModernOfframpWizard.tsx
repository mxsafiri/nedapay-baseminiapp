'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useOffRamp from '@/hooks/useOffRamp';
import { AuthPrompt } from '@/components/AuthPrompt';
import { BASE_CHAIN, type ChainConfig } from '@/config/chains';
import { 
  X,
  ArrowRight, 
  ArrowLeft,
  DollarSign,
  Building2,
  User,
  Send,
  Check,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ModernOfframpWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'amount' | 'bank' | 'account' | 'success';

export function ModernOfframpWizard({ isOpen, onClose }: ModernOfframpWizardProps) {
  const { isAuthenticated } = useAuth();
  
  // Chain and token selection
  const [selectedChain] = useState<ChainConfig>(BASE_CHAIN);
  const [selectedToken] = useState<'USDC'>('USDC');
  
  // Enhanced off-ramp hook
  const {
    amount, setAmount,
    fiat, setFiat,
    rate,
    institution, setInstitution,
    accountIdentifier, setAccountIdentifier,
    accountName, setAccountName,
    isLoading,
    error,
    success,
    balance,
    currencies,
    institutions,
    receiveAmount,
    gasAbstractionActive,
    balanceLoading,
    handleSubmit,
    fetchInstitutions,
    handleFetchRate
  } = useOffRamp({ chain: selectedChain, token: selectedToken });
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'bank', title: 'Bank Details', icon: Building2 },
    { id: 'account', title: 'Account Info', icon: User },
    { id: 'success', title: 'Complete', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // Load institutions when fiat currency changes
  useEffect(() => {
    if (fiat && fiat !== 'USD') {
      fetchInstitutions();
    }
  }, [fiat, fetchInstitutions]);

  // Fetch rate when amount or fiat changes
  useEffect(() => {
    if (amount && fiat && parseFloat(amount) > 0) {
      handleFetchRate();
    }
  }, [amount, fiat, handleFetchRate]);

  const handleNext = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (currentStep === 'amount') {
      setCurrentStep('bank');
    } else if (currentStep === 'bank') {
      setCurrentStep('account');
    } else if (currentStep === 'account') {
      await processTransaction();
    }
  };

  const handleBack = () => {
    if (currentStep === 'bank') {
      setCurrentStep('amount');
    } else if (currentStep === 'account') {
      setCurrentStep('bank');
    }
  };

  const processTransaction = async () => {
    setIsProcessing(true);
    try {
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSubmit(mockEvent);
      
      if (success) {
        setCurrentStep('success');
        toast.success('Off-ramp transaction initiated successfully!');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'amount':
        return amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance) && fiat;
      case 'bank':
        return institution;
      case 'account':
        return accountIdentifier && accountName;
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
      <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Off-ramp</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicator */}
          {currentStep !== 'success' && (
            <div className="flex items-center justify-center mb-8">
              {steps.slice(0, -1).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    index <= currentStepIndex 
                      ? 'bg-teal-600 text-white shadow-lg' 
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {index < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 2 && (
                    <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                      index < currentStepIndex ? 'bg-teal-600' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 'amount' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">How much do you want to cash out?</h3>
                  <p className="text-white/60 text-sm">Convert your crypto to local currency</p>
                </div>
                
                {/* Balance Display */}
                <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Available Balance</span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 hover:bg-white/10 rounded transition-all duration-200"
                    >
                      {showBalance ? (
                        <Eye className="w-4 h-4 text-white/70" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-white/70" />
                      )}
                    </button>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {balanceLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : showBalance ? (
                      `${balance} USDC`
                    ) : (
                      '••••••'
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full text-center text-3xl font-bold bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg font-semibold">
                      USDC
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <select
                      value={fiat}
                      onChange={(e) => setFiat(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                    >
                      <option value="" className="bg-gray-800">Select currency</option>
                      {currencies.map((currency) => (
                        <option key={currency} value={currency} className="bg-gray-800">
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rate Display */}
                  {rate && amount && fiat && (
                    <div className="bg-teal-600/20 border border-teal-500/30 rounded-xl p-4">
                      <div className="text-center">
                        <p className="text-teal-300 text-sm mb-1">You'll receive approximately</p>
                        <p className="text-2xl font-bold text-white">
                          {receiveAmount} {fiat}
                        </p>
                        <p className="text-teal-300/70 text-xs mt-1">
                          Rate: 1 USDC = {rate} {fiat}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'bank' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Select your bank</h3>
                  <p className="text-white/60 text-sm">Choose where to receive your {fiat}</p>
                </div>
                
                <div className="space-y-3">
                  {institutions.length > 0 ? (
                    institutions.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setInstitution(bank)}
                        className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                          institution?.id === bank.id
                            ? 'bg-teal-600/20 border-teal-500/50 text-white'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{bank.name}</p>
                            <p className="text-sm opacity-70">{bank.code}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
                      <p className="text-white/60">No banks available for {fiat}</p>
                      <p className="text-white/40 text-sm">Please select a different currency</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'account' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Account details</h3>
                  <p className="text-white/60 text-sm">Enter your {institution?.name} account information</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={accountIdentifier}
                      onChange={(e) => setAccountIdentifier(e.target.value)}
                      placeholder="Enter your account number"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Enter account holder name"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Transaction Summary */}
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-white mb-3">Transaction Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount:</span>
                        <span className="text-white">{amount} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">You'll receive:</span>
                        <span className="text-white">{receiveAmount} {fiat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Bank:</span>
                        <span className="text-white">{institution?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Gas Method:</span>
                        <span className={gasAbstractionActive ? 'text-green-400' : 'text-yellow-400'}>
                          {gasAbstractionActive ? 'Gasless' : 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'success' && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Transaction Initiated!</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Your off-ramp transaction has been submitted successfully
                  </p>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount:</span>
                        <span className="text-white">{amount} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Receiving:</span>
                        <span className="text-white">{receiveAmount} {fiat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">To Account:</span>
                        <span className="text-white">{accountIdentifier}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mt-4">
                    Processing time: 1-3 business days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-600/20 border border-red-500/30 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {currentStep !== 'success' && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed() || isProcessing}
                className="flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : currentStep === 'account' ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Payment</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <AuthPrompt
          action="off-ramp crypto"
          description="Connect your wallet to convert your crypto to local currency."
          onCancel={() => setShowAuthPrompt(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
