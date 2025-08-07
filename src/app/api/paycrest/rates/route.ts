import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const network = searchParams.get('network') || 'base'; // Default to base network

  if (!token || !amount || !currency) {
    return NextResponse.json(
      { error: 'Missing required parameters: token, amount, currency' },
      { status: 400 }
    );
  }

  try {
    // Build URL with network parameter
    const paycrestUrl = `${process.env.NEXT_PUBLIC_PAYCREST_API_URL}/v1/rates/${token}/${amount}/${currency}?network=${network}`;
    
    console.log('Fetching Paycrest rates:', { token, amount, currency, network, url: paycrestUrl });
    
    const response = await fetch(paycrestUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCREST_CLIENT_SECRET}`, // Use proper auth header
        'x-api-key': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('Paycrest response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Paycrest API error details:', errorText);
      throw new Error(`Paycrest API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Paycrest rates data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
