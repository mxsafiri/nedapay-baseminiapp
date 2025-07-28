'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Trophy,
  Star,
  Gift,
  Share2,
  QrCode,
  CreditCard,
  ChevronRight,
  Sparkles,
  Users,
  Target,
  Coins,
  Award,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOffers } from '@/contexts/OffersContext';

interface CustomerRewardsHubProps {
  merchantName?: string;
  merchantLogo?: string;
  customerAddress?: string;
  onClose?: () => void;
}

// Mock data for customer rewards
const mockCustomerData = {
  points: 75,
  tier: 'Gold Customer',
  nfts: [
    {
      id: 1,
      name: 'Gold Customer NFT',
      image: '/nft-gold.png',
      rarity: 'Legendary',
      earned: '2024-01-15',
      benefits: ['10% off all purchases', 'Priority support', 'Exclusive events']
    },
    {
      id: 2,
      name: 'Early Adopter',
      image: '/nft-early.png',
      rarity: 'Rare',
      earned: '2024-01-01',
      benefits: ['5% bonus points', 'Beta access']
    }
  ],
  activeChallenge: {
    title: 'Spend $50 for VIP NFT',
    progress: 60,
    target: 50,
    current: 30,
    reward: 'VIP Customer NFT',
    description: 'Unlock exclusive VIP benefits and special discounts'
  },
  redemptionOptions: [
    { points: 50, value: 5, description: '$5 off your next purchase' },
    { points: 100, value: 12, description: '$12 off orders over $50' },
    { points: 200, value: 25, description: '$25 off orders over $100' }
  ]
};

