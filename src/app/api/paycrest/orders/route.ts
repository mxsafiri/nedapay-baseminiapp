import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    const paycrestUrl = `${process.env.NEXT_PUBLIC_PAYCREST_API_URL}/v1/orders`;
    
    const response = await fetch(paycrestUrl, {
      method: 'POST',
      headers: {
        'API-Key': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '',
        'API-Secret': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_SECRET || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Paycrest order creation failed:', errorData);
      throw new Error(`Paycrest API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');

  if (!orderId) {
    return NextResponse.json(
      { error: 'Missing order ID' },
      { status: 400 }
    );
  }

  try {
    const paycrestUrl = `${process.env.NEXT_PUBLIC_PAYCREST_API_URL}/v1/orders/${orderId}`;
    
    const response = await fetch(paycrestUrl, {
      method: 'GET',
      headers: {
        'API-Key': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '',
        'API-Secret': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_SECRET || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Paycrest API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Order status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}
