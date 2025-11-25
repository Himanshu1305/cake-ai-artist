import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

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
      
      // Clamp scale between 1x and 3x
      newScale = Math.max(1, Math.min(3, newScale));
      
      // Haptic feedback at boundaries
      if ((newScale >= 3 && scale < 3) || (newScale <= 1 && scale > 1)) {
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
      // All touches released
      if (scale < 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
  }, [scale]);

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
      
      {/* Zoom indicator */}
      {scale > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium"
        >
          {scale.toFixed(1)}x
        </motion.div>
      )}
      
      {/* Pinch hint - shown briefly on first view */}
      {scale === 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full pointer-events-none">
          🤏 Pinch to zoom
        </div>
      )}
    </div>
  );
};
