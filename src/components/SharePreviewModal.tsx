'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  X, 
  Copy, 
  Check, 
  QrCode,
  Share2,
  Sparkles,
  ExternalLink,
  Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Offer } from '@/contexts/OffersContext';

interface SharePreviewModalProps {
  offer: Offer;
  merchantName: string;
  onClose: () => void;
}

export default function SharePreviewModal({ offer, merchantName, onClose }: SharePreviewModalProps) {
  const { isDark } = useTheme();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const shareUrl = `${window.location.origin}/promo/${offer.id}?code=${offer.code}&merchant=${encodeURIComponent(merchantName)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedUrl(true);
    toast.success('Shareable link copied!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code);
    setCopiedCode(true);
    toast.success('Promo code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFarcasterShare = () => {
    const text = `🎉 Amazing deal alert! Get ${offer.discount}% OFF at ${merchantName}!\n\n💰 Use code: ${offer.code}\n🎯 ${offer.description}\n\nClaim your discount now! 👇`;
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(farcasterUrl, '_blank');
    toast.success('Opening Farcaster to share this offer!');
  };

  const handleGenerateQR = () => {
    // In a real app, this would generate and show a QR code
    // For now, we'll copy the URL and show a message
    navigator.clipboard.writeText(shareUrl);
    toast.success('QR code URL copied! Use a QR generator to create a scannable code.');
  };

  const handlePreviewLink = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl my-8 rounded-3xl transition-all duration-300 backdrop-blur-sm ${
        isDark ? 'bg-gray-900/95 border border-gray-800/40 shadow-2xl' : 'bg-white/95 shadow-2xl border border-gray-200/50'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-display font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Share Offer</h1>
              <p className={`text-sm font-sans ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Preview and share your promotional offer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {/* Customer Preview */}
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Customer Preview</h2>
            
            {/* Mini Preview Card */}
            <div className={`rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm border ${
              isDark ? 'bg-gray-800/60 border-gray-700/40' : 'bg-gray-50/80 border-gray-200/50'
            }`}>
              {/* Offer Card Preview */}
              <div className={`bg-gradient-to-r ${offer.colorTheme} rounded-xl p-4 text-white relative overflow-hidden mb-4`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Special Offer</span>
                    </div>
                    <Gift className="w-4 h-4 opacity-60" />
                  </div>
                  <div className="text-2xl font-display font-bold mb-1">
                    {offer.discount}% OFF
                  </div>
                  <p className="text-white/90 text-xs">
                    {offer.description}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              </div>

              {/* Promo Code Preview */}
              <div className="text-center">
                <p className={`text-xs mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Use promo code:</p>
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg font-mono font-bold text-sm border-2 border-dashed ${
                  isDark ? 'bg-gray-700/60 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'
                }`}>
                  <Copy className="w-3 h-3" />
                  <span>{offer.code}</span>
                </div>
              </div>

              {/* Preview Link */}
              <div className="mt-4 text-center">
                <button
                  onClick={handlePreviewLink}
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDark ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Preview Full Page</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div>
            <h2 className={`text-lg font-semibold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Share Options</h2>
            
            <div className="flex justify-center space-x-3 sm:space-x-4 flex-wrap gap-y-4">
              {/* Copy URL */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={handleCopyUrl}
                  className={`w-14 h-14 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                    copiedUrl
                      ? isDark ? 'bg-green-600/20 text-green-400 border-2 border-green-500/40' : 'bg-green-100 text-green-600 border-2 border-green-300'
                      : isDark ? 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 border-2 border-gray-700/40 hover:border-gray-600/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {copiedUrl ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Copy Link</span>
              </div>

              {/* Farcaster Share */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={handleFarcasterShare}
                  className={`w-14 h-14 rounded-2xl transition-all duration-200 flex items-center justify-center border-2 ${
                    isDark ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-500/40 hover:border-purple-400/60' : 'bg-purple-100 hover:bg-purple-200 text-purple-600 border-purple-300 hover:border-purple-400'
                  }`}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </button>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Farcaster</span>
              </div>

              {/* Generate QR Code */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={handleGenerateQR}
                  className={`w-14 h-14 rounded-2xl transition-all duration-200 flex items-center justify-center border-2 ${
                    isDark ? 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 border-gray-700/40 hover:border-gray-600/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                </button>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>QR Code</span>
              </div>

              {/* Copy Promo Code */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={handleCopyCode}
                  className={`w-14 h-14 rounded-2xl transition-all duration-200 flex items-center justify-center border-2 ${
                    copiedCode
                      ? isDark ? 'bg-green-600/20 text-green-400 border-green-500/40' : 'bg-green-100 text-green-600 border-green-300'
                      : isDark ? 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 border-gray-700/40 hover:border-gray-600/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {copiedCode ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Copy Code</span>
              </div>
            </div>
          </div>

          {/* Share URL Display */}
          <div className={`p-3 rounded-lg text-xs font-mono break-all ${
            isDark ? 'bg-gray-800/40 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            {shareUrl}
          </div>
        </div>
      </div>
    </div>
  );
}
