'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { stablecoins } from '@/data/stablecoins';
import { formatAddress } from '@/lib/utils';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function PaymentProcessor() {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(stablecoins[0]);
  const [memo, setMemo] = useState('');

  const { 
    data: hash, 
    sendTransaction, 
    isPending: isSending 
  } = useSendTransaction();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSendPayment = async () => {
    if (!recipient || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      const amountInWei = parseUnits(amount, selectedCoin.decimals);
      
      // For USDC and other ERC-20 tokens, we'd need to use a contract call
      // For now, this is a simplified ETH transfer example
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });

      toast.success('Transaction submitted!');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to send payment');
    }
  };

  const resetForm = () => {
    setRecipient('');
    setAmount('');
    setMemo('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stablecoin Selection */}
          <div className="space-y-2">
            <Label>Select Stablecoin</Label>
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
                  <span>{coin.baseToken}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({selectedCoin.baseToken})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          {/* Memo (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Input
              id="memo"
              placeholder="Payment description..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {/* Transaction Status */}
          {hash && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                {isConfirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isConfirmed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isConfirming ? 'Confirming...' : isConfirmed ? 'Confirmed!' : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1 font-mono">
                {formatAddress(hash)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSendPayment}
              disabled={isSending || isConfirming || !recipient || !amount}
              className="flex-1"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Payment
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isSending || isConfirming}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
