import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const App = dynamic(() => import("./App"), { ssr: false });

export default function Home() {
  const missingVars = [];
  
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    missingVars.push('NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY');
  }
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    missingVars.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  if (!process.env.CLERK_SECRET_KEY) {
    missingVars.push('CLERK_SECRET_KEY');
  }

  return (
    <ErrorBoundary>
      {/* Environment Status Banner */}
      {missingVars.length > 0 && (
        <div className="bg-red-600 text-white p-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-lg mb-2">⚠️ Configuration Required</h3>
            <p className="mb-2">Missing environment variables:</p>
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {missingVars.map(varName => (
                <code key={varName} className="bg-red-800 px-2 py-1 rounded text-sm">
                  {varName}
                </code>
              ))}
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <a href="/api/env-test" className="underline hover:text-red-200">
                Test Environment Variables
              </a>
              <a href="/status" className="underline hover:text-red-200">
                View Status Dashboard
              </a>
            </div>
          </div>
        </div>
      )}
      <App />
    </ErrorBoundary>
  );
}
