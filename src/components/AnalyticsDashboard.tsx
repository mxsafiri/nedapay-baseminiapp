'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsService, type AnalyticsData, type ChartData, type TopReward } from '@/lib/analyticsService';

export function AnalyticsDashboard() {
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    period: '7 days',
    revenue: 0,
    customers: 0,
    redemptions: 0,
    engagement: 0,
    trend: 'stable'
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topRewards, setTopRewards] = useState<TopReward[]>([]);

  const periods = [
    { id: '24h', label: '24H' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' }
  ];

  // Fetch analytics data
  const fetchAnalyticsData = async (period: string) => {
    try {
      setIsLoading(true);
      const response = await analyticsService.fetchAnalytics(period);
      setAnalytics(response.analytics);
      setChartData(response.chartData);
      setTopRewards(response.topRewards);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchAnalyticsData(selectedPeriod);
  }, []);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    fetchAnalyticsData(period);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await analyticsService.refreshAnalytics(selectedPeriod);
      setAnalytics(response.analytics);
      setChartData(response.chartData);
      setTopRewards(response.topRewards);
      toast.success('Analytics data refreshed');
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      toast.error('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    toast.success('Analytics report exported!');
    // TODO: Generate and download analytics report
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Analytics Dashboard</h2>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Loyalty program performance insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className={`flex space-x-1 p-1 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => handlePeriodChange(period.id)}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedPeriod === period.id
                ? isDark
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-600 text-white'
                : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className={`w-4 h-4 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Revenue</span>
            </div>
            {getTrendIcon(analytics.trend)}
          </div>
          <div className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>${analytics.revenue}</div>
          <div className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>Last {analytics.period}</div>
        </div>

        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className={`w-4 h-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>New Customers</span>
            </div>
            {getTrendIcon('up')}
          </div>
          <div className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{analytics.customers}</div>
          <div className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>Last {analytics.period}</div>
        </div>

        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className={`w-4 h-4 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Redemptions</span>
            </div>
            {getTrendIcon('up')}
          </div>
          <div className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{analytics.redemptions}</div>
          <div className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>Last {analytics.period}</div>
        </div>

        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className={`w-4 h-4 ${
                isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Engagement</span>
            </div>
            {getTrendIcon('up')}
          </div>
          <div className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{analytics.engagement}%</div>
          <div className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>Last {analytics.period}</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Revenue Trend</h3>
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Last 7 days</span>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between space-x-2 h-32">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                }`}
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <div className={`text-xs mt-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {item.label}
              </div>
              <div className={`text-xs font-medium ${
                item.change > 0 
                  ? 'text-green-500' 
                  : item.change < 0 
                    ? 'text-red-500' 
                    : 'text-gray-500'
              }`}>
                {item.change > 0 ? '+' : ''}{item.change}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Rewards */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Top Performing Rewards</h3>
        
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg animate-pulse ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex-1">
                  <div className={`h-4 rounded mb-2 ${
                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`} style={{ width: '60%' }} />
                  <div className={`h-3 rounded ${
                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`} style={{ width: '40%' }} />
                </div>
                <div className="text-right">
                  <div className={`h-4 rounded mb-2 ${
                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`} style={{ width: '50px' }} />
                  <div className={`h-3 rounded ${
                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`} style={{ width: '40px' }} />
                </div>
              </div>
            ))
          ) : topRewards.length > 0 ? (
            topRewards.map((reward, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div>
                <div className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{reward.name}</div>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{reward.redemptions} redemptions</div>
              </div>
              <div className={`text-right`}>
                <div className={`font-semibold ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>${reward.revenue}</div>
                <div className={`text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>revenue</div>
              </div>
            </div>
            ))
          ) : (
            // Empty state
            <div className={`text-center py-8 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <BarChart3 className={`w-12 h-12 mx-auto mb-3 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p>No rewards data available</p>
              <p className="text-sm mt-1">Start creating offers to see performance metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
