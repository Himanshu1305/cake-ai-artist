import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, RotateCw, Type } from "lucide-react";
import { addTextToCake, getFontFamily } from "@/utils/cakeTextOverlay";
import { FontPreviewPicker } from "./FontPreviewPicker";

interface TextEditorProps {
  imageUrl: string;
  recipientName: string;
  initialPosition?: { x: number; y: number };
  initialFontSize?: number;
  initialColor?: string;
  initialRotation?: number;
  initialFontStyle?: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export const TextEditor = ({
  imageUrl,
  recipientName,
  initialPosition = { x: 0.5, y: 0.65 },
  initialFontSize = 42,
  initialColor = "#2563EB",
  initialRotation = 0,
  initialFontStyle = "great-vibes",
  onSave,
  onCancel,
}: TextEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [color, setColor] = useState(initialColor);
  const [rotation, setRotation] = useState(initialRotation);
  const [fontStyle, setFontStyle] = useState(initialFontStyle);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [position, fontSize, color, rotation, fontStyle, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Explicitly clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw text
    const x = position.x * canvas.width;
    const y = position.y * canvas.height;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Text styling
    ctx.font = `${fontSize}px ${getFontFamily(fontStyle)}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add subtle emboss effect
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(recipientName, 0, 0);

    // Add highlight
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = -1;
    ctx.shadowOffsetY = -1;
    ctx.fillText(recipientName, 0, 0);

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Check if click is near text position (within 50px radius)
    const textX = position.x * canvas.width;
    const textY = position.y * canvas.height;
    const distance = Math.sqrt(Math.pow(mouseX - textX, 2) + Math.pow(mouseY - textY, 2));

    if (distance < 100) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setPosition({
      x: Math.max(0.1, Math.min(0.9, mouseX / canvas.width)),
      y: Math.max(0.1, Math.min(0.9, mouseY / canvas.height)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const editedImageUrl = canvas.toDataURL("image/png");
    onSave(editedImageUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Edit Text Overlay</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Drag the text, then adjust size, color, and rotation
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-[1fr,300px] gap-6">
            {/* Canvas Area */}
            <div ref={containerRef} className="border border-border rounded-lg overflow-hidden bg-muted/20">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fontSize" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size: {fontSize}px
                </Label>
                <Slider
                  id="fontSize"
                  min={20}
                  max={80}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rotation" className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation: {rotation}°
                </Label>
                <Slider
                  id="rotation"
                  min={-45}
                  max={45}
                  step={1}
                  value={[rotation]}
                  onValueChange={(value) => setRotation(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#D4687A"
                    className="flex-1"
                  />
                </div>
              </div>

              <FontPreviewPicker
                selectedFontId={fontStyle}
                recipientName={recipientName}
                onFontChange={setFontStyle}
              />

              <div className="pt-4 space-y-2">
                <Button onClick={handleSave} className="w-full">
                  Apply Changes
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                <p className="font-medium mb-1">💡 Tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Click and drag the text to reposition it</li>
                  <li>Use sliders for precise adjustments</li>
                  <li>Choose colors that contrast with the cake</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
