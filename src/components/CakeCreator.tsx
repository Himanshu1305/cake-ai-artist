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
import { Download, Sparkles, MessageSquare, Calendar, Users, User, Share2, Facebook, MessageCircle, Crown, Instagram, RotateCw, Check, Save, X as XIcon, Star, HelpCircle, Smartphone, Monitor, Upload, Type } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShareInstructions } from "@/components/ShareInstructions";
import { processImageArray } from "@/utils/cakeTextOverlay";
import { TextEditor } from "@/components/TextEditor";

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
  const [originalImages, setOriginalImages] = useState<string[]>([]);
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [postGenRating, setPostGenRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [occasionDate, setOccasionDate] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [showShareInstructions, setShowShareInstructions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const PREMIUM_CHARACTERS = [
    "spider-man", "hulk", "captain-america", "peppa-pig", "doraemon", 
    "shinchan", "minions", "hello-kitty", "chhota-bheem", "motu-patlu",
    "pikachu", "totoro", "sailor-moon", "tom-and-jerry", "gojo-satoru",
    "inosuke", "zenitsu", "todoroki-shoto", "anya-forger", "loid-forger",
    "goku", "naruto", "masha-and-bear", "anna", "elsa", "olaf", "sven", "barbie"
  ];
  const FREE_GENERATION_LIMIT = 5;

  // Image compression utility
  const compressImage = async (file: File, maxWidth = 1024, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width = (width * maxWidth) / height;
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with quality, return only base64 data without prefix
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed.split(',')[1]); // Remove data URI prefix
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Image validation and compression wrapper
  const validateAndCompressImage = async (file: File) => {
    // Check file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image too large. Please use an image under 10MB.');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file.');
    }

    return await compressImage(file, 1024, 0.75);
  };

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
    setOriginalImages([]);
    setSelectedImages(new Set());
    setGeneratedMessage(null);

    try {
      // Validate and compress uploaded image if present
      let customImageBase64: string | undefined;
      if (uploadedImage) {
        try {
          customImageBase64 = await validateAndCompressImage(uploadedImage);
          console.log('Compressed image size:', customImageBase64.length, 'characters');
        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: "Image processing failed",
            description: error instanceof Error ? error.message : "Could not process the uploaded image",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

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
            character: character || undefined,
            customImage: customImageBase64
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId); // Clear timeout if request succeeds

        if (!response.ok) {
          const errorText = await response.text();
          console.error('N8N error response:', errorText);
          throw new Error(`Failed to generate cake image: ${response.status} ${response.statusText}`);
        }

        // Check if response has content before parsing JSON
        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");

        console.log('Response headers:', {
          contentType,
          contentLength,
          status: response.status,
          statusText: response.statusText
        });

        // Validate response has JSON content
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error('N8N returned non-JSON response:', text);
          throw new Error('N8N webhook returned invalid response format. Expected JSON.');
        }

        if (contentLength === "0") {
          console.error('N8N returned empty response');
          throw new Error('N8N webhook returned empty response. Please check your workflow configuration.');
        }

        // Safely parse JSON with try-catch
        let data;
        try {
          const responseText = await response.text();
          console.log('Raw N8N response text:', responseText);
          data = JSON.parse(responseText);
          console.log('Parsed N8N data:', data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('N8N webhook returned invalid JSON. Please check your workflow output.');
        }
      
        // Extract 4 images - handle both array of strings and array of objects
        let images: string[] = [];
        if (data.images && Array.isArray(data.images)) {
          images = data.images
            .map((img: any) => {
              // Extract URL from object or use string directly
              if (typeof img === 'string') return img;
              return img.imageUrl || img.image_url || null;
            })
            .filter((url: string | null) => {
              // Validate URLs - must be non-empty strings starting with http
              if (!url || typeof url !== 'string') {
                console.error('Invalid image URL:', url);
                return false;
              }
              if (!url.startsWith('http')) {
                console.error('Image URL must start with http:', url);
                return false;
              }
              return true;
            });
        } else if (data.image_urls && Array.isArray(data.image_urls)) {
          images = data.image_urls.filter((url: any) => 
            url && typeof url === 'string' && url.startsWith('http')
          );
        }

        console.log('Parsed images:', images);
        console.log('Valid image count:', images.length);
        console.log('All images are valid strings:', images.every(img => typeof img === 'string'));

        // Validate we have at least one valid image
        if (images.length === 0) {
          throw new Error('No valid images received from N8N. Please check your workflow configuration.');
        }

        if (images.length !== 4) {
          console.warn(`Expected 4 images but received ${images.length}. Some images may be invalid.`);
          toast({
            title: "Partial results",
            description: `Received ${images.length} valid images instead of 4. Some may have failed to generate.`,
          });
        }

        // Extract AI message - check both 'message' and 'greetingMessage'
        const aiMessage = data.message || data.greetingMessage;
        if (aiMessage) {
          setGeneratedMessage(aiMessage);
          if (!useCustomMessage) {
            setDisplayedMessage(aiMessage);
          }
        } else {
          console.warn('No message or greetingMessage field in N8N response:', data);
        }

        // Update displayed message
        if (useCustomMessage && customMessage.trim()) {
          setDisplayedMessage(customMessage);
        } else if (aiMessage) {
          setDisplayedMessage(aiMessage);
        }

        // Store original images (without text) for later editing
        setOriginalImages([...images]);
        
        // Process images with text overlay and set them
        const processedImages = await processImageArray(images, name.trim());
        setGeneratedImages(processedImages);
        setSelectedImages(new Set([0]));
        
        toast({
          title: "Cake created successfully!",
          description: isLoggedIn 
            ? `Your personalized cake for ${name} is ready! Click "Save to Gallery" to save it.` 
            : `Your personalized cake for ${name} is ready! Login to save it.`,
        });

        // Show post-generation rating prompt if logged in
        if (isLoggedIn) {
          setShowRatingPrompt(true);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout. N8N workflow took too long to respond (>60s).');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error generating cake:", error);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Cannot connect to image generation service. Please check your internet connection or try again later.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Image generation is taking too long. Please try again with simpler options.";
        } else if (error.message.includes('JSON') || error.message.includes('json')) {
          errorMessage = "Image generation service returned invalid data. Please try again or contact support.";
        } else if (error.message.includes('No valid images')) {
          errorMessage = "No images were generated. Please check your N8N workflow configuration.";
        } else if (error.message.includes('empty response')) {
          errorMessage = "Image generation service returned no data. Please check your N8N workflow.";
        } else if (error.message.includes('invalid response format')) {
          errorMessage = "Image generation service returned wrong format. Expected JSON response.";
        }
      }
      
      toast({
        title: "Failed to create cake",
        description: errorMessage,
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
            recipient_name: recipientName.trim() || null,
            occasion_type: occasion || null,
            occasion_date: occasionDate || null,
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

  const handleRatingSubmit = async () => {
    if (!postGenRating || !user) return;

    try {
      const { error } = await supabase
        .from("feedback")
        .insert({
          user_id: user.id,
          rating: postGenRating,
          feedback_type: "post_generation",
          category: "general",
          message: ratingFeedback.trim() || null,
          page_url: window.location.pathname,
        });

      if (error) throw error;

      toast({
        title: "Thanks for rating!",
        description: "Your feedback helps us improve",
      });

      setShowRatingPrompt(false);
      setPostGenRating(0);
      setRatingFeedback("");
    } catch (error) {
      console.error("Error submitting rating:", error);
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
      const fileNames: string[] = [];
      
      for (const index of Array.from(selectedImages)) {
        const imageUrl = generatedImages[index];
        
        // Create composite image
        const compositeUrl = await createShareableImage(
          imageUrl,
          displayedMessage || `Happy celebration for ${name}!`,
          name
        );
        
        // Download
        const fileName = `${name}-cake-${index + 1}.png`;
        fileNames.push(fileName);
        
        const link = document.createElement('a');
        link.href = compositeUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(compositeUrl);
      }
      
      toast({
        title: "✅ Download complete!",
        description: `Downloaded: ${fileNames.join(', ')} to your Downloads folder`,
        duration: 5000,
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
    // Check if user has seen instructions
    const hasSeenInstructions = localStorage.getItem('hasSeenShareInstructions');
    if (!hasSeenInstructions) {
      setShowShareInstructions(true);
      // Still continue with download after showing modal
    }

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
      
      // Convert blob URL to actual blob for sharing
      const response = await fetch(compositeUrl);
      const blob = await response.blob();
      const file = new File([blob], `${name}-cake.png`, { type: 'image/png' });
      
      // Try Web Share API first (works on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: shareText,
            text: shareText,
          });
          toast({
            title: "Shared successfully! 🎉",
            description: "Your cake card has been shared",
          });
          URL.revokeObjectURL(compositeUrl);
          return;
        } catch (shareError) {
          // User cancelled or share failed, continue to platform-specific sharing
          console.log('Web Share API failed, falling back to platform-specific:', shareError);
        }
      }
      
      // Platform-specific sharing fallbacks with enhanced messaging
      const platformName = platform === 'x' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1);
      
      // Download the image
      const link = document.createElement('a');
      link.href = compositeUrl;
      link.download = `${name}-cake-${platform}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Platform-specific toast messages with detailed instructions
      let toastDescription = "";
      
      if (isMobile) {
        switch (platform) {
          case 'facebook':
            toastDescription = "Tap 'What's on your mind?' → Photo/Video → Select downloaded image";
            break;
          case 'x':
            toastDescription = "Tap '+' → Media → Select downloaded image → Add your text";
            break;
          case 'whatsapp':
            toastDescription = "Open chat → Paperclip icon → Gallery → Select downloaded image";
            break;
          case 'instagram':
            toastDescription = "Opening Instagram... Select the image from your gallery";
            // Try to open Instagram app
            setTimeout(() => {
              window.location.href = 'instagram://library';
            }, 500);
            break;
        }
      } else {
        switch (platform) {
          case 'facebook':
            toastDescription = "Open Facebook → What's on your mind? → Photo/Video → Upload downloaded image";
            break;
          case 'x':
            toastDescription = "Open X → Post button → Media icon → Upload downloaded image";
            break;
          case 'whatsapp':
            toastDescription = "Open WhatsApp Web → Chat → Paperclip → Photos & Videos → Upload image";
            break;
          case 'instagram':
            toastDescription = "Open Instagram on your phone → '+' → Post → Select image from gallery";
            break;
        }
      }
      
      toast({
        title: `✅ Image downloaded!`,
        description: toastDescription,
        duration: 7000,
      });
      
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
                      <SelectContent className="bg-background border-border z-[100]" sideOffset={4}>
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
                      <SelectContent className="bg-background border-border z-[100]" sideOffset={4}>
                        <SelectItem value="brother">Brother</SelectItem>
                        <SelectItem value="sister">Sister</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="daughter">Daughter</SelectItem>
                        <SelectItem value="son">Son</SelectItem>
                        <SelectItem value="husband">Husband</SelectItem>
                        <SelectItem value="wife">Wife</SelectItem>
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
                      <SelectContent className="bg-background border-border z-[100]" sideOffset={4}>
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
                      <SelectContent className="bg-background border-border z-[100] max-h-[300px]" sideOffset={4}>
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

                {/* Custom Image Upload - Hidden for now */}
                {false && (
                <div className="mt-4 p-4 bg-surface-elevated/50 rounded-lg border border-party-purple/30">
                  <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Upload className="w-4 h-4" />
                    Upload Custom Image for Cake (Optional)
                    {!isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload a photo to create a custom photo cake. Best with square or portrait images.
                  </p>
                  
                  {!uploadedImagePreview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            toast({
                              title: "Invalid file",
                              description: "Please upload an image file (JPG, PNG, or WEBP)",
                              variant: "destructive",
                            });
                            return;
                          }

                          // Validate file size (10MB max before compression)
                          if (file.size > 10 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Maximum file size is 10MB",
                              variant: "destructive",
                            });
                            return;
                          }

                          setUploadedImage(file);

                          // Create preview
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setUploadedImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);

                          toast({
                            title: "Image uploaded",
                            description: "Your image will be compressed and optimized for the cake",
                          });
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading || (!isPremium && false)} // Enable for all users for now
                      />
                      <div className="border-2 border-dashed border-party-purple/50 rounded-lg p-6 hover:border-party-purple transition-colors cursor-pointer bg-surface/50">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Upload className="w-8 h-8 text-party-purple" />
                          <p className="text-sm font-medium text-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG or WEBP (max 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded preview"
                        className="w-full h-40 object-cover rounded-lg border border-party-purple/30"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedImagePreview(null);
                          toast({
                            title: "Image removed",
                            description: "Custom image cleared",
                          });
                        }}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        disabled={isLoading}
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                )}

                {/* Memory Fields - NEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-surface-elevated/50 rounded-lg border border-party-pink/20">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Who is this for? (Optional)
                    </Label>
                    <Input
                      id="recipientName"
                      type="text"
                      placeholder="e.g., Sarah, Mom, Best Friend"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="bg-background border-border"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">Save as a memory to remember later</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occasionDate" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Occasion Date (Optional)
                    </Label>
                    <Input
                      id="occasionDate"
                      type="date"
                      value={occasionDate}
                      onChange={(e) => setOccasionDate(e.target.value)}
                      className="bg-background border-border"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">For future reminders</p>
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
                  ✨ Generate My Cake 🎉
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

      {/* Post-Generation Rating Prompt */}
      {showRatingPrompt && generatedImages.length > 0 && !isLoading && (
        <Card className="p-6 bg-party-purple/10 border-party-purple/30 mb-6 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRatingPrompt(false)}
            className="absolute top-2 right-2"
          >
            <XIcon className="w-4 h-4" />
          </Button>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">How did we do?</h3>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPostGenRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || postGenRating)
                        ? "fill-gold text-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Any thoughts? (Optional)"
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <Button
              onClick={handleRatingSubmit}
              disabled={!postGenRating}
              className="w-full"
            >
              Submit Rating
            </Button>
          </div>
        </Card>
      )}

      {/* Generated Images Display */}
      {!isLoading && generatedImages.length > 0 && (
        <div className="space-y-6">
          {/* Message Display Card */}
          {displayedMessage && (
            <Card className="p-6 bg-gradient-celebration/30 border-party-pink/40 border-2 shadow-party">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5 text-party-pink" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {useCustomMessage ? "Your Custom Message" : "AI Generated Message"}
                  </h3>
                </div>
                <p className="text-foreground text-base leading-relaxed">
                  {displayedMessage}
                </p>
              </div>
            </Card>
          )}

          {/* Image Grid */}
          <Card className="p-6 bg-gradient-party/10 border-party-purple/40 border-2 shadow-party">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  🎂 Your Generated Cakes
                </h3>
                <span className="text-sm text-muted-foreground">
                  {selectedImages.size} of {generatedImages.length} selected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden border-4 transition-all duration-300 ${
                      selectedImages.has(index)
                        ? "border-party-pink shadow-lg shadow-party-pink/50"
                        : "border-border hover:border-party-purple/50"
                    }`}
                  >
                    <div
                      onClick={() => setPreviewImage(imageUrl)}
                      className="cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={imageUrl || '/placeholder.svg'}
                        alt={`Cake angle ${index + 1}`}
                        className="w-full h-full object-cover aspect-square"
                        onError={(e) => {
                          console.error('Failed to load image:', imageUrl);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    {/* Selection Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSelected = new Set(selectedImages);
                        if (newSelected.has(index)) {
                          newSelected.delete(index);
                        } else {
                          newSelected.add(index);
                        }
                        setSelectedImages(newSelected);
                      }}
                      className="absolute top-2 right-2 cursor-pointer"
                    >
                      <div className={`rounded-full p-1.5 shadow-lg transition-all ${
                        selectedImages.has(index)
                          ? "bg-party-pink text-white"
                          : "bg-white/80 text-gray-600 hover:bg-white"
                      }`}>
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                    
                    {/* View Label */}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                      {["Front View", "Side View", "Top-Down View", "3/4 View (Diagonal)"][index] || `View ${index + 1}`}
                    </div>
                    
                    {/* Edit Text Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingImageIndex(index);
                      }}
                      size="sm"
                      className="absolute bottom-2 right-2 bg-party-pink/90 hover:bg-party-pink text-white text-xs py-1 px-2 h-auto"
                    >
                      <Type className="w-3 h-3 mr-1" />
                      Edit Text
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Click images to preview • Click checkmark to select for download/share
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card className="p-6 bg-gradient-celebration/20 border-party-pink/30 border-2 shadow-party">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                What would you like to do?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={selectedImages.size === 0}
                  className="w-full py-6 bg-gradient-party hover:shadow-party transition-all duration-300 text-white font-semibold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download {selectedImages.size > 0 ? `(${selectedImages.size})` : ""}
                </Button>

                {/* Save to Gallery Button */}
                {isLoggedIn && (
                  <div className="space-y-2">
                    <Button
                      onClick={async () => {
                        if (selectedImages.size === 0) {
                          toast({
                            title: "No images selected",
                            description: "Please select at least one image to save",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        const selectedUrls = Array.from(selectedImages).map(i => generatedImages[i]);
                        await saveGeneratedImage(selectedUrls);
                        
                        toast({
                          title: "🎉 Woohoo! Saved to Your Gallery!",
                          description: `${selectedImages.size} stunning cake${selectedImages.size > 1 ? 's' : ''} saved! ✨ Want to show off? Head to Gallery → Click the ⭐ star to feature your masterpiece on our HOMEPAGE!`,
                          className: "bg-gradient-to-r from-party-purple via-party-pink to-party-orange border-2 border-party-gold text-white shadow-2xl",
                        });
                      }}
                      disabled={selectedImages.size === 0}
                      className="w-full py-6 bg-party-purple hover:bg-party-purple/90 transition-all duration-300 text-white font-semibold"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save to Gallery {selectedImages.size > 0 ? `(${selectedImages.size})` : ""}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      💡 Saved images can be starred ⭐ in your gallery to feature on our homepage!
                    </p>
                  </div>
                )}
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-medium text-foreground">Share Your Cake Card 🎉</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowShareInstructions(true)}
                        >
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How to share on social media</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {isMobile ? "Tap to download & open app" : "Click to download & upload manually"}
                </p>
                
                {/* Collapsible How to Share Section */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="share-guide" className="border-party-purple/20">
                    <AccordionTrigger className="text-xs py-2 hover:no-underline">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        {isMobile ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                        How to Share (Quick Guide)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground space-y-2 pb-3">
                      {isMobile ? (
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-party-pink font-bold">1.</span>
                            <span>Tap a button below → Image saves & app opens</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-party-pink font-bold">2.</span>
                            <span>In the app, create post & select image from gallery</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-party-pink font-bold">3.</span>
                            <span>Add your caption & share! 🎉</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <Download className="w-3 h-3 text-party-pink shrink-0 mt-0.5" />
                            <span>Click button → Image downloads to Downloads folder</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Upload className="w-3 h-3 text-party-purple shrink-0 mt-0.5" />
                            <span>Open platform → Create post → Upload downloaded image</span>
                          </div>
                          <div className="flex items-center gap-1 text-party-mint pt-1">
                            <span>💡 Tip: Check your Downloads folder for the image</span>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <TooltipProvider>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleShare('facebook')}
                          disabled={selectedImages.size === 0}
                          variant="outline"
                          className="border-party-blue hover:bg-party-blue hover:text-white"
                        >
                          <Facebook className="w-4 h-4 mr-1" />
                          {isMobile ? "📱" : "💻"} Facebook
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMobile ? "Downloads & opens Facebook app" : "Downloads image for manual upload"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleShare('x')}
                          disabled={selectedImages.size === 0}
                          variant="outline"
                          className="border-party-blue hover:bg-party-blue hover:text-white"
                        >
                          <XIcon className="w-4 h-4 mr-1" />
                          {isMobile ? "📱" : "💻"} X
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMobile ? "Downloads & opens X app" : "Downloads image for manual upload"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleShare('whatsapp')}
                          disabled={selectedImages.size === 0}
                          variant="outline"
                          className="border-green-500 hover:bg-green-500 hover:text-white"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {isMobile ? "📱" : "💻"} WhatsApp
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMobile ? "Downloads & opens WhatsApp" : "Downloads for WhatsApp Web"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleShare('instagram')}
                          disabled={selectedImages.size === 0}
                          variant="outline"
                          className="border-party-pink hover:bg-party-pink hover:text-white"
                        >
                          <Instagram className="w-4 h-4 mr-1" />
                          {isMobile ? "📱" : "💻"} Instagram
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMobile ? "Downloads & tries to open Instagram" : "Downloads - use phone to upload"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-surface-elevated border-party-pink/30">
          {previewImage && (
            <div className="relative">
              <Button
                onClick={() => setPreviewImage(null)}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-50 bg-background/80 hover:bg-background"
              >
                <XIcon className="w-4 h-4" />
              </Button>
              
              <div className="p-4">
                <div className="relative flex items-center justify-center bg-background/50 rounded-lg overflow-hidden min-h-[400px]">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Instructions Modal */}
      <ShareInstructions 
        open={showShareInstructions} 
        onOpenChange={setShowShareInstructions}
      />

      {/* Text Editor Modal */}
      {editingImageIndex !== null && (
        <TextEditor
          imageUrl={originalImages[editingImageIndex]}
          recipientName={name}
          onSave={(editedImageUrl) => {
            const newImages = [...generatedImages];
            newImages[editingImageIndex] = editedImageUrl;
            setGeneratedImages(newImages);
            setEditingImageIndex(null);
            toast({
              title: "Text updated!",
              description: "Your cake text has been customized successfully.",
            });
          }}
          onCancel={() => setEditingImageIndex(null)}
        />
      )}
    </div>
  );
};