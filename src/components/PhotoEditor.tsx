// ============================================
// FALLBACK: Used by original N8N + overlay solution
// This component is preserved for fallback purposes
// ============================================

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PhotoPosition } from "@/utils/cakePhotoOverlay";

interface PhotoEditorProps {
  cakeImageUrl: string;
  userPhotoUrl: string;
  initialPosition: PhotoPosition;
  onSave: (processedImageUrl: string) => void;
  onCancel: () => void;
}

export const PhotoEditor = ({
  cakeImageUrl,
  userPhotoUrl,
  initialPosition,
  onSave,
  onCancel,
}: PhotoEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState<PhotoPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [cakeImage, setCakeImage] = useState<HTMLImageElement | null>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const cake = new Image();
    cake.crossOrigin = 'anonymous';
    cake.onload = () => setCakeImage(cake);
    cake.src = cakeImageUrl;

    const user = new Image();
    user.crossOrigin = 'anonymous';
    user.onload = () => setUserImage(user);
    user.src = userPhotoUrl;
  }, [cakeImageUrl, userPhotoUrl]);

  // Draw canvas whenever position or images change
  useEffect(() => {
    if (!cakeImage || !userImage) return;
    drawCanvas();
  }, [position, cakeImage, userImage]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !cakeImage || !userImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = cakeImage.width;
    canvas.height = cakeImage.height;

    // Draw cake
    ctx.drawImage(cakeImage, 0, 0);

    // Calculate photo dimensions
    const photoSize = canvas.width * position.size;
    const photoX = canvas.width * position.x;
    const photoY = canvas.height * position.y;

    // Draw photo with clipping and rotation
    ctx.save();
    ctx.translate(photoX, photoY);
    ctx.rotate((position.rotation * Math.PI) / 180);

    // Create clipping path
    ctx.beginPath();
    if (position.shape === 'circle') {
      ctx.arc(0, 0, photoSize / 2, 0, Math.PI * 2);
    } else {
      const halfSize = photoSize / 2;
      ctx.rect(-halfSize, -halfSize, photoSize, photoSize);
    }
    ctx.closePath();
    ctx.clip();

    // Draw user photo (scaled to fit)
    const scale = Math.max(photoSize / userImage.width, photoSize / userImage.height);
    const scaledWidth = userImage.width * scale;
    const scaledHeight = userImage.height * scale;
    ctx.drawImage(userImage, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

    ctx.restore();

    // Draw border
    ctx.save();
    ctx.translate(photoX, photoY);
    ctx.rotate((position.rotation * Math.PI) / 180);
    ctx.strokeStyle = position.borderColor;
    ctx.lineWidth = position.borderWidth;
    ctx.beginPath();
    if (position.shape === 'circle') {
      ctx.arc(0, 0, photoSize / 2, 0, Math.PI * 2);
    } else {
      const halfSize = photoSize / 2;
      ctx.rect(-halfSize, -halfSize, photoSize, photoSize);
    }
    ctx.stroke();
    ctx.restore();

    // Draw shadow
    ctx.save();
    ctx.translate(photoX, photoY);
    ctx.rotate((position.rotation * Math.PI) / 180);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = position.borderColor;
    ctx.lineWidth = position.borderWidth;
    ctx.beginPath();
    if (position.shape === 'circle') {
      ctx.arc(0, 0, photoSize / 2, 0, Math.PI * 2);
    } else {
      const halfSize = photoSize / 2;
      ctx.rect(-halfSize, -halfSize, photoSize, photoSize);
    }
    ctx.stroke();
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    updatePosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setPosition(prev => ({ ...prev, x, y }));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-auto">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <CardTitle>Edit Photo Placement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Canvas Preview */}
            <div className="space-y-2">
              <Label>Preview (drag photo to move)</Label>
              <div className="border rounded-lg overflow-hidden bg-muted">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Size: {Math.round(position.size * 100)}%</Label>
                <Slider
                  value={[position.size]}
                  onValueChange={([value]) => setPosition(prev => ({ ...prev, size: value }))}
                  min={0.25}
                  max={0.6}
                  step={0.05}
                />
              </div>

              <div className="space-y-2">
                <Label>Rotation: {position.rotation}°</Label>
                <Slider
                  value={[position.rotation]}
                  onValueChange={([value]) => setPosition(prev => ({ ...prev, rotation: value }))}
                  min={-15}
                  max={15}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Shape</Label>
                <RadioGroup
                  value={position.shape}
                  onValueChange={(value: 'circle' | 'rectangle') => setPosition(prev => ({ ...prev, shape: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="circle" id="circle" />
                    <Label htmlFor="circle" className="cursor-pointer">Circle (Edible Print)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rectangle" id="rectangle" />
                    <Label htmlFor="rectangle" className="cursor-pointer">Rectangle</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderColor">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={position.borderColor}
                    onChange={(e) => setPosition(prev => ({ ...prev, borderColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={position.borderColor}
                    onChange={(e) => setPosition(prev => ({ ...prev, borderColor: e.target.value }))}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Width: {position.borderWidth}px</Label>
                <Slider
                  value={[position.borderWidth]}
                  onValueChange={([value]) => setPosition(prev => ({ ...prev, borderWidth: value }))}
                  min={2}
                  max={8}
                  step={1}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Apply Changes
                </Button>
                <Button onClick={onCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
