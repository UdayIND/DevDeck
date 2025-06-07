import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const App = dynamic(() => import("./App"), { ssr: false });

export default function Home() {
  return (
    <ErrorBoundary>
      {/* Environment Status Banner (only show if there are issues) */}
      {(!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && (
        <div className="bg-yellow-600 text-black p-2 text-center text-sm">
          ⚠️ Some features may not work properly. Environment variables need to be configured.
          <a href="/api/debug" className="ml-2 underline">Check Status</a>
        </div>
      )}
      <App />
    </ErrorBoundary>
  );
}
