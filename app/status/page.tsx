"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StatusPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/debug')
      .then(res => res.json())
      .then(data => {
        setDebugInfo(data);
        setLoading(false);
      })
      .catch(err => {
        setDebugInfo({ error: err.message });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">DevDeck Status</h1>
          <Link href="/" className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environment Variables */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Environment Variables</h2>
            {debugInfo?.environment && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Liveblocks:</span>
                  <span className={debugInfo.environment.liveblocks ? 'text-green-400' : 'text-red-400'}>
                    {debugInfo.environment.liveblocks ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Clerk Public:</span>
                  <span className={debugInfo.environment.clerk_public ? 'text-green-400' : 'text-red-400'}>
                    {debugInfo.environment.clerk_public ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Clerk Secret:</span>
                  <span className={debugInfo.environment.clerk_secret ? 'text-green-400' : 'text-red-400'}>
                    {debugInfo.environment.clerk_secret ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Node Environment:</span>
                  <span className="text-blue-400">{debugInfo.environment.node_env}</span>
                </div>
              </div>
            )}
          </div>

          {/* Missing Variables */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Missing Variables</h2>
            {debugInfo?.missing_vars?.length > 0 ? (
              <div className="space-y-2">
                {debugInfo.missing_vars.map((varName: string) => (
                  <div key={varName} className="text-red-300">
                    ❌ {varName.toUpperCase()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-green-400">✅ All required variables are set!</div>
            )}
          </div>

          {/* Setup Instructions */}
          <div className="bg-gray-900 p-6 rounded-lg md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Setup Instructions</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-cyan-400 mb-2">1. Liveblocks Setup</h3>
                <p className="text-gray-300 mb-2">Go to <a href="https://liveblocks.io/dashboard" target="_blank" className="text-blue-400 underline">Liveblocks Dashboard</a></p>
                <p className="text-gray-300">Set: <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY</code></p>
              </div>
              <div>
                <h3 className="font-semibold text-cyan-400 mb-2">2. Clerk Setup</h3>
                <p className="text-gray-300 mb-2">Go to <a href="https://dashboard.clerk.com" target="_blank" className="text-blue-400 underline">Clerk Dashboard</a></p>
                <p className="text-gray-300">Set: <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code></p>
                <p className="text-gray-300">Set: <code className="bg-gray-800 px-2 py-1 rounded">CLERK_SECRET_KEY</code></p>
              </div>
            </div>
          </div>

          {/* Feature Status */}
          <div className="bg-gray-900 p-6 rounded-lg md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Feature Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Link href="/design-desk-jam" className="block p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="font-semibold">Whiteboard</div>
                  <div className="text-sm text-gray-400">Real-time drawing</div>
                </Link>
              </div>
              <div className="text-center">
                <Link href="/design-desk-slides" className="block p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-semibold">Presentations</div>
                  <div className="text-sm text-gray-400">Collaborative slides</div>
                </Link>
              </div>
              <div className="text-center">
                <Link href="/workspace" className="block p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                  <div className="text-2xl mb-2">🛠️</div>
                  <div className="font-semibold">Workspace</div>
                  <div className="text-sm text-gray-400">Advanced canvas</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          Last updated: {debugInfo?.environment?.timestamp}
        </div>
      </div>
    </div>
  );
} 