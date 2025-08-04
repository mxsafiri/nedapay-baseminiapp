import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency');

  if (!currency) {
    return NextResponse.json(
      { error: 'Missing currency parameter' },
      { status: 400 }
    );
  }

  try {
    const paycrestUrl = `${process.env.NEXT_PUBLIC_PAYCREST_API_URL}/v1/institutions/${currency}`;
    
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
    console.error('Institutions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}
