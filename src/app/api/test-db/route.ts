import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase database connection...');
    
    // Test 1: Basic connection test
    const { data: connectionTest, error: connectionError } = await supabase
      .from('merchants')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('Connection test failed:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError,
        tests: {
          connection: false,
          tables: null
        }
      });
    }
    
    console.log('Basic connection successful');
    
    // Test 2: Check if tables exist
    const tableTests: any = {};
    
    // Test merchants table
    try {
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .select('*')
        .limit(1);
      
      tableTests.merchants = {
        exists: !merchantsError,
        error: merchantsError?.message || null,
        sampleData: merchantsData
      };
    } catch (err) {
      tableTests.merchants = {
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
    
    // Test offers table
    try {
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select('*')
        .limit(1);
      
      tableTests.offers = {
        exists: !offersError,
        error: offersError?.message || null,
        sampleData: offersData
      };
    } catch (err) {
      tableTests.offers = {
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
    
    // Test transactions table
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);
      
      tableTests.transactions = {
        exists: !transactionsError,
        error: transactionsError?.message || null,
        sampleData: transactionsData
      };
    } catch (err) {
      tableTests.transactions = {
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
    
    // Test 3: Environment variables check
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    };
    
    console.log('Database test results:', {
      connection: true,
      tables: tableTests,
      environment: envCheck
    });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      tests: {
        connection: true,
        tables: tableTests,
        environment: envCheck
      }
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
