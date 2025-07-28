// Mock Privy lookup endpoint for development
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    // Mock logic: simulate some users having Privy accounts
    const hasPrivyAccount = walletAddress.toLowerCase().includes('a') || walletAddress.toLowerCase().includes('e');
    
    if (hasPrivyAccount) {
      return NextResponse.json({
        exists: true,
        privyUserId: `privy_${walletAddress.slice(-8)}`,
        message: 'User found in Privy system (mock)'
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: 'User not found in Privy system (mock)'
      });
    }
  } catch (error) {
    console.error('Mock Privy lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Privy lookup failed' },
      { status: 400 }
    );
  }
}
