"use client";
import { RoomProvider } from "@/lib/liveblocks.config";
import { LiveMap } from "@liveblocks/client";

export default function LiveblocksProvider({ children }: { children: React.ReactNode }) {
  return (
    <RoomProvider
      id="design-desk-slides"
      initialPresence={{ cursor: null, message: null }}
      initialStorage={{
        canvasObjects: new LiveMap(),
        slides: [ { id: "slide-1", name: "Slide 1" } ],
        currentSlide: "slide-1",
        objectsBySlide: { "slide-1": [] },
        presenter: "",
        templates: [],
      }}
    >
      {children}
    </RoomProvider>
  );
} 