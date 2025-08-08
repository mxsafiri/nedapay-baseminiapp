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
      {/* Portfolio Balance Section - Target Design Match */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-4 font-medium">Portfolio Balance</p>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3 whitespace-nowrap tracking-tight">
                {balanceVisible ? `${formattedBalance} ${selectedStablecoin}` : '••••••'}
              </h2>
              {/* Wallet address display - refined */}
              {isConnected && walletAddress && (
                <p className="text-white/40 text-xs font-mono tracking-wider">
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

        {/* Quick Actions - Target Design Match */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setShowGetPaidWizard(true)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl p-5 transition-all duration-300 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-7 h-7 text-white" />
            <span className="text-white font-semibold text-sm tracking-wide">Get Paid</span>
          </button>
          
          <button
            onClick={handleGenerateQR}
            className="bg-white/8 hover:bg-white/15 active:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl p-5 transition-all duration-300 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-white font-semibold text-sm tracking-wide">Generate QR</span>
          </button>
          
          <button
            onClick={() => setShowOfframpWizard(true)}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-2xl p-5 transition-all duration-300 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowDownToLine className="w-7 h-7 text-white" />
            <span className="text-white font-semibold text-sm tracking-wide whitespace-nowrap">Off-ramp</span>
          </button>
        </div>
      </div>

      {/* Business Growth Section - Target Design Match */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Grow Your Business</h3>
              <p className="text-white/60 text-sm font-medium">Offer the best deals</p>
            </div>
          </div>
          <button
            onClick={() => setShowPromoWizard(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-full transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Active Offers Section - Target Design Match */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-lg">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Active Offers</h3>
              <p className="text-white/60 text-sm font-medium">Your top-performing deals</p>
            </div>
          </div>
          <button className="text-white/60 hover:text-white font-semibold text-sm transition-all duration-300 hover:scale-105">
            View All ›
          </button>
        </div>

        {/* Empty State - Target Design Match */}
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-white/8 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Gift className="w-10 h-10 text-white/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">No Active Offers</h3>
          <p className="text-white/60 text-sm font-medium max-w-xs mx-auto leading-relaxed">Create your first one to attract customers</p>
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
