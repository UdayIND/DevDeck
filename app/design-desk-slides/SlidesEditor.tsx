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
} from "@/config/liveblocks.config";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { HexColorPicker } from "react-colorful";

const COLORS = ["#00fff7", "#ff00c8", "#ffe600", "#00ff5a", "#fff", "#000"];
const SIZES = [2, 4, 8, 16];
const TEMPLATES = [
  { name: "Title Slide", objects: [{ type: "textbox", text: "Title", left: 400, top: 100, width: 400, fontSize: 48, fill: "#fff", fontWeight: "bold" }] },
  { name: "Bullets", objects: [{ type: "textbox", text: "• Point 1\n• Point 2\n• Point 3", left: 200, top: 200, width: 600, fontSize: 32, fill: "#fff" }] },
  { name: "Image + Caption", objects: [{ type: "rect", left: 350, top: 150, width: 500, height: 300, fill: "#222" }, { type: "textbox", text: "Caption here", left: 400, top: 480, width: 400, fontSize: 28, fill: "#fff" }] },
];

export default function SlidesEditor() {
  // Liveblocks state
  const slides = useStorage((root) => root.slides || []);
  const currentSlide = useStorage((root) => root.currentSlide || "slide-1");
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
  const [tool, setTool] = useState("select");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  // Initialize Fabric.js for the current slide
  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: tool === "pen",
      backgroundColor: "#18181b",
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = fabricCanvas;
    // Load objects for current slide
    if (objectsBySlide && objectsBySlide[currentSlide]) {
      fabricCanvas.loadFromJSON({ objects: objectsBySlide[currentSlide] }, fabricCanvas.renderAll.bind(fabricCanvas));
    }
    // Save objects to Liveblocks on add/modify/remove
    const saveObjects = () => {
      setObjectsBySlide(currentSlide, fabricCanvas.toDatalessJSON().objects);
    };
    fabricCanvas.on("object:added", saveObjects);
    fabricCanvas.on("object:modified", saveObjects);
    fabricCanvas.on("object:removed", saveObjects);
    // Clean up
    return () => {
      fabricCanvas.dispose();
    };
    // eslint-disable-next-line
  }, [currentSlide]);

  // Update tool/color/size
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (tool === "pen") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = size;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [tool, color, size]);

  // Add this useEffect after the tool/color/size effect
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    // Remove any previous listeners to avoid duplicates
    canvas.off('mouse:down');
    canvas.off('mouse:up');

    if (tool === 'pen') {
      // On mousedown, enable drawing mode
      canvas.on('mouse:down', () => {
        canvas.isDrawingMode = true;
      });
      // On mouseup, disable drawing mode
      canvas.on('mouse:up', () => {
        canvas.isDrawingMode = false;
      });
    } else {
      canvas.isDrawingMode = false;
    }
    // Clean up listeners on tool change
    return () => {
      canvas.off('mouse:down');
      canvas.off('mouse:up');
    };
  }, [tool]);

  // Slide actions
  const addSlide = () => {
    const newId = `slide-${Date.now()}`;
    setSlides([...slides, { id: newId, name: `Slide ${slides.length + 1}` }]);
    setObjectsBySlide(newId, []);
    setCurrentSlide(newId);
  };
  const deleteSlide = (id: string) => {
    if (slides.length === 1) return;
    const idx = slides.findIndex((s: any) => s.id === id);
    const newSlides = slides.filter((s: any) => s.id !== id);
    setSlides(newSlides);
    if (currentSlide === id) {
      setCurrentSlide(newSlides[Math.max(0, idx - 1)].id);
    }
  };
  const selectSlide = (id: string) => setCurrentSlide(id);

  // Drag-and-drop reorder
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(slides);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSlides(reordered);
  };

  // Presence bar
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

  // Add rectangle
  const addRect = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: color,
      width: 120,
      height: 80,
      rx: 10,
      ry: 10,
      stroke: "#fff",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
      selectable: true,
      evented: true,
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
      left: 150,
      top: 150,
      rx: 60,
      ry: 40,
      fill: color,
      stroke: "#fff",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
      selectable: true,
      evented: true,
    });
    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
    canvas.requestRenderAll();
  };
  // Add text
  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.Textbox("Double-click to edit", {
      left: 200,
      top: 200,
      width: 200,
      fontSize: 28,
      fill: color,
      fontWeight: "bold",
      editable: true,
      selectable: true,
      evented: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };
  // Add image by URL
  const addImage = () => {
    const url = prompt("Paste image URL:");
    if (!url) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(url, (img) => {
      img.set({ left: 250, top: 250, scaleX: 0.5, scaleY: 0.5 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    });
  };
  // Export as PNG
  const handleExportPNG = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png" });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `slide-${currentSlide}.png`;
    a.click();
  };
  // Export as PDF
  const handleExportPDF = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png" });
    const pdf = new (await import("jspdf")).jsPDF({ orientation: "landscape", unit: "px", format: [1200, 700] });
    pdf.addImage(dataUrl, "PNG", 0, 0, 1200, 700);
    pdf.save(`slide-${currentSlide}.pdf`);
  };

  // Add from template
  const addFromTemplate = (templateIdx: number) => {
    const newId = `slide-${Date.now()}`;
    setSlides([...slides, { id: newId, name: `${TEMPLATES[templateIdx].name} ${slides.length + 1}` }]);
    setObjectsBySlide(newId, TEMPLATES[templateIdx].objects);
    setCurrentSlide(newId);
    setShowTemplates(false);
  };

  // Presenter mode logic
  const startPresenter = () => {
    setPresenter(self?.connectionId);
    setIsPresenter(true);
  };
  const stopPresenter = () => {
    setPresenter(null);
    setIsPresenter(false);
  };
  useEffect(() => {
    if (presenter && presenter !== self?.connectionId) {
      // Follow presenter's slide
      // TODO: Optionally follow pan/zoom as well
      // setCurrentSlide(presenterCurrentSlide)
    }
  }, [presenter, self, setCurrentSlide]);

  // Live cursors
  const renderCursors = () => (
    <>
      {others.map((user) =>
        user.presence?.cursor ? (
          <div
            key={user.connectionId}
            className="absolute pointer-events-none z-50"
            style={{
              left: user.presence?.cursor.x,
              top: user.presence?.cursor.y,
              color: (user.presence as any)?.color || '#00fff7',
            }}
          >
            <svg width="24" height="24" style={{ filter: "drop-shadow(0 0 4px #000)" }}>
              <circle cx="12" cy="12" r="8" fill={(user.presence as any)?.color || '#00fff7'} opacity={0.7} />
            </svg>
            <span className="text-xs font-bold" style={{ color: (user.presence as any)?.color || '#00fff7' }}>{(user.presence as any)?.name || "User"}</span>
          </div>
        ) : null
      )}
    </>
  );

  // Add grid overlay to canvas (dot grid)
  const drawGrid = (canvas: fabric.Canvas) => {
    const gridSpacing = 32;
    const gridColor = "#333";
    for (let i = 0; i < (canvas.width || 1200) / gridSpacing; i++) {
      for (let j = 0; j < (canvas.height || 700) / gridSpacing; j++) {
        const circle = new fabric.Circle({
          left: i * gridSpacing,
          top: j * gridSpacing,
          radius: 1.5,
          fill: gridColor,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        canvas.add(circle);
        canvas.sendToBack(circle);
      }
    }
  };

  // Enhance Fabric.js setup for selection/move/resize and grid
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    // Remove all previous grid dots
    canvas.getObjects("circle").forEach(obj => canvas.remove(obj));
    drawGrid(canvas);
    // Enable selection, moving, resizing for all objects
    canvas.selection = tool === "select";
    canvas.forEachObject(obj => {
      // Always make objects interactive in select mode
      if (tool === "select") {
        obj.selectable = true;
        obj.evented = true;
        if (obj.type === "textbox" || obj.type === "text") {
          (obj as any).editable = true;
        }
      } else {
        obj.selectable = false;
        obj.evented = false;
        if (obj.type === "textbox" || obj.type === "text") {
          (obj as any).editable = false;
        }
      }
    });
    // Listen for selection
    canvas.off("selection:created");
    canvas.off("selection:updated");
    canvas.off("selection:cleared");
    canvas.on("selection:created", e => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:updated", e => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:cleared", () => setSelectedObject(null));
    // Listen for object modifications to update state
    canvas.off("object:modified");
    canvas.on("object:modified", () => canvas.requestRenderAll());
  }, [tool, currentSlide]);

  // Object property modification handlers
  const handleColorChange = (color: string) => {
    if (selectedObject) {
      if (selectedObject.type === "textbox" || selectedObject.type === "text") {
        selectedObject.set("fill", color);
      } else {
        selectedObject.set("stroke", color);
        selectedObject.set("fill", color);
      }
      fabricRef.current?.requestRenderAll();
      setShowColorPicker(false);
    } else {
      setColor(color); // Default for new objects
      setShowColorPicker(false);
    }
  };
  const handleSizeChange = (size: number) => {
    if (selectedObject) {
      if (selectedObject.type === "textbox" || selectedObject.type === "text") {
        selectedObject.set("fontSize", size);
      } else {
        selectedObject.set("strokeWidth", size);
      }
      fabricRef.current?.requestRenderAll();
    } else {
      setSize(size);
    }
  };
  const handleTextChange = (text: string) => {
    if (selectedObject && (selectedObject.type === "textbox" || selectedObject.type === "text")) {
      selectedObject.set("text", text);
      fabricRef.current?.requestRenderAll();
    }
  };

  // Undo/Redo logic
  const saveHistory = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setHistory((prev) => [...prev, canvas.toDatalessJSON()]);
    setRedoStack([]);
  };
  const handleUndo = () => {
    const canvas = fabricRef.current;
    if (!canvas || history.length === 0) return;
    setRedoStack((prev) => [canvas.toDatalessJSON(), ...prev]);
    const prevState = history[history.length - 1];
    canvas.loadFromJSON(prevState, () => {
      canvas.renderAll();
      setHistory((h) => h.slice(0, -1));
    });
  };
  const handleRedo = () => {
    const canvas = fabricRef.current;
    if (!canvas || redoStack.length === 0) return;
    setHistory((prev) => [...prev, canvas.toDatalessJSON()]);
    const nextState = redoStack[0];
    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();
      setRedoStack((r) => r.slice(1));
    });
  };

  // Save history on object changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const save = () => saveHistory();
    canvas.on("object:added", save);
    canvas.on("object:modified", save);
    canvas.on("object:removed", save);
    return () => {
      canvas.off("object:added", save);
      canvas.off("object:modified", save);
      canvas.off("object:removed", save);
    };
  }, [currentSlide]);

  // Zoom and pan logic
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    // Mouse wheel for zoom
    const handleWheel = (opt: any) => {
      let delta = opt.e.deltaY;
      let zoomLevel = canvas.getZoom();
      zoomLevel *= 0.999 ** delta;
      zoomLevel = Math.max(0.2, Math.min(zoomLevel, 3));
      setZoom(zoomLevel);
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoomLevel);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };
    canvas.on("mouse:wheel", handleWheel);
    // Pan with spacebar + drag
    const handleMouseDown = (opt: any) => {
      if (opt.e && opt.e.spaceKey) {
        setIsPanning(true);
        setPanStart({ x: opt.e.clientX, y: opt.e.clientY });
        canvas.setCursor("grab");
      }
    };
    const handleMouseMove = (opt: any) => {
      if (isPanning && panStart && opt.e) {
        const dx = opt.e.clientX - panStart.x;
        const dy = opt.e.clientY - panStart.y;
        canvas.relativePan({ x: dx, y: dy });
        setPanStart({ x: opt.e.clientX, y: opt.e.clientY });
      }
    };
    const handleMouseUp = () => {
      setIsPanning(false);
      setPanStart(null);
      canvas.setCursor("default");
    };
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    return () => {
      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [isPanning, panStart]);

  // Snapping guides (to grid)
  const snapToGrid = (obj: fabric.Object) => {
    const gridSpacing = 32;
    obj.set({
      left: Math.round((obj.left || 0) / gridSpacing) * gridSpacing,
      top: Math.round((obj.top || 0) / gridSpacing) * gridSpacing,
    });
  };
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const handleMoving = (e: any) => {
      snapToGrid(e.target);
    };
    canvas.on("object:moving", handleMoving);
    return () => {
      canvas.off("object:moving", handleMoving);
    };
  }, [currentSlide]);

  // Grouping/Ungrouping
  const handleGroup = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    if (activeObj.type !== "activeSelection") return;
    (activeObj as any).toGroup();
    canvas.requestRenderAll();
  };
  const handleUngroup = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    if (activeObj.type !== "group") return;
    (activeObj as any).toActiveSelection();
    canvas.requestRenderAll();
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, redoStack]);

  // Duplication handler
  const handleDuplicate = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    let clone;
    active.clone((cloned: any) => {
      clone = cloned;
      clone.set({ left: (active.left || 0) + 40, top: (active.top || 0) + 40 });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.requestRenderAll();
    });
  };
  // Keyboard shortcut for duplication
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleDuplicate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Align/distribute handlers
  const handleAlign = (type: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "activeSelection") return;
    const objects = (active as any).getObjects() as any[];
    if (objects.length < 2) return;
    let ref: number;
    if (["left", "center", "right"].includes(type)) {
      if (type === "left") ref = Math.min(...objects.map((o: any) => o.left));
      if (type === "center") ref = Math.min(...objects.map((o: any) => (o.left || 0) + (o.width * o.scaleX) / 2));
      if (type === "right") ref = Math.max(...objects.map((o: any) => (o.left || 0) + (o.width * o.scaleX)));
      objects.forEach((o: any) => {
        if (type === "left") o.set({ left: ref });
        if (type === "center") o.set({ left: ref - (o.width * o.scaleX) / 2 });
        if (type === "right") o.set({ left: ref - o.width * o.scaleX });
      });
    }
    if (["top", "middle", "bottom"].includes(type)) {
      if (type === "top") ref = Math.min(...objects.map((o: any) => o.top));
      if (type === "middle") ref = Math.min(...objects.map((o: any) => (o.top || 0) + (o.height * o.scaleY) / 2));
      if (type === "bottom") ref = Math.max(...objects.map((o: any) => (o.top || 0) + (o.height * o.scaleY)));
      objects.forEach((o: any) => {
        if (type === "top") o.set({ top: ref });
        if (type === "middle") o.set({ top: ref - (o.height * o.scaleY) / 2 });
        if (type === "bottom") o.set({ top: ref - o.height * o.scaleY });
      });
    }
    canvas.requestRenderAll();
  };
  const handleDistribute = (axis: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "activeSelection") return;
    const objects = ((active as any).getObjects() as any[]).slice().sort((a: any, b: any) => (axis === "x" ? a.left - b.left : a.top - b.top));
    if (objects.length < 3) return;
    if (axis === "x") {
      const left = objects[0].left;
      const right = objects[objects.length - 1].left;
      const step = (right - left) / (objects.length - 1);
      objects.forEach((o: any, i: number) => {
        o.set({ left: left + i * step });
      });
    } else {
      const top = objects[0].top;
      const bottom = objects[objects.length - 1].top;
      const step = (bottom - top) / (objects.length - 1);
      objects.forEach((o: any, i: number) => {
        o.set({ top: top + i * step });
      });
    }
    canvas.requestRenderAll();
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="w-full max-w-7xl flex flex-col gap-4 items-center">
        {renderPresence()}
        {/* Slide Navigation with Drag-and-Drop and Templates */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="slides" direction="horizontal">
            {(provided) => (
              <div className="flex gap-2 mb-2" ref={provided.innerRef} {...provided.droppableProps}>
                {slides.map((slide: any, index: number) => (
                  <Draggable key={slide.id} draggableId={slide.id} index={index}>
                    {(provided, snapshot) => (
                      <button
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`slide-tab px-3 py-1 rounded transition-colors duration-150
                          ${slide.id === currentSlide ? "bg-accent-cyan text-black font-bold ring-2 ring-accent-cyan" : "bg-gray-800 text-white"}
                          ${snapshot.isDragging ? "ring-2 ring-accent-cyan" : ""}
                        `}
                        onClick={() => selectSlide(slide.id)}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      >
                        {slide.name}
                        <span
                          className="ml-2 text-xs text-red-400 hover:text-red-600 transition-colors duration-150"
                          onClick={e => { e.stopPropagation(); deleteSlide(slide.id); }}
                          style={{ cursor: 'pointer' }}
                        >✕</span>
                      </button>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <button className="btn-neon ml-2" onClick={addSlide}>+ Add Slide</button>
                <button className="btn-neon ml-2" onClick={() => setShowTemplates(true)}>+ From Template</button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4 text-neon">Choose a Template</h2>
              <div className="grid grid-cols-1 gap-4">
                {TEMPLATES.map((tpl, idx) => (
                  <button key={tpl.name} className="btn-neon w-full py-4 mb-2" onClick={() => addFromTemplate(idx)}>{tpl.name}</button>
                ))}
              </div>
              <button className="mt-4 btn-neon w-full" onClick={() => setShowTemplates(false)}>Cancel</button>
            </div>
          </div>
        )}
        {/* Tool Palette with Presenter Mode, Undo/Redo */}
        <div className="flex gap-2 items-center mb-2">
          <button
            className={`btn-neon ${tool === "select" ? "ring-2 ring-accent-cyan" : ""} hover:bg-gray-700 transition-colors duration-150`}
            onClick={() => setTool("select")}
          > Select </button>
          <button
            className={`btn-neon ${tool === "pen" ? "ring-2 ring-accent-cyan" : ""} hover:bg-gray-700 transition-colors duration-150`}
            onClick={() => setTool("pen")}
          > Pen </button>
          <button className="btn-neon" onClick={addRect}>Rectangle</button>
          <button className="btn-neon" onClick={addEllipse}>Ellipse</button>
          <button className="btn-neon" onClick={addText}>Text</button>
          <button className="btn-neon" onClick={addImage}>Image</button>
          <span className="ml-4">Color:</span>
          {COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border-2 border-white mx-1 transition-all duration-150
                ${color === c ? "outline outline-2 outline-accent-cyan" : ""}
                hover:scale-110 hover:border-accent-cyan`}
              style={{ background: c, cursor: 'pointer' }}
              onClick={() => setColor(c)}
            />
          ))}
          <span className="ml-4">Size:</span>
          <select value={size} onChange={e => setSize(Number(e.target.value))} className="bg-gray-800 text-white rounded px-2 py-1">
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-neon ml-4" onClick={handleExportPNG}>Export PNG</button>
          <button className="btn-neon" onClick={handleExportPDF}>Export PDF</button>
          <button className="btn-neon ml-4" onClick={() => setShowChat((v) => !v)}>{showChat ? "Hide Comments" : "Show Comments"}</button>
          <button className="btn-neon" onClick={handleUndo} disabled={history.length === 0}>Undo</button>
          <button className="btn-neon" onClick={handleRedo} disabled={redoStack.length === 0}>Redo</button>
          <button className="btn-neon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}>-</button>
          <span className="text-white">{(zoom * 100).toFixed(0)}%</span>
          <button className="btn-neon" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>
          <button className="btn-neon" onClick={handleGroup}>Group</button>
          <button className="btn-neon" onClick={handleUngroup}>Ungroup</button>
          <button className="btn-neon" onClick={handleDuplicate}>Duplicate</button>
          <button className="btn-neon" onClick={() => handleAlign("left")}>Align Left</button>
          <button className="btn-neon" onClick={() => handleAlign("center")}>Align Center</button>
          <button className="btn-neon" onClick={() => handleAlign("right")}>Align Right</button>
          <button className="btn-neon" onClick={() => handleAlign("top")}>Align Top</button>
          <button className="btn-neon" onClick={() => handleAlign("middle")}>Align Middle</button>
          <button className="btn-neon" onClick={() => handleAlign("bottom")}>Align Bottom</button>
          <button className="btn-neon" onClick={() => handleDistribute("x")}>Distribute Horizontally</button>
          <button className="btn-neon" onClick={() => handleDistribute("y")}>Distribute Vertically</button>
          {isPresenter ? (
            <button className="btn-neon ml-4 bg-red-600" onClick={stopPresenter}>Stop Presenter Mode</button>
          ) : (
            <button className="btn-neon ml-4 bg-green-600" onClick={startPresenter}>Start Presenter Mode</button>
          )}
        </div>
        {/* Canvas and Comments with Live Cursors */}
        <div className="relative border-2 border-accent-cyan rounded-lg bg-black overflow-auto" style={{ width: "100%", height: 400 }}>
          <canvas ref={canvasRef} width={1200} height={700} style={{ background: String("#18181b"), width: "100%", height: 400 }} />
          {renderCursors()}
          {showChat && (
            <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-accent-cyan z-50">
              {/* Comments component would be rendered here */}
            </div>
          )}
        </div>
        {/* Advanced Presence Bar */}
        <div className="flex gap-2 mt-2">
          {others.map((user) => (
            <div key={user.connectionId} className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full border-2 border-white" style={{ background: (user.presence as any)?.color || '#00fff7' }}></span>
              <span className="text-xs font-bold">{(user.presence as any)?.name || "User"}</span>
              {presenter === user.connectionId && <span className="ml-1 text-green-400">Presenter</span>}
            </div>
          ))}
        </div>
        {/* Properties Panel */}
        {selectedObject && (
          <div className="w-80 bg-gray-900 rounded-xl p-6 ml-4 flex flex-col gap-4 border border-gray-700">
            <h3 className="text-lg font-bold mb-2 text-accent-cyan">Properties</h3>
            {/* Color */}
            <div>
              <label className="block text-sm mb-1">Color</label>
              <button
                className="w-8 h-8 rounded-full border-2 border-white"
                style={{ background: selectedObject.get("fill") || selectedObject.get("stroke") || "#fff" }}
                onClick={() => setShowColorPicker(true)}
              />
            </div>
            {/* Size */}
            <div>
              <label className="block text-sm mb-1">{selectedObject.type === "textbox" || selectedObject.type === "text" ? "Font Size" : "Stroke Width"}</label>
              <input
                type="range"
                min={2}
                max={selectedObject.type === "textbox" || selectedObject.type === "text" ? 96 : 16}
                value={selectedObject.type === "textbox" || selectedObject.type === "text" ? (selectedObject as any).fontSize : selectedObject.get("strokeWidth")}
                onChange={e => handleSizeChange(Number(e.target.value))}
              />
            </div>
            {/* Text editing */}
            {(selectedObject.type === "textbox" || selectedObject.type === "text") && (
              <div>
                <label className="block text-sm mb-1">Text</label>
                <textarea
                  className="w-full bg-gray-800 text-white rounded p-2"
                  value={(selectedObject as any).text}
                  onChange={e => handleTextChange(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <HexColorPicker color={selectedObject ? (selectedObject.get("fill") || selectedObject.get("stroke") || color) : color} onChange={handleColorChange} />
              <button className="btn-neon mt-4 w-full" onClick={() => setShowColorPicker(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 