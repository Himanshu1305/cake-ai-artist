import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Download, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

interface CommunityImage {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

const CommunityGallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<CommunityImage | null>(null);

  useEffect(() => {
    loadCommunityImages();
  }, []);

  const loadCommunityImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("id, image_url, prompt, created_at")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setImages(data);
      }
    } catch (error) {
      console.error("Error loading community images:", error);
      toast({
        title: "Failed to load images",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cake-design-${prompt.slice(0, 20).replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your image is downloading",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = (image: CommunityImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-celebration">
      <Helmet>
        <title>Community Gallery - Featured Cake Designs | Cake AI Artist</title>
        <meta name="description" content="Explore amazing cakes created by our community. Get inspired by featured cake creations from users worldwide." />
        <meta name="keywords" content="cake gallery, featured designs, cake inspiration, cake examples" />
        <link rel="canonical" href="https://cakeaiartist.com/community" />
        <meta property="og:url" content="https://cakeaiartist.com/community" />
      </Helmet>
      
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 py-6 backdrop-blur-sm bg-background/80 sticky top-0 z-40 border-b border-border/30">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Community Gallery</h1>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/")} variant="outline" size="sm">
              Home
            </Button>
            <Button onClick={() => navigate("/#creator")} size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your Own
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Community Creations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse beautiful cake designs created by our community. Get inspired and create your own!
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading amazing cakes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No featured cakes yet</p>
            <Button onClick={() => navigate("/#creator")}>
              Be the First to Create
            </Button>
          </div>
        )}

        {/* Image Grid */}
        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden border-2 border-border hover:border-party-purple transition-all duration-300 cursor-pointer group"
                onClick={() => handleImageClick(image)}
              >
                <div className="relative aspect-square">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {image.prompt}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                className="w-full h-auto rounded-lg"
              />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  {selectedImage.prompt}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(selectedImage.image_url, selectedImage.prompt)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCloseModal();
                      navigate('/#creator');
                    }}
                    className="flex-1"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Similar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default CommunityGallery;
