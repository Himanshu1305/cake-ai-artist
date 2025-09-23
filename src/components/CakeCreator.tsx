import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Download, Sparkles } from "lucide-react";

interface CakeCreatorProps {}

export const CakeCreator = ({}: CakeCreatorProps) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("https://n8n-6421994137235212.kloudbeansite.com/webhook-test/20991645-1c69-48bd-915e-5bfd58e64016", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cake image");
      }

      const data = await response.json();
      
      // Handle different possible response formats
      let imageUrl = "";
      if (data.imageUrl) {
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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Form */}
      <Card className="p-8 bg-gradient-surface border-border shadow-elegant">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Create Your Personalized Cake</h2>
            <p className="text-muted-foreground">Enter a name and we'll create a beautiful custom cake just for you</p>
          </div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter the name for your cake"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg py-6 px-4 bg-surface border-border focus:ring-gold focus:border-gold"
              disabled={isLoading}
            />
            
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
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
            
            <Button
              onClick={handleDownload}
              className="w-full py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Your Cake
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};