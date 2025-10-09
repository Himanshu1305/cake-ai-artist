import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 text-3xl pointer-events-none">
                    <span className="animate-flame-flicker inline-block drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]">🕯️</span>
                    <span className="animate-flame-dance inline-block drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]">🕯️</span>
                    <span className="animate-flame-flicker inline-block drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]" style={{ animationDelay: '0.5s' }}>🕯️</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-foreground/70 line-clamp-2 mb-3">
                    {image.prompt}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/50">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;