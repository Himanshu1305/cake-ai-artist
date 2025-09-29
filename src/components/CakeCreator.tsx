import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Download, Sparkles, MessageSquare, Calendar, Users, User, Share2, Facebook, Twitter, MessageCircle } from "lucide-react";

interface CakeCreatorProps {}

export const CakeCreator = ({}: CakeCreatorProps) => {
  const [name, setName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [occasion, setOccasion] = useState("");
  const [relation, setRelation] = useState("");
  const [gender, setGender] = useState("");
  const [cakeType, setCakeType] = useState("");
  const [layers, setLayers] = useState("");
  const [theme, setTheme] = useState("");
  const [colors, setColors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Please enter a name",
        description: "We need a name to create your personalized cake!",
        variant: "destructive",
      });
      return;
    }

    if (!useAI && !customMessage.trim()) {
      toast({
        title: "Please enter a message",
        description: "When not using AI, you need to provide a custom message for your cake!",
        variant: "destructive",
      });
      return;
    }

    if (useAI && (!occasion || !relation || !gender)) {
      toast({
        title: "Please complete all fields",
        description: "When using AI, please select occasion, relation, and gender for better personalized messages!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    setGeneratedMessage(null);

    try {
      const response = await fetch("https://n8n-6421994137235212.kloudbeansite.com/webhook-test/20991645-1c69-48bd-915e-5bfd58e64016", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: name.trim(),
          cakeType: cakeType || undefined,
          layers: layers || undefined,
          theme: theme || undefined,
          colors: colors || undefined,
          ...(useAI ? { 
            useAI: true,
            occasion: occasion,
            relation: relation,
            gender: gender
          } : { message: customMessage.trim() })
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cake image");
      }

      // Check if response is binary data (image)
      const contentType = response.headers.get("content-type");
      let imageUrl = "";
      
      if (contentType && contentType.startsWith("image/")) {
        // Handle binary image response
        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
      } else {
        try {
          // Try to parse as JSON first
          const data = await response.json();
          
          // Extract message if available
          let message = "";
          if (data.message) {
            message = data.message;
            setGeneratedMessage(message);
          }
          
          // Handle different possible JSON response formats
          if (data.image_url) {
            imageUrl = data.image_url;
          } else if (data.imageUrl) {
            imageUrl = data.imageUrl;
          } else if (data.image) {
            imageUrl = data.image;
          } else if (data.url) {
            imageUrl = data.url;
          } else if (typeof data === "string" && data.startsWith("http")) {
            imageUrl = data;
          } else {
            throw new Error("No image URL found in response");
          }
        } catch (jsonError) {
          // If JSON parsing fails, treat as binary data
          const blob = await response.blob();
          imageUrl = URL.createObjectURL(blob);
        }
      }

      setGeneratedImage(imageUrl);
      toast({
        title: "Cake created successfully!",
        description: `Your personalized cake for ${name} is ready!`,
      });
    } catch (error) {
      console.error("Error generating cake:", error);
      toast({
        title: "Failed to create cake",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}-cake.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your cake image is downloading!",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Download failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    if (!generatedImage) return;

    const shareText = `Check out this amazing personalized cake I created for ${name}! 🎂✨`;
    const shareUrl = window.location.href;
    
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
      default:
        return;
    }
    
    window.open(shareLink, "_blank", "width=600,height=400");
    
    toast({
      title: "Sharing opened",
      description: `Share your cake on ${platform}!`,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Form */}
      <Card className="p-8 bg-gradient-surface border-border shadow-elegant">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Create Your Personalized Cake</h2>
            <p className="text-muted-foreground">Enter a name and customize your cake message</p>
          </div>
          
          <div className="space-y-6">
            <Input
              type="text"
              placeholder="Enter the name for your cake"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg py-6 px-4 bg-surface border-border focus:ring-gold focus:border-gold"
              disabled={isLoading}
            />

            {/* Context Fields for AI */}
            {useAI && (
              <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Help AI personalize your message</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occasion" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Occasion
                    </Label>
                    <Select value={occasion} onValueChange={setOccasion} disabled={isLoading}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="celebration">Celebration</SelectItem>
                        <SelectItem value="farewell">Farewell</SelectItem>
                        <SelectItem value="congratulations">Congratulations</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relation" className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Relation
                    </Label>
                    <Select value={relation} onValueChange={setRelation} disabled={isLoading}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="brother">Brother</SelectItem>
                        <SelectItem value="sister">Sister</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="daughter">Daughter</SelectItem>
                        <SelectItem value="son">Son</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="in-laws">In-laws</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Gender
                    </Label>
                    <Select value={gender} onValueChange={setGender} disabled={isLoading}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Cake Customization */}
            <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">Customize Your Cake</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cake-type" className="text-sm font-medium">
                    Cake Type
                  </Label>
                  <Select value={cakeType} onValueChange={setCakeType} disabled={isLoading}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select cake type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="chocolate">Chocolate</SelectItem>
                      <SelectItem value="vanilla">Vanilla</SelectItem>
                      <SelectItem value="strawberry">Strawberry</SelectItem>
                      <SelectItem value="red-velvet">Red Velvet</SelectItem>
                      <SelectItem value="funfetti">Funfetti</SelectItem>
                      <SelectItem value="carrot">Carrot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layers" className="text-sm font-medium">
                    Layers
                  </Label>
                  <Select value={layers} onValueChange={setLayers} disabled={isLoading}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select layers" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="single">Single Layer</SelectItem>
                      <SelectItem value="double">2-Layer</SelectItem>
                      <SelectItem value="triple">3-Layer</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-sm font-medium">
                    Theme/Style
                  </Label>
                  <Select value={theme} onValueChange={setTheme} disabled={isLoading}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="rustic">Rustic</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="fun">Fun/Cartoon</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colors" className="text-sm font-medium">
                    Colors
                  </Label>
                  <Select value={colors} onValueChange={setColors} disabled={isLoading}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select colors" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="multicolor">Multicolor</SelectItem>
                      <SelectItem value="gold-silver">Gold/Silver</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* AI Message Toggle */}
            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
              <div className="space-y-1">
                <Label htmlFor="ai-toggle" className="text-base font-medium">
                  AI-Generated Message
                </Label>
                <p className="text-sm text-muted-foreground">
                  Let AI create a perfect message for your cake
                </p>
              </div>
              <Switch
                id="ai-toggle"
                checked={useAI}
                onCheckedChange={setUseAI}
                disabled={isLoading}
              />
            </div>

            {/* Custom Message */}
            {!useAI && (
              <div className="space-y-2">
                <Label htmlFor="message" className="text-base font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Custom Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter your custom message for the cake..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="min-h-[100px] bg-surface border-border focus:ring-gold focus:border-gold"
                  disabled={isLoading}
                />
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !name.trim() || (!useAI && !customMessage.trim()) || (useAI && (!occasion || !relation || !gender))}
              className="w-full py-6 text-lg bg-gradient-gold hover:shadow-gold transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating your cake...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Cake
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 bg-surface-elevated border-border">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-foreground">Crafting Your Perfect Cake</h3>
              <p className="text-muted-foreground">Our AI is designing a beautiful personalized cake for {name}...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Image */}
      {generatedImage && !isLoading && (
        <Card className="p-6 bg-surface-elevated border-border shadow-elegant">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Your Personalized Cake is Ready!</h3>
              <p className="text-muted-foreground">A beautiful cake created especially for {name}</p>
            </div>
            
            {/* Display AI-generated message if available */}
            {generatedMessage && (
              <div className="p-4 bg-gold/10 border border-gold/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Personalized Message</p>
                    <p className="text-foreground leading-relaxed">{generatedMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="rounded-lg overflow-hidden shadow-gold">
              <img
                src={generatedImage}
                alt={`Personalized cake for ${name}`}
                className="w-full h-auto max-h-96 object-cover"
                onError={() => {
                  toast({
                    title: "Image failed to load",
                    description: "There was an issue loading your cake image.",
                    variant: "destructive",
                  });
                }}
              />
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={handleDownload}
                className="w-full py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Your Cake
              </Button>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  Share on social media
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleShare("facebook")}
                    variant="outline"
                    className="flex items-center gap-2 py-3"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => handleShare("twitter")}
                    variant="outline"
                    className="flex items-center gap-2 py-3"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => handleShare("whatsapp")}
                    variant="outline"
                    className="flex items-center gap-2 py-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};