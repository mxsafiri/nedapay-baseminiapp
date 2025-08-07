import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
const paymentRequests = new Map();

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json();
    
    // Generate unique payment ID
    const paymentId = Math.random().toString(36).substring(2, 15);
    
    // Create payment request object
    const paymentRequest = {
      id: paymentId,
      ...paymentData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    
    // Store payment request
    paymentRequests.set(paymentId, paymentRequest);
    
    console.log('Created payment request:', paymentRequest);
    
    return NextResponse.json({
      success: true,
      paymentId,
      paymentRequest,
    });
  } catch (error) {
    console.error('Error creating payment request:', error);
    return NextResponse.json(
      { error: 'Failed to create payment request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('id');
  
  if (!paymentId) {
    return NextResponse.json(
      { error: 'Payment ID is required' },
      { status: 400 }
    );
  }
  
  const paymentRequest = paymentRequests.get(paymentId);
  
  if (!paymentRequest) {
    return NextResponse.json(
      { error: 'Payment request not found' },
      { status: 404 }
    );
  }
  
  // Check if payment has expired
  const createdAt = new Date(paymentRequest.createdAt);
  const expiryTime = new Date(createdAt.getTime() + (parseInt(paymentRequest.expiryHours) * 60 * 60 * 1000));
  const isExpired = new Date() > expiryTime;
  
  if (isExpired && paymentRequest.status === 'pending') {
    paymentRequest.status = 'expired';
    paymentRequests.set(paymentId, paymentRequest);
  }
  
  return NextResponse.json({
    success: true,
    paymentRequest,
  });
}
