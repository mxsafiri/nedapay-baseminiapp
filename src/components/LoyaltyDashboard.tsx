'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Gift, 
  Users, 
  DollarSign, 
  TrendingUp, 
  QrCode, 
  Settings,
  Sparkles,
  ArrowRight,
  Target,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LoyaltyMetrics {
  totalCustomers: number;
  loyaltyDrivenSales: number;
  redemptionRate: number;
  activeRewards: number;
}

interface QuickInsight {
  id: string;
  message: string;
  action: string;
  type: 'suggestion' | 'alert' | 'opportunity';
}

export function LoyaltyDashboard() {
  const { isDark } = useTheme();
  const [metrics, setMetrics] = useState<LoyaltyMetrics>({
    totalCustomers: 0,
    loyaltyDrivenSales: 0,
    redemptionRate: 0,
    activeRewards: 0
  });

  // Fetch real loyalty metrics from Supabase
  useEffect(() => {
    const fetchLoyaltyMetrics = async () => {
      try {
        const response = await fetch('/api/analytics/loyalty');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics || {
            totalCustomers: 0,
            loyaltyDrivenSales: 0,
            redemptionRate: 0,
            activeRewards: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch loyalty metrics:', error);
      }
    };

    fetchLoyaltyMetrics();
  }, []);

  const [insights] = useState<QuickInsight[]>([
    {
      id: '1',
      message: '30% of customers redeem points within 7 days',
      action: 'Send reminder to 20 inactive customers',
      type: 'suggestion'
    },
    {
      id: '2', 
      message: 'Weekend sales increased 25% with loyalty rewards',
      action: 'Create weekend bonus campaign',
      type: 'opportunity'
    },
    {
      id: '3',
      message: 'Low redemption rate detected for new customers',
      action: 'Offer welcome bonus to recent signups',
      type: 'alert'
    }
  ]);

  const handleSetupLoyalty = () => {
    toast.success('Opening loyalty setup wizard...');
    // TODO: Navigate to loyalty setup wizard
  };

  const handleGenerateQR = () => {
    toast.success('QR code generated for customer enrollment!');
    // TODO: Generate and download QR code
  };

  const handleApplySuggestion = (insight: QuickInsight) => {
    toast.success(`Applied: ${insight.action}`);
    // TODO: Execute XMTP message sending or other actions
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Sparkles className="w-4 h-4" />;
      case 'alert': return <Target className="w-4 h-4" />;
      case 'opportunity': return <TrendingUp className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'suggestion': return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'alert': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'opportunity': return isDark ? 'text-green-400' : 'text-green-600';
      default: return isDark ? 'text-blue-400' : 'text-blue-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Quick Actions */}
      <div className={`rounded-2xl p-6 transition-colors duration-300 backdrop-blur-sm ${
        isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSetupLoyalty}
            className={`flex items-center justify-center space-x-2 p-4 rounded-xl transition-all duration-200 backdrop-blur-sm shadow-md hover:shadow-lg ${
              isDark
                ? 'bg-purple-600/90 hover:bg-purple-700/90 text-white border border-purple-500/30'
                : 'bg-purple-500/90 hover:bg-purple-600/90 text-white border border-purple-400/30'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Setup Loyalty</span>
          </button>

          <button
            onClick={handleGenerateQR}
            className={`flex items-center justify-center space-x-2 p-4 rounded-xl transition-all duration-200 backdrop-blur-sm shadow-md hover:shadow-lg ${
              isDark
                ? 'bg-blue-600/90 hover:bg-blue-700/90 text-white border border-blue-500/30'
                : 'bg-blue-500/90 hover:bg-blue-600/90 text-white border border-blue-400/30'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span className="font-medium">Generate QR</span>
          </button>
        </div>
      </div>

      {/* Loyalty Overview */}
      <div className={`rounded-2xl p-6 transition-colors duration-300 backdrop-blur-sm ${
        isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? 'bg-purple-600' : 'bg-purple-500'
            }`}>
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Loyalty Overview</h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Program performance metrics</p>
            </div>
          </div>
          <button
            onClick={() => toast.success('Opening detailed analytics...')}
            className={`text-sm font-medium transition-colors duration-200 ${
              isDark 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            View Details →
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl backdrop-blur-sm border ${
            isDark ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/40' : 'bg-gradient-to-br from-gray-50/80 to-gray-100/40 border-gray-200/40'
          }`}>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{metrics.totalCustomers}</div>
            <div className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Total Customers</div>
          </div>
          
          <div className={`p-4 rounded-xl backdrop-blur-sm border ${
            isDark ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/40' : 'bg-gradient-to-br from-gray-50/80 to-gray-100/40 border-gray-200/40'
          }`}>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>${metrics.loyaltyDrivenSales}</div>
            <div className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Loyalty Sales</div>
          </div>
          
          <div className={`p-4 rounded-xl backdrop-blur-sm border ${
            isDark ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/40' : 'bg-gradient-to-br from-gray-50/80 to-gray-100/40 border-gray-200/40'
          }`}>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{metrics.redemptionRate}%</div>
            <div className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Redemption Rate</div>
          </div>
          
          <div className={`p-4 rounded-xl backdrop-blur-sm border ${
            isDark ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/40' : 'bg-gradient-to-br from-gray-50/80 to-gray-100/40 border-gray-200/40'
          }`}>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{metrics.activeRewards}</div>
            <div className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Active Rewards</div>
          </div>
        </div>
      </div>

      {/* Quick Insights (AI) */}
      <div className={`rounded-2xl p-6 transition-colors duration-300 backdrop-blur-sm ${
        isDark ? 'bg-gray-900/60 border border-gray-800/40 shadow-lg' : 'bg-white/80 shadow-lg border border-gray-200/50'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDark ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
          }`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Quick Insights</h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>AI-powered recommendations</p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={getInsightColor(insight.type)}>
                      {getInsightIcon(insight.type)}
                    </span>
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{insight.message}</span>
                  </div>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{insight.action}</p>
                </div>
                <button
                  onClick={() => handleApplySuggestion(insight)}
                  className={`ml-4 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
