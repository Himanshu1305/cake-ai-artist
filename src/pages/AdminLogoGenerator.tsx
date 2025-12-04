import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, RefreshCw, ArrowLeft } from "lucide-react";

const LOGO_VARIATIONS = [
  {
    id: "icon-only",
    name: "Icon Only",
    description: "Clean icon for favicons, app icons, social media avatars",
    prompt: "Professional minimalist logo icon of a 3-tier celebration cake with subtle circuit board patterns and AI neural network lines in the frosting layers, coral (#FF6B6B) and gold (#FFD700) gradient colors, clean modern vector style, pure white background, no text, ultra high resolution, centered composition"
  },
  {
    id: "horizontal",
    name: "Horizontal Lockup",
    description: "Icon + text side by side for headers, email signatures",
    prompt: "Professional horizontal logo with a 3-tier celebration cake icon on the left side featuring subtle circuit patterns in frosting, and elegant modern text 'Cake AI Artist' on the right side, coral and gold color scheme, clean white background, tech-meets-celebration aesthetic, ultra high resolution"
  },
  {
    id: "stacked",
    name: "Stacked/Centered",
    description: "Icon above text for square spaces, business cards",
    prompt: "Professional stacked logo with a 3-tier celebration cake icon with circuit patterns centered above the text 'Cake AI Artist' below, badge style composition, warm coral and gold colors, clean white background, modern elegant typography, ultra high resolution"
  },
  {
    id: "minimal",
    name: "Minimal Mark",
    description: "Simplified version for small sizes, watermarks",
    prompt: "Simple minimalist cake slice icon with a small AI sparkle/star accent, single coral (#FF6B6B) color, ultra clean vector style, pure white background, no text, perfect for small sizes, ultra high resolution"
  },
  {
    id: "full-badge",
    name: "Full Badge",
    description: "Circular badge for stamps, certificates, merchandise",
    prompt: "Circular badge logo with a beautiful layered 3-tier cake in the center featuring subtle tech patterns, text 'Cake AI Artist' elegantly curved around the circular border, vintage-modern style with coral and gold colors, clean white background, ultra high resolution"
  }
];

export default function AdminLogoGenerator() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [logos, setLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _role: "admin",
      _user_id: user.id
    });

    if (!hasAdminRole) {
      toast.error("Admin access required");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const generateLogo = async (variation: typeof LOGO_VARIATIONS[0]) => {
    setGeneratingId(variation.id);
    
    try {
      const response = await supabase.functions.invoke("generate-logo", {
        body: { prompt: variation.prompt }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.imageUrl) {
        setLogos(prev => ({ ...prev, [variation.id]: response.data.imageUrl }));
        toast.success(`${variation.name} generated!`);
      }
    } catch (error) {
      console.error("Logo generation error:", error);
      toast.error("Failed to generate logo. Please try again.");
    } finally {
      setGeneratingId(null);
    }
  };

  const downloadLogo = (id: string, name: string) => {
    const imageUrl = logos[id];
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `cake-ai-artist-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Logo Generator | Admin | Cake AI Artist</title>
      </Helmet>

      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Logo Generator
            </h1>
            <p className="text-muted-foreground">
              Generate and preview all 5 logo variations for Cake AI Artist
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOGO_VARIATIONS.map((variation) => (
              <Card key={variation.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{variation.name}</CardTitle>
                  <CardDescription>{variation.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                    {logos[variation.id] ? (
                      <img
                        src={logos[variation.id]}
                        alt={variation.name}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Click Generate to preview
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateLogo(variation)}
                      disabled={generatingId !== null}
                      className="flex-1"
                    >
                      {generatingId === variation.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : logos[variation.id] ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate
                        </>
                      ) : (
                        "Generate"
                      )}
                    </Button>

                    {logos[variation.id] && (
                      <Button
                        variant="outline"
                        onClick={() => downloadLogo(variation.id, variation.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
