"use client";
import { useState, useRef, useEffect } from "react";
import { fabric } from "fabric";
import {
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useUpdateMyPresence,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
} from "@/lib/liveblocks.config";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { HexColorPicker } from "react-colorful";
import { toast } from "react-hot-toast";

const COLORS = ["#00fff7", "#ff00c8", "#ffe600", "#00ff5a", "#fff", "#000"];
const SIZES = [2, 4, 8, 16];
const TEMPLATES = [
  { name: "Title Slide", objects: [{ type: "textbox", text: "Title", left: 400, top: 100, width: 400, fontSize: 48, fill: "#fff", fontWeight: "bold" }] },
  { name: "Bullets", objects: [{ type: "textbox", text: "• Point 1\n• Point 2\n• Point 3", left: 200, top: 200, width: 600, fontSize: 32, fill: "#fff" }] },
  { name: "Image + Caption", objects: [{ type: "rect", left: 350, top: 150, width: 500, height: 300, fill: "#222" }, { type: "textbox", text: "Caption here", left: 400, top: 480, width: 400, fontSize: 28, fill: "#fff" }] },
];

interface SlidesEditorProps {
  currentSlide: string;
  isPresenting: boolean;
}

export default function SlidesEditor({ currentSlide, isPresenting }: SlidesEditorProps) {
  // Liveblocks state
  const slides = useStorage((root) => root.slides || []);
  const currentSlideId = useStorage((root) => root.currentSlide || "slide-1");
  const objectsBySlide = useStorage((root) => root.objectsBySlide || {});
  const setSlides = useMutation(({ storage }, newSlides) => {
    storage.set("slides", newSlides);
  }, []);
  const setCurrentSlide = useMutation(({ storage }, slideId) => {
    storage.set("currentSlide", slideId);
  }, []);
  const setObjectsBySlide = useMutation(({ storage }, slideId, objects) => {
    const obs = storage.get("objectsBySlide") || {};
    obs[slideId] = objects;
    storage.set("objectsBySlide", obs);
  }, []);
  const others = useOthers();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();
  const [showChat, setShowChat] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [presenter, setPresenter] = useStorage((root) => root.presenter);
  const [isPresenter, setIsPresenter] = useState(false);
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Local state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [selectedTool, setSelectedTool] = useState("select");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [fontSize, setFontSize] = useState(24);
  const [showToolbar, setShowToolbar] = useState(!isPresenting);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: isPresenting ? window.innerWidth : 1000,
      height: isPresenting ? window.innerHeight : 600,
      backgroundColor: "#1a1a1a",
      selection: !isPresenting,
    });

    fabricRef.current = canvas;

    // Disable interactions in presentation mode
    if (isPresenting) {
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    }

    // Setup tool interactions
    setupCanvasEvents(canvas);

    return () => {
      canvas.dispose();
    };
  }, [isPresenting, currentSlideId]);

  // Load slide objects when current slide changes
  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const currentSlideData = slides.find((slide: any) => slide.id === currentSlideId);

    if (currentSlideData?.objects) {
      canvas.clear();
      
      currentSlideData.objects.forEach((objData: any) => {
        fabric.util.enlivenObjects(
          [objData],
          (objects: fabric.Object[]) => {
            objects.forEach((obj) => {
              canvas.add(obj);
            });
            canvas.renderAll();
          },
          ''
        );
      });
    }
  }, [currentSlideId, slides]);

  const setupCanvasEvents = (canvas: fabric.Canvas) => {
    if (isPresenting) return;

    canvas.on("mouse:down", (options) => {
      if (!options.e) return;
      const pointer = canvas.getPointer(options.e);

      switch (selectedTool) {
        case "rectangle":
          addRectangle(pointer.x, pointer.y);
          break;
        case "circle":
          addCircle(pointer.x, pointer.y);
          break;
        case "text":
          addText(pointer.x, pointer.y);
          break;
        case "arrow":
          addArrow(pointer.x, pointer.y);
          break;
      }
    });

    canvas.on("object:modified", () => {
      saveSlideObjects();
    });

    canvas.on("object:added", () => {
      saveSlideObjects();
    });

    canvas.on("object:removed", () => {
      saveSlideObjects();
    });

    canvas.on("mouse:move", (options) => {
      if (!options.e) return;
      const pointer = canvas.getPointer(options.e);
      updateMyPresence({ cursor: { x: pointer.x, y: pointer.y } });
    });
  };

  const saveSlideObjects = () => {
    if (!fabricRef.current) return;
    
    const objects = fabricRef.current.getObjects().map((obj: any) => obj.toObject());
    setObjectsBySlide(currentSlideId, objects);
  };

  const addRectangle = (x: number, y: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 100,
      fill: selectedColor,
      stroke: "#fff",
      strokeWidth: 2,
      rx: 10,
      ry: 10,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = (x: number, y: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: 60,
      fill: selectedColor,
      stroke: "#fff",
      strokeWidth: 2,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addText = (x: number, y: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new fabric.IText("Click to edit", {
      left: x,
      top: y,
      fontSize: fontSize,
      fill: selectedColor,
      fontFamily: "Arial",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addArrow = (x: number, y: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const arrow = new fabric.Path(
      "M 0 0 L 100 0 L 85 -15 M 100 0 L 85 15",
      {
        left: x,
        top: y,
        stroke: selectedColor,
        strokeWidth: 3,
        fill: "",
      }
    );

    canvas.add(arrow);
    canvas.setActiveObject(arrow);
    canvas.renderAll();
  };

  const addBulletPoints = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const bulletText = new fabric.IText("• Point 1\n• Point 2\n• Point 3", {
      left: 100,
      top: 200,
      fontSize: fontSize,
      fill: selectedColor,
      fontFamily: "Arial",
      lineHeight: 1.5,
    });

    canvas.add(bulletText);
    canvas.setActiveObject(bulletText);
    canvas.renderAll();
  };

  const addTitle = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const title = new fabric.IText("Slide Title", {
      left: 100,
      top: 50,
      fontSize: fontSize * 2,
      fill: selectedColor,
      fontFamily: "Arial",
      fontWeight: "bold",
    });

    canvas.add(title);
    canvas.setActiveObject(title);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const duplicateSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  };

  const renderCursors = () => {
    if (isPresenting) return null;

    return others.map((user) => {
      if (user.presence?.cursor) {
        return (
          <div
            key={user.connectionId}
            className="absolute pointer-events-none z-50"
            style={{
              left: user.presence.cursor.x,
              top: user.presence.cursor.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <svg width="20" height="20">
              <circle 
                cx="10" 
                cy="10" 
                r="6" 
                fill={(user.presence as any)?.color || '#00fff7'} 
                opacity={0.8} 
              />
            </svg>
          </div>
        );
      }
      return null;
    });
  };

  if (isPresenting) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <canvas ref={canvasRef} className="max-w-full max-h-full" />
        {renderCursors()}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-800">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-2 p-4 bg-gray-900 border-b border-gray-700 flex-wrap">
          {/* Tool Selection */}
          <div className="flex gap-2">
            {[
              { name: "Select", value: "select", icon: "↖️" },
              { name: "Text", value: "text", icon: "T" },
              { name: "Rectangle", value: "rectangle", icon: "▭" },
              { name: "Circle", value: "circle", icon: "○" },
              { name: "Arrow", value: "arrow", icon: "↗" },
            ].map((tool) => (
              <button
                key={tool.value}
                onClick={() => setSelectedTool(tool.value)}
                className={`px-3 py-2 rounded border-2 transition-all ${
                  selectedTool === tool.value
                    ? 'border-neon bg-neon/20 text-neon'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <span className="mr-1">{tool.icon}</span>
                {tool.name}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-600"></div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button onClick={addTitle} className="btn-neon px-3 py-2 text-sm">
              📝 Title
            </button>
            <button onClick={addBulletPoints} className="btn-neon px-3 py-2 text-sm">
              • Bullets
            </button>
          </div>

          <div className="w-px h-8 bg-gray-600"></div>

          {/* Object Actions */}
          <div className="flex gap-2">
            <button onClick={duplicateSelected} className="btn-neon px-3 py-2 text-sm">
              📋 Duplicate
            </button>
            <button onClick={deleteSelected} className="bg-red-600 hover:bg-red-700 px-3 py-2 text-sm rounded">
              🗑️ Delete
            </button>
          </div>

          <div className="w-px h-8 bg-gray-600"></div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Color:</span>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-8 rounded border border-gray-600"
            />
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-8">{fontSize}</span>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-700 p-4 overflow-auto relative">
        <div className="bg-white rounded-lg shadow-lg inline-block relative">
          <canvas ref={canvasRef} className="rounded-lg" />
          {renderCursors()}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 bg-gray-900 border-t border-gray-700 flex items-center justify-between text-sm">
        <div className="text-gray-400">
          Slide: {slides.findIndex((s: any) => s.id === currentSlideId) + 1} / {slides.length}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className="text-gray-400 hover:text-white"
          >
            {showToolbar ? "Hide" : "Show"} Toolbar
          </button>
          <div className="text-gray-400">
            {others.length + 1} user{others.length !== 0 ? 's' : ''} editing
          </div>
        </div>
      </div>
    </div>
  );
} 