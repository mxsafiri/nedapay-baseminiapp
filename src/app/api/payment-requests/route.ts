import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    
    // Store payment request in Supabase
    const { data, error } = await supabase
      .from('payment_requests')
      .insert([paymentRequest])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating payment request:', error);
      throw new Error('Failed to store payment request');
    }
    
    console.log('Created payment request:', data);
    
    return NextResponse.json({
      success: true,
      paymentId,
      paymentRequest: data,
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
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch payment request from Supabase
    const { data: paymentRequest, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', paymentId)
      .single();
    
    if (error || !paymentRequest) {
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
      // Update status in Supabase
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({ status: 'expired' })
        .eq('id', paymentId);
      
      if (!updateError) {
        paymentRequest.status = 'expired';
      }
    }
    
    return NextResponse.json({
      success: true,
      paymentRequest,
    });
  } catch (error) {
    console.error('Error fetching payment request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment request' },
      { status: 500 }
    );
  }
}
