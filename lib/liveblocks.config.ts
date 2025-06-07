import { LiveMap, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Get the public key from environment variable with fallback for build time
const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

// Only throw error in browser/runtime, not during build
if (typeof window !== 'undefined' && !publicApiKey) {
  throw new Error("NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is not defined.");
}

// Create the Liveblocks client using the public key from the environment
const client = createClient({
  throttle: 16, // Control the frequency of updates.
  publicApiKey: publicApiKey || "pk_dev_placeholder", // Fallback for build time
  
  // Uncomment if using a custom auth backend
  // authEndpoint: "/api/liveblocks-auth",

  resolveUsers: async ({ userIds }) => {
    // For Comments feature, return user data like name and avatar
    // Implement this with your own backend or leave it as is if not used
    return [];
  },
  resolveMentionSuggestions: async ({ text, roomId }) => {
    // For Comments feature: Suggest userIds when mentioning users by filtering their names
    return [];
  },
});

// Presence: Properties that are synced for each user
export type Presence = {
  cursor: { x: number; y: number } | null;
  message: string | null;
};

// Storage: Shared objects across users that persist in the Room
// Expanded to support both Jam and Slides modules
// canvasObjects: for Jam/whiteboard
// slides, currentSlide, objectsBySlide, presenter, templates: for Slides
// panZoom: for Jam (if needed in future)
type Storage = {
  canvasObjects: LiveMap<string, any>;
  slides?: any[];
  currentSlide?: string;
  objectsBySlide?: Record<string, any[]>;
  presenter?: any;
  templates?: any[];
  panZoom?: { zoom: number; pan: [number, number] };
  // DevHub additions
  files?: any[];
  readme?: string;
  issues?: any[];
};

// UserMeta: Optional static metadata for users
type UserMeta = {
  // Example: id, name, avatar fetched from your custom auth backend
  // id?: string;
  // info?: Json;
};

// RoomEvent: Custom events broadcast and listened to within the room
type RoomEvent = {
  x: number;
  y: number;
  value: string;
};

// ThreadMetadata: Metadata for Comments threads (for example, in collaborative comments feature)
export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

// Create the RoomContext using the client, presence, and storage types
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
  client
);
