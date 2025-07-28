// Mock authentication endpoint for development
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    // Mock user data
    const mockUser = {
      id: `user_${walletAddress.slice(-8)}`,
      walletAddress,
      name: `User ${walletAddress.slice(-4)}`,
      email: `user${walletAddress.slice(-4)}@example.com`,
      isVerified: true,
      createdAt: new Date().toISOString(),
      preferences: {
        defaultCurrency: 'USDC',
        notifications: true,
        theme: 'light'
      }
    };

    // Mock JWT token
    const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    return NextResponse.json({
      success: true,
      token: mockToken,
      user: mockUser,
      expiresAt,
      message: 'Mock authentication successful'
    });
  } catch (error) {
    console.error('Mock auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 400 }
    );
  }
}
