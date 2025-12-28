import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Download, Sparkles, Heart, MessageCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { BreadcrumbSchema } from "@/components/SEOSchema";
import { PopularCakesSection } from "@/components/PopularCakesSection";
import { useGalleryInteractions } from "@/hooks/useGalleryInteractions";
import { GalleryComments } from "@/components/GalleryComments";
import { cn } from "@/lib/utils";

interface CommunityImage {
  id: string;
  image_url: string;
  occasion_type: string | null;
  created_at: string;
}

const CommunityGallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<CommunityImage | null>(null);

  const imageIds = useMemo(() => images.map(img => img.id), [images]);
  
  const {
    stats,
    userLikes,
    comments,
    isLiking,
    isCommenting,
    toggleLike,
    addComment,
    deleteComment,
    loadComments,
    isAuthenticated,
    currentUserId,
  } = useGalleryInteractions(imageIds);

  useEffect(() => {
    loadCommunityImages();
  }, []);

  // Load comments when image is selected
  useEffect(() => {
    if (selectedImage) {
      loadComments(selectedImage.id);
    }
  }, [selectedImage, loadComments]);

  const loadCommunityImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("public_featured_images" as any)
        .select("id, image_url, occasion_type, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setImages(data as unknown as CommunityImage[]);
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

  const handleDownload = async (imageUrl: string, occasionType: string | null) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = occasionType ? occasionType.toLowerCase().replace(/\s+/g, '-') : 'cake';
      link.download = `cake-design-${filename}-${Date.now()}.png`;
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

  const handleLikeClick = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    toggleLike(imageId);
  };

  return (
    <div className="min-h-screen bg-gradient-celebration">
      <Helmet>
        <title>Community Gallery - Best Virtual Cake Designs | Cake AI Artist</title>
        <meta name="description" content="Explore amazing virtual cakes created with the best AI cake generator. Get inspired by featured cake creations from users worldwide." />
        <meta name="keywords" content="best virtual cake gallery, featured AI cake designs, cake inspiration, best AI cake examples" />
        <link rel="canonical" href="https://cakeaiartist.com/community" />
        <meta property="og:title" content="Community Gallery - Best Virtual Cake Designs | Cake AI Artist" />
        <meta property="og:description" content="Explore amazing virtual cakes created with the best AI cake generator. Get inspired by featured cake creations from users worldwide." />
        <meta property="og:url" content="https://cakeaiartist.com/community" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Community Gallery - Best Virtual Cake Designs" />
        <meta name="twitter:description" content="Explore amazing virtual cakes created with the best AI cake generator." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "Community Gallery", url: "https://cakeaiartist.com/community" },
        ]}
      />
      
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 py-6 backdrop-blur-sm bg-background/80 sticky top-0 z-40 border-b border-border/30">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
            <span>Cake AI Artist</span>
          </Link>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/#creator")} size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your Own
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Most Popular This Week */}
        <PopularCakesSection />

        <div className="text-center mb-12 mt-8">
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
                    alt={image.occasion_type || "Cake design"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                      {image.occasion_type || "Cake Design"}
                    </p>
                  </div>
                  
                  {/* Like & Comment counts overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/80 to-transparent">
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={(e) => handleLikeClick(e, image.id)}
                        disabled={isLiking}
                        className={cn(
                          "flex items-center gap-1.5 transition-all duration-200 hover:scale-110",
                          userLikes.has(image.id) 
                            ? "text-party-pink" 
                            : "text-white/80 hover:text-party-pink"
                        )}
                      >
                        <Heart 
                          className={cn(
                            "w-5 h-5 transition-all",
                            userLikes.has(image.id) && "fill-current"
                          )} 
                        />
                        <span className="font-medium">{stats[image.id]?.like_count || 0}</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-white/80">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{stats[image.id]?.comment_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.occasion_type || "Cake design"}
                className="w-full h-auto rounded-lg"
              />
              
              {/* Stats & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(selectedImage.id)}
                    disabled={isLiking}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
                      userLikes.has(selectedImage.id) 
                        ? "bg-party-pink/20 text-party-pink" 
                        : "bg-muted text-muted-foreground hover:text-party-pink hover:bg-party-pink/10"
                    )}
                  >
                    <Heart 
                      className={cn(
                        "w-5 h-5",
                        userLikes.has(selectedImage.id) && "fill-current"
                      )} 
                    />
                    <span className="font-medium">{stats[selectedImage.id]?.like_count || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">{stats[selectedImage.id]?.comment_count || 0}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {selectedImage.occasion_type || "Cake Design"}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(selectedImage.image_url, selectedImage.occasion_type)}
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
              
              {/* Comments Section */}
              <div className="border-t border-border pt-4">
                <GalleryComments
                  comments={comments[selectedImage.id] || []}
                  onAddComment={(content) => addComment(selectedImage.id, content)}
                  onDeleteComment={(commentId) => deleteComment(commentId, selectedImage.id)}
                  isCommenting={isCommenting}
                  isAuthenticated={isAuthenticated}
                  currentUserId={currentUserId}
                />
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
