// Mock invoice sync endpoint for development
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { invoice } = await request.json();
    
    // Mock successful sync response
    const syncedInvoice = {
      ...invoice,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentLink: `https://pay.nedapay.app/invoice/${invoice.id}`,
      status: 'sent',
      updatedAt: new Date().toISOString(),
      syncedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      invoice: syncedInvoice,
      message: 'Invoice synced successfully (mock)'
    });
  } catch (error) {
    console.error('Mock invoice sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Invoice sync failed' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Mock invoice list
    const mockInvoices = [
      {
        id: `inv_${Date.now()}_1`,
        userId,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [{ description: 'Web Development', quantity: 1, price: 500 }],
        subtotal: 500,
        tax: 50,
        total: 550,
        currency: 'USDC',
        status: 'paid',
        paymentLink: 'https://pay.nedapay.app/invoice/mock1',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString(),
        source: 'mainapp',
        syncStatus: 'synced'
      }
    ];

    return NextResponse.json({
      success: true,
      invoices: mockInvoices,
      message: 'Mock invoices retrieved'
    });
  } catch (error) {
    console.error('Mock invoice fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 400 }
    );
  }
}
