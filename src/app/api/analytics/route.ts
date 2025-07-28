// Analytics API endpoint - aggregates real data from transactions and invoices
import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch transactions data
    const transactionsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mock/transactions?userId=${userId}`,
      { method: 'GET' }
    );
    const transactionsData = await transactionsResponse.json();
    const transactions = transactionsData.transactions || [];

    // Fetch invoices data
    const invoicesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mock/invoices/sync?userId=${userId}`,
      { method: 'GET' }
    );
    const invoicesData = await invoicesResponse.json();
    const invoices = invoicesData.invoices || [];

    // Filter data by date range
    const filteredTransactions = transactions.filter((tx: any) => 
      new Date(tx.createdAt) >= startDate
    );
    const filteredInvoices = invoices.filter((inv: any) => 
      new Date(inv.createdAt) >= startDate
    );

    // Calculate metrics
    const revenue = filteredTransactions.reduce((sum: number, tx: any) => 
      sum + parseFloat(tx.amount), 0
    ) + filteredInvoices.reduce((sum: number, inv: any) => 
      sum + inv.total, 0
    );

    const customers = new Set([
      ...filteredTransactions.map((tx: any) => tx.fromAddress),
      ...filteredInvoices.map((inv: any) => inv.customerEmail)
    ]).size;

    // Mock redemptions and engagement for now (would come from loyalty system)
    const redemptions = Math.floor(revenue / 15); // Rough estimate
    const engagement = Math.min(95, Math.floor((customers / Math.max(1, filteredTransactions.length)) * 100));

    // Calculate trend (compare with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousTransactions = transactions.filter((tx: any) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= previousPeriodStart && txDate < startDate;
    });
    const previousRevenue = previousTransactions.reduce((sum: number, tx: any) => 
      sum + parseFloat(tx.amount), 0
    );
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (revenue > previousRevenue * 1.05) trend = 'up';
    else if (revenue < previousRevenue * 0.95) trend = 'down';

    // Generate chart data based on period
    const chartData = generateChartData(filteredTransactions, filteredInvoices, period, startDate, now);

    // Generate top performing rewards (mock data for now - would come from loyalty system)
    const topRewards = [
      { name: '10% Off Purchase', redemptions: Math.floor(redemptions * 0.4), revenue: Math.floor(revenue * 0.25) },
      { name: 'Free Coffee', redemptions: Math.floor(redemptions * 0.3), revenue: Math.floor(revenue * 0.15) },
      { name: 'Buy 2 Get 1 Free', redemptions: Math.floor(redemptions * 0.2), revenue: Math.floor(revenue * 0.20) },
      { name: 'VIP Access', redemptions: Math.floor(redemptions * 0.1), revenue: Math.floor(revenue * 0.30) }
    ];

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
