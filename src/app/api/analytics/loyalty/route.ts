// Loyalty Analytics API endpoint - real Supabase integration
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface LoyaltyMetrics {
  totalCustomers: number;
  loyaltyDrivenSales: number;
  redemptionRate: number;
  activeRewards: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Calculate date range for current period (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Fetch total customers with loyalty activity
    const { data: customersData, error: customersError } = await supabase
      .from('transactions')
      .select('user_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('loyalty_points', 'is', null);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
    }

    const totalCustomers = customersData ? new Set(customersData.map(t => t.user_id)).size : 0;

    // Fetch loyalty-driven sales (transactions with loyalty points used)
    const { data: salesData, error: salesError } = await supabase
      .from('transactions')
      .select('amount, loyalty_points_used')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('loyalty_points_used', 'is', null)
      .gt('loyalty_points_used', 0);

    if (salesError) {
      console.error('Error fetching sales:', salesError);
    }

    const loyaltyDrivenSales = salesData ? 
      salesData.reduce((sum, transaction) => sum + parseFloat(transaction.amount || '0'), 0) : 0;

    // Fetch redemption data
    const { data: redemptionData, error: redemptionError } = await supabase
      .from('transactions')
      .select('loyalty_points_earned, loyalty_points_used')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (redemptionError) {
      console.error('Error fetching redemption data:', redemptionError);
    }

    let redemptionRate = 0;
    if (redemptionData && redemptionData.length > 0) {
      const totalEarned = redemptionData.reduce((sum, t) => sum + (parseFloat(t.loyalty_points_earned || '0')), 0);
      const totalUsed = redemptionData.reduce((sum, t) => sum + (parseFloat(t.loyalty_points_used || '0')), 0);
      redemptionRate = totalEarned > 0 ? Math.round((totalUsed / totalEarned) * 100) : 0;
    }

    // Fetch active rewards (offers with loyalty components)
    const { data: offersData, error: offersError } = await supabase
      .from('offers')
      .select('id')
      .eq('is_active', true)
      .not('loyalty_points_required', 'is', null);

    if (offersError) {
      console.error('Error fetching offers:', offersError);
    }

    const activeRewards = offersData ? offersData.length : 0;

    const metrics: LoyaltyMetrics = {
      totalCustomers,
      loyaltyDrivenSales: Math.round(loyaltyDrivenSales),
      redemptionRate,
      activeRewards
    };

    return NextResponse.json({
      success: true,
      metrics,
      period: '30d',
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Loyalty analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch loyalty analytics',
        metrics: {
          totalCustomers: 0,
          loyaltyDrivenSales: 0,
          redemptionRate: 0,
          activeRewards: 0
        }
      },
      { status: 500 }
    );
  }
}
