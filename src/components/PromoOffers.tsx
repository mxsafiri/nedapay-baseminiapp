'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  Calendar,
  Percent,
  Gift,
  Target,
  Zap,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOffers, Offer } from '@/contexts/OffersContext';
import PromoSetupWizard from './PromoSetupWizard';
import SharePreviewModal from './SharePreviewModal';
import { AuthPrompt } from './AuthPrompt';

export default function PromoOffers() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { offers, deleteOffer, updateOffer } = useOffers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [sharingOffer, setSharingOffer] = useState<Offer | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | 'edit' | null>(null);

  const handleCreatePromo = () => {
    if (!isAuthenticated) {
      setPendingAction('create');
      setShowAuthPrompt(true);
      return;
    }
    toast.success('Opening promo creation wizard...');
  };

  const handleEditPromo = (id: string) => {
    if (!isAuthenticated) {
      const offerToEdit = offers.find(offer => offer.id === id);
      if (offerToEdit) {
        setEditingOffer(offerToEdit);
        setPendingAction('edit');
        setShowAuthPrompt(true);
      }
      return;
    }
    
    const offerToEdit = offers.find(offer => offer.id === id);
    if (offerToEdit) {
      setEditingOffer(offerToEdit);
      setShowEditWizard(true);
      toast.success('Opening edit wizard...');
    }
  };

  const handleDeletePromo = (id: string) => {
    deleteOffer(id);
    toast.success('Offer deleted successfully!');
  };

  const handleEditClose = () => {
    setShowEditWizard(false);
    setEditingOffer(null);
  };

  const handleEditSave = (updatedOffer: Partial<Offer>) => {
    if (editingOffer) {
      updateOffer(editingOffer.id, updatedOffer);
      toast.success('Offer updated successfully!');
      handleEditClose();
    }
  };

  const handleShare = (offer: Offer) => {
    setSharingOffer(offer);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSharingOffer(null);
  };

  const handleAuthSuccess = () => {
    setShowAuthPrompt(false);
    
    if (pendingAction === 'create') {
      toast.success('Opening promo creation wizard...');
    } else if (pendingAction === 'edit' && editingOffer) {
      setShowEditWizard(true);
      toast.success('Opening edit wizard...');
    }
    
    setPendingAction(null);
    setEditingOffer(null);
  };

  const handleAuthCancel = () => {
    setShowAuthPrompt(false);
    setPendingAction(null);
    setEditingOffer(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColorDark = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/30 text-green-400 border-green-800/30';
      case 'Scheduled':
        return 'bg-blue-900/30 text-blue-400 border-blue-800/30';
      case 'Expired':
        return 'bg-gray-800/30 text-gray-400 border-gray-700/30';
      default:
        return 'bg-gray-800/30 text-gray-400 border-gray-700/30';
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && offer.isActive) ||
                         (selectedStatus === 'inactive' && !offer.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDark ? 'bg-purple-600' : 'bg-purple-500'
          }`}>
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-display font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Promo & Offers</h1>
            <p className={`text-sm font-sans ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage your promotional campaigns</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm ${
        isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search promos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl transition-all duration-200 border ${
                isDark 
                  ? 'bg-gray-800/60 border-gray-700/40 text-white placeholder-gray-400' 
                  : 'bg-gray-50/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
              isDark 
                ? 'bg-gray-800/60 border-gray-700/40 text-white' 
                : 'bg-gray-50/80 border-gray-200/50 text-gray-900'
            }`}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Promo Cards */}
      <div className="space-y-4">
        {filteredOffers.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
            isDark ? 'border-gray-700 bg-gray-900/20' : 'border-gray-300 bg-gray-50/50'
          }`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Percent className={`w-8 h-8 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>No offers yet</h3>
            <p className={`text-sm mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Create your first promotional offer to get started</p>
            <button
              onClick={handleCreatePromo}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Offer
            </button>
          </div>
        ) : (
          filteredOffers.map((offer) => (
          <div
            key={offer.id}
            className={`rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm ${
              isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                {/* Promo Visual */}
                <div className={`bg-gradient-to-r ${offer.colorTheme} rounded-xl p-4 text-white relative overflow-hidden w-24 h-20 flex-shrink-0`}>
                  <div className="relative z-10">
                    <p className="text-xs opacity-90">Up to</p>
                    <h4 className="text-lg font-display font-bold">{offer.discount}%</h4>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <Percent className="absolute bottom-1 right-1 w-4 h-4 text-white/60" />
                </div>
                
                {/* Promo Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-display font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{offer.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                      isDark ? getStatusColorDark(offer.isActive ? 'Active' : 'Inactive') : getStatusColor(offer.isActive ? 'Active' : 'Inactive')
                    }`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      onClick={() => handleShare(offer)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                        isDark ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
                      }`}
                    >
                      <Share2 className="w-3 h-3" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {offer.template}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <Users className={`w-3 h-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Uses</span>
                      </div>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        0 / 1,000
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <TrendingUp className={`w-3 h-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Revenue</span>
                      </div>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>$0</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <Calendar className={`w-3 h-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Ends</span>
                      </div>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {offer.expiryDate 
                          ? offer.expiryDate.toLocaleDateString('en-US', {
                              month: 'numeric',
                              day: 'numeric', 
                              year: 'numeric'
                            })
                          : 'No expiry'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditPromo(offer.id)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePromo(offer.id)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDark ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className={`w-full h-2 rounded-full ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${offer.colorTheme}`}
                  style={{ width: `0%` }}
                ></div>
              </div>
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Active
              </p>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Edit Wizard Modal */}
      {showEditWizard && editingOffer && (
        <PromoSetupWizard 
          onClose={handleEditClose}
          editingOffer={editingOffer}
          onSave={handleEditSave}
        />
      )}

      {/* Share Preview Modal */}
      {showShareModal && sharingOffer && (
        <SharePreviewModal 
          offer={sharingOffer}
          merchantName="Your Business"
          onClose={handleCloseShareModal}
        />
      )}

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <AuthPrompt
          action={pendingAction === 'create' ? 'Create Promo Offer' : 'Edit Promo Offer'}
          description={pendingAction === 'create' 
            ? 'Connect your wallet to create and manage promotional offers for your business.'
            : 'Connect your wallet to edit this promotional offer.'
          }
          onCancel={handleAuthCancel}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