export default function CustomerRewardsHub({ 
  merchantName = "Coffee Corner", 
  merchantLogo = "/merchant-logo.png",
  customerAddress = "0x1234...5678",
  onClose 
}: CustomerRewardsHubProps) {
  const { isDark } = useTheme();
  const { getActiveOffers } = useOffers();
  const [selectedRedemption, setSelectedRedemption] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Get real offers from the merchant
  const merchantOffers = getActiveOffers();
  const hasOffers = merchantOffers.length > 0;

  const handleJoinChallenge = () => {
    toast.success('Challenge joined! Start spending to unlock your VIP NFT');
  };

  const handleShareNFT = (nftName: string) => {
    toast.success(`Sharing ${nftName} on Farcaster...`);
    // Integration with Farcaster would go here
  };

  const handleRedeemPoints = () => {
    const redemption = mockCustomerData.redemptionOptions[selectedRedemption];
    toast.success(`Redeemed ${redemption.points} points for ${redemption.description}!`);
  };

  const handleBasePay = () => {
    toast.success('Opening Base Pay for instant redemption...');
    // Integration with Base Pay would go here
  };

  const handleScanQR = () => {
    setShowQRCode(true);
    toast.success('QR Code ready for in-store scanning');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(customerAddress);
    toast.success('Address copied to clipboard!');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 to-white text-gray-900'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-md border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900/60 border-gray-800/40 shadow-sm' 
          : 'bg-white/70 border-gray-200/50 shadow-sm'
      }`}>
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/NEDApay Logo Symbol (1)-new.svg" 
                alt="NEDApay" 
                className="w-8 h-8"
              />
              <div>
                <h1 className={`text-lg font-display font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>NEDApay Rewards</h1>
                <p className={`text-sm font-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{merchantName}</p>
              </div>
            </div>
            
            {/* Base Avatar */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {customerAddress.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <button
                onClick={copyAddress}
                className={`text-xs px-2 py-1 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {customerAddress.slice(0, 6)}...{customerAddress.slice(-4)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Merchant Logo & Points */}
        <div className={`rounded-3xl p-6 text-center transition-all duration-300 backdrop-blur-sm ${
          isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
        }`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-display font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Your Rewards</h2>
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span className="text-3xl font-bold text-yellow-500">{mockCustomerData.points}</span>
            <span className={`text-lg font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Points</span>
          </div>
        </div>

        {/* Live Merchant Offers */}
        {hasOffers && (
          <div className={`rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm ${
            isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
          }`}>
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="w-5 h-5 text-orange-500" />
              <h3 className={`font-display font-bold text-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Special Offers</h3>
            </div>
            
            <div className="space-y-3">
              {merchantOffers.map((offer) => {
                // Map color theme to gradient classes
                const getOfferGradient = (colorTheme: string) => {
                  switch (colorTheme) {
                    case 'blue': return 'from-blue-500 to-blue-600';
                    case 'green': return 'from-green-500 to-green-600';
                    case 'purple': return 'from-purple-500 to-purple-600';
                    case 'orange': return 'from-orange-500 to-orange-600';
                    default: return 'from-blue-500 to-purple-600';
                  }
                };
                
                return (
                  <div
                    key={offer.id}
                    className={`bg-gradient-to-r ${getOfferGradient(offer.colorTheme)} rounded-2xl p-4 text-white relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm font-medium opacity-90">Limited Time</span>
                        </div>
                        <h4 className="text-xl font-display font-bold mb-1">{offer.discount}% OFF</h4>
                        <p className="text-sm opacity-90 mb-2">{offer.description}</p>
                        
                        <div className="flex items-center space-x-2 mt-3">
                          <div className="px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                            <span className="text-xs font-medium">{offer.code}</span>
                          </div>
                          <div className="text-xs opacity-75">
                            {offer.pointsPerDollar} pts per $1 • {offer.nftMilestone} purchases for NFT
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ml-4">
                        <span className="text-2xl font-bold">{offer.discount}%</span>
                      </div>
                    </div>
                
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 translate-x-8"></div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-100/50 to-yellow-100/50 border border-orange-200/30">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-800">
                  Show these offers at checkout to redeem your discounts!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Offers State */}
        {!hasOffers && (
          <div className={`rounded-3xl p-6 text-center transition-all duration-300 backdrop-blur-sm ${
            isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
          }`}>
            <Gift className={`w-12 h-12 mx-auto mb-4 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-display font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>No Active Offers</h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Check back soon for exciting promotional offers from {merchantName}!</p>
          </div>
        )}

        {/* Active Challenge */}
        <div className={`rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm relative overflow-hidden ${
          isDark ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-purple-800/40 shadow-lg' : 'bg-gradient-to-r from-purple-100/80 to-blue-100/80 shadow-lg border border-purple-200/50'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className={`font-display font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Active Challenge</h3>
            </div>
            
            <h4 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{mockCustomerData.activeChallenge.title}</h4>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Progress</span>
                <span className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{mockCustomerData.activeChallenge.progress}%</span>
              </div>
              <div className={`w-full h-3 rounded-full ${
                isDark ? 'bg-gray-800/60' : 'bg-gray-200/60'
              }`}>
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${mockCustomerData.activeChallenge.progress}%` }}
                ></div>
              </div>
              <p className={`text-xs mt-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                ${mockCustomerData.activeChallenge.current} / ${mockCustomerData.activeChallenge.target}
              </p>
            </div>

            <button
              onClick={handleJoinChallenge}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
            >
              Join Challenge
            </button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        </div>

        {/* Your NFTs */}
        <div className={`rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm ${
          isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-purple-500" />
            <h3 className={`font-display font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Your NFTs</h3>
          </div>

          <div className="space-y-4">
            {mockCustomerData.nfts.map((nft) => (
              <div
                key={nft.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50/50 border-gray-200/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-display font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{nft.name}</h4>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{nft.rarity} • Earned {nft.earned}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleShareNFT(nft.name)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all duration-200 ${
                      isDark
                        ? 'bg-blue-600/80 hover:bg-blue-700/80 text-white'
                        : 'bg-blue-500/80 hover:bg-blue-600/80 text-white'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Share on Farcaster</span>
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                      isDark
                        ? 'bg-green-600/80 hover:bg-green-700/80 text-white'
                        : 'bg-green-500/80 hover:bg-green-600/80 text-white'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem Now */}
        <div className={`rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm ${
          isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-2 mb-4">
            <Gift className="w-5 h-5 text-green-500" />
            <h3 className={`font-display font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Redeem Now</h3>
          </div>

          <div className="space-y-3 mb-6">
            {mockCustomerData.redemptionOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedRedemption(index)}
                className={`w-full p-4 rounded-2xl transition-all duration-200 border-2 text-left ${
                  selectedRedemption === index
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20'
                    : isDark
                      ? 'border-gray-700/40 bg-gray-800/40 hover:bg-gray-700/40'
                      : 'border-gray-200/50 bg-gray-50/50 hover:bg-gray-100/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold text-lg ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{option.points} points = ${option.value} off</p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{option.description}</p>
                  </div>
                  {selectedRedemption === index && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleScanQR}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                isDark
                  ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 border border-gray-700/40'
                  : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 border border-gray-200/50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-medium">Scan QR Code</span>
            </button>
            
            <button
              onClick={handleBasePay}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all duration-200 shadow-lg"
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Pay with Base Pay</span>
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm ${
              isDark ? 'bg-gray-900/90 border border-gray-800/40 shadow-2xl' : 'bg-white/90 shadow-2xl border border-gray-200/50'
            }`}>
              <div className="text-center">
                <h3 className={`text-lg font-display font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Scan to Redeem</h3>
                
                <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-2xl p-4 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-white" />
                  </div>
                </div>
                
                <p className={`text-sm mb-6 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Show this QR code to the merchant to redeem your points</p>
                
                <button
                  onClick={() => setShowQRCode(false)}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Import missing Store icon
import { Store } from 'lucide-react';
