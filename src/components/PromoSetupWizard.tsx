'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ArrowLeft, 
  Save, 
  ChevronRight,
  Store,
  Utensils,
  Palette,
  Upload,
  Eye,
  Gift,
  Coins,
  Trophy,
  Sparkles,
  Check,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOffers, Offer } from '@/contexts/OffersContext';

interface PromoSetupWizardProps {
  onClose: () => void;
  editingOffer?: Offer;
  onSave?: (updatedOffer: Partial<Offer>) => void;
}

const templates = [
  {
    id: 'retail',
    name: 'Retail Starter',
    description: 'Perfect for retail stores and e-commerce',
    icon: Store,
    color: 'from-blue-500 to-blue-600',
    features: ['Points per purchase', 'Tier rewards', 'Birthday bonuses']
  },
  {
    id: 'restaurant',
    name: 'Restaurant Pro',
    description: 'Designed for restaurants and food services',
    icon: Utensils,
    color: 'from-orange-500 to-red-500',
    features: ['Meal rewards', 'Happy hour deals', 'Loyalty stamps']
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Build your own loyalty program',
    icon: Palette,
    color: 'from-purple-500 to-purple-600',
    features: ['Full customization', 'Advanced rules', 'Custom rewards']
  }
];

const colorThemes = [
  { id: 'blue', name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF', bg: 'from-blue-500 to-blue-600' },
  { id: 'green', name: 'Forest Green', primary: '#10B981', secondary: '#047857', bg: 'from-green-500 to-green-600' },
  { id: 'purple', name: 'Royal Purple', primary: '#8B5CF6', secondary: '#7C3AED', bg: 'from-purple-500 to-purple-600' },
  { id: 'orange', name: 'Sunset Orange', primary: '#F59E0B', secondary: '#D97706', bg: 'from-orange-500 to-orange-600' }
];

export default function PromoSetupWizard({ onClose, editingOffer, onSave }: PromoSetupWizardProps) {
  const { isDark } = useTheme();
  const { addOffer } = useOffers();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(editingOffer?.template || '');
  const [offerTitle, setOfferTitle] = useState(editingOffer?.title || '');
  const [offerDescription, setOfferDescription] = useState(editingOffer?.description || '');
  const [discount, setDiscount] = useState(editingOffer?.discount.toString() || '25');
  const [pointsPerDollar, setPointsPerDollar] = useState(editingOffer?.pointsPerDollar.toString() || '1');
  const [nftMilestone, setNftMilestone] = useState(editingOffer?.nftMilestone.toString() || '10');
  const [redemptionRate, setRedemptionRate] = useState(editingOffer?.redemptionRate.toString() || '50');
  const [redemptionValue, setRedemptionValue] = useState(editingOffer?.redemptionValue.toString() || '5');
  const [selectedColor, setSelectedColor] = useState(editingOffer?.colorTheme.replace('from-', '').replace('-500', '').replace(' to-', '').replace('-600', '') || 'blue');
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(editingOffer?.logo || null);
  const [expiryDate, setExpiryDate] = useState(
    editingOffer?.expiryDate 
      ? editingOffer.expiryDate.toISOString().split('T')[0] 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  );

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    toast.success('Promo campaign saved successfully!');
    onClose();
  };

  const handlePublish = () => {
    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    const selectedColorData = colorThemes.find(c => c.id === selectedColor);
    
    const offerData = {
      title: offerTitle || `${selectedTemplateData?.name || 'Custom'} Offer`,
      description: offerDescription || `${pointsPerDollar} points per $1 USDC • ${nftMilestone} purchases for NFT`,
      discount: parseInt(discount),
      code: editingOffer?.code || `PROMO${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      template: selectedTemplate,
      pointsPerDollar: parseInt(pointsPerDollar),
      nftMilestone: parseInt(nftMilestone),
      redemptionRate: parseInt(redemptionRate),
      redemptionValue: parseInt(redemptionValue),
      colorTheme: selectedColorData?.bg || selectedColor,
      logo: uploadedLogo,
      expiryDate: new Date(expiryDate),
      isActive: true,
    };
    
    if (editingOffer && onSave) {
      // Editing existing offer
      onSave(offerData);
    } else {
      // Creating new offer
      addOffer(offerData);
      toast.success('Promo campaign published and live!');
    }
    
    onClose();
  };

  const handlePreview = () => {
    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    const selectedColorData = colorThemes.find(c => c.id === selectedColor);
    
    const previewData = {
      title: offerTitle || `${selectedTemplateData?.name || 'Custom'} Offer`,
      description: offerDescription || `${pointsPerDollar} points per $1 USDC • ${nftMilestone} purchases for NFT`,
      discount: parseInt(discount),
      code: `PROMO${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      colorTheme: selectedColorData?.bg || selectedColor,
      pointsPerDollar: parseInt(pointsPerDollar),
      nftMilestone: parseInt(nftMilestone),
      redemptionRate: parseInt(redemptionRate),
      redemptionValue: parseInt(redemptionValue)
    };
    
    toast.success(`Preview: ${previewData.discount}% OFF - ${previewData.title}`);
    console.log('Preview Data:', previewData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplate !== '';
      case 2:
        return pointsPerDollar && nftMilestone && redemptionRate && redemptionValue;
      case 3:
        return selectedColor;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Choose Template</h2>
        <p className={`text-sm font-sans ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Select a template that best fits your business</p>
      </div>

      <div className="space-y-4">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`w-full p-6 rounded-2xl transition-all duration-200 border-2 ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                  : isDark
                    ? 'border-gray-700/40 bg-gray-800/40 hover:bg-gray-700/40'
                    : 'border-gray-200/50 bg-gray-50/50 hover:bg-gray-100/50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-lg font-display font-semibold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{template.name}</h3>
                  <p className={`text-sm mb-3 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.features.map((feature, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-gray-200/60 text-gray-700'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Set Rewards</h2>
        <p className={`text-sm font-sans ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Configure your loyalty program rewards</p>
      </div>

      <div className="space-y-6">
        {/* Discount Percentage */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className={`font-display font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Discount Percentage</h3>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/40 border-gray-600/40 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="25"
              min="1"
              max="99"
            />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>% OFF</span>
          </div>
        </div>

        {/* Points per Dollar */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <h3 className={`font-display font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Points per $1 USDC</h3>
          </div>
          <input
            type="number"
            value={pointsPerDollar}
            onChange={(e) => setPointsPerDollar(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/40 border-gray-600/40 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter points per dollar"
          />
        </div>

        {/* NFT Milestone */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h3 className={`font-display font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>NFT Milestone</h3>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={nftMilestone}
              onChange={(e) => setNftMilestone(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/40 border-gray-600/40 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="10"
            />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>purchases</span>
          </div>
        </div>

        {/* Redemption Rate */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <h3 className={`font-display font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Redemption Rate</h3>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={redemptionRate}
              onChange={(e) => setRedemptionRate(e.target.value)}
              className={`w-20 px-3 py-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/40 border-gray-600/40 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="50"
            />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>points =</span>
            <span className="text-lg font-bold text-green-500">$</span>
            <input
              type="number"
              value={redemptionValue}
              onChange={(e) => setRedemptionValue(e.target.value)}
              className={`w-20 px-3 py-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/40 border-gray-600/40 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="5"
            />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>off</span>
          </div>
        </div>

        {/* Preview Button */}
        <button
          onClick={handlePreview}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl transition-all duration-200 border ${
            isDark
              ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 border-gray-700/40'
              : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 border-gray-200/50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="font-medium">Preview Rewards</span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Add Branding</h2>
        <p className={`text-sm font-sans ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Customize the look and feel of your loyalty program</p>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <h3 className={`font-display font-semibold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Logo</h3>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
            isDark 
              ? 'border-gray-600 hover:border-gray-500 bg-gray-700/20' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}>
            <Upload className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <p className={`text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>Upload your logo</p>
            <p className={`text-xs ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>PNG, JPG up to 2MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUploadedLogo(e.target.files?.[0] || null)}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className={`inline-block mt-3 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Choose File
            </label>
          </div>
          {uploadedLogo && (
            <p className={`text-sm mt-2 ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>✓ {uploadedLogo.name} uploaded</p>
          )}
        </div>

        {/* Color Themes */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <h3 className={`font-display font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Color Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {colorThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedColor(theme.id)}
                className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                  selectedColor === theme.id
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                    : isDark
                      ? 'border-gray-700/40 bg-gray-800/40 hover:bg-gray-700/40'
                      : 'border-gray-200/50 bg-gray-50/50 hover:bg-gray-100/50'
                }`}
              >
                <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${theme.bg} mb-2`}></div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{theme.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl transition-all duration-300 backdrop-blur-sm ${
        isDark ? 'bg-gray-900/90 border border-gray-800/40 shadow-2xl' : 'bg-white/90 shadow-2xl border border-gray-200/50'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/20">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className={`text-lg font-display font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>NEDApay - Promo Setup</h1>
              <p className={`text-sm font-sans ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Step {currentStep} of 3</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              isDark
                ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300'
                : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700'
            }`}
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className={`w-full h-2 rounded-full ${
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 max-h-96 overflow-y-auto">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200/20">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  step <= currentStep ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
          
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                canProceed()
                  ? isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                canProceed()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
