'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useBalance } from '@/hooks/useBalance';
import { formatUnits } from 'viem';
import { stablecoins } from '@/data/stablecoins';
import { formatBalance, formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  Plus, 
  Send, 
  ArrowDownToLine,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  Gift,
  Percent,
  QrCode,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import PromoSetupWizard from './PromoSetupWizard';
import SharePreviewModal from './SharePreviewModal';
import QRPreviewModal from './QRPreviewModal';
import { useOffers } from '@/contexts/OffersContext';
import { RateDisplay } from '@/components/RateDisplay';
import { EnhancedOfframpWizard } from './EnhancedOfframpWizard';
import { GetPaidWizard } from './GetPaidWizard';

export default function MPulseDashboard() {
  const { isDark } = useTheme();
  const { user, isAuthenticated, ready, wallets } = useAuth();
  
  // Get wallet address from Privy wallets directly
  const walletAddress = wallets?.[0]?.address;
  const { usdc, eth, isLoading: balanceLoading, refetch } = useBalance(walletAddress);
  const { getActiveOffers } = useOffers();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedStablecoin, setSelectedStablecoin] = useState('USDC');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPromoWizard, setShowPromoWizard] = useState(false);
  const [sharingOffer, setSharingOffer] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [showOfframpWizard, setShowOfframpWizard] = useState(false);
  const [showGetPaidWizard, setShowGetPaidWizard] = useState(false);

  // Get the selected stablecoin configuration
  const selectedCoin = stablecoins.find(coin => coin.baseToken === selectedStablecoin) || stablecoins[0];
  
  // Use the same wallet address from Privy wallets
  const isConnected = isAuthenticated && walletAddress;

  // Use real RPC-fetched balance based on selected stablecoin
  const getRealBalance = () => {
    if (!isConnected) return '0.00';
    
    if (selectedStablecoin === 'USDC') {
      return usdc || '0.00';
    }
    
    if (selectedStablecoin === 'ETH') {
      return eth || '0.00';
    }
    
    return '0.00';
  };
  
  const formattedBalance = getRealBalance();

  // For now, we'll show a simple message instead of mock growth data
  // In a real app, you'd calculate this from historical balance data
  const balanceValue = parseFloat(formattedBalance);

  const handleCreateOffer = () => {
    console.log('Create Offer button clicked!');
    console.log('Current showPromoWizard state:', showPromoWizard);
    setShowPromoWizard(true);
    console.log('Setting showPromoWizard to true');
    toast.success('Opening promo wizard...');
  };

  const handleSend = () => {
    toast.success('Opening send interface...');
  };

  const handleOfframp = () => {
    toast.success('Opening off-ramp interface...');
  };

  const handleGenerateQR = () => {
    setShowQRPreview(true);
  };

  const handleShare = (offer: any) => {
    setSharingOffer(offer);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSharingOffer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 space-y-4">
      {/* Portfolio Balance Section - Exact Match */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="mb-6">
          <p className="text-white/70 text-sm mb-3">Portfolio Balance</p>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                {balanceVisible ? `${formattedBalance} ${selectedStablecoin}` : '••••••'}
              </h2>
              {/* Wallet address display - compact */}
              {isConnected && walletAddress && (
                <p className="text-white/50 text-sm font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedStablecoin}
                onChange={(e) => setSelectedStablecoin(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm backdrop-blur-sm hover:bg-white/20 transition-all duration-200 focus:outline-none"
              >
                {stablecoins.map((coin) => (
                  <option key={coin.baseToken} value={coin.baseToken} className="bg-gray-800 text-white">
                    {coin.baseToken}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
              >
                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Exact Match */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowGetPaidWizard(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-4 transition-all duration-200 flex flex-col items-center space-y-2"
          >
            <Plus className="w-6 h-6 text-white" />
            <span className="text-white font-medium text-sm">Get Paid</span>
          </button>
          
          <button
            onClick={handleGenerateQR}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-all duration-200 flex flex-col items-center space-y-2"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </div>
            <span className="text-white font-medium text-sm">Generate QR</span>
          </button>
          
          <button
            onClick={() => setShowOfframpWizard(true)}
            className="bg-teal-600 hover:bg-teal-700 rounded-2xl p-4 transition-all duration-200 flex flex-col items-center space-y-2"
          >
            <ArrowDownToLine className="w-6 h-6 text-white" />
            <span className="text-white font-medium text-sm">Off-ramp</span>
          </button>
        </div>
      </div>

      {/* Business Growth Section - Exact Match */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Grow Your Business</h3>
              <p className="text-white/70 text-sm">Offer the best deals</p>
            </div>
          </div>
          <button
            onClick={() => setShowPromoWizard(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Active Offers Section - Exact Match */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Active Offers</h3>
              <p className="text-white/70 text-sm">Your top-performing deals</p>
            </div>
          </div>
          <button className="text-white/70 hover:text-white font-medium text-sm transition-colors duration-200">
            View All ›
          </button>
        </div>

        {/* Empty State - Exact Match */}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Active Offers</h3>
          <p className="text-white/70 text-sm">Create your first one to attract customers</p>
        </div>
      </div>

      {/* Promo Setup Wizard Modal */}
      {showPromoWizard && (
        <PromoSetupWizard onClose={() => setShowPromoWizard(false)} />
      )}

      {/* Share Preview Modal */}
      {showShareModal && sharingOffer && (
        <SharePreviewModal 
          offer={sharingOffer}
          merchantName="Your Business"
          onClose={handleCloseShareModal}
        />
      )}

      {/* QR Preview Modal */}
      {showQRPreview && (
        <QRPreviewModal 
          isOpen={showQRPreview}
          merchantName="NEDApay"
          onClose={() => setShowQRPreview(false)}
        />
      )}
      
      {/* Offramp Wizard Modal */}
      {showOfframpWizard && (
        <EnhancedOfframpWizard
          isOpen={showOfframpWizard}
          onClose={() => setShowOfframpWizard(false)}
        />
      )}
      
      {/* Get Paid Wizard Modal */}
      {showGetPaidWizard && (
        <GetPaidWizard
          isOpen={showGetPaidWizard}
          onClose={() => setShowGetPaidWizard(false)}
        />
      )}
    </div>
  );
}
