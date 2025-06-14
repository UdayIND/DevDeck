import Cursor from "./Cursor";
import { COLORS } from "@/lib/index";
import { useOthers } from "@/lib/liveblocks.config";

function LiveCursors() {
  const others = useOthers();

  return others.map(({ connectionId, presence }) => {
    if (!presence?.cursor) return null;

    return (
      <Cursor
        key={connectionId}
        color={COLORS[connectionId % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message || ""}
      />
    );
  });
}

export default LiveCursors;
