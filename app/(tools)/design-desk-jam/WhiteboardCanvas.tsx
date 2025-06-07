"use client";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { fabric } from "fabric";
import {
  useMutation,
  useStorage,
  useOthers,
  useSelf,
  useUpdateMyPresence,
} from "@/lib/liveblocks.config";
import { LiveMap } from "@liveblocks/client";

const COLORS = ["#00fff7", "#ff00c8", "#ffe600", "#00ff5a", "#fff", "#000"];
const SIZES = [2, 4, 8, 16];

type Presence = {
  name: string;
  color: string;
  cursor?: { x: number; y: number };
};

interface WhiteboardCanvasProps {
  selectedTool: string;
  selectedColor: string;
}

const WhiteboardCanvas = forwardRef<HTMLCanvasElement, WhiteboardCanvasProps>(
  ({ selectedTool, selectedColor }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(5);

    // Liveblocks hooks
    const canvasObjects = useStorage((root) => root.canvasObjects);
    const others = useOthers();
    const self = useSelf();
    const updateMyPresence = useUpdateMyPresence();

    const syncCanvasToStorage = useMutation(({ storage }, canvas: fabric.Canvas) => {
      const objects = canvas.getObjects().map((obj: any) => ({
        ...obj.toObject(),
        id: obj.id || Date.now().toString(),
      }));
      
      let canvasObjects = storage.get("canvasObjects");
      if (!canvasObjects) {
        canvasObjects = new LiveMap();
        storage.set("canvasObjects", canvasObjects);
      }
      
      // Clear existing objects and add new ones
      const keys = Array.from(canvasObjects.keys());
      keys.forEach(key => canvasObjects.delete(key));
      
      objects.forEach((obj, index) => {
        canvasObjects.set(index.toString(), obj);
      });
    }, []);

    const addObjectToCanvas = useMutation(({ storage }, object: any) => {
      let canvasObjects = storage.get("canvasObjects");
      if (!canvasObjects) {
        canvasObjects = new LiveMap();
        storage.set("canvasObjects", canvasObjects);
      }
      const newKey = Date.now().toString();
      canvasObjects.set(newKey, object);
    }, []);

    const clearCanvas = useMutation(({ storage }) => {
      let canvasObjects = storage.get("canvasObjects");
      if (!canvasObjects) {
        canvasObjects = new LiveMap();
        storage.set("canvasObjects", canvasObjects);
      }
      const keys = Array.from(canvasObjects.keys());
      keys.forEach(key => canvasObjects.delete(key));
    }, []);

    // Expose canvas reference to parent
    useImperativeHandle(ref, () => canvasRef.current!, []);

    useEffect(() => {
      if (!canvasRef.current) return;

      // Initialize Fabric.js canvas
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 1200,
        height: 800,
        backgroundColor: "#111111",
      });

      fabricRef.current = canvas;

      // Set up drawing mode based on selected tool
      const setupTool = () => {
        switch (selectedTool) {
          case "pen":
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = brushSize;
            canvas.freeDrawingBrush.color = selectedColor;
            break;
          case "highlighter":
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = brushSize * 3;
            canvas.freeDrawingBrush.color = selectedColor;
            (canvas.freeDrawingBrush as any).globalCompositeOperation = "multiply";
            break;
          case "eraser":
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = brushSize * 2;
            (canvas.freeDrawingBrush as any).globalCompositeOperation = "destination-out";
            break;
          default:
            canvas.isDrawingMode = false;
            break;
        }
      };

      setupTool();

      // Handle mouse events
      canvas.on("mouse:down", (options) => {
        setIsDrawing(true);
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
          case "sticky":
            addStickyNote(pointer.x, pointer.y);
            break;
          case "arrow":
            addArrow(pointer.x, pointer.y);
            break;
        }
      });

      canvas.on("mouse:move", (options) => {
        if (!isDrawing) return;
        const pointer = canvas.getPointer(options.e);
        updateMyPresence({ cursor: { x: pointer.x, y: pointer.y } });
      });

      canvas.on("mouse:up", () => {
        setIsDrawing(false);
        syncCanvasToStorage(canvas);
      });

      canvas.on("path:created", () => {
        syncCanvasToStorage(canvas);
      });

      canvas.on("object:modified", () => {
        syncCanvasToStorage(canvas);
      });

      return () => {
        canvas.dispose();
      };
    }, [selectedTool, selectedColor, brushSize]);

    // Sync canvas objects from storage
    useEffect(() => {
      if (!fabricRef.current || !canvasObjects) return;

      const canvas = fabricRef.current;
      canvas.clear();

      if (canvasObjects.size > 0) {
        const objectsArray = Array.from(canvasObjects.values());
        objectsArray.forEach((objData: any) => {
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
    }, [canvasObjects]);

    // Helper functions to add objects
    const addRectangle = (x: number, y: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const rect = new fabric.Rect({
        left: x,
        top: y,
        fill: selectedColor,
        width: 100,
        height: 60,
        rx: 8,
        ry: 8,
        stroke: "#fff",
        strokeWidth: 2,
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
        radius: 50,
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
        fontSize: 24,
        fill: selectedColor,
        fontFamily: "Arial",
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    };

    const addStickyNote = (x: number, y: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const noteBackground = new fabric.Rect({
        width: 150,
        height: 150,
        fill: "#ffe600",
        stroke: "#000",
        strokeWidth: 1,
        rx: 5,
        ry: 5,
      });

      const noteText = new fabric.IText("Note", {
        fontSize: 16,
        fill: "#000",
        left: 10,
        top: 10,
        width: 130,
      });

      const group = new fabric.Group([noteBackground, noteText], {
        left: x,
        top: y,
      });

      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
    };

    const addArrow = (x: number, y: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const arrow = new fabric.Path(
        "M 0 0 L 50 0 L 40 -10 M 50 0 L 40 10",
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

    // Render live cursors
    const renderCursors = () => {
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
              <svg width="24" height="24" style={{ filter: "drop-shadow(0 0 4px #000)" }}>
                <circle 
                  cx="12" 
                  cy="12" 
                  r="8" 
                  fill={(user.presence as any)?.color || '#00fff7'} 
                  opacity={0.8} 
                />
              </svg>
              <span 
                className="text-xs font-bold ml-2" 
                style={{ color: (user.presence as any)?.color || '#00fff7' }}
              >
                {user.connectionId?.toString().slice(-2)}
              </span>
            </div>
          );
        }
        return null;
      });
    };

    return (
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="border border-gray-600 rounded-lg"
          style={{ cursor: selectedTool === "eraser" ? "crosshair" : "default" }}
        />
        {renderCursors()}
      </div>
    );
  }
);

WhiteboardCanvas.displayName = "WhiteboardCanvas";

export default WhiteboardCanvas; 