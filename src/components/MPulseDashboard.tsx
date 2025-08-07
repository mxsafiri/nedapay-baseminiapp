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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 space-y-8">
      {/* Portfolio Balance Section - Enhanced */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm font-medium mb-2">Portfolio Balance</p>
            <div className="flex items-center space-x-4">
              <h2 className="text-5xl font-bold text-white">
                {balanceVisible ? `${formattedBalance} ${selectedStablecoin}` : '••••••'}
              </h2>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
              >
                {balanceVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          {/* Wallet address display - only show when connected */}
          {isConnected && walletAddress && (
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs font-mono text-white/50">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}
        </div>
        
        {/* Stablecoin Selector - Enhanced */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <select
              value={selectedStablecoin}
              onChange={(e) => setSelectedStablecoin(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {stablecoins.map((coin) => (
                <option key={coin.baseToken} value={coin.baseToken} className="bg-gray-800 text-white">
                  {coin.baseToken}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setIsRefreshing(true);
                refetch();
                setTimeout(() => setIsRefreshing(false), 1000);
              }}
              disabled={isRefreshing || !isConnected}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              <TrendingUp className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setShowGetPaidWizard(true)}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 transition-all duration-300 flex flex-col items-center space-y-3 hover:bg-white/10 hover:scale-105 shadow-xl"
        >
          <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">Get Paid</span>
        </button>
        
        <button
          onClick={() => setShowOfframpWizard(true)}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 transition-all duration-300 flex flex-col items-center space-y-3 hover:bg-white/10 hover:scale-105 shadow-xl"
        >
          <div className="p-4 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl">
            <ArrowDownToLine className="w-8 h-8 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">Off-ramp</span>
        </button>
        
        <button
          onClick={handleGenerateQR}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 transition-all duration-300 flex flex-col items-center space-y-3 hover:bg-white/10 hover:scale-105 shadow-xl"
        >
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">QR Code</span>
        </button>
      </div>

      {/* Business Growth Section - Enhanced */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Grow Your Business</h3>
              <p className="text-white/70">Offer the best deals</p>
            </div>
          </div>
          <button
            onClick={() => setShowPromoWizard(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Active Offers Section - Enhanced */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Active Offers</h3>
              <p className="text-white/70 text-sm">Your top-performing deals</p>
            </div>
          </div>
          <button className="text-white/70 hover:text-white font-medium transition-colors duration-200">
            View All →
          </button>
        </div>

        {/* Offer Cards */}
        <div className="space-y-4">
          {getActiveOffers().length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="p-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl w-fit mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Offers</h3>
              <p className="text-white/70 text-sm mb-6">Create your first one to attract customers</p>
              <button
                onClick={() => setShowPromoWizard(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Your First Offer
              </button>
            </div>
          ) : (
            getActiveOffers().map((offer) => {
              // Map color theme to gradient classes
              const getOfferGradient = (colorTheme: string) => {
                switch (colorTheme) {
                  case 'blue': return 'bg-gradient-to-r from-blue-500 to-blue-600';
                  case 'green': return 'bg-gradient-to-r from-green-500 to-green-600';
                  case 'purple': return 'bg-gradient-to-r from-purple-500 to-purple-600';
                  case 'orange': return 'bg-gradient-to-r from-orange-500 to-orange-600';
                  default: return 'bg-gradient-to-r from-blue-500 to-purple-600';
                }
              };
              
              return (
                <div
                  key={offer.id}
                  className={`${getOfferGradient(offer.colorTheme)} rounded-3xl p-6 text-white relative overflow-hidden shadow-xl`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                      <p className="text-sm opacity-90 mb-1">Up to</p>
                      <h4 className="text-3xl font-bold mb-2">{offer.discount}% OFF</h4>
                      <p className="text-sm opacity-90 mb-4">{offer.description}</p>
                      
                      <button
                        onClick={() => handleShare(offer)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Share</span>
                      </button>
                    </div>
                    
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Percent className="w-10 h-10 text-white/90" />
                    </div>
                  </div>
              
                  {/* Enhanced Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
                  <div className="absolute top-1/2 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12"></div>
                </div>
              );
            })
          )}
        </div>
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
