"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import LiveblocksProvider from "./LiveblocksProvider";
import { useState, useEffect } from "react";
import { useOthers, useSelf, useStorage, useMutation } from "@/lib/liveblocks.config";
import { toast } from "react-hot-toast";

const SlidesEditor = dynamic(() => import("./SlidesEditor"), { ssr: false });

function DesignDeskSlidesInner() {
  const slides = useStorage((root) => root.slides || []);
  const currentSlide = useStorage((root) => root.currentSlide || "slide-1");
  const others = useOthers();
  const self = useSelf();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isPresenting, setIsPresenting] = useState(false);

  // Initialize slides if empty
  const initializeSlides = useMutation(({ storage }) => {
    const existingSlides = storage.get("slides");
    if (!existingSlides || existingSlides.length === 0) {
      storage.set("slides", [
        { id: "slide-1", title: "Slide 1", objects: [] },
      ]);
      storage.set("currentSlide", "slide-1");
    }
  }, []);

  const addSlide = useMutation(({ storage }) => {
    const existingSlides = storage.get("slides") || [];
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${existingSlides.length + 1}`,
      objects: [],
    };
    storage.set("slides", [...existingSlides, newSlide]);
    storage.set("currentSlide", newSlide.id);
  }, []);

  const deleteSlide = useMutation(({ storage }, slideId: string) => {
    const existingSlides = storage.get("slides") || [];
    const filteredSlides = existingSlides.filter((slide: any) => slide.id !== slideId);
    storage.set("slides", filteredSlides);
    
    if (currentSlide === slideId && filteredSlides.length > 0) {
      storage.set("currentSlide", filteredSlides[0].id);
    }
  }, []);

  const setCurrentSlide = useMutation(({ storage }, slideId: string) => {
    storage.set("currentSlide", slideId);
  }, []);

  useEffect(() => {
    if (slides.length === 0) {
      initializeSlides();
    }
  }, []);

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

  const startPresentation = () => {
    setIsPresenting(true);
    toast.success("Presentation started!");
  };

  const stopPresentation = () => {
    setIsPresenting(false);
    toast.success("Presentation stopped!");
  };

  const exportSlides = () => {
    const exportData = {
      slides,
      metadata: {
        title: "DesignDesk Presentation",
        created: new Date().toISOString(),
        slides: slides.length,
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presentation-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Slides exported!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-neon">DesignDesk Slides</h1>
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
          {!isPresenting ? (
            <button onClick={startPresentation} className="btn-neon px-4 py-2 text-sm">
              🎥 Present
            </button>
          ) : (
            <button onClick={stopPresentation} className="bg-red-600 hover:bg-red-700 px-4 py-2 text-sm rounded">
              ⏹️ Stop
            </button>
          )}
          <button onClick={exportSlides} className="btn-neon px-4 py-2 text-sm">
            📥 Export
          </button>
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
        {/* Left Sidebar - Slide List */}
        <div className="w-64 bg-gray-900 p-4 border-r border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-accent-cyan">Slides</h3>
            <button
              onClick={addSlide}
              className="btn-neon px-3 py-1 text-xs"
            >
              + Add
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {slides.map((slide: any, index: number) => (
              <div
                key={slide.id}
                className={`p-3 rounded border-2 cursor-pointer transition-all ${
                  currentSlide === slide.id
                    ? 'border-neon bg-neon/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setCurrentSlide(slide.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{slide.title}</div>
                    <div className="text-xs text-gray-400">Slide {index + 1}</div>
                  </div>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(slide.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                {/* Slide thumbnail preview */}
                <div className="mt-2 w-full h-16 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-xs text-gray-400">
                  Preview
                </div>
              </div>
            ))}
          </div>

          {/* Slide Actions */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-accent-purple mb-2">Actions</h4>
            <button className="btn-neon w-full py-2 text-sm">
              📋 Duplicate Slide
            </button>
            <button className="btn-neon w-full py-2 text-sm">
              📄 Add Template
            </button>
            <button className="btn-neon w-full py-2 text-sm">
              🎨 Change Theme
            </button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 relative">
          <SlidesEditor currentSlide={currentSlide} isPresenting={isPresenting} />
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

            {/* Comments Section */}
            <div className="mt-4">
              <h4 className="font-semibold text-accent-cyan mb-2">Slide Comments</h4>
              <div className="bg-gray-800 rounded p-2 text-sm text-gray-400">
                No comments on this slide yet.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DesignDeskSlides() {
  return (
    <LiveblocksProvider>
      <DesignDeskSlidesInner />
    </LiveblocksProvider>
  );
} 