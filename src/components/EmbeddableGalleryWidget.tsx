import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  occasion_type: string | null;
}

interface EmbeddableGalleryWidgetProps {
  limit?: number;
  showBranding?: boolean;
  columns?: 2 | 3 | 4;
}

export const EmbeddableGalleryWidget = ({
  limit = 6,
  showBranding = true,
  columns = 3,
}: EmbeddableGalleryWidgetProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, [limit]);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from("public_featured_images" as any)
        .select("id, image_url, occasion_type")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (data) {
        setImages(data as unknown as GalleryImage[]);
      }
    } catch (error) {
      console.error("Error loading gallery images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-background rounded-lg">
        <div className={`grid ${gridCols[columns]} gap-3`}>
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background rounded-lg font-sans">
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {images.map((image) => (
          <a
            key={image.id}
            href="https://cakeaiartist.com/community"
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105"
          >
            <div className="relative aspect-square">
              <img
                src={image.image_url}
                alt={image.occasion_type || "AI Cake Design"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </a>
        ))}
      </div>

      {showBranding && (
        <a
          href="https://cakeaiartist.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Powered by Cake AI Artist</span>
        </a>
      )}
    </div>
  );
};

// Embed page for iframe usage
export const EmbedGalleryPage = () => {
  // Parse URL params for customization
  const urlParams = new URLSearchParams(window.location.search);
  const limit = parseInt(urlParams.get("limit") || "6", 10);
  const columns = parseInt(urlParams.get("columns") || "3", 10) as 2 | 3 | 4;
  const showBranding = urlParams.get("branding") !== "false";

  return (
    <div className="min-h-screen bg-background p-2">
      <EmbeddableGalleryWidget
        limit={limit}
        columns={columns}
        showBranding={showBranding}
      />
    </div>
  );
};

export default EmbeddableGalleryWidget;
