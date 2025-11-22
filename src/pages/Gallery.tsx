import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, Download, Share2, Facebook, Twitter, MessageCircle, Instagram, X, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
  featured: boolean;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    loadImages(session.user.id);
  };

  const loadImages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error("Error loading images:", error);
      toast.error("Failed to load your images");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;
      
      setImages(images.filter(img => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.substring(0, 30)}-cake.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Download started!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  const handleShare = (platform: string, prompt: string) => {
    const shareText = `Check out this amazing personalized cake! 🎂✨`;
    const shareUrl = window.location.origin;
    
    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
        break;
      case "instagram":
        toast.success("Please save the image and share it on Instagram app!");
        return;
      default:
        return;
    }
    
    window.open(shareLink, "_blank", "width=600,height=400");
    toast.success(`Sharing on ${platform}!`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const toggleFeatured = async (imageId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("generated_images")
        .update({ featured: !currentFeatured })
        .eq("id", imageId);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === imageId ? { ...img, featured: !currentFeatured } : img
      ));

      toast.success(
        !currentFeatured 
          ? "Image featured! It will appear in the homepage carousel." 
          : "Image unfeatured."
      );
    } catch (error: any) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-celebration flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-party-pink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-celebration">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">My Gallery</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-party-purple/30 hover:border-party-purple"
            >
              Home
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-party-pink/30 hover:border-party-pink"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-foreground/70">
            You have {images.length} saved images (max 20)
          </p>
        </div>

        {images.length === 0 ? (
          <Card className="p-12 text-center bg-surface-elevated/80 backdrop-blur-sm">
            <p className="text-foreground/70 text-lg mb-4">
              You haven't saved any images yet.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-party-pink hover:bg-party-pink/90"
            >
              Create Your First Cake
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden bg-surface-elevated/80 backdrop-blur-sm border-2 border-party-pink/30 hover:border-party-pink transition-all"
              >
                <div 
                  className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-foreground/70 line-clamp-2 mb-3">
                    {image.prompt}
                  </p>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-foreground/50">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={image.featured ? "default" : "outline"}
                        onClick={() => toggleFeatured(image.id, image.featured)}
                        className={image.featured 
                          ? "bg-gold hover:bg-gold/90 border-gold" 
                          : "border-gold/30 hover:border-gold"
                        }
                        title={image.featured ? "Remove from featured" : "Feature on homepage"}
                      >
                        <Star className={`w-4 h-4 ${image.featured ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(image.image_url, image.prompt)}
                        className="border-party-purple/30 hover:border-party-purple"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-party-pink/30 hover:border-party-pink"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-surface-elevated border-party-pink/30">
                          <DropdownMenuItem 
                            onClick={() => handleShare("facebook", image.prompt)}
                            className="cursor-pointer hover:bg-party-pink/10"
                          >
                            <Facebook className="w-4 h-4 mr-2" />
                            Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleShare("twitter", image.prompt)}
                            className="cursor-pointer hover:bg-party-pink/10"
                          >
                            <Twitter className="w-4 h-4 mr-2" />
                            Twitter
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleShare("whatsapp", image.prompt)}
                            className="cursor-pointer hover:bg-party-pink/10"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleShare("instagram", image.prompt)}
                            className="cursor-pointer hover:bg-party-pink/10"
                          >
                            <Instagram className="w-4 h-4 mr-2" />
                            Instagram
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImage(image.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl p-0 bg-surface-elevated border-party-pink/30">
          {selectedImage && (
            <div className="relative">
              <Button
                onClick={handleCloseModal}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-50 bg-background/80 hover:bg-background"
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="p-4">
                <div className="relative flex items-center justify-center bg-background/50 rounded-lg overflow-hidden min-h-[400px]">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.prompt}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
                
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-foreground/70">{selectedImage.prompt}</p>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => handleDownload(selectedImage.image_url, selectedImage.prompt)}
                      variant="outline"
                      size="sm"
                      className="border-party-pink/30 hover:border-party-pink bg-background"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
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

export default Gallery;