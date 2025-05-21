"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  useMutation,
  useStorage,
  useOthers,
  useSelf,
  useUpdateMyPresence,
} from "@/config/liveblocks.config";

const COLORS = ["#00fff7", "#ff00c8", "#ffe600", "#00ff5a", "#fff", "#000"];
const SIZES = [2, 4, 8, 16];

type Presence = {
  name: string;
  color: string;
  cursor?: { x: number; y: number };
};

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [showChat, setShowChat] = useState(false);

  // Liveblocks hooks
  const canvasObjects = useStorage((root) => root.canvasObjects || new Map());
  const panZoom = useStorage((root) => root.panZoom || { zoom: 1, pan: [0, 0] });
  const others = useOthers();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();

  // Sync canvas objects to Liveblocks
  const setObjects = useMutation(({ storage }, newObjects) => {
    storage.set("canvasObjects", newObjects);
  }, []);
  // Sync pan/zoom to Liveblocks
  const setPanZoom = useMutation(({ storage }, newPanZoom) => {
    storage.set("panZoom", newPanZoom);
  }, []);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#18181b",
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = fabricCanvas;
    // Set initial tool
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = size;
    fabricCanvas.isDrawingMode = tool === "pen";

    // Pan/zoom
    let panning = false;
    fabricCanvas.on("mouse:down", (opt) => {
      if (tool === "pan") {
        panning = true;
        fabricCanvas.setCursor("grab");
      }
    });
    fabricCanvas.on("mouse:move", (opt) => {
      if (panning && opt.e) {
        const e = opt.e as MouseEvent;
        fabricCanvas.relativePan({ x: e.movementX, y: e.movementY });
        setPanZoom({ zoom: fabricCanvas.getZoom(), pan: [Number(e.movementX), Number(e.movementY)] });
      }
      // Update presence cursor
      if (opt.e) {
        updateMyPresence({ cursor: { x: opt.e.offsetX, y: opt.e.offsetY } });
      }
    });
    fabricCanvas.on("mouse:up", () => {
      panning = false;
      fabricCanvas.setCursor("default");
    });
    // Zoom
    fabricCanvas.on("mouse:wheel", (opt) => {
      const e = opt.e as WheelEvent;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** e.deltaY;
      zoom = Math.max(0.2, Math.min(zoom, 3));
      fabricCanvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
      setPanZoom({ zoom, pan: [Number(e.movementX), Number(e.movementY)] });
      e.preventDefault();
      e.stopPropagation();
    });
    // Save objects to Liveblocks on add/modify/remove
    const saveObjects = () => {
      setObjects(fabricCanvas.toDatalessJSON().objects);
    };
    fabricCanvas.on("object:added", saveObjects);
    fabricCanvas.on("object:modified", saveObjects);
    fabricCanvas.on("object:removed", saveObjects);
    // Load objects from Liveblocks
    if (canvasObjects && canvasObjects.size > 0) {
      fabricCanvas.loadFromJSON({ objects: Array.from(canvasObjects.values()) }, fabricCanvas.renderAll.bind(fabricCanvas));
    }
    // Load pan/zoom from Liveblocks
    if (panZoom) {
      fabricCanvas.setZoom(panZoom.zoom);
      if (fabricCanvas.viewportTransform) {
        fabricCanvas.viewportTransform[4] = panZoom.pan[0];
        fabricCanvas.viewportTransform[5] = panZoom.pan[1];
      }
    }
    // Clean up
    return () => {
      fabricCanvas.dispose();
    };
    // eslint-disable-next-line
  }, []);

  // Update tool/color/size
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (tool === "pen") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = size;
    } else if (tool === "eraser") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#18181b";
      canvas.freeDrawingBrush.width = size * 2;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [tool, color, size]);

  // Add sticky note
  const addSticky = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const note = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "#ffe600",
      width: 120,
      height: 80,
      rx: 10,
      ry: 10,
      stroke: "#000",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
    });
    const text = new fabric.Textbox("Sticky Note", {
      left: 110,
      top: 120,
      width: 100,
      fontSize: 18,
      fill: "#222",
      fontWeight: "bold",
      editable: true,
    });
    canvas.add(note, text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };
  // Add rectangle
  const addRect = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      fill: color,
      width: 100,
      height: 60,
      rx: 8,
      ry: 8,
      stroke: "#fff",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };
  // Add ellipse
  const addEllipse = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const ellipse = new fabric.Ellipse({
      left: 200,
      top: 200,
      rx: 50,
      ry: 30,
      fill: color,
      stroke: "#fff",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
    });
    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
    canvas.requestRenderAll();
  };

  // Add Sprint Review template
  const addSprintReviewTemplate = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const columnTitles = [
      { label: "What went well", color: "#00ff5a" },
      { label: "What could be better", color: "#ffe600" },
      { label: "Action Items", color: "#ff00c8" },
    ];
    const startX = 100;
    const gap = 260;
    columnTitles.forEach((col, i) => {
      // Title
      const title = new fabric.Textbox(col.label, {
        left: startX + i * gap + 10,
        top: 60,
        width: 200,
        fontSize: 22,
        fill: "#fff",
        fontWeight: "bold",
        editable: false,
        selectable: false,
        evented: false,
      });
      // Column background
      const rect = new fabric.Rect({
        left: startX + i * gap,
        top: 100,
        fill: col.color,
        width: 220,
        height: 600,
        rx: 16,
        ry: 16,
        stroke: "#222",
        strokeWidth: 2,
        opacity: 0.18,
        selectable: false,
        evented: false,
      });
      canvas.add(rect);
      canvas.add(title);
    });
    canvas.requestRenderAll();
  };

  // User presence bar
  const renderPresence = () => (
    <div className="flex gap-2 mb-2">
      {self && (
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ background: (self.presence as any)?.color || '#00fff7' }}></span>
          <span className="text-xs">You</span>
        </div>
      )}
      {others.map((user) => (
        <div key={user.connectionId} className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ background: (user.presence as any)?.color || '#00fff7' }}></span>
          <span className="text-xs">{(user.presence as any)?.name || "User"}</span>
        </div>
      ))}
    </div>
  );

  // User cursors
  const renderCursors = () => (
    <>
      {others.map((user) =>
        (user.presence as any)?.cursor ? (
          <div
            key={user.connectionId}
            className="absolute pointer-events-none z-50"
            style={{
              left: (user.presence as any)?.cursor.x,
              top: (user.presence as any)?.cursor.y,
              color: (user.presence as any)?.color,
            }}
          >
            <svg width="24" height="24" style={{ filter: "drop-shadow(0 0 4px #000)" }}>
              <circle cx="12" cy="12" r="8" fill={(user.presence as any)?.color} opacity={0.7} />
            </svg>
            <span className="text-xs font-bold" style={{ color: (user.presence as any)?.color }}>{(user.presence as any)?.name || "User"}</span>
          </div>
        ) : null
      )}
    </>
  );

  // Export as image
  const handleExport = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png" });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "design-desk-jam.png";
    a.click();
  };

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {renderPresence()}
      {/* Tool Palette */}
      <div className="flex gap-2 items-center mb-2">
        <button className={`btn-neon ${tool === "pen" ? "ring-2 ring-accent-cyan" : ""}`} onClick={() => setTool("pen")}>Pen</button>
        <button className={`btn-neon ${tool === "eraser" ? "ring-2 ring-accent-cyan" : ""}`} onClick={() => setTool("eraser")}>Eraser</button>
        <button className={`btn-neon ${tool === "pan" ? "ring-2 ring-accent-cyan" : ""}`} onClick={() => setTool("pan")}>Pan</button>
        <button className="btn-neon" onClick={addSticky}>Sticky Note</button>
        <button className="btn-neon" onClick={addRect}>Rectangle</button>
        <button className="btn-neon" onClick={addEllipse}>Ellipse</button>
        <button className="btn-neon" onClick={addSprintReviewTemplate}>Sprint Review Template</button>
        <span className="ml-4">Color:</span>
        {COLORS.map((c) => (
          <button key={c} className="w-6 h-6 rounded-full border-2 border-white mx-1" style={{ background: c, outline: color === c ? "2px solid #00fff7" : "none" }} onClick={() => setColor(c)} />
        ))}
        <span className="ml-4">Size:</span>
        <select value={size} onChange={e => setSize(Number(e.target.value))} className="bg-gray-800 text-white rounded px-2 py-1">
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-neon ml-4" onClick={handleExport}>Export</button>
        <button className="btn-neon ml-4" onClick={() => setShowChat((v) => !v)}>{showChat ? "Hide Chat" : "Show Chat"}</button>
      </div>
      {/* Canvas */}
      <div className="border-2 border-accent-cyan rounded-lg bg-black overflow-auto relative" style={{ width: "100%", height: 500 }}>
        <canvas ref={canvasRef} width={1600} height={1000} style={{ background: "#18181b", width: "100%", height: 500 }} />
        {renderCursors()}
        {showChat && (
          <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-accent-cyan z-50">
            {/* Comments roomId="design-desk-jam" */}
          </div>
        )}
      </div>
    </div>
  );
} 