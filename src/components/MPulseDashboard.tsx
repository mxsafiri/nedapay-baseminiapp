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
import { RateDisplay, CompactRateDisplay } from '@/components/RateDisplay';
import { OfframpWizard } from './OfframpWizard';
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
    <div className="p-6 space-y-6">
      {/* Portfolio Balance Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm font-sans ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Portfolio</p>
            <div className="flex items-center space-x-3 mt-1">
              <h2 className={`text-3xl font-display font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {balanceVisible ? `${formattedBalance} ${selectedStablecoin}` : '••••••'}
              </h2>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Wallet address display - only show when connected */}
            {isConnected && walletAddress && (
              <div className="flex items-center space-x-2 mt-2">
                <span className={`text-xs font-mono ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>
            )}
            
            {/* Real-time Rate Display */}
            <div className="mt-3">
              <CompactRateDisplay 
                token="USDC" 
                currency="NGN" 
                className="justify-start"
              />
            </div>
            {/* USD value display - only show when connected and has balance */}
            {isConnected && balanceValue > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>≈ ${formatCurrency(balanceValue)} USD</span>
              </div>
            )}
          </div>
          
          {/* Stablecoin Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedStablecoin}
              onChange={(e) => setSelectedStablecoin(e.target.value)}
              className={`px-3 py-2 rounded-xl font-medium transition-all duration-200 border ${
                isDark 
                  ? 'bg-gray-800/60 border-gray-700/40 text-white hover:bg-gray-700/60' 
                  : 'bg-gray-50/80 border-gray-200/50 text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="DAI">DAI</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <button
            onClick={() => setShowGetPaidWizard(true)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5 mb-2" />
            <span className="text-sm font-medium">Get Paid</span>
          </button>

          <button
            onClick={handleGenerateQR}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-800 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <QrCode className="w-5 h-5 mb-2" />
            <span className="text-sm font-medium">Generate QR</span>
          </button>

          <button
            onClick={() => setShowOfframpWizard(true)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <ArrowDownToLine className="w-5 h-5 mb-2" />
            <span className="text-sm font-medium">Off-ramp</span>
          </button>
        </div>
      </div>

      {/* Business Growth CTA */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
            }`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-display font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Grow your business</h3>
              <p className={`text-sm font-sans ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Offer the best deals</p>
            </div>
          </div>
          <button className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              : 'bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50'
          }`}>
            Get Started
          </button>
        </div>
      </div>

      {/* Active Offers */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? 'bg-orange-600' : 'bg-orange-500'
            }`}>
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-display font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Active Offers</h3>
              <p className={`text-sm font-sans ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Your best performing deals</p>
            </div>
          </div>
          <button className={`text-sm font-medium transition-colors duration-200 ${
            isDark 
              ? 'text-blue-400 hover:text-blue-300' 
              : 'text-blue-600 hover:text-blue-700'
          }`}>
            View All →
          </button>
        </div>

        {/* Offer Cards */}
        <div className="space-y-4">
          {getActiveOffers().length === 0 ? (
            <div className="rounded-2xl p-8 text-center">
              <Gift className={`w-12 h-12 mx-auto mb-4 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-display font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>No Active Offers</h3>
              <p className={`text-sm mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Create your first promotional offer to attract customers</p>
              <button
                onClick={() => setShowPromoWizard(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg"
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
                  className={`${getOfferGradient(offer.colorTheme)} rounded-2xl p-4 text-white relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                      <p className="text-sm opacity-90 mb-1">Up to</p>
                      <h4 className="text-2xl font-display font-bold mb-1">{offer.discount}% OFF</h4>
                      <p className="text-sm opacity-90">{offer.description}</p>
                      
                      <button
                        onClick={() => handleShare(offer)}
                        className="flex items-center space-x-2 mt-3 px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                      >
                        <Share2 className="w-3 h-3" />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                    </div>
                    
                    <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                      <Percent className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
              
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 translate-x-12"></div>
                </div>
              );
            })
          )}
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
        <OfframpWizard
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
