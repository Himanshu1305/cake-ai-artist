import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, Download, Share2, Facebook, MessageCircle, Instagram, X as XIcon, Star, Calendar, Clock, Gift, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PartyPackGenerator } from "@/components/PartyPackGenerator";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
  featured: boolean;
  recipient_name?: string | null;
  occasion_type?: string | null;
  occasion_date?: string | null;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  // Party Pack Mode states
  const [partyPackMode, setPartyPackMode] = useState(false);
  const [selectedCakeForPartyPack, setSelectedCakeForPartyPack] = useState<GeneratedImage | null>(null);
  const [showPartyPackModal, setShowPartyPackModal] = useState(false);

  // Map local filenames to imported assets
  const localImageMap: Record<string, string> = {
    'featured-cake-1.jpg': featuredCake1,
    'featured-cake-2.jpg': featuredCake2,
    'featured-cake-3.jpg': featuredCake3,
    'featured-cake-4.jpg': featuredCake4,
    'featured-cake-5.jpg': featuredCake5,
  };

  // Resolve image URLs (local assets or Supabase storage URLs)
  const resolveImageUrl = (url: string): string => {
    return localImageMap[url] || url;
  };

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
      // SECURITY: Explicitly select only needed fields instead of *
      const { data, error } = await supabase
        .from("generated_images")
        .select("id, image_url, prompt, created_at, featured, recipient_name, occasion_type, occasion_date, user_id")
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
      case "x":
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
    if (partyPackMode) {
      setSelectedCakeForPartyPack(image);
    } else {
      setSelectedImage(image);
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const toggleFeatured = async (imageId: string, currentFeatured: boolean) => {
    try {
      // SECURITY: Warn users about privacy when featuring images
      const image = images.find(img => img.id === imageId);
      
      if (!currentFeatured && image) {
        // Check if image contains personal data
        const hasPersonalData = image.recipient_name || image.prompt?.includes('name') || 
                                image.occasion_date;
        
        if (hasPersonalData) {
          toast.warning(
            "Note: Featured images are visible to everyone. Consider privacy when featuring images with personal details.",
            { duration: 5000 }
          );
        }
      }

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

  // Calculate upcoming occasions
  const upcomingOccasions = useMemo(() => {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);
    
    return images
      .filter(img => img.occasion_date)
      .map(img => {
        const occasionDate = new Date(img.occasion_date!);
        const daysUntil = Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...img, daysUntil };
      })
      .filter(img => img.daysUntil >= 0 && img.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [images]);

  const regularImages = useMemo(() => {
    return images.filter(img => !upcomingOccasions.some(upcoming => upcoming.id === img.id));
  }, [images, upcomingOccasions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-celebration flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-party-pink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-celebration">
      <Helmet>
        <title>My Gallery - Your Best Virtual Cakes | Cake AI Artist</title>
        <meta name="description" content="View and manage your personalized best virtual cakes created with the best AI cake designer. Download, share, and organize your custom AI-generated cakes." />
        <meta name="keywords" content="my cake designs, best virtual cakes, cake gallery, best ai cakes, share cake designs" />
        <link rel="canonical" href="https://cakeaiartist.com/gallery" />
      </Helmet>
      
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">My Gallery</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setPartyPackMode(!partyPackMode);
                setSelectedCakeForPartyPack(null);
              }}
              variant={partyPackMode ? "default" : "outline"}
              className={partyPackMode 
                ? "bg-party-gold hover:bg-party-gold/90 text-background" 
                : "border-party-gold/30 hover:border-party-gold"
              }
            >
              <Gift className="w-4 h-4 mr-2" />
              Party Pack
            </Button>
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
        {/* Party Pack Mode Banner */}
        {partyPackMode && (
          <Card className="mb-6 relative overflow-hidden bg-gradient-to-r from-party-gold/30 via-party-pink/30 to-party-purple/30 border-2 border-party-gold shadow-party">
            <div className="relative z-10 p-6">
              <div className="flex items-start gap-4">
                <Gift className="w-10 h-10 text-party-gold flex-shrink-0 mt-1 animate-pulse" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    🎉 Party Pack Mode Active
                  </h3>
                  <p className="text-foreground/80 text-base font-medium leading-relaxed">
                    Click any cake below to select it, then generate matching party items (invitations, banners, thank you cards, and more!)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Feature Info Banner */}
        {!partyPackMode && (
          <Card className="mb-6 relative overflow-hidden bg-gradient-to-r from-party-purple/20 via-party-pink/20 to-party-gold/20 border-2 border-party-gold/40 shadow-party hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-all duration-300 cursor-pointer group">
          <div className="relative z-10 p-6">
            <div className="flex items-start gap-4">
              <Star className="w-10 h-10 text-party-gold fill-party-gold flex-shrink-0 mt-1 float animate-pulse drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              <div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-party-pink via-party-purple to-party-gold bg-clip-text text-transparent animate-[sparkle_2s_ease-in-out_infinite]">
                  ✨ Want to Show Off Your Creation? ✨
                </h3>
                <p className="text-foreground text-base font-medium leading-relaxed">
                  Your cake could inspire <span className="text-party-gold font-bold text-lg">thousands</span>! Tap the <Star className="w-4 h-4 inline fill-party-gold text-party-gold animate-pulse mx-1" /> star on any image below to feature it on our homepage →
                </p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/10 transition-all duration-500" />
        </Card>
        )}

        {/* Upcoming Occasions Section */}
        {upcomingOccasions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-party-pink" />
              <h2 className="text-2xl font-bold text-foreground">Upcoming Occasions</h2>
              <Badge variant="secondary" className="bg-party-pink/20 text-party-pink">
                {upcomingOccasions.length} coming soon
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingOccasions.map((image) => (
                <Card
                  key={image.id}
                  className={`overflow-hidden bg-gradient-to-br from-party-pink/10 to-party-purple/10 backdrop-blur-sm border-2 transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] ${
                    partyPackMode && selectedCakeForPartyPack?.id === image.id
                      ? 'ring-4 ring-party-gold border-party-gold'
                      : 'border-party-pink hover:border-party-gold'
                  }`}
                >
                  <div className="relative">
                    <Badge 
                      className="absolute top-2 left-2 z-10 bg-party-gold text-background font-bold shadow-lg animate-pulse"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {image.daysUntil === 0 ? 'Today!' : image.daysUntil === 1 ? 'Tomorrow!' : `In ${image.daysUntil} days`}
                    </Badge>
                    {partyPackMode && selectedCakeForPartyPack?.id === image.id && (
                      <Badge className="absolute top-2 right-2 z-10 bg-party-gold text-background font-bold shadow-lg">
                        <Check className="w-3 h-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                    <div 
                      className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={resolveImageUrl(image.image_url)}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-3 p-3 bg-gradient-party/20 rounded-lg border-2 border-party-gold/30">
                      <p className="text-sm font-bold text-foreground mb-1">
                        🎉 {image.recipient_name}
                      </p>
                      <p className="text-xs text-foreground/80">
                        📅 {new Date(image.occasion_date!).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {image.occasion_type && ` • ${image.occasion_type.charAt(0).toUpperCase() + image.occasion_type.slice(1)}`}
                      </p>
                    </div>
                    
                    <p className="text-sm text-foreground/70 line-clamp-2 mb-3">
                      {image.prompt}
                    </p>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs text-foreground/50">
                        Created {new Date(image.created_at).toLocaleDateString()}
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
                          title={image.featured ? "Remove from homepage" : "⭐ Feature on homepage"}
                        >
                          <Star className={`w-4 h-4 ${image.featured ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(resolveImageUrl(image.image_url), image.prompt)}
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
                              onClick={() => handleShare("x", image.prompt)}
                              className="cursor-pointer hover:bg-party-pink/10"
                            >
                              <XIcon className="w-4 h-4 mr-2" />
                              X
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
          </div>
        )}

        {/* All Cakes Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {upcomingOccasions.length > 0 ? 'All Your Cakes' : 'Your Cake Memories'}
            </h2>
            <p className="text-foreground/70">
              {images.length} saved images (max 20)
            </p>
          </div>
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
            {regularImages.map((image) => (
              <Card
                key={image.id}
                className={`overflow-hidden bg-surface-elevated/80 backdrop-blur-sm border-2 transition-all ${
                  partyPackMode && selectedCakeForPartyPack?.id === image.id
                    ? 'ring-4 ring-party-gold border-party-gold'
                    : 'border-party-pink/30 hover:border-party-pink'
                }`}
              >
                <div 
                  className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(image)}
                >
                  {partyPackMode && selectedCakeForPartyPack?.id === image.id && (
                    <Badge className="absolute top-2 right-2 z-10 bg-party-gold text-background font-bold shadow-lg">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                  <img
                    src={resolveImageUrl(image.image_url)}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  {/* Memory Info */}
                  {(image.recipient_name || image.occasion_date) && (
                    <div className="mb-3 p-3 bg-gradient-party/10 rounded-lg border border-party-pink/20">
                      {image.recipient_name && (
                        <p className="text-sm font-semibold text-foreground mb-1">
                          🎁 For: {image.recipient_name}
                        </p>
                      )}
                      {image.occasion_date && (
                        <p className="text-xs text-foreground/70">
                          📅 {new Date(image.occasion_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {image.occasion_type && ` • ${image.occasion_type.charAt(0).toUpperCase() + image.occasion_type.slice(1)}`}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-foreground/70 line-clamp-2 mb-3">
                    {image.prompt}
                  </p>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-foreground/50">
                      Created {new Date(image.created_at).toLocaleDateString()}
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
                        title={image.featured ? "Remove from homepage" : "⭐ Feature on homepage - your cake will appear in the community carousel!"}
                      >
                        <Star className={`w-4 h-4 ${image.featured ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(resolveImageUrl(image.image_url), image.prompt)}
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
                            onClick={() => handleShare("x", image.prompt)}
                            className="cursor-pointer hover:bg-party-pink/10"
                          >
                            <XIcon className="w-4 h-4 mr-2" />
                            X
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

      {/* Floating Action Button for Party Pack */}
      {partyPackMode && selectedCakeForPartyPack && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
          <Button
            onClick={() => setShowPartyPackModal(true)}
            size="lg"
            className="bg-party-gold hover:bg-party-gold/90 text-background font-bold shadow-2xl hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-all hover:scale-105"
          >
            <Gift className="w-5 h-5 mr-2" />
            Generate Party Pack for {selectedCakeForPartyPack.recipient_name || 'This Cake'}
          </Button>
        </div>
      )}

      {/* Party Pack Modal */}
      <Dialog open={showPartyPackModal} onOpenChange={setShowPartyPackModal}>
        <DialogContent className="max-w-2xl bg-surface-elevated border-party-gold/30">
          {selectedCakeForPartyPack && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-party-gold" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Create Party Pack</h2>
                  <p className="text-sm text-foreground/70">
                    Generate matching party items for {selectedCakeForPartyPack.recipient_name || 'this cake'}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <img
                  src={resolveImageUrl(selectedCakeForPartyPack.image_url)}
                  alt="Selected cake"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              <PartyPackGenerator
                cakeImageId={selectedCakeForPartyPack.id}
                name={selectedCakeForPartyPack.recipient_name || 'Celebration'}
                occasion={selectedCakeForPartyPack.occasion_type || 'celebration'}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                <XIcon className="w-4 h-4" />
              </Button>
              
              <div className="p-4">
                <div className="relative flex items-center justify-center bg-background/50 rounded-lg overflow-hidden min-h-[400px]">
                  <img
                    src={resolveImageUrl(selectedImage.image_url)}
                    alt={selectedImage.prompt}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
                
                <div className="mt-4 space-y-4">
                  {/* Memory Info in Modal */}
                  {selectedImage.recipient_name && (
                    <div className="p-3 bg-gradient-party/10 rounded-lg border border-party-pink/20">
                      <p className="text-sm font-semibold text-foreground">
                        🎁 Created for: {selectedImage.recipient_name}
                      </p>
                      {selectedImage.occasion_date && (
                        <p className="text-xs text-foreground/70 mt-1">
                          📅 Occasion: {new Date(selectedImage.occasion_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {selectedImage.occasion_type && ` • ${selectedImage.occasion_type.charAt(0).toUpperCase() + selectedImage.occasion_type.slice(1)}`}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-foreground/70">{selectedImage.prompt}</p>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => handleDownload(resolveImageUrl(selectedImage.image_url), selectedImage.prompt)}
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