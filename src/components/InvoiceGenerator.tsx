'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { stablecoins } from '@/data/stablecoins';
import { formatAddress, formatCurrency } from '@/lib/utils';
import { 
  FileText, 
  Copy, 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  ShoppingCart, 
  CreditCard, 
  Check,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceSync, type SyncableInvoice } from '@/lib/invoiceSync';
import { sharedAuth } from '@/lib/auth';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  customerName: string;
  customerEmail?: string;
  items: InvoiceItem[];
  selectedCoin: typeof stablecoins[0];
  dueDate: string;
  notes: string;
  total: number;
}

export function InvoiceGenerator() {
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  
  // Get wallet address from Privy
  const address = user?.walletAddress;
  const [currentStep, setCurrentStep] = useState(1);
  const [invoice, setInvoice] = useState<Invoice>({
    id: `INV-${Date.now()}`,
    customerName: '',
    customerEmail: '',
    items: [{ id: '1', description: 'Service/Product', quantity: 1, price: 0 }],
    selectedCoin: stablecoins[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    total: 0
  });

  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<SyncableInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 4;
  const stepTitles = [
    'Customer Details',
    'Invoice Items',
    'Payment Settings',
    'Review & Generate'
  ];

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const generateInvoice = async () => {
    if (!invoice.customerName) {
      toast.error('Please enter customer name');
      return;
    }

    if (invoice.items.some(item => !item.description || item.price <= 0)) {
      toast.error('Please complete all invoice items');
      return;
    }

    const total = calculateTotal();
    const finalInvoice = { ...invoice, total };
    setGeneratedInvoice(finalInvoice);
    toast.success('Invoice generated successfully!');
  };

  const copyPaymentLink = () => {
    if (!generatedInvoice) return;
    
    const paymentLink = `${window.location.origin}/pay?invoice=${generatedInvoice.id}&amount=${generatedInvoice.total}&token=${generatedInvoice.selectedCoin.baseToken}`;
    navigator.clipboard.writeText(paymentLink);
    toast.success('Payment link copied to clipboard!');
  };

  const downloadInvoice = () => {
    if (!generatedInvoice) return;
    
    const invoiceData = JSON.stringify(generatedInvoice, null, 2);
    const blob = new Blob([invoiceData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedInvoice.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded!');
  };

  // Wizard navigation functions
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!invoice.customerName.trim()) {
          toast.error('Please enter customer name');
          return false;
        }
        // Email is optional, but if provided, it should be valid
        if (invoice.customerEmail && invoice.customerEmail.trim() && !invoice.customerEmail.includes('@')) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      case 2:
        if (invoice.items.some(item => !item.description.trim() || item.price <= 0)) {
          toast.error('Please complete all invoice items');
          return false;
        }
        return true;
      case 3:
        return true; // Payment settings are optional/have defaults
      default:
        return true;
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setGeneratedInvoice(null);
    setInvoice({
      id: `INV-${Date.now()}`,
      customerName: '',
      customerEmail: '',
      items: [{ id: '1', description: 'Service/Product', quantity: 1, price: 0 }],
      selectedCoin: stablecoins[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      total: 0
    });
  };

  if (generatedInvoice) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden shadow-lg`}>
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Invoice Generated!</h2>
                <p className="text-green-100">#{generatedInvoice.id}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-6 space-y-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Customer:</span>
                  <span className="font-medium">{generatedInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {generatedInvoice.total.toFixed(2)} {generatedInvoice.selectedCoin.baseToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyPaymentLink}
                className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
              <button
                onClick={downloadInvoice}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
                  isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>

            <button
              onClick={resetWizard}
              className={`w-full p-3 rounded-xl border-2 border-dashed ${
                isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Create New Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden shadow-lg`}>
        {/* Wizard Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Invoice</h2>
              <p className="text-blue-100">Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Who are you invoicing?</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={invoice.customerName}
                    onChange={(e) => setInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
                
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="email"
                    placeholder="customer@example.com (optional)"
                    value={invoice.customerEmail || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <ShoppingCart className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className="text-lg font-semibold mb-2">Invoice Items</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>What are you charging for?</p>
              </div>
              
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Item description (e.g., Web Design Service)"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark 
                            ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              isDark 
                                ? 'bg-gray-900 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              isDark 
                                ? 'bg-gray-900 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          />
                        </div>
                        
                        <div className="flex items-end">
                          {invoice.items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className={`w-full px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${
                                isDark 
                                  ? 'border-red-800 text-red-400 hover:border-red-700 hover:bg-red-900/20' 
                                  : 'border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className={`text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Subtotal: <span className="font-medium">${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addItem}
                  className={`w-full p-4 rounded-xl border-2 border-dashed transition-colors ${
                    isDark 
                      ? 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-5 w-5 mx-auto mb-1" />
                  Add Another Item
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CreditCard className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className="text-lg font-semibold mb-2">Payment Settings</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Choose currency and due date</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment Currency</label>
                  <div className="grid grid-cols-2 gap-3">
                    {stablecoins.map((coin) => (
                      <button
                        key={coin.baseToken}
                        onClick={() => setInvoice(prev => ({ ...prev, selectedCoin: coin }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          invoice.selectedCoin.baseToken === coin.baseToken
                            ? 'border-blue-500 bg-blue-500/10'
                            : isDark
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{coin.icon}</span>
                          <div className="text-left">
                            <div className="font-medium">{coin.baseToken}</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{coin.name}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="date"
                        value={invoice.dueDate}
                        onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="Payment terms, etc."
                      value={invoice.notes}
                      onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Check className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <h3 className="text-lg font-semibold mb-2">Review & Generate</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Double-check your invoice details</p>
              </div>
              
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Customer:</span>
                    <span className="font-medium">{invoice.customerName}</span>
                  </div>
                  {invoice.customerEmail && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                      <span className="font-medium">{invoice.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Currency:</span>
                    <span className="font-medium">{invoice.selectedCoin.baseToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Due Date:</span>
                    <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Items:</h4>
                    {invoice.items.map((item, index) => (
                      <div key={item.id} className="flex justify-between text-sm mb-2">
                        <span>{item.description} (×{item.quantity})</span>
                        <span>${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-xl font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculateTotal().toFixed(2)} {invoice.selectedCoin.baseToken}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                currentStep === 1
                  ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={generateInvoice}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Generate Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
