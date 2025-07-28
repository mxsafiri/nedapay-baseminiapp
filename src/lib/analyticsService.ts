// Analytics service for fetching real analytics data
import { sharedAuth } from './auth';

export interface AnalyticsData {
  period: string;
  revenue: number;
  customers: number;
  redemptions: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartData {
  label: string;
  value: number;
  change: number;
}

export interface TopReward {
  name: string;
  redemptions: number;
  revenue: number;
}

export interface AnalyticsResponse {
  analytics: AnalyticsData;
  chartData: ChartData[];
  topRewards: TopReward[];
}

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  async fetchAnalytics(period: string = '7d'): Promise<AnalyticsResponse> {
    try {
      // Get user ID from auth
      const currentUser = sharedAuth.getCurrentUser();
      const userId = currentUser?.id || 'anonymous';
      
      const response = await fetch(
        `${this.baseUrl}/api/analytics?period=${period}&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      return {
        analytics: data.analytics,
        chartData: data.analytics.chartData,
        topRewards: data.analytics.topRewards
      };
    } catch (error) {
      console.error('Analytics service error:', error);
      
      // Fallback to basic mock data if API fails
      return this.getFallbackData(period);
    }
  }

  private getFallbackData(period: string): AnalyticsResponse {
    return {
      analytics: {
        period: this.getPeriodLabel(period),
        revenue: 0,
        customers: 0,
        redemptions: 0,
        engagement: 0,
        trend: 'stable'
      },
      chartData: this.getEmptyChartData(period),
      topRewards: []
    };
  }

  private getEmptyChartData(period: string): ChartData[] {
    if (period === '24h') {
      return Array.from({ length: 24 }, (_, i) => ({
        label: i.toString().padStart(2, '0') + ':00',
        value: 0,
        change: 0
      }));
    }
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map(label => ({
      label,
      value: 0,
      change: 0
    }));
  }

  private getPeriodLabel(period: string): string {
    switch (period) {
      case '24h': return '24 hours';
      case '7d': return '7 days';
      case '30d': return '30 days';
      case '90d': return '90 days';
      default: return '7 days';
    }
  }

  async refreshAnalytics(period: string = '7d'): Promise<AnalyticsResponse> {
    // Add cache busting parameter
    const timestamp = Date.now();
    const currentUser = sharedAuth.getCurrentUser();
    const userId = currentUser?.id || 'anonymous';
    
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analytics?period=${period}&userId=${userId}&_t=${timestamp}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Analytics refresh error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh analytics');
      }

      return {
        analytics: data.analytics,
        chartData: data.analytics.chartData,
        topRewards: data.analytics.topRewards
      };
    } catch (error) {
      console.error('Analytics refresh error:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
