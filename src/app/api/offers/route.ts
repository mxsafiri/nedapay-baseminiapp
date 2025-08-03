import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: 'Merchant ID is required' },
        { status: 400 }
      );
    }

    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch offers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      offers: offers || [],
      message: 'Offers retrieved successfully'
    });

  } catch (error) {
    console.error('Offers fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchantId,
      title,
      description,
      discountPercentage,
      code,
      expiresAt,
      maxRedemptions
    } = body;

    // Validate required fields
    if (!merchantId || !title || !description || !discountPercentage || !code) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if offer code already exists for this merchant
    const { data: existingOffer } = await supabase
      .from('offers')
      .select('id')
      .eq('merchant_id', merchantId)
      .eq('code', code)
      .single();

    if (existingOffer) {
      return NextResponse.json(
        { success: false, error: 'Offer code already exists' },
        { status: 409 }
      );
    }

    // Create new offer
    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert({
        merchant_id: merchantId,
        title,
        description,
        discount_percentage: discountPercentage,
        code,
        is_active: true,
        expires_at: expiresAt || null,
        redemptions: 0,
        max_redemptions: maxRedemptions || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      offer: newOffer,
      message: 'Offer created successfully'
    });

  } catch (error) {
    console.error('Offer creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      offerId,
      merchantId,
      title,
      description,
      discountPercentage,
      isActive,
      expiresAt,
      maxRedemptions
    } = body;

    if (!offerId || !merchantId) {
      return NextResponse.json(
        { success: false, error: 'Offer ID and Merchant ID are required' },
        { status: 400 }
      );
    }

    // Update offer
    const { data: updatedOffer, error } = await supabase
      .from('offers')
      .update({
        title,
        description,
        discount_percentage: discountPercentage,
        is_active: isActive,
        expires_at: expiresAt || null,
        max_redemptions: maxRedemptions || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .eq('merchant_id', merchantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating offer:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update offer' },
        { status: 500 }
      );
    }

    if (!updatedOffer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      message: 'Offer updated successfully'
    });

  } catch (error) {
    console.error('Offer update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');
    const merchantId = searchParams.get('merchantId');

    if (!offerId || !merchantId) {
      return NextResponse.json(
        { success: false, error: 'Offer ID and Merchant ID are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId)
      .eq('merchant_id', merchantId);

    if (error) {
      console.error('Error deleting offer:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully'
    });

  } catch (error) {
    console.error('Offer deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
