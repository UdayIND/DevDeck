import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    liveblocks_exists: !!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
    liveblocks_value: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ? 'SET' : 'NOT_SET',
    clerk_public_exists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerk_public_value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT_SET',
    clerk_secret_exists: !!process.env.CLERK_SECRET_KEY,
    clerk_secret_value: process.env.CLERK_SECRET_KEY ? 'SET' : 'NOT_SET',
    node_env: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: 'Environment Variable Test',
    variables: envVars,
    all_required_set: envVars.liveblocks_exists && envVars.clerk_public_exists && envVars.clerk_secret_exists,
    timestamp: new Date().toISOString(),
  });
} 