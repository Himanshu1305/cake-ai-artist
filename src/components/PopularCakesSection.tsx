import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Heart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface PopularCake {
  id: string;
  image_url: string;
  occasion_type: string | null;
  like_count: number;
}

export const PopularCakesSection = () => {
  const [popularCakes, setPopularCakes] = useState<PopularCake[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPopularCakes();
  }, []);

  const loadPopularCakes = async () => {
    try {
      // Get top 8 images by like count from the stats table
      const { data: statsData, error: statsError } = await supabase
        .from("gallery_image_stats")
        .select("image_id, like_count")
        .order("like_count", { ascending: false })
        .limit(8);

      if (statsError) throw statsError;

      if (!statsData || statsData.length === 0) {
        // If no stats, just get recent featured images
        const { data: featuredData, error: featuredError } = await supabase
          .from("public_featured_images" as any)
          .select("id, image_url, occasion_type")
          .order("created_at", { ascending: false })
          .limit(8);

        if (featuredError) throw featuredError;

        if (featuredData) {
          setPopularCakes(
            (featuredData as any[]).map((img) => ({
              id: img.id,
              image_url: img.image_url,
              occasion_type: img.occasion_type,
              like_count: 0,
            }))
          );
        }
        setIsLoading(false);
        return;
      }

      // Get image details for these IDs
      const imageIds = statsData.map((s) => s.image_id);
      const { data: imagesData, error: imagesError } = await supabase
        .from("public_featured_images" as any)
        .select("id, image_url, occasion_type")
        .in("id", imageIds);

      if (imagesError) throw imagesError;

      if (imagesData) {
        // Merge stats with image data
        const cakesWithStats = (imagesData as any[])
          .map((img) => {
            const stats = statsData.find((s) => s.image_id === img.id);
            return {
              id: img.id,
              image_url: img.image_url,
              occasion_type: img.occasion_type,
              like_count: stats?.like_count || 0,
            };
          })
          .sort((a, b) => b.like_count - a.like_count);

        setPopularCakes(cakesWithStats);
      }
    } catch (error) {
      console.error("Error loading popular cakes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-party-pink" />
            <h2 className="text-2xl font-bold text-foreground">Most Popular This Week</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="aspect-square bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (popularCakes.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-transparent to-party-pink/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-party-pink" />
            <h2 className="text-2xl font-bold text-foreground">Most Popular This Week</h2>
          </div>
          <Link
            to="/community"
            className="text-sm text-party-pink hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularCakes.slice(0, 8).map((cake, index) => (
            <Link key={cake.id} to="/community">
              <Card className="overflow-hidden border-2 border-border hover:border-party-purple transition-all duration-300 cursor-pointer group relative">
                {index < 3 && (
                  <div className="absolute top-2 left-2 z-10 bg-gradient-party text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>
                )}
                <div className="relative aspect-square">
                  <img
                    src={cake.image_url}
                    alt={cake.occasion_type || "Popular cake design"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Heart className="w-4 h-4 text-party-pink fill-party-pink" />
                      <span className="font-medium text-foreground">
                        {cake.like_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCakesSection;
