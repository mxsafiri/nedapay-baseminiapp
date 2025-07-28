'use client';

import React, { useState } from 'react';
import { X, Copy, ExternalLink, QrCode, Check, Target, Store, Coins, Gift, Percent, Star, Trophy, Zap, Share2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useOffers } from '../contexts/OffersContext';
import toast from 'react-hot-toast';

interface QRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName: string;
}

export default function QRPreviewModal({ isOpen, onClose, merchantName }: QRPreviewModalProps) {
  const { isDark } = useTheme();
  const { offers, userPoints } = useOffers();
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const qrUrl = `${window.location.origin}/rewards/merchant-123?merchant=${encodeURIComponent(merchantName)}`;
  const hasOffers = offers && offers.length > 0;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopiedUrl(true);
      toast.success('QR URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleOpenPreview = () => {
    window.open(qrUrl, '_blank');
  };

  const handleGenerateQR = () => {
    toast.success('QR Code generated! (Feature coming soon)');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl h-[90vh] rounded-3xl transition-all duration-300 backdrop-blur-sm border flex flex-col ${
        isDark ? 'bg-gray-950/95 border-gray-800/40' : 'bg-white/95 border-gray-200/50'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
          isDark ? 'border-gray-800/40' : 'border-gray-200/50'
        }`}>
          <div>
            <h1 className={`text-2xl font-display font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Customer Rewards Preview</h1>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>This is exactly what customers will see when they scan your QR code</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-gray-800/60 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content - Unified Design */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className={`rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
            isDark ? 'bg-gray-900/60 border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border-gray-200/50'
          }`}>
            {/* Header with Share Icons */}
            <div className={`p-6 border-b ${
              isDark ? 'border-gray-800/40 bg-gray-900/60' : 'border-gray-200/50 bg-white/70'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/NEDApay Logo Symbol (1)-new.svg" 
                    alt="NEDApay" 
                    className="w-8 h-8"
                  />
                  <div>
                    <h3 className={`text-lg font-display font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>NEDApay Rewards</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{merchantName}</p>
                  </div>
                </div>
                
                {/* Icon-based Share Options */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyUrl}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    title="Copy QR URL"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={handleOpenPreview}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    title="Open Full Preview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleGenerateQR}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    title="Generate QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out rewards at ${merchantName}!`)}&embeds[]=${encodeURIComponent(qrUrl)}`, '_blank')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDark ? 'hover:bg-purple-900/30 text-purple-400 hover:text-purple-300' : 'hover:bg-purple-50 text-purple-600 hover:text-purple-700'
                    }`}
                    title="Share on Farcaster"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Rewards Content */}
            <div className="p-6 space-y-6">
              {/* Points Section */}
              <div className={`rounded-3xl p-6 text-center transition-all duration-300 backdrop-blur-sm ${
                isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
              }`}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h4 className={`text-2xl font-display font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Your Rewards</h4>
                <div className="flex items-center justify-center space-x-2">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  <span className="text-3xl font-bold text-yellow-500">{userPoints.totalPoints}</span>
                  <span className={`text-lg font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>points</span>
                </div>
              </div>

              {/* Active Offers */}
              {hasOffers && (
                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Active Offers</h4>
                  <div className="grid gap-4">
                    {offers.slice(0, 3).map((offer) => (
                      <div
                        key={offer.id}
                        className={`p-4 rounded-2xl border transition-all duration-200 ${
                          isDark ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-gray-200/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              offer.colorTheme === 'blue' ? 'bg-blue-500' :
                              offer.colorTheme === 'purple' ? 'bg-purple-500' :
                              offer.colorTheme === 'green' ? 'bg-green-500' :
                              offer.colorTheme === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                            }`}>
                              <Gift className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className={`font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>{offer.title}</h5>
                              <p className={`text-sm ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>{offer.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Percent className="w-4 h-4 text-green-500" />
                              <span className="text-lg font-bold text-green-500">{offer.discount}%</span>
                            </div>
                            <p className={`text-xs ${
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}>Code: {offer.code}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NFT Collection Preview */}
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Collectible NFTs</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((nft) => (
                    <div
                      key={nft}
                      className={`aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center ${
                        isDark ? 'border-gray-700 bg-gray-800/40' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <Star className={`w-8 h-8 mx-auto mb-2 ${
                          isDark ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>Earn {nft * 25} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Redemption Options */}
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Redeem Points</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-gray-200/50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className={`font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>$5 Off</span>
                    </div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>50 points</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-gray-200/50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <span className={`font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Free Item</span>
                    </div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>100 points</p>
                  </div>
                </div>
              </div>

              {/* QR Code URL Display */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-start space-x-2">
                  <Target className={`w-4 h-4 mt-0.5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-blue-300' : 'text-blue-800'
                    }`}>How it works:</p>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Customers scan the QR code or visit the link to see your rewards page with all active offers, earn points, and redeem rewards.
                    </p>
                    <div className={`mt-2 p-2 rounded text-xs font-mono break-all ${
                      isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {qrUrl}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
