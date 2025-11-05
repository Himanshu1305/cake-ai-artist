import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Download, Sparkles, MessageSquare, Calendar, Users, User, Share2, Facebook, Twitter, MessageCircle, Crown, Instagram, RotateCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CakeCreatorProps {}

export const CakeCreator = ({}: CakeCreatorProps) => {
  const navigate = useNavigate();
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
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [useCustomMessage, setUseCustomMessage] = useState<boolean>(false);
  const [displayedMessage, setDisplayedMessage] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [totalGenerations, setTotalGenerations] = useState(0);

  const PREMIUM_CHARACTERS = [
    "spider-man", "hulk", "captain-america", "peppa-pig", "doraemon", 
    "shinchan", "minions", "hello-kitty", "chhota-bheem", "motu-patlu",
    "pikachu", "totoro", "sailor-moon", "tom-and-jerry", "gojo-satoru",
    "inosuke", "zenitsu", "todoroki-shoto", "anya-forger", "loid-forger",
    "goku", "naruto", "masha-and-bear", "anna", "elsa", "olaf", "sven", "barbie"
  ];
  const FREE_GENERATION_LIMIT = 5;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setUser(session.user);
      setIsLoggedIn(true);
      await loadUserData(session.user.id);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Get profile to check premium status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .maybeSingle();

      console.log("Profile data:", profile, "Error:", profileError);

      if (profile) {
        setIsPremium(profile.is_premium || false);
        console.log("Premium status set to:", profile.is_premium);
      }

      // Get generation count for current year (for premium users)
      const currentYear = new Date().getFullYear();
      const { data: tracking } = await supabase
        .from("generation_tracking")
        .select("count")
        .eq("user_id", userId)
        .eq("year", currentYear)
        .single();

      if (tracking) {
        setGenerationCount(tracking.count);
      }

      // Get total generation count (for free users)
      const { data: allTracking } = await supabase
        .from("generation_tracking")
        .select("count")
        .eq("user_id", userId);

      if (allTracking) {
        const total = allTracking.reduce((sum, record) => sum + (record.count || 0), 0);
        setTotalGenerations(total);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

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

    // Check generation limits for logged-in users
    if (isLoggedIn) {
      if (isPremium && generationCount >= 100) {
        toast({
          title: "Generation limit reached",
          description: "You've reached your limit of 100 generations for this year.",
          variant: "destructive",
        });
        return;
      }
      
      if (!isPremium && totalGenerations >= FREE_GENERATION_LIMIT) {
        toast({
          title: "Free limit reached",
          description: `You've used all ${FREE_GENERATION_LIMIT} free generations. Upgrade to Premium for unlimited cakes!`,
          variant: "destructive",
        });
        return;
      }
    }

    // Check if character is premium and user is not premium
    if (character && PREMIUM_CHARACTERS.includes(character) && !isPremium) {
      toast({
        title: "Premium character selected",
        description: "This character is only available for Premium users. Upgrade to unlock all characters!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);
    setSelectedImages(new Set());
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

      // Parse JSON response expecting array of 4 images
      const data = await response.json();
      
      // Extract 4 images
      let images: string[] = [];
      if (data.images && Array.isArray(data.images)) {
        images = data.images;
      } else if (data.image_urls) {
        images = data.image_urls;
      }

      // Extract AI message
      if (data.message) {
        setGeneratedMessage(data.message);
        if (!useCustomMessage) {
          setDisplayedMessage(data.message);
        }
      }

      // Update displayed message
      if (useCustomMessage && customMessage.trim()) {
        setDisplayedMessage(customMessage);
      } else if (data.message) {
        setDisplayedMessage(data.message);
      }

      // Set images and select first by default
      setGeneratedImages(images);
      setSelectedImages(new Set([0]));
      
      // Save images if user is logged in
      if (isLoggedIn && user && images.length > 0) {
        const selectedUrls = [images[0]]; // Initially save first image
        await saveGeneratedImage(selectedUrls);
      }
      
      toast({
        title: "Cake created successfully!",
        description: isLoggedIn 
          ? `Your personalized cake for ${name} is ready and saved!` 
          : `Your personalized cake for ${name} is ready! Login to save it.`,
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

  const saveGeneratedImage = async (selectedImageUrls: string[]) => {
    if (!user) return;

    try {
      const prompt = `${name} - ${occasion} cake for ${relation} (${gender})${character ? ` with ${character}` : ''}`;
      
      // Save all selected images
      for (const imageUrl of selectedImageUrls) {
        // Save image to permanent storage
        console.log('Saving image to storage...');
        const { data: storageData, error: storageError } = await supabase.functions.invoke(
          'save-image-to-storage',
          {
            body: { 
              imageUrl, 
              userId: user.id,
              prompt 
            }
          }
        );

        if (storageError) {
          console.error('Storage error:', storageError);
          throw storageError;
        }

        const permanentUrl = storageData?.publicUrl || imageUrl;
        console.log('Permanent URL:', permanentUrl);

        // Save image with permanent URL and message
        const { error: imageError } = await supabase
          .from("generated_images")
          .insert({
            user_id: user.id,
            image_url: permanentUrl,
            prompt: prompt,
            message: displayedMessage || null,
            message_type: useCustomMessage ? 'custom' : 'ai',
          });

        if (imageError) throw imageError;
      }

      // Update generation tracking
      const currentYear = new Date().getFullYear();
      const { data: existing } = await supabase
        .from("generation_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .single();

      if (existing) {
        await supabase
          .from("generation_tracking")
          .update({ count: existing.count + 1 })
          .eq("id", existing.id);
        setGenerationCount(existing.count + 1);
        setTotalGenerations(totalGenerations + 1);
      } else {
        await supabase
          .from("generation_tracking")
          .insert({
            user_id: user.id,
            year: currentYear,
            count: 1,
          });
        setGenerationCount(1);
        setTotalGenerations(totalGenerations + 1);
      }
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const createShareableImage = async (
    cakeImageUrl: string,
    message: string,
    recipientName: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#fff1f2');
      gradient.addColorStop(1, '#fce7f3');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load cake image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw cake image (centered, maintain aspect ratio)
        const imgAspect = img.width / img.height;
        const maxWidth = 1000;
        const maxHeight = 800;
        let drawWidth = maxWidth;
        let drawHeight = maxWidth / imgAspect;
        
        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = maxHeight * imgAspect;
        }
        
        const x = (canvas.width - drawWidth) / 2;
        const y = 80;
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Draw message box
        const messageY = y + drawHeight + 40;
        const messageBoxHeight = 200;
        
        // Message background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 20;
        ctx.fillRect(40, messageY, canvas.width - 80, messageBoxHeight);
        ctx.shadowBlur = 0;
        
        // Message text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.textAlign = 'center';
        
        // Word wrap function
        const wrapText = (text: string, maxWidth: number) => {
          const words = text.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          
          words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          
          if (currentLine) lines.push(currentLine);
          return lines;
        };
        
        const lines = wrapText(message, canvas.width - 160);
        const lineHeight = 40;
        const textStartY = messageY + (messageBoxHeight - (lines.length * lineHeight)) / 2 + 30;
        
        lines.forEach((line, i) => {
          ctx.fillText(line, canvas.width / 2, textStartY + (i * lineHeight));
        });
        
        // Footer
        ctx.font = '18px Arial';
        ctx.fillStyle = '#999';
        ctx.fillText('Created with ❤️ for ' + recipientName, canvas.width / 2, canvas.height - 40);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = cakeImageUrl;
    });
  };

  const handleDownload = async () => {
    if (selectedImages.size === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to download",
        variant: "destructive",
      });
      return;
    }
    
    try {
      for (const index of Array.from(selectedImages)) {
        const imageUrl = generatedImages[index];
        
        // Create composite image
        const compositeUrl = await createShareableImage(
          imageUrl,
          displayedMessage || `Happy celebration for ${name}!`,
          name
        );
        
        // Download
        const link = document.createElement('a');
        link.href = compositeUrl;
        link.download = `${name}-cake-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(compositeUrl);
      }
      
      toast({
        title: "Download complete!",
        description: `${selectedImages.size} shareable card(s) downloaded successfully`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not create shareable image",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (platform: string) => {
    if (selectedImages.size === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to share",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Use first selected image for sharing
      const firstSelected = Array.from(selectedImages)[0];
      const imageUrl = generatedImages[firstSelected];
      
      // Create composite
      const compositeUrl = await createShareableImage(
        imageUrl,
        displayedMessage || `Happy celebration for ${name}!`,
        name
      );
      
      const shareText = `Check out this amazing cake I created for ${name}! 🎂✨`;
      
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + window.location.href)}`, '_blank');
          break;
        case 'instagram':
          // Instagram doesn't support web sharing, download instead
          const link = document.createElement('a');
          link.href = compositeUrl;
          link.download = `${name}-cake-instagram.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "Image downloaded!",
            description: "Open Instagram app and upload the downloaded image",
          });
          break;
      }
      
      URL.revokeObjectURL(compositeUrl);
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share failed",
        description: "Could not create shareable image",
        variant: "destructive",
      });
    }
  };

    return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* User Status Banner */}
      {isLoggedIn && (
        <Card className="p-4 bg-party-purple/10 border-party-purple/30 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                {isPremium ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Premium User
                  </>
                ) : (
                  "✨ Free User"
                )}
              </p>
              <p className="text-xs text-foreground/70">
                {isPremium 
                  ? `${generationCount} / 100 generations used this year`
                  : `${totalGenerations} / ${FREE_GENERATION_LIMIT} free generations used`}
              </p>
            </div>
            <div className="flex gap-2">
              {!isPremium && (
                <Button
                  onClick={() => navigate("/auth")}
                  size="sm"
                  className="bg-gradient-party hover:shadow-party"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              )}
              <Button
                onClick={() => navigate("/gallery")}
                variant="outline"
                size="sm"
                className="border-party-purple/30 hover:border-party-purple"
              >
                View Gallery
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!isLoggedIn && (
        <Card className="p-4 bg-party-pink/10 border-party-pink/30 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                🎁 Free Trial Mode
              </p>
              <p className="text-xs text-foreground/70">
                Generate cakes for free! Login to save and access them later.
              </p>
            </div>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-party-pink hover:bg-party-pink/90"
              size="sm"
            >
              Login / Sign Up
            </Button>
          </div>
        </Card>
      )}

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
                        <SelectItem value="mickey-minnie" className="flex items-center gap-2">
                          Mickey Mouse and Minnie Mouse
                        </SelectItem>
                        <SelectItem value="spider-man" disabled={!isPremium} className="flex items-center gap-2">
                          <span className="flex items-center gap-2">
                            Spider-Man {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="hulk" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Hulk {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="captain-america" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Captain America {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="peppa-pig" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Peppa Pig {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="doraemon" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Doraemon {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="shinchan" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Shinchan {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="minions" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Minions {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="hello-kitty" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Hello Kitty {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="chhota-bheem" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Chhota Bheem {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="motu-patlu" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Motu Patlu {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="pikachu" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Pikachu {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="totoro" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Totoro {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="sailor-moon" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Sailor Moon {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="tom-and-jerry" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Tom and Jerry {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="gojo-satoru" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Gojo Satoru {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="inosuke" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Inosuke {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="zenitsu" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Zenitsu {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="todoroki-shoto" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Todoroki Shoto {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="anya-forger" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Anya Forger {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="loid-forger" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Loid Forger {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="goku" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Goku {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="naruto" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Naruto {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="masha-and-bear" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Masha and the Bear {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="anna" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Anna {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="elsa" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Elsa {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="olaf" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Olaf {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="sven" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Sven {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
                        <SelectItem value="barbie" disabled={!isPremium}>
                          <span className="flex items-center gap-2">
                            Barbie {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          </span>
                        </SelectItem>
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

            {/* Custom Message Section */}
            <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message Options
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {useCustomMessage ? "Custom" : "AI Generated"}
                  </span>
                  <Switch
                    checked={useCustomMessage}
                    onCheckedChange={setUseCustomMessage}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {useCustomMessage ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your personalized message here... (max 250 characters)"
                    value={customMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= 250) {
                        setCustomMessage(e.target.value);
                      }
                    }}
                    className="min-h-[100px] bg-background border-border"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {customMessage.length}/250 characters
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  AI will generate a personalized message based on the details you've provided
                </p>
              )}
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
    </div>
  );
};