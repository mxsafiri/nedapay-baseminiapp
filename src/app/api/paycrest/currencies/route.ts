import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const paycrestUrl = `${process.env.NEXT_PUBLIC_PAYCREST_API_URL}/v1/currencies`;
    
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
    console.error('Currencies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}
