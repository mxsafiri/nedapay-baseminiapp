'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { stablecoins } from '@/data/stablecoins';
import { formatBalance, formatCurrency } from '@/lib/utils';
import { ArrowUpDown, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OfframpQuote {
  inputAmount: number;
  outputAmount: number;
  exchangeRate: number;
  fees: number;
  processingTime: string;
}

export function FiatOfframp() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState(stablecoins[0]);
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [quote, setQuote] = useState<OfframpQuote | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get wallet address from Privy
  const address = user?.walletAddress;
  const isConnected = isAuthenticated && address;

  // Placeholder balance - in production you'd fetch real balance
  const balance = isConnected ? { value: BigInt('1650500000'), decimals: 6, formatted: '1,650.50' } : null;

  const availableBalance = balance 
    ? parseFloat(formatBalance(balance.value.toString(), selectedCoin.decimals))
    : 0;

  const getOfframpQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsGettingQuote(true);
    
    // Simulate API call for quote
    setTimeout(() => {
      const inputAmount = parseFloat(amount);
      const exchangeRate = selectedCoin.currency === 'USD' ? 1 : 
                          selectedCoin.currency === 'NGN' ? 1650 :
                          selectedCoin.currency === 'ZAR' ? 18.5 : 1;
      
      const fees = inputAmount * 0.015; // 1.5% fee
      const outputAmount = (inputAmount - fees) * exchangeRate;

      const newQuote: OfframpQuote = {
        inputAmount,
        outputAmount,
        exchangeRate,
        fees,
        processingTime: '1-3 business days'
      };

      setQuote(newQuote);
      setIsGettingQuote(false);
      toast.success('Quote generated successfully!');
    }, 2000);
  };

  const processOfframp = async () => {
    if (!quote || !bankAccount) {
      toast.error('Please complete all fields');
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Offramp request submitted successfully!');
      setQuote(null);
      setAmount('');
      setBankAccount('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Fiat Offramp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCoin.flag}</span>
                <span className="font-semibold">{selectedCoin.baseToken} Balance</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {availableBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stablecoin Selection */}
          <div className="space-y-2">
            <Label>Select Stablecoin to Convert</Label>
            <div className="grid grid-cols-2 gap-2">
              {stablecoins.map((coin) => (
                <Button
                  key={coin.address}
                  variant={selectedCoin.address === coin.address ? "default" : "outline"}
                  onClick={() => setSelectedCoin(coin)}
                  className="flex items-center gap-2 h-auto p-3"
                  size="sm"
                >
                  <span>{coin.flag}</span>
                  <div className="text-left">
                    <div className="font-semibold">{coin.baseToken}</div>
                    <div className="text-xs opacity-70">to {coin.currency}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Convert</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                max={availableBalance}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {selectedCoin.baseToken}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Min: 10.00 {selectedCoin.baseToken}</span>
              <span>Max: {availableBalance.toFixed(2)} {selectedCoin.baseToken}</span>
            </div>
          </div>

          {/* Get Quote Button */}
          {!quote && (
            <Button 
              onClick={getOfframpQuote}
              disabled={isGettingQuote || !amount}
              className="w-full"
            >
              {isGettingQuote ? 'Getting Quote...' : 'Get Quote'}
            </Button>
          )}

          {/* Quote Display */}
          {quote && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Conversion Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">You Send:</span>
                    <div className="font-semibold">
                      {quote.inputAmount.toFixed(2)} {selectedCoin.baseToken}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">You Receive:</span>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(quote.outputAmount, selectedCoin.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Exchange Rate:</span>
                    <div className="font-semibold">
                      1 {selectedCoin.baseToken} = {quote.exchangeRate.toFixed(2)} {selectedCoin.currency}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Processing Time:</span>
                    <div className="font-semibold">{quote.processingTime}</div>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Network Fee:</span>
                    <span>Gas abstracted</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee (1.5%):</span>
                    <span>{quote.fees.toFixed(2)} {selectedCoin.baseToken}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Account Input */}
          {quote && (
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account Details</Label>
              <Input
                id="bankAccount"
                placeholder="Account number or IBAN"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Ensure your bank account matches your verified identity</span>
              </div>
            </div>
          )}

          {/* Process Offramp Button */}
          {quote && (
            <div className="space-y-3">
              <Button 
                onClick={processOfframp}
                disabled={isProcessing || !bankAccount}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Confirm Offramp'}
              </Button>
              
              <Button 
                onClick={() => setQuote(null)}
                variant="outline"
                className="w-full"
              >
                Get New Quote
              </Button>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-semibold mb-1">Important Notice:</p>
                <ul className="space-y-1">
                  <li>• KYC verification required for fiat offramp</li>
                  <li>• Processing times may vary by region</li>
                  <li>• Exchange rates are indicative and may change</li>
                  <li>• Additional fees may apply from your bank</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
