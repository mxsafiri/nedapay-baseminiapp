import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');

  if (!token || !amount || !currency) {
    return NextResponse.json(
      { error: 'Missing required parameters: token, amount, currency' },
      { status: 400 }
    );
  }

  try {
    const paycrestUrl = `${process.env.NEXT_PUBLIC_PAYCREST_API_URL}/v1/rates/${token}/${amount}/${currency}`;
    
    const response = await fetch(paycrestUrl, {
      method: 'GET',
      headers: {
        'API-Key': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Paycrest API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}
