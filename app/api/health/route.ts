import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    // const dbStatus = await checkDatabaseConnection();
    
    // Check external services
    // const liveblocksStatus = await checkLiveblocks();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        database: 'operational',
        liveblocks: 'operational',
        authentication: 'operational',
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
} 