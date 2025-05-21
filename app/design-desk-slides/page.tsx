"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import LiveblocksProvider from "./LiveblocksProvider";

const SlidesEditor = dynamic(() => import("./SlidesEditor"), { ssr: false });

export default function DesignDeskSlides() {
  return (
    <LiveblocksProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
        <h1 className="text-5xl font-bold mb-4 text-neon">DesignDesk Slides</h1>
        <p className="text-xl mb-8 text-gray-300">Create, present, and collaborate on slides.</p>
        <div className="w-full max-w-7xl bg-gray-900 rounded-xl shadow-lg p-8 flex gap-8">
          {/* Slide List */}
          <div className="w-56 flex-shrink-0">
            {/* TODO: Slide list UI */}
          </div>
          {/* Slides Editor */}
          <div className="flex-1">
            <SlidesEditor />
          </div>
          {/* Chat Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* TODO: Chat sidebar */}
          </div>
        </div>
        <Link href="/" className="btn-neon px-6 py-2 rounded-full font-semibold mt-8">Back to Home</Link>
      </div>
    </LiveblocksProvider>
  );
} 