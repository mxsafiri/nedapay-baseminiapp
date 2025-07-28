// Mock health check endpoint for development
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'NedaPay Mock API',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock',
    environment: 'development'
  });
}
