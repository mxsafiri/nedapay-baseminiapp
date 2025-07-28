'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useOffers } from '@/contexts/OffersContext';
import { 
  Gift, 
  Copy, 
  Check, 
  Sparkles, 
  Store,
  Clock,
  Users,
  ArrowRight,
  Share2,
  CreditCard,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Offer } from '@/contexts/OffersContext';

interface CustomerPromoPageProps {
  offer: Offer;
  merchantName: string;
}

export default function CustomerPromoPage({ offer, merchantName }: CustomerPromoPageProps) {
  const { isDark } = useTheme();
  const { simulatePurchase, userPoints } = useOffers();
  const [codeCopied, setCodeCopied] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('25');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code);
    setCodeCopied(true);
    toast.success('Promo code copied!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${offer.discount}% OFF at ${merchantName}`,
        text: `Check out this amazing deal! Get ${offer.discount}% off with code ${offer.code}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleFarcasterShare = () => {
    const text = `🎉 Amazing deal alert! Get ${offer.discount}% OFF at ${merchantName}!\n\n💰 Use code: ${offer.code}\n🎯 ${offer.description}\n\nClaim your discount now! 👇`;
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(window.location.href)}`;
    window.open(farcasterUrl, '_blank');
    toast.success('Opening Farcaster to share this offer!');
  };

  const handlePurchase = () => {
    const amount = parseFloat(purchaseAmount);
    if (amount > 0) {
      simulatePurchase(offer.id, amount);
      const pointsEarned = Math.floor(amount * offer.pointsPerDollar);
      toast.success(`Purchase successful! Earned ${pointsEarned} points!`);
      setShowPurchaseModal(false);
    } else {
      toast.error('Please enter a valid purchase amount');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        isDark ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'
      } backdrop-blur-sm sticky top-0 z-10`}>
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className={`font-display font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Special Offer</h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>from {merchantName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFarcasterShare}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30' : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                <span className="text-sm font-medium">Farcaster</span>
              </button>
              <button
                onClick={handleShare}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Offer Card */}
        <div className={`rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm border ${
          isDark ? 'bg-gray-800/60 border-gray-700/40 shadow-2xl' : 'bg-white/80 shadow-2xl border-gray-200/50'
        }`}>
          {/* Discount Badge */}
          <div className={`bg-gradient-to-r ${offer.colorTheme} rounded-2xl p-6 text-white relative overflow-hidden mb-6`}>
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 mr-2" />
                <span className="text-lg font-medium">Special Offer</span>
              </div>
              <div className="text-4xl font-display font-bold mb-2">
                {offer.discount}% OFF
              </div>
              <p className="text-white/90 text-sm">
                {offer.description}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          {/* Promo Code */}
          <div className="text-center mb-6">
            <p className={`text-sm mb-3 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Use promo code:</p>
            <button
              onClick={handleCopyCode}
              className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl font-mono font-bold text-lg transition-all duration-200 border-2 border-dashed ${
                codeCopied
                  ? isDark ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-green-50 border-green-300 text-green-700'
                  : isDark ? 'bg-gray-800/60 border-gray-600 text-white hover:bg-gray-700/60' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span>{offer.code}</span>
            </button>
          </div>

          {/* Offer Details */}
          <div className="space-y-4">
            <div className={`flex items-center space-x-3 p-3 rounded-xl ${
              isDark ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <Store className={`w-5 h-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Valid at {merchantName}</p>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{offer.template} offer</p>
              </div>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-xl ${
              isDark ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <Clock className={`w-5 h-5 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Active Now</p>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Limited time offer</p>
              </div>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-xl ${
              isDark ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <Users className={`w-5 h-5 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Loyalty Rewards</p>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Earn {offer.pointsPerDollar} points per $1 USDC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Points Display */}
        <div className={`p-4 rounded-2xl border-2 border-dashed mb-4 ${
          isDark ? 'bg-yellow-900/20 border-yellow-600/40 text-yellow-400' : 'bg-yellow-50 border-yellow-300 text-yellow-700'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-5 h-5" />
            <span className="font-bold">Your Points: {userPoints.totalPoints}</span>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => setShowPurchaseModal(true)}
          className={`w-full flex items-center justify-center space-x-3 py-4 rounded-2xl font-semibold transition-all duration-200 ${
            isDark 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } shadow-lg hover:shadow-xl`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Make Purchase & Earn Points</span>
        </button>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Powered by NEDApay • Secure payments on Base
          </p>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
            isDark ? 'bg-gray-950/95 border-gray-800/40' : 'bg-white/95 border-gray-200/50'
          }`}>
            <div className="p-6">
              <h3 className={`text-xl font-display font-bold mb-4 text-center ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Make Purchase</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Purchase Amount (USDC)</label>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="25"
                    min="1"
                    step="1"
                  />
                </div>
                
                <div className={`p-3 rounded-xl ${
                  isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-blue-300' : 'text-blue-800'}>Points to earn:</span>
                    <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {Math.floor(parseFloat(purchaseAmount || '0') * offer.pointsPerDollar)} points
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className={isDark ? 'text-blue-300' : 'text-blue-800'}>Discount applied:</span>
                    <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {offer.discount}% OFF
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="flex-1 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
