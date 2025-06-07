import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      liveblocks: !!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
      clerk_public: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      clerk_secret: !!process.env.CLERK_SECRET_KEY,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      status: 'ok',
      environment: envCheck,
      message: 'DevDeck Debug Info',
      missing_vars: Object.entries(envCheck)
        .filter(([key, value]) => key !== 'node_env' && key !== 'timestamp' && !value)
        .map(([key]) => key),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 