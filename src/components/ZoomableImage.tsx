import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomableImageProps {
  src: string;
  alt: string;
  onZoomChange?: (isZoomed: boolean) => void;
  resetTrigger?: number;
}

export const ZoomableImage = ({ src, alt, onZoomChange, resetTrigger }: ZoomableImageProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });
  
  const haptic = useHapticFeedback();

  // Reset zoom when slide changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [resetTrigger]);

  // Notify parent of zoom state changes
  useEffect(() => {
    onZoomChange?.(scale > 1);
  }, [scale, onZoomChange]);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture started
      e.preventDefault();
      initialDistanceRef.current = getDistance(e.touches);
      initialScaleRef.current = scale;
      haptic.light();
    } else if (e.touches.length === 1) {
      // Single touch - could be pan or tap
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      lastPositionRef.current = { ...position };

      // Double-tap detection
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected
        e.preventDefault();
        const newScale = scale > 1 ? 1 : 2;
        setScale(newScale);
        
        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        } else {
          // Zoom centered on tap location
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const x = ((rect.width / 2 - e.touches[0].clientX + rect.left) * (newScale - 1));
            const y = ((rect.height / 2 - e.touches[0].clientY + rect.top) * (newScale - 1));
            setPosition({ x, y });
          }
        }
        
        haptic.medium();
        setLastTap(0);
      } else {
        setLastTap(now);
      }
    }
  }, [scale, position, lastTap, haptic]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const scaleChange = currentDistance / initialDistanceRef.current;
      let newScale = initialScaleRef.current * scaleChange;
      
      // Clamp scale between 0.5x and 3x
      newScale = Math.max(0.5, Math.min(3, newScale));
      
      // Haptic feedback at boundaries
      if ((newScale >= 3 && scale < 3) || (newScale <= 0.5 && scale > 0.5)) {
        haptic.medium();
      }
      
      setScale(newScale);
      
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan when zoomed
      e.preventDefault();
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Calculate max pan boundaries based on zoom level
        const maxX = (rect.width * (scale - 1)) / 2;
        const maxY = (rect.height * (scale - 1)) / 2;
        
        const newX = Math.max(-maxX, Math.min(maxX, lastPositionRef.current.x + dx));
        const newY = Math.max(-maxY, Math.min(maxY, lastPositionRef.current.y + dy));
        
        setPosition({ x: newX, y: newY });
      }
    }
  }, [scale, haptic]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All touches released - no auto-reset, allow zoom out
    }
  }, [scale]);

  // Mouse wheel zoom for desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Double-click zoom toggle for desktop
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const newScale = scale > 1 ? 1 : 2;
    setScale(newScale);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    } else {
      // Zoom centered on click location
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((rect.width / 2 - e.clientX + rect.left) * (newScale - 1));
        const y = ((rect.height / 2 - e.clientY + rect.top) * (newScale - 1));
        setPosition({ x, y });
      }
    }
    haptic.medium();
  }, [scale, haptic]);

  // Programmatic zoom control
  const handleZoomChange = useCallback((newScale: number) => {
    const clampedScale = Math.max(0.5, Math.min(3, newScale));
    setScale(clampedScale);
    
    if (clampedScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    haptic.light();
  }, [haptic]);

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <motion.img
        src={src}
        alt={alt}
        className="max-w-full max-h-[70vh] object-contain rounded-lg"
        animate={{
          scale,
          x: position.x,
          y: position.y,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        draggable={false}
      />
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20"
          onClick={() => handleZoomChange(scale - 0.25)}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-white text-xs min-w-[45px] text-center font-medium">
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20"
          onClick={() => handleZoomChange(scale + 0.25)}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20 ml-1"
          onClick={() => handleZoomChange(1)}
          title="Fit to view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Pinch hint - shown on mobile when at default zoom */}
      {scale === 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full pointer-events-none md:hidden">
          🤏 Pinch to zoom
        </div>
      )}
    </div>
  );
};
