// Mock Privy create user endpoint for development
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, chainType, defaultChain } = await request.json();
    
    // Mock new Privy user creation
    const newPrivyUserId = `privy_new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockPrivyUser = {
      id: newPrivyUserId,
      wallet: {
        address: walletAddress,
        chainType: chainType || 'ethereum',
        walletClient: 'privy'
      },
      createdAt: new Date().toISOString(),
      linkedAccounts: [
        {
          type: 'wallet',
          address: walletAddress,
          verified: true
        }
      ]
    };

    // Mock tokens for new user
    const mockAccessToken = `privy_access_new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockRefreshToken = `privy_refresh_new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      user: mockPrivyUser,
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      message: 'New Privy user created (mock)'
    });
  } catch (error) {
    console.error('Mock Privy create user error:', error);
    return NextResponse.json(
      { success: false, error: 'Privy user creation failed' },
      { status: 400 }
    );
  }
}
