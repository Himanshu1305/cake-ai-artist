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
  const [useAI] = useState(true);
  const [occasion, setOccasion] = useState("");
  const [relation, setRelation] = useState("");
  const [gender, setGender] = useState("");
  const [character, setCharacter] = useState("");
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

    if (!occasion || !relation || !gender) {
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
          useAI: true,
          occasion: occasion,
          relation: relation,
          gender: gender,
          character: character || undefined
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
      <Card className="p-8 bg-gradient-celebration/20 border-party-pink/30 border-2 shadow-party backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              🎂 Create Your Dream Cake ✨
            </h2>
            <p className="text-foreground/80 text-lg">Enter a name and let the magic begin! 🎉</p>
          </div>
          
          <div className="space-y-6">
            <Input
              type="text"
              placeholder="🎯 Enter the special person's name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg py-6 px-4 bg-surface border-party-pink/50 focus:ring-party-pink focus:border-party-pink transition-all duration-300"
              disabled={isLoading}
            />

            {/* Context Fields for AI */}
            <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">Help AI personalize your message</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="character" className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Character
                    </Label>
                    <Select value={character} onValueChange={setCharacter} disabled={isLoading}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select character (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50 max-h-[300px]">
                        <SelectItem value="spider-man">Spider-Man</SelectItem>
                        <SelectItem value="hulk">Hulk</SelectItem>
                        <SelectItem value="captain-america">Captain America</SelectItem>
                        <SelectItem value="peppa-pig">Peppa Pig</SelectItem>
                        <SelectItem value="doraemon">Doraemon</SelectItem>
                        <SelectItem value="shinchan">Shinchan</SelectItem>
                        <SelectItem value="minions">Minions</SelectItem>
                        <SelectItem value="hello-kitty">Hello Kitty</SelectItem>
                        <SelectItem value="chhota-bheem">Chhota Bheem</SelectItem>
                        <SelectItem value="motu-patlu">Motu Patlu</SelectItem>
                        <SelectItem value="pikachu">Pikachu</SelectItem>
                        <SelectItem value="totoro">Totoro</SelectItem>
                        <SelectItem value="sailor-moon">Sailor Moon</SelectItem>
                        <SelectItem value="tom-and-jerry">Tom and Jerry</SelectItem>
                        <SelectItem value="gojo-satoru">Gojo Satoru</SelectItem>
                        <SelectItem value="inosuke">Inosuke</SelectItem>
                        <SelectItem value="zenitsu">Zenitsu</SelectItem>
                        <SelectItem value="todoroki-shoto">Todoroki Shoto</SelectItem>
                        <SelectItem value="anya-forger">Anya Forger</SelectItem>
                        <SelectItem value="loid-forger">Loid Forger</SelectItem>
                        <SelectItem value="goku">Goku</SelectItem>
                        <SelectItem value="naruto">Naruto</SelectItem>
                        <SelectItem value="masha-and-bear">Masha and the Bear</SelectItem>
                        <SelectItem value="mickey-minnie">Mickey Mouse and Minnie Mouse</SelectItem>
                        <SelectItem value="anna">Anna</SelectItem>
                        <SelectItem value="elsa">Elsa</SelectItem>
                        <SelectItem value="olaf">Olaf</SelectItem>
                        <SelectItem value="sven">Sven</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </div>

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

            <Button
              type="submit"
              disabled={isLoading || !name.trim() || !occasion || !relation || !gender}
              className="w-full py-6 text-lg bg-gradient-party hover:shadow-party transition-all duration-300 transform hover:scale-[1.02] text-white font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  🎂 Creating your magical cake...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  ✨ Generate My Cake Magic 🎉
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 bg-gradient-party/10 border-party-purple/40 border-2 shadow-party">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-party-pink border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">🎂 Crafting Your Magical Cake ✨</h3>
              <p className="text-foreground/80 text-lg">Our AI is designing the perfect celebration cake for {name}... 🎉</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="animate-bounce floating-flame">🎈</span>
                <span className="animate-bounce dancing-flame" style={{ animationDelay: '0.1s' }}>🎊</span>
                <span className="animate-bounce floating-flame" style={{ animationDelay: '0.2s' }}>✨</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Image */}
      {generatedImage && !isLoading && (
        <Card className="p-6 bg-gradient-celebration/20 border-2 border-gold/50 shadow-party backdrop-blur-sm">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                🎊 Your Dream Cake is Ready! ✨
              </h3>
              <p className="text-foreground/80 text-lg">A magical cake created especially for {name} 🎂💖</p>
            </div>
            
            {/* Display AI-generated message if available */}
            {generatedMessage && (
              <div className="p-6 bg-gradient-party/10 border-2 border-party-pink/30 rounded-xl shadow-party">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-party rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-party-pink mb-2 flex items-center gap-2">
                      🎉 Your Personalized Message ✨
                    </p>
                    <p className="text-foreground leading-relaxed text-lg font-medium">{generatedMessage}</p>
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