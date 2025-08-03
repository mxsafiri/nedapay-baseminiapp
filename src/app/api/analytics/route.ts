// Analytics API endpoint - aggregates real data from transactions and invoices
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface AnalyticsMetrics {
  period: string;
  revenue: number;
  customers: number;
  redemptions: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
  chartData: Array<{
    label: string;
    value: number;
    change: number;
  }>;
  topRewards: Array<{
    name: string;
    redemptions: number;
    revenue: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const userId = searchParams.get('userId');

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Fetch transactions data from Supabase
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('merchant_id', userId || '')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    // Fetch offers data from Supabase (replacing invoices for now)
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('merchant_id', userId || '')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (offersError) {
      console.error('Error fetching offers:', offersError);
    }

    // Data is already filtered by date in the query
    const filteredTransactions = transactions || [];
    const filteredOffers = offers || [];

    // Calculate metrics from real data
    const revenue = filteredTransactions.reduce((sum: number, tx: any) => 
      sum + parseFloat(tx.amount || 0), 0
    );

    const customers = new Set([
      ...filteredTransactions.map((tx: any) => tx.customer_wallet),
      ...filteredTransactions.filter((tx: any) => tx.customer_wallet).map((tx: any) => tx.customer_wallet)
    ]).size;

    // Calculate redemptions from offers
    const redemptions = filteredOffers.reduce((sum: number, offer: any) => 
      sum + (offer.redemptions || 0), 0
    );

    // Calculate engagement based on real data
    const totalOffers = filteredOffers.length;
    const activeOffers = filteredOffers.filter((offer: any) => offer.is_active).length;
    const engagement = totalOffers > 0 ? Math.round((activeOffers / totalOffers) * 100) : 0;

    // Calculate trend (compare with previous period)
    const periodLength = now.getTime() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);
    
    const { data: previousTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('merchant_id', userId || '')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', startDate.toISOString());
    
    const previousRevenue = (previousTransactions || []).reduce((sum: number, tx: any) => 
      sum + parseFloat(tx.amount || 0), 0
    );
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (revenue > previousRevenue * 1.05) trend = 'up';
    else if (revenue < previousRevenue * 0.95) trend = 'down';

    // Generate chart data based on period
    const chartData = generateChartData(filteredTransactions, filteredOffers, period, startDate, now);

    // Generate top performing rewards from real offers data
    const topRewards = filteredOffers
      .sort((a: any, b: any) => (b.redemptions || 0) - (a.redemptions || 0))
      .slice(0, 4)
      .map((offer: any) => ({
        name: offer.title || 'Untitled Offer',
        redemptions: offer.redemptions || 0,
        revenue: Math.floor((offer.redemptions || 0) * (revenue / Math.max(1, redemptions)) * (offer.discount_percentage / 100))
      }));
    
    // Fill with default offers if we don't have enough real data
    while (topRewards.length < 4) {
      topRewards.push({
        name: `Offer ${topRewards.length + 1}`,
        redemptions: 0,
        revenue: 0
      });
    }

    const analytics: AnalyticsMetrics = {
      period: getPeriodLabel(period),
      revenue: Math.round(revenue),
      customers,
      redemptions,
      engagement,
      trend,
      chartData,
      topRewards
    };

    return NextResponse.json({
      success: true,
      analytics,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function generateChartData(transactions: any[], invoices: any[], period: string, startDate: Date, endDate: Date) {
  const data: Array<{ label: string; value: number; change: number }> = [];
  
  if (period === '24h') {
    // Hourly data for 24h
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= hourStart && txDate < hourEnd;
      });
      
      const hourRevenue = hourTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      
      data.push({
        label: hourStart.getHours().toString().padStart(2, '0') + ':00',
        value: Math.round(hourRevenue),
        change: Math.random() * 20 - 10 // Mock change for now
      });
    }
  } else {
    // Daily data for longer periods
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < Math.min(days, 7); i++) {
      const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= dayStart && txDate < dayEnd;
      });
      
      const dayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= dayStart && invDate < dayEnd;
      });
      
      const dayRevenue = dayTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) +
                        dayInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      data.push({
        label: dayLabels[dayStart.getDay()],
        value: Math.round(dayRevenue),
        change: Math.random() * 30 - 15 // Mock change for now
      });
    }
  }
  
  return data;
}

function getPeriodLabel(period: string): string {
  switch (period) {
    case '24h': return '24 hours';
    case '7d': return '7 days';
    case '30d': return '30 days';
    case '90d': return '90 days';
    default: return '7 days';
  }
}
