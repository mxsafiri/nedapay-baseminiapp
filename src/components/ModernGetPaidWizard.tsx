'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthPrompt } from '@/components/AuthPrompt';
import { 
  X,
  ArrowRight, 
  ArrowLeft,
  DollarSign,
  Link2,
  CreditCard,
  Copy,
  Share2,
  QrCode,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ModernGetPaidWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'amount' | 'details' | 'generated';

interface PaymentData {
  amount: string;
  currency: string;
  description: string;
  expiryHours: string;
}

export function ModernGetPaidWizard({ isOpen, onClose }: ModernGetPaidWizardProps) {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [data, setData] = useState<PaymentData>({
    amount: '',
    currency: 'USD',
    description: '',
    expiryHours: '24',
  });

  const steps = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'details', title: 'Details', icon: CreditCard },
    { id: 'generated', title: 'Link Ready', icon: Link2 },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (currentStep === 'amount') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      await generatePaymentLink();
    }
  };

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('amount');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'amount':
        return data.amount && parseFloat(data.amount) > 0;
      case 'details':
        return data.description.trim().length > 0;
      default:
        return false;
    }
  };

  const generatePaymentLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create payment request');
      
      const result = await response.json();
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/pay/${result.paymentId}`;
      setGeneratedLink(link);
      setCurrentStep('generated');
      
      toast.success('Payment link created successfully!');
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('Failed to create payment link');
    } finally {
      setIsLoading(false);
    }
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
          text: `Payment request for ${data.amount} ${data.currency}`,
          url: generatedLink,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Get Paid</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  index <= currentStepIndex 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 'amount' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">How much do you want to get paid?</h3>
                  <p className="text-white/60 text-sm">Set the amount for your payment request</p>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={data.amount}
                      onChange={(e) => setData({ ...data, amount: e.target.value })}
                      placeholder="100"
                      className="w-full text-center text-3xl font-bold bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <select
                      value={data.currency}
                      onChange={(e) => setData({ ...data, currency: e.target.value })}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="USD" className="bg-gray-800">USD</option>
                      <option value="EUR" className="bg-gray-800">EUR</option>
                      <option value="GBP" className="bg-gray-800">GBP</option>
                      <option value="KES" className="bg-gray-800">KES</option>
                      <option value="NGN" className="bg-gray-800">NGN</option>
                      <option value="TZS" className="bg-gray-800">TZS</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'details' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Add payment details</h3>
                  <p className="text-white/60 text-sm">Provide context for your payment request</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                    <textarea
                      value={data.description}
                      onChange={(e) => setData({ ...data, description: e.target.value })}
                      placeholder="What is this payment for?"
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Expires in</label>
                    <select
                      value={data.expiryHours}
                      onChange={(e) => setData({ ...data, expiryHours: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="1" className="bg-gray-800">1 hour</option>
                      <option value="6" className="bg-gray-800">6 hours</option>
                      <option value="24" className="bg-gray-800">24 hours</option>
                      <option value="168" className="bg-gray-800">7 days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'generated' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Payment link created!</h3>
                  <p className="text-white/60 text-sm">Share this link to receive your payment</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-white">{data.amount} {data.currency}</p>
                      <p className="text-white/60 text-sm">{data.description}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm font-mono truncate mr-2">
                        {generatedLink}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        <Copy className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={shareLink}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Link</span>
                    </button>
                    <button
                      onClick={() => {/* TODO: Generate QR code */}}
                      className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all duration-200"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {currentStep !== 'generated' && (
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
                disabled={!canProceed() || isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200"
              >
                <span>{isLoading ? 'Creating...' : currentStep === 'details' ? 'Create Link' : 'Next'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {currentStep === 'generated' && (
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
          action="Create Payment Link"
          description="Connect your wallet to create payment links and receive payments."
          onCancel={() => setShowAuthPrompt(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
