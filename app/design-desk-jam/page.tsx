"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import LiveblocksProvider from "./LiveblocksProvider";

const WhiteboardCanvas = dynamic(() => import("./WhiteboardCanvas"), { ssr: false });

export default function DesignDeskJam() {
  return (
    <LiveblocksProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
        <h1 className="text-5xl font-bold mb-4 text-neon">DesignDesk Jam</h1>
        <p className="text-xl mb-8 text-gray-300">Collaborative whiteboard and brainstorming space.</p>
        <div className="w-full max-w-5xl bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-8">
          <WhiteboardCanvas />
          {/* Tool Palette */}
          <div className="flex gap-4 items-center mb-4">
            <span className="font-semibold text-accent-cyan">Tools:</span>
            <button className="btn-neon">Pen</button>
            <button className="btn-neon">Highlighter</button>
            <button className="btn-neon">Sticky Note</button>
            <button className="btn-neon">Shape</button>
            <button className="btn-neon">Eraser</button>
            {/* TODO: Add color picker, export, undo/redo */}
          </div>
          {/* User Presence & Chat */}
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="font-semibold text-accent-purple mb-2">Active Users</div>
              <div className="bg-gray-800 rounded p-2 text-gray-300">[ TODO: Show avatars/presence ]</div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-accent-purple mb-2">Chat</div>
              <div className="bg-gray-800 rounded p-2 text-gray-300">[ TODO: Implement chat sidebar ]</div>
            </div>
          </div>
          {/* Board History & Export */}
          <div className="flex gap-4 mt-4">
            <button className="btn-neon">Undo</button>
            <button className="btn-neon">Redo</button>
            <button className="btn-neon">Export</button>
            {/* TODO: Implement board history, export as image/PDF */}
          </div>
        </div>
        <Link href="/" className="btn-neon px-6 py-2 rounded-full font-semibold mt-8">Back to Home</Link>
      </div>
    </LiveblocksProvider>
  );
} 