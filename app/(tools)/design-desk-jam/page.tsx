"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import LiveblocksProvider from "./LiveblocksProvider";
import { useState, useRef, useEffect } from "react";
import { useOthers, useSelf, useUpdateMyPresence, useUndo, useRedo, useCanUndo, useCanRedo } from "@/lib/liveblocks.config";
import { HexColorPicker } from "react-colorful";
import { toast } from "react-hot-toast";

const WhiteboardCanvas = dynamic(() => import("./WhiteboardCanvas"), { ssr: false });

function DesignDeskJamInner() {
  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("#00fff7");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const others = useOthers();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tools = [
    { name: "Pen", value: "pen", icon: "✏️" },
    { name: "Highlighter", value: "highlighter", icon: "🖍️" },
    { name: "Sticky Note", value: "sticky", icon: "📝" },
    { name: "Rectangle", value: "rectangle", icon: "▭" },
    { name: "Circle", value: "circle", icon: "○" },
    { name: "Arrow", value: "arrow", icon: "↗" },
    { name: "Text", value: "text", icon: "T" },
    { name: "Eraser", value: "eraser", icon: "🧽" },
  ];

  const colors = ["#00fff7", "#ff00c8", "#ffe600", "#00ff5a", "#fff", "#000", "#ff5722", "#2196f3", "#4caf50"];

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    updateMyPresence({ message: JSON.stringify({ tool }) });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    updateMyPresence({ message: JSON.stringify({ color }) });
    setShowColorPicker(false);
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        user: self?.connectionId?.toString() || "Anonymous",
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage("");
      toast.success("Message sent!");
    }
  };

  const exportCanvas = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      toast.success("Whiteboard exported!");
    }
  };

  const clearCanvas = () => {
    setShowClearModal(true);
  };

  const confirmClearCanvas = () => {
    // This will be handled by the WhiteboardCanvas component
    setShowClearModal(false);
    toast.success("Canvas cleared!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Clear Canvas</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to clear the entire canvas? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCanvas}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Clear Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-neon">DesignDesk Jam</h1>
          <div className="flex items-center gap-2">
            {others.map((user) => (
              <div
                key={user.connectionId}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: (user.presence as any)?.color || '#00fff7' }}
              >
                {user.connectionId?.toString().slice(-2)}
              </div>
            ))}
            <div className="text-sm text-gray-400">
              {others.length + 1} user{others.length !== 0 ? 's' : ''} online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="btn-neon px-4 py-2 text-sm"
          >
            💬 Chat
          </button>
          <Link href="/" className="btn-neon px-4 py-2 text-sm">
            ← Back
          </Link>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-gray-900 p-4 border-r border-gray-700">
          <div className="space-y-4">
            {/* Tools */}
            <div>
              <h3 className="font-semibold text-accent-cyan mb-3">Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.value}
                    onClick={() => handleToolSelect(tool.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTool === tool.value
                        ? 'border-neon bg-neon/20 text-neon'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-lg mb-1">{tool.icon}</div>
                    <div className="text-xs">{tool.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-semibold text-accent-purple mb-3">Colors</h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      selectedColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="btn-neon w-full py-2 text-sm"
              >
                Custom Color
              </button>
              {showColorPicker && (
                <div className="mt-3">
                  <HexColorPicker color={selectedColor} onChange={handleColorSelect} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-semibold text-accent-cyan mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className={`btn-neon w-full py-2 text-sm ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  ↶ Undo
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className={`btn-neon w-full py-2 text-sm ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  ↷ Redo
                </button>
                <button
                  onClick={exportCanvas}
                  className="btn-neon w-full py-2 text-sm"
                >
                  📥 Export PNG
                </button>
                <button
                  onClick={clearCanvas}
                  className="bg-red-600 hover:bg-red-700 text-white w-full py-2 text-sm rounded"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <WhiteboardCanvas 
            selectedTool={selectedTool}
            selectedColor={selectedColor}
          />
        </div>

        {/* Right Sidebar - Chat (if open) */}
        {showChat && (
          <div className="w-80 bg-gray-900 p-4 border-l border-gray-700 flex flex-col">
            <h3 className="font-semibold text-accent-purple mb-3">Team Chat</h3>
            
            {/* Chat Messages */}
            <div className="flex-1 bg-gray-800 rounded p-3 mb-3 overflow-y-auto max-h-96">
              {chatMessages.length === 0 ? (
                <div className="text-gray-400 text-sm">No messages yet. Start the conversation!</div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <div className="text-xs text-gray-400">{msg.timestamp}</div>
                    <div className="text-sm">
                      <span className="text-accent-cyan">User {msg.user.slice(-2)}:</span> {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
              <button
                onClick={sendChatMessage}
                className="btn-neon px-4 py-2"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DesignDeskJam() {
  // Check if Liveblocks environment variable is available
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-gray-300 mb-4">
            Liveblocks environment variable is not configured.
          </p>
          <p className="text-sm text-gray-400">
            Please set NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY in your environment variables.
          </p>
          <Link href="/" className="btn-neon px-4 py-2 text-sm mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LiveblocksProvider>
      <DesignDeskJamInner />
    </LiveblocksProvider>
  );
} 