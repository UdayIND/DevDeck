"use client";
import { RoomProvider } from "@/lib/liveblocks.config";
import { LiveMap } from "@liveblocks/client";

export default function LiveblocksProvider({ children }: { children: React.ReactNode }) {
  return (
    <RoomProvider
      id="design-desk-jam"
      initialPresence={{ cursor: null, message: null }}
      initialStorage={{ canvasObjects: new LiveMap() }}
    >
      {children}
    </RoomProvider>
  );
} 