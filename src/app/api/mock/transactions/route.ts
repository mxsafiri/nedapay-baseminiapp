// Mock transaction endpoints for development
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transaction } = await request.json();
    
    // Mock successful transaction sync
    const syncedTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      transaction: syncedTransaction,
      message: 'Transaction synced successfully (mock)'
    });
  } catch (error) {
    console.error('Mock transaction sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Transaction sync failed' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Mock transaction history
    const mockTransactions = [
      {
        id: `tx_${Date.now()}_1`,
        userId,
        type: 'payment',
        status: 'completed',
        amount: '100.00',
        currency: 'USDC',
        fromAddress: '0x742d35Cc6634C0532925a3b8D4C6C4C8c8c8c8c8',
        toAddress: '0x123456789abcdef123456789abcdef123456789a',
        txHash: '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef',
        blockNumber: 18500000,
        description: 'Payment to merchant',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        completedAt: new Date(Date.now() - 3500000).toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'miniapp',
        syncStatus: 'synced',
        chainId: 8453,
        networkName: 'Base'
      },
      {
        id: `tx_${Date.now()}_2`,
        userId,
        type: 'invoice_payment',
        status: 'completed',
        amount: '550.00',
        currency: 'USDC',
        fromAddress: '0x987654321fedcba987654321fedcba987654321f',
        toAddress: '0x742d35Cc6634C0532925a3b8D4C6C4C8c8c8c8c8',
        txHash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456',
        blockNumber: 18499000,
        description: 'Invoice payment received',
        invoiceId: 'inv_mock_1',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        completedAt: new Date(Date.now() - 86300000).toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'mainapp',
        syncStatus: 'synced',
        chainId: 8453,
        networkName: 'Base'
      }
    ];

    return NextResponse.json({
      success: true,
      transactions: mockTransactions,
      message: 'Mock transactions retrieved'
    });
  } catch (error) {
    console.error('Mock transaction fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 400 }
    );
  }
}
