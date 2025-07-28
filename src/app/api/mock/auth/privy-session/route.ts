// Mock Privy session endpoint for development
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { privyUserId, walletAddress } = await request.json();
    
    // Mock Privy user data
    const mockPrivyUser = {
      id: privyUserId,
      wallet: {
        address: walletAddress,
        chainType: 'ethereum',
        walletClient: 'privy'
      },
      email: {
        address: `user${walletAddress.slice(-4)}@example.com`,
        verified: true
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      linkedAccounts: [
        {
          type: 'wallet',
          address: walletAddress,
          verified: true
        },
        {
          type: 'email',
          address: `user${walletAddress.slice(-4)}@example.com`,
          verified: true
        }
      ]
    };

    // Mock tokens
    const mockAccessToken = `privy_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockRefreshToken = `privy_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      user: mockPrivyUser,
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      message: 'Privy session retrieved (mock)'
    });
  } catch (error) {
    console.error('Mock Privy session error:', error);
    return NextResponse.json(
      { success: false, error: 'Privy session failed' },
      { status: 400 }
    );
  }
}
