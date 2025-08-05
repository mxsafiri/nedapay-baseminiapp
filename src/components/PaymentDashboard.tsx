'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { StablecoinBalance } from '@/components/StablecoinBalance';
import { PaymentProcessor } from '@/components/PaymentProcessor';
import { InvoiceGenerator } from '@/components/InvoiceGenerator';
import { FiatOfframp } from '@/components/FiatOfframp';
import { 
  CreditCard, 
  FileText, 
  ArrowUpDown, 
  Coins,
  AlertCircle 
} from 'lucide-react';

export function PaymentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const isConnected = isAuthenticated && user?.walletAddress;

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Please connect your wallet to access payment features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Payment Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="balance" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Balance
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="invoice" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoice
              </TabsTrigger>
              <TabsTrigger value="offramp" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Offramp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="mt-6">
              <StablecoinBalance />
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <PaymentProcessor />
            </TabsContent>

            <TabsContent value="invoice" className="mt-6">
              <InvoiceGenerator />
            </TabsContent>

            <TabsContent value="offramp" className="mt-6">
              <FiatOfframp />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
