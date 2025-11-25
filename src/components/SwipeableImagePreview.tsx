import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, X as XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SwipeableImagePreviewProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const VIEW_LABELS = ["Front View", "Side View", "Top-Down View", "3/4 View (Diagonal)"];

export const SwipeableImagePreview = ({ images, initialIndex = 0, onClose }: SwipeableImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [api, setApi] = useState<CarouselApi>();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!api) return;

    // Set initial index
    api.scrollTo(initialIndex);

    // Listen for slide changes
    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api, initialIndex]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-50 bg-background/80 hover:bg-background"
      >
        <XIcon className="w-4 h-4" />
      </Button>

      {/* View Label */}
      <div className="absolute top-2 left-2 z-50 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium">
        {VIEW_LABELS[currentIndex] || `View ${currentIndex + 1}`}
      </div>

      {/* Carousel */}
      <div className="flex-1 flex items-center justify-center p-4 pt-16">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full max-w-4xl"
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="flex items-center justify-center">
                  <img
                    src={image}
                    alt={`Cake ${VIEW_LABELS[index]}`}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows - Hidden on mobile for touch swipe */}
          {!isMobile && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 pb-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            aria-label={`View ${index + 1}`}
          />
        ))}
      </div>

      {/* Mobile Swipe Hint */}
      {isMobile && currentIndex === initialIndex && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground bg-black/50 text-white px-3 py-1 rounded-full inline-block animate-fade-in">
            👆 Swipe to see more views
          </p>
        </div>
      )}
    </div>
  );
};
