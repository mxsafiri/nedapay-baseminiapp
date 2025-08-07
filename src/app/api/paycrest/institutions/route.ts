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
    
    console.log('Fetching Paycrest institutions:', { currency, url: paycrestUrl });
    
    const response = await fetch(paycrestUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCREST_CLIENT_SECRET}`, // Use proper auth header
        'x-api-key': process.env.NEXT_PUBLIC_PAYCREST_CLIENT_ID || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('Paycrest institutions response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Paycrest institutions API error details:', errorText);
      throw new Error(`Paycrest API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Paycrest institutions data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Institutions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}
