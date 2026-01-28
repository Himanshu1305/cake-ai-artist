import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { CharacterPicker } from "@/components/CharacterPicker";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Download, Sparkles, MessageSquare, Calendar, Users, User, Share2, Facebook, MessageCircle, Crown, Instagram, RotateCw, Check, Save, X as XIcon, Star, HelpCircle, Smartphone, Monitor, Upload, Type, Image as ImageIcon, RefreshCw, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShareInstructions } from "@/components/ShareInstructions";
import { processImageArray } from "@/utils/cakeTextOverlay";
import { TextEditor } from "@/components/TextEditor";
import { PhotoEditor } from "@/components/PhotoEditor";
import { SwipeableImagePreview } from "@/components/SwipeableImagePreview";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { processCakeWithPhoto, FALLBACK_PHOTO_POSITIONS } from "@/utils/cakePhotoOverlay";
import type { PhotoPosition } from "@/utils/cakePhotoOverlay";
import { z } from "zod";
import { PartyPackGenerator } from "@/components/PartyPackGenerator";

// Input validation schema
const cakeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  occasion: z.string().min(1, "Occasion is required"),
  relation: z.string().min(1, "Relation is required"),
  gender: z.string().min(1, "Gender is required"),
  character: z.string().max(50, "Character name too long").optional(),
  cakeType: z.string().max(30, "Cake type too long").optional(),
  layers: z.string().max(20, "Layers value too long").optional(),
  theme: z.string().max(100, "Theme too long").optional(),
  colors: z.string().max(100, "Colors value too long").optional(),
});

interface CakeCreatorProps {}

export const CakeCreator = ({}: CakeCreatorProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [useAI] = useState(true);
  const [occasion, setOccasion] = useState("");
  const [relation, setRelation] = useState("");
  const [gender, setGender] = useState("");
  const [character, setCharacter] = useState("");
  const [cakeStyle, setCakeStyle] = useState<"decorated" | "sculpted">("decorated");
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [dailyGenerations, setDailyGenerations] = useState(0);
  const [monthlyGenerations, setMonthlyGenerations] = useState(0);
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
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [userPhotoForCake, setUserPhotoForCake] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [editingPhotoOnCakeIndex, setEditingPhotoOnCakeIndex] = useState<number | null>(null);
  const [photoPosition, setPhotoPosition] = useState<PhotoPosition | null>(null);
  const [isSavingToGallery, setIsSavingToGallery] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const [regeneratingView, setRegeneratingView] = useState<number | null>(null);
  const [savedCakeImageId, setSavedCakeImageId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const haptic = useHapticFeedback();

  const PREMIUM_CHARACTERS = [
    "spider-man", "hulk", "captain-america", "peppa-pig", "doraemon", 
    "shinchan", "minions", "hello-kitty", "chhota-bheem", "motu-patlu",
    "pikachu", "totoro", "sailor-moon", "tom-and-jerry", "gojo-satoru",
    "inosuke", "zenitsu", "todoroki-shoto", "anya-forger", "loid-forger",
    "goku", "naruto", "masha-and-bear", "anna", "elsa", "olaf", "sven", "barbie",
    "harry-potter", "hermione-granger", "simba", "nemo", "dory", 
    "aladdin", "jasmine", "genie", "zootopia", "jack-skellington",
    "moana", "rapunzel", "cinderella", "snow-white", "woody", "buzz-lightyear",
    "batman", "wonder-woman", "iron-man", "thor", "winnie-the-pooh", "paw-patrol"
  ];
  const FREE_DAILY_LIMIT = 3;            // 3 generations per day for free users
  const FREE_MONTHLY_LIMIT = 12;         // 12 generations per month for free users
  const PREMIUM_GENERATION_LIMIT = 150;  // For regular premium users (per year)
  const ADMIN_GENERATION_LIMIT = 500;    // For admins only (per year)

  // Simulated progress during generation - extended for longer AI generation times
  useEffect(() => {
    if (!isLoading) {
      setGenerationProgress(0);
      setGenerationStep("");
      return;
    }

    // Extended progress simulation to handle up to 3+ minute generation times
    const steps = [
      { progress: 5, step: "🎂 Baking something special...", delay: 500 },
      { progress: 12, step: "✨ Adding magical decorations...", delay: 3000 },
      { progress: 20, step: "🌈 Mixing the perfect colors...", delay: 8000 },
      { progress: 28, step: "🎀 Shaping the perfect tiers...", delay: 15000 },
      { progress: 36, step: "💖 Sprinkling some magic...", delay: 22000 },
      { progress: 44, step: "🌟 Creating beautiful details...", delay: 30000 },
      { progress: 52, step: "🎨 Adding artistic touches...", delay: 40000 },
      { progress: 60, step: "✨ Perfecting the fondant...", delay: 50000 },
      { progress: 68, step: "🍰 Adding final decorations...", delay: 60000 },
      { progress: 75, step: "🎁 Wrapping up the magic...", delay: 75000 },
      { progress: 82, step: "💫 Almost there, stay with us...", delay: 90000 },
      { progress: 88, step: "🌟 Final touches in progress...", delay: 105000 },
      { progress: 93, step: "✨ Just a moment more...", delay: 120000 },
      { progress: 96, step: "🎉 Nearly ready to celebrate...", delay: 140000 },
      { progress: 98, step: "🎂 Finishing up...", delay: 160000 },
    ];

    const timers: NodeJS.Timeout[] = [];
    
    steps.forEach(({ progress, step, delay }) => {
      const timer = setTimeout(() => {
        setGenerationProgress(progress);
        setGenerationStep(step);
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  // Regenerate specific view
  const handleRegenerateView = async (viewIndex: number) => {
    // When character is selected (4 images): 0=front, 1=side, 2=top (decorated), 3=main (sculpted)
    // For sculpted-only: 0=main, 1=top
    // For decorated-only: 0=front, 1=side, 2=top
    
    let viewName: string;
    let viewStyle: 'decorated' | 'sculpted' = 'decorated';
    
    // Check if we're in dual-style mode (character selected = 4 images)
    const isDualStyleMode = character && generatedImages.length === 4;
    
    if (isDualStyleMode) {
      // 4-image mode: first 3 are decorated, last 1 is sculpted main
      if (viewIndex < 3) {
        const decoratedViewNames = ['front', 'side', 'top'];
        viewName = decoratedViewNames[viewIndex];
        viewStyle = 'decorated';
      } else {
        viewName = 'main';
        viewStyle = 'sculpted';
      }
    } else if (cakeStyle === 'sculpted') {
      const sculptedViewNames = ['main', 'top'];
      viewName = sculptedViewNames[viewIndex];
      viewStyle = 'sculpted';
    } else {
      const decoratedViewNames = ['front', 'side', 'top'];
      viewName = decoratedViewNames[viewIndex];
      viewStyle = 'decorated';
    }
    
    setRegeneratingView(viewIndex);
    haptic.medium();
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-complete-cake', {
        body: {
          name,
          character,
          occasion,
          relation,
          gender,
          cakeStyle: viewStyle, // Use the specific style for this view
          cakeType,
          layers: viewStyle === 'sculpted' ? undefined : layers,
          theme,
          colors,
          userPhotoBase64: userPhotoPreview ? userPhotoPreview.split(',')[1] : undefined,
          specificView: viewName
        }
      });

      if (error) throw error;

      if (data.regeneratedImage) {
        const newImages = [...generatedImages];
        newImages[viewIndex] = data.regeneratedImage;
        setGeneratedImages(newImages);
        
        // Get the appropriate label based on mode
        let label: string;
        if (isDualStyleMode) {
          const labels = ['Front (Decorated)', 'Side (Decorated)', 'Top-Down (Decorated)', 'Character-Shaped'];
          label = labels[viewIndex];
        } else if (cakeStyle === 'sculpted') {
          const labels = ['Main', 'Top-Down'];
          label = labels[viewIndex];
        } else {
          const labels = ['Front', 'Side', 'Top-Down'];
          label = labels[viewIndex];
        }
        
        toast({
          title: "Success!",
          description: `${label} view regenerated!`
        });
        haptic.success();
      }
    } catch (error) {
      console.error('Error regenerating view:', error);
      toast({
        title: "Error",
        description: 'Failed to regenerate view. Please try again.',
        variant: "destructive"
      });
      haptic.error();
    } finally {
      setRegeneratingView(null);
    }
  };

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
    
    // Listen for auth state changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsPremium(false);
        setIsAdmin(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    // Try to refresh the session first
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      // Try to refresh
      const { data: refreshData } = await supabase.auth.refreshSession();
      if (refreshData.session) {
        setUser(refreshData.session.user);
        setIsLoggedIn(true);
        await loadUserData(refreshData.session.user.id);
        return;
      }
    }
    
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

      // Check if user is admin using has_role function
      const { data: adminCheck } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });
      
      setIsAdmin(adminCheck === true);
      console.log("Admin status:", adminCheck);

      // Get generation count for current year (for premium users)
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const { data: yearlyTracking } = await supabase
        .from("generation_tracking")
        .select("count")
        .eq("user_id", userId)
        .eq("year", currentYear)
        .is("month", null)
        .maybeSingle();

      if (yearlyTracking) {
        setGenerationCount(yearlyTracking.count || 0);
      }

      // Get monthly generation count (for free users)
      const { data: monthlyTracking } = await supabase
        .from("generation_tracking")
        .select("count")
        .eq("user_id", userId)
        .eq("year", currentYear)
        .eq("month", currentMonth)
        .maybeSingle();

      if (monthlyTracking) {
        setMonthlyGenerations(monthlyTracking.count || 0);
      }

      // Get daily generation count (for free users) - count images created today
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyImages } = await supabase
        .from("generated_images")
        .select("id", { count: 'exact' })
        .eq("user_id", userId)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      setDailyGenerations(dailyImages?.length || 0);

      // Get total generation count (for free users display)
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

  // Confetti celebration animation
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Fire multiple bursts for a grand celebration
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Helper function with retry logic and timeout for network interruptions
  const invokeWithRetry = async (functionName: string, body: any, maxRetries = 1) => {
    const TIMEOUT_MS = 180000; // 3 minute timeout for cake generation
    
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Generation timed out. The AI is taking longer than expected. Please try again.')), TIMEOUT_MS);
        });
        
        // Race between actual call and timeout
        const result = await Promise.race([
          supabase.functions.invoke(functionName, { body }),
          timeoutPromise
        ]);
        
        if (result.error) throw result.error;
        return { data: result.data, error: null };
      } catch (err) {
        lastError = err;
        console.log(`Attempt ${attempt + 1} failed:`, err);
        if (attempt < maxRetries) {
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          toast({
            title: "Reconnecting...",
            description: "Connection interrupted. Trying again...",
          });
        }
      }
    }
    return { data: null, error: lastError };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium(); // Haptic feedback on form submission
    
    // SECURITY: Validate all inputs with zod schema
    try {
      cakeFormSchema.parse({
        name,
        occasion,
        relation,
        gender,
        character: character || undefined,
        cakeType: cakeType || undefined,
        layers: layers || undefined,
        theme: theme || undefined,
        colors: colors || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid input",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    // REQUIRE LOGIN: Users must be logged in to generate cakes
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to generate your personalized cake!",
        variant: "destructive",
      });
      return;
    }

    // Check generation limits for logged-in users
    if (isLoggedIn) {
      if (isPremium) {
        const premiumLimit = isAdmin ? ADMIN_GENERATION_LIMIT : PREMIUM_GENERATION_LIMIT;
        
        if (generationCount >= premiumLimit) {
          toast({
            title: "Generation limit reached",
            description: `You've reached your limit of ${premiumLimit} generations for this year.`,
            variant: "destructive",
          });
          return;
        }
      } else {
        // Check daily limit for free users
        if (dailyGenerations >= FREE_DAILY_LIMIT) {
          toast({
            title: "Daily limit reached",
            description: `You've used all ${FREE_DAILY_LIMIT} free generations today. Come back tomorrow or upgrade to Premium for ${PREMIUM_GENERATION_LIMIT}/year!`,
            variant: "destructive",
          });
          return;
        }
        
        // Check monthly limit for free users
        if (monthlyGenerations >= FREE_MONTHLY_LIMIT) {
          toast({
            title: "Monthly limit reached",
            description: `You've used all ${FREE_MONTHLY_LIMIT} free generations this month. Upgrade to Premium for ${PREMIUM_GENERATION_LIMIT}/year!`,
            variant: "destructive",
          });
          return;
        }
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

      // ========== ORIGINAL N8N SOLUTION (COMMENTED FOR FALLBACK) ==========
      // const controller = new AbortController();
      // const timeoutId = setTimeout(() => controller.abort(), 60000);
      // 
      // try {
      //   const response = await fetch("https://n8n-6421994137235212.kloudbeansite.com/webhook-test/20991645-1c69-48bd-915e-5bfd58e64016", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ 
      //       name: name.trim(),
      //       cakeType: cakeType || undefined,
      //       layers: layers || undefined,
      //       theme: theme || undefined,
      //       colors: colors || undefined,
      //       useAI: true,
      //       occasion: occasion,
      //       relation: relation,
      //       gender: gender,
      //       character: character || undefined,
      //       customImage: customImageBase64
      //     }),
      //     signal: controller.signal
      //   });
      //   clearTimeout(timeoutId);
      //   ... (rest of N8N logic)
      //   
      //   // Store original images (without text) for later editing
      //   setOriginalImages([...images]);
      //   
      //   // Process images with text overlay and set them
      //   let processedImages = await processImageArray(images, name.trim());
      //   
      //   // If user uploaded a photo, automatically place it on top-down view (index 2)
      //   if (userPhotoPreview && processedImages.length >= 3) {
      //     const processedWithPhoto = await processCakeWithPhoto(processedImages[2], userPhotoPreview, 'top');
      //     processedImages[2] = processedWithPhoto;
      //   }
      // ========== END ORIGINAL N8N SOLUTION ==========

      // ========== NEW NATIVE LOVABLE AI SOLUTION ==========
      try {
        // Determine view count: 4 if character selected, else 2 for sculpted, 3 for decorated
        const viewCount = character ? 4 : (cakeStyle === 'sculpted' ? 2 : 3);
        const viewDescription = character 
          ? "4 beautiful views (3 decorated + 1 character-shaped)" 
          : `${viewCount} beautiful views`;
        
        toast({
          title: "Creating your cake...",
          description: `AI is generating ${viewDescription} with your personalization!`,
        });

        const { data, error } = await invokeWithRetry('generate-complete-cake', {
          name: name.trim(),
          character: character || undefined,
          occasion: occasion,
          relation: relation,
          gender: gender,
          cakeStyle: cakeStyle,
          cakeType: cakeType || undefined,
          layers: cakeStyle === 'sculpted' ? undefined : (layers || undefined), // Ignore layers for sculpted
          theme: theme || undefined,
          colors: colors || undefined,
          userPhotoBase64: userPhotoPreview ? userPhotoPreview.split(',')[1] : undefined
        });

        if (error) {
          console.error('Native generation error:', error);
          throw new Error(error.message || 'Failed to generate cake images');
        }

        if (!data?.success || !data?.images) {
          throw new Error('Invalid response from cake generation service');
        }

        const images = data.images;
        const aiMessage = data.greetingMessage;

        console.log('Native generation complete:', { imageCount: images.length, hasMessage: !!aiMessage });

        // Validate we have images
        if (!images || images.length === 0) {
          throw new Error('No images were generated. Please try again.');
        }

        // Set message
        if (aiMessage) {
          setGeneratedMessage(aiMessage);
          if (!useCustomMessage) {
            setDisplayedMessage(aiMessage);
          }
        }

        // Update displayed message
        if (useCustomMessage && customMessage.trim()) {
          setDisplayedMessage(customMessage);
        } else if (aiMessage) {
          setDisplayedMessage(aiMessage);
        }

        // Images come with name and photo already baked in!
        setGeneratedImages(images);
        setOriginalImages(images); // Same as generated since no post-processing needed
        setSelectedImages(new Set([0]));
        
        // Trigger celebration confetti after a brief delay
        setTimeout(() => triggerConfetti(), 400);
        
        haptic.success();
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
      } catch (error) {
        console.error("Error generating cake:", error);
        
        let errorMessage = "Something went wrong. Please try again.";
        let isAuthError = false;
        
        if (error instanceof Error) {
          const errorText = error.message.toLowerCase();
          
          if (errorText.includes('401') || errorText.includes('invalid') && errorText.includes('token') || 
              errorText.includes('expired') || errorText.includes('unauthorized') ||
              errorText.includes('missing authorization') || errorText.includes('missing sub claim')) {
            isAuthError = true;
            errorMessage = "Your session has expired. Please log in again to continue.";
            // Clear the stale session state
            setIsLoggedIn(false);
            setUser(null);
            // Try to refresh the session
            const { data: refreshData } = await supabase.auth.refreshSession();
            if (refreshData.session) {
              setUser(refreshData.session.user);
              setIsLoggedIn(true);
              errorMessage = "Session refreshed! Please try generating again.";
            }
          } else if (error.message.includes('Rate limit')) {
            errorMessage = "You've hit the rate limit. Please wait a moment and try again.";
          } else if (error.message.includes('timed out')) {
            errorMessage = "Generation took too long. The AI service may be busy. Please try again in a moment.";
          } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
            errorMessage = "Connection was interrupted during generation. Please try again - your internet may have briefly disconnected.";
          } else if (error.message.includes('No images')) {
            errorMessage = "No images were generated. Please try again.";
          } else {
            errorMessage = error.message || errorMessage;
          }
        }
        
        haptic.error();
        toast({
          title: isAuthError ? "Session expired" : "Failed to create cake",
          description: errorMessage,
          variant: "destructive",
        });
      }
      // ========== END NEW NATIVE LOVABLE AI SOLUTION ==========
    } catch (error) {
      // This catch block handles validation errors before generation starts
      console.error("Error in handleSubmit:", error);
      
      haptic.error();
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
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
        const { data: insertedImage, error: imageError } = await supabase
          .from("generated_images")
          .insert({
            user_id: user.id,
            image_url: permanentUrl,
            prompt: prompt,
            message: displayedMessage || null,
            message_type: useCustomMessage ? 'custom' : 'ai',
            recipient_name: recipientName.trim() || name.trim(), // Smart fallback to main name
            occasion_type: occasion || null,
            occasion_date: occasionDate || new Date().toISOString().split('T')[0], // Default to today for tracking
          })
          .select()
          .single();

        if (imageError) throw imageError;
        
        // Store the first saved image ID for party pack generation
        if (insertedImage && !savedCakeImageId) {
          setSavedCakeImageId(insertedImage.id);
        }
      }

      // Update generation tracking
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12
      
      // Update yearly tracking
      const { data: existingYearly } = await supabase
        .from("generation_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .is("month", null)
        .maybeSingle();

      if (existingYearly) {
        await supabase
          .from("generation_tracking")
          .update({ count: existingYearly.count + 1 })
          .eq("id", existingYearly.id);
        setGenerationCount(existingYearly.count + 1);
      } else {
        await supabase
          .from("generation_tracking")
          .insert({
            user_id: user.id,
            year: currentYear,
            month: null,
            count: 1,
          });
        setGenerationCount(1);
      }

      // Update monthly tracking (for free users)
      if (!isPremium) {
        const { data: existingMonthly } = await supabase
          .from("generation_tracking")
          .select("*")
          .eq("user_id", user.id)
          .eq("year", currentYear)
          .eq("month", currentMonth)
          .maybeSingle();

        if (existingMonthly) {
          await supabase
            .from("generation_tracking")
            .update({ count: existingMonthly.count + 1 })
            .eq("id", existingMonthly.id);
          setMonthlyGenerations(existingMonthly.count + 1);
        } else {
          await supabase
            .from("generation_tracking")
            .insert({
              user_id: user.id,
              year: currentYear,
              month: currentMonth,
              count: 1,
            });
          setMonthlyGenerations(1);
        }
      }

      // Update daily count
      setDailyGenerations(dailyGenerations + 1);
      setTotalGenerations(totalGenerations + 1);
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
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Load cake image first to calculate dynamic height
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Calculate cake dimensions - edge-to-edge
        const imgAspect = img.width / img.height;
        const maxWidth = 1080; // Full width
        const maxHeight = 950;
        let drawWidth = maxWidth;
        let drawHeight = maxWidth / imgAspect;
        
        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = maxHeight * imgAspect;
        }
        
        const topPadding = 0; // No top padding
        const gapAfterCake = 0; // No gap
        const messagePadding = 20;
        const lineHeight = 38;
        
        // Word wrap function
        const wrapText = (text: string, maxWidth: number) => {
          ctx.font = 'bold 30px Arial, sans-serif';
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
        
        // Calculate message dimensions
        const lines = wrapText(message, canvas.width - 80);
        const messageBoxHeight = (lines.length * lineHeight) + (messagePadding * 2);
        
        // Calculate total canvas height dynamically - no minimum
        const totalHeight = topPadding + drawHeight + gapAfterCake + messageBoxHeight;
        canvas.height = totalHeight;
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#fff1f2');
        gradient.addColorStop(1, '#fce7f3');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw cake image (centered)
        const x = (canvas.width - drawWidth) / 2;
        const y = topPadding;
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Draw message area - simple pink strip
        const messageY = y + drawHeight + gapAfterCake;
        
        // Pink strip behind message
        ctx.fillStyle = '#fce7f3';
        ctx.fillRect(0, messageY, canvas.width, messageBoxHeight);
        
        // Message text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 30px Arial, sans-serif';
        ctx.textAlign = 'center';
        
        const textStartY = messageY + messagePadding + lineHeight - 8;
        lines.forEach((line, i) => {
          ctx.fillText(line, canvas.width / 2, textStartY + (i * lineHeight));
        });
        
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
    haptic.medium(); // Haptic on download button
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
                  ? `${generationCount} / ${isAdmin ? ADMIN_GENERATION_LIMIT : PREMIUM_GENERATION_LIMIT} generations used this year`
                  : `${dailyGenerations}/${FREE_DAILY_LIMIT} today • ${monthlyGenerations}/${FREE_MONTHLY_LIMIT} this month`}
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
                    <MobileSelect
                      value={occasion}
                      onValueChange={setOccasion}
                      disabled={isLoading}
                      label="Select Occasion"
                      placeholder="Select occasion"
                      triggerClassName="bg-background border-border"
                      options={[
                        { value: "birthday", label: "Birthday" },
                        { value: "anniversary", label: "Anniversary" },
                        { value: "christmas", label: "Christmas" },
                        { value: "new-year", label: "New Year" },
                        { value: "graduation", label: "Graduation" },
                        { value: "wedding", label: "Wedding" },
                        { value: "celebration", label: "Celebration" },
                        { value: "farewell", label: "Farewell" },
                        { value: "congratulations", label: "Congratulations" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relation" className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Relation
                    </Label>
                    <MobileSelect
                      value={relation}
                      onValueChange={setRelation}
                      disabled={isLoading}
                      label="Select Relation"
                      placeholder="Select relation"
                      triggerClassName="bg-background border-border"
                      options={[
                        { value: "brother", label: "Brother" },
                        { value: "sister", label: "Sister" },
                        { value: "father", label: "Father" },
                        { value: "mother", label: "Mother" },
                        { value: "daughter", label: "Daughter" },
                        { value: "son", label: "Son" },
                        { value: "husband", label: "Husband" },
                        { value: "wife", label: "Wife" },
                        { value: "friend", label: "Friend" },
                        { value: "in-laws", label: "In-laws" },
                        { value: "partner", label: "Partner" },
                        { value: "colleague", label: "Colleague" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Gender
                    </Label>
                    <MobileSelect
                      value={gender}
                      onValueChange={setGender}
                      disabled={isLoading}
                      label="Select Gender"
                      placeholder="Select gender"
                      triggerClassName="bg-background border-border"
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="character" className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Character
                    </Label>
                    <CharacterPicker
                      value={character}
                      onValueChange={setCharacter}
                      isPremium={isPremium}
                      disabled={isLoading}
                      onPremiumBlock={() => {
                        toast({
                          title: "Premium character",
                          description: "This character requires Premium. Upgrade to unlock!",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>

                  {/* Cake Style Info - Show when character is selected (both styles will be generated) */}
                  {character && (
                    <div className="col-span-full mt-4 p-4 bg-gradient-to-r from-party-purple/10 to-party-coral/10 rounded-lg border border-party-purple/30">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-party-purple to-party-pink rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            Both Cake Styles Included!
                            <Crown className="w-4 h-4 text-gold" />
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            You'll get <strong>4 images</strong>: 3 decorated cake views + 1 character-shaped cake
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Decorated Cake Icon */}
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-party-pink">
                              <rect x="4" y="14" width="16" height="6" rx="1" fill="currentColor" opacity="0.4" />
                              <rect x="6" y="8" width="12" height="6" rx="1" fill="currentColor" opacity="0.6" />
                              <rect x="8" y="3" width="8" height="5" rx="1" fill="currentColor" />
                            </svg>
                            <span className="text-sm font-medium">Decorated (3 views)</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Front, Side, Top-Down</p>
                        </div>
                        <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Sculpted Cake Icon */}
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-party-coral">
                              <ellipse cx="12" cy="16" rx="8" ry="4" fill="currentColor" opacity="0.4" />
                              <ellipse cx="12" cy="10" rx="6" ry="8" fill="currentColor" opacity="0.6" />
                              <circle cx="12" cy="6" r="4" fill="currentColor" />
                            </svg>
                            <span className="text-sm font-medium">Character-Shaped (1 view)</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Full sculpted cake</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Upload Section */}
                <div className="mt-6 p-5 border-t border-border/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-party-coral to-party-mint rounded-full flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        📸 Add Your Photo to the Cake (Optional)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Upload a photo and it will automatically be placed on the Top-Down View of your cake! Perfect for edible photo prints.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a photo and it will automatically be placed on the Top-Down View!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {userPhotoPreview && (
                      <div className="relative w-32 h-32 mx-auto">
                        <img
                          src={userPhotoPreview}
                          alt="Your photo preview"
                          className="w-full h-full object-cover rounded-lg border-2 border-party-coral/50"
                        />
                        <button
                          onClick={() => {
                            setUserPhotoForCake(null);
                            setUserPhotoPreview(null);
                            haptic.light();
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;

                            // Validate file type
                            if (!file.type.startsWith('image/')) {
                              toast({
                                title: "Invalid file type",
                                description: "Please upload an image file (JPG, PNG, etc.)",
                                variant: "destructive",
                              });
                              return;
                            }

                            // Validate file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              toast({
                                title: "File too large",
                                description: "Please upload an image under 10MB",
                                variant: "destructive",
                              });
                              return;
                            }

                            setUserPhotoForCake(file);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setUserPhotoPreview(e.target?.result as string);
                              haptic.success();
                            };
                            reader.readAsDataURL(file);
                          };
                          input.click();
                        }}
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {userPhotoPreview ? "Change Photo" : "Upload Photo"}
                      </Button>
                    </div>

                    {userPhotoPreview && (
                      <p className="text-xs text-center text-party-coral font-medium animate-pulse">
                        ✨ Your photo will be automatically added to the Top-Down View after generation!
                      </p>
                    )}
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
                  <Label htmlFor="layers" className="text-sm font-medium flex items-center gap-2">
                    Layers
                    {cakeStyle === "sculpted" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Layers don't apply to character-shaped cakes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Label>
                  <Select 
                    value={layers} 
                    onValueChange={setLayers} 
                    disabled={isLoading || cakeStyle === "sculpted"}
                  >
                    <SelectTrigger className={`bg-background border-border ${cakeStyle === "sculpted" ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <SelectValue placeholder={cakeStyle === "sculpted" ? "N/A for sculpted cakes" : "Select layers"} />
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

            {/* Save as Memory - Who is this for & Occasion Date */}
            <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">Save as a Memory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-muted-foreground">Remember who this cake was for</p>
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
                  <p className="text-xs text-muted-foreground">Get reminders for future celebrations</p>
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
                <div className="flex items-center gap-3 p-3 bg-gradient-celebration/20 rounded-lg border border-party-purple/20">
                  <span className="text-3xl animate-bounce">🎉</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-semibold flex items-center gap-2">
                      ✨ AI Magic Activated!
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our AI will craft a heartfelt, personalized message just for <span className="font-semibold text-party-pink">{name || "your special someone"}</span>! 
                      Based on the occasion, relationship & more - it'll feel like YOU wrote it! 💝
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Login Required Banner - shown when user is not logged in */}
            {!isLoggedIn && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg animate-pulse">
                <div className="flex-shrink-0">
                  <LogIn className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    🔐 Log in to create your cake!
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Create an account to save your cakes and access them anytime
                  </p>
                </div>
                <Link to="/auth">
                  <Button type="button" variant="outline" size="sm" className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50">
                    Log in
                  </Button>
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !isLoggedIn || !name.trim() || !occasion || !relation || !gender}
              className={`w-full py-6 text-lg font-bold transition-all duration-300 ${
                !isLoggedIn 
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              🎂 Creating your magical cake...
            </div>
          ) : !isLoggedIn ? (
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              🔐 Free Sign Up Required to Generate
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
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">🎂 Crafting Your Magical Cake ✨</h3>
              <p className="text-foreground/80 text-lg">Creating the perfect celebration cake for {name}... 🎉</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto space-y-2">
              <Progress value={generationProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">{generationStep || "Starting..."}</p>
              <p className="text-xs text-muted-foreground">{generationProgress}%</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="animate-bounce">🎈</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎊</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
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

              {/* Check if we're in dual-style mode (4 images with character) */}
              {generatedImages.length === 4 && character ? (
                // Dual-style mode: Show grouped sections
                <div className="space-y-6">
                  {/* Decorated Style Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-party-pink">
                        <rect x="4" y="14" width="16" height="6" rx="1" fill="currentColor" opacity="0.4" />
                        <rect x="6" y="8" width="12" height="6" rx="1" fill="currentColor" opacity="0.6" />
                        <rect x="8" y="3" width="8" height="5" rx="1" fill="currentColor" />
                      </svg>
                      <h4 className="font-semibold text-foreground">Decorated Style</h4>
                      <span className="text-xs text-muted-foreground">(3 views)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {generatedImages.slice(0, 3).map((imageUrl, index) => (
                        <div
                          key={index}
                          className={`relative rounded-lg border-4 overflow-visible transition-all duration-300 group ${
                            selectedImages.has(index)
                              ? "border-party-pink shadow-lg shadow-party-pink/50"
                              : "border-border hover:border-party-purple/50"
                          }`}
                        >
                          <div
                            onClick={() => {
                              haptic.light();
                              setPreviewImageIndex(index);
                            }}
                            className="cursor-pointer hover:opacity-90 transition-opacity aspect-square overflow-hidden"
                          >
                            <img
                              src={imageUrl || '/placeholder.svg'}
                              alt={`Cake ${["Front View", "Side View", "Top-Down View"][index]}`}
                              className="w-full h-full object-cover rounded-lg"
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
                              haptic.light();
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
                            {["Front View", "Side View", "Top-Down View"][index]}
                          </div>
                          
                          {/* Regenerate View Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegenerateView(index);
                            }}
                            disabled={regeneratingView !== null}
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {regeneratingView === index ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                Regenerating...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Regenerate
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sculpted Style Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-party-coral">
                        <ellipse cx="12" cy="16" rx="8" ry="4" fill="currentColor" opacity="0.4" />
                        <ellipse cx="12" cy="10" rx="6" ry="8" fill="currentColor" opacity="0.6" />
                        <circle cx="12" cy="6" r="4" fill="currentColor" />
                      </svg>
                      <h4 className="font-semibold text-foreground">Character-Shaped Cake</h4>
                      <span className="text-xs text-muted-foreground">(1 view)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                      <div
                        className={`relative rounded-lg border-4 overflow-visible transition-all duration-300 group ${
                          selectedImages.has(3)
                            ? "border-party-coral shadow-lg shadow-party-coral/50"
                            : "border-border hover:border-party-purple/50"
                        }`}
                      >
                        <div
                          onClick={() => {
                            haptic.light();
                            setPreviewImageIndex(3);
                          }}
                          className="cursor-pointer hover:opacity-90 transition-opacity aspect-square overflow-hidden"
                        >
                          <img
                            src={generatedImages[3] || '/placeholder.svg'}
                            alt="Character-Shaped Cake"
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              console.error('Failed to load image:', generatedImages[3]);
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        
                        {/* Selection Checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            haptic.light();
                            const newSelected = new Set(selectedImages);
                            if (newSelected.has(3)) {
                              newSelected.delete(3);
                            } else {
                              newSelected.add(3);
                            }
                            setSelectedImages(newSelected);
                          }}
                          className="absolute top-2 right-2 cursor-pointer"
                        >
                          <div className={`rounded-full p-1.5 shadow-lg transition-all ${
                            selectedImages.has(3)
                              ? "bg-party-coral text-white"
                              : "bg-white/80 text-gray-600 hover:bg-white"
                          }`}>
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                        
                        {/* View Label */}
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-party-coral to-party-pink text-white px-2 py-1 rounded text-xs font-medium">
                          ✨ Character-Shaped
                        </div>
                        
                        {/* Regenerate View Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegenerateView(3);
                          }}
                          disabled={regeneratingView !== null}
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {regeneratingView === 3 ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Standard mode: Single grid
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`relative rounded-lg border-4 overflow-visible transition-all duration-300 group ${
                        selectedImages.has(index)
                          ? "border-party-pink shadow-lg shadow-party-pink/50"
                          : "border-border hover:border-party-purple/50"
                      }`}
                    >
                      <div
                        onClick={() => {
                          haptic.light();
                          setPreviewImageIndex(index);
                        }}
                        className="cursor-pointer hover:opacity-90 transition-opacity aspect-square overflow-hidden"
                      >
                        <img
                          src={imageUrl || '/placeholder.svg'}
                          alt={`Cake ${["Front View", "Side View", "Top-Down View", "3/4 View"][index]}`}
                          className="w-full h-full object-cover rounded-lg"
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
                          haptic.light();
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
                        {cakeStyle === "sculpted" 
                          ? (["Main View", "Top-Down View"][index] || `View ${index + 1}`)
                          : (["Front View", "Side View", "Top-Down View", "3/4 View (Diagonal)"][index] || `View ${index + 1}`)
                        }
                      </div>
                      
                      {/* Regenerate View Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateView(index);
                        }}
                        disabled={regeneratingView !== null}
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {regeneratingView === index ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Click images to preview • Click checkmark to select for download/share
              </p>
            </div>
          </Card>

          {/* Customization Card - Only show if photo was uploaded */}
          {userPhotoPreview && (
            <Card className="p-6 bg-gradient-to-r from-party-coral/20 via-party-mint/20 to-party-purple/10 border-2 border-party-coral/30 shadow-party">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                    ✨ Customize Your Cake
                    <span className="inline-block animate-sparkle">🎨</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust your photo placement on the top-down view
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-party-coral/10 to-party-mint/10 p-4 rounded-lg border-2 border-party-coral/20 space-y-3 max-w-md">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-party-coral to-party-mint rounded-full flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Edit Photo Position</h4>
                        <p className="text-xs text-muted-foreground">Adjust photo on Top-Down View</p>
                      </div>
                    </div>

                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-party-coral">🎯</span>
                        <span><strong>Position</strong> anywhere on cake</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-party-mint">📐</span>
                        <span><strong>Resize</strong> to perfect size</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gold">🔄</span>
                        <span><strong>Rotate</strong> for best angle</span>
                      </li>
                    </ul>

                    <Button
                      onClick={() => {
                        setEditingPhotoOnCakeIndex(2);
                        setPhotoPosition(FALLBACK_PHOTO_POSITIONS.top);
                        haptic.light();
                      }}
                      className="w-full bg-gradient-to-r from-party-coral to-party-mint hover:from-party-coral/90 hover:to-party-mint/90"
                      size="sm"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Edit Photo on Top-Down View
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

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
                        if (isSavingToGallery) return; // Prevent double-clicks
                        
                        if (selectedImages.size === 0) {
                          toast({
                            title: "No images selected",
                            description: "Please select at least one image to save",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        setIsSavingToGallery(true);
                        haptic.medium();
                        
                        toast({
                          title: "💾 Saving to Gallery...",
                          description: "Please wait while we save your cakes",
                        });
                        
                        const selectedUrls = Array.from(selectedImages).map(i => generatedImages[i]);
                        await saveGeneratedImage(selectedUrls);
                        
                        setIsSavingToGallery(false);
                        haptic.success();
                        
                        toast({
                          title: "🎉 Woohoo! Saved to Your Gallery!",
                          description: `${selectedImages.size} stunning cake${selectedImages.size > 1 ? 's' : ''} saved! ✨ Want to show off? Head to Gallery → Click the ⭐ star to feature your masterpiece on our HOMEPAGE!`,
                          className: "bg-gradient-to-r from-party-purple via-party-pink to-party-orange border-2 border-party-gold text-white shadow-2xl",
                        });
                      }}
                      disabled={selectedImages.size === 0 || isSavingToGallery}
                      className="w-full py-6 bg-party-purple hover:bg-party-purple/90 transition-all duration-300 text-white font-semibold"
                    >
                      {isSavingToGallery ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save to Gallery {selectedImages.size > 0 ? `(${selectedImages.size})` : ""}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      💡 Saved images can be starred ⭐ in your gallery to feature on our homepage!
                    </p>
                  </div>
                )}

                {/* Party Pack Generator - Show after saving to gallery */}
                {isLoggedIn && savedCakeImageId && (
                  <div className="pt-4 border-t border-muted">
                    <div className="space-y-2 mb-4 text-center">
                      <h4 className="font-semibold text-foreground flex items-center justify-center gap-2">
                        🎁 Want the Complete Party Experience?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Generate matching invitations, thank you cards, banner, cake topper & place cards!
                      </p>
                    </div>
                    <PartyPackGenerator
                      cakeImageId={savedCakeImageId}
                      name={name}
                      occasion={occasion}
                      theme={theme}
                      colors={colors}
                      character={character}
                    />
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

      {/* Image Preview Dialog with Swipeable Gallery */}
      <Dialog open={previewImageIndex !== null} onOpenChange={(open) => !open && setPreviewImageIndex(null)}>
        <DialogContent className="max-w-4xl w-full p-0 h-[90vh]">
          {previewImageIndex !== null && (
            <SwipeableImagePreview
              images={generatedImages}
              initialIndex={previewImageIndex}
              onClose={() => setPreviewImageIndex(null)}
            />
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

      {/* Photo Editor Modal */}
      {editingPhotoOnCakeIndex !== null && userPhotoPreview && (
        <PhotoEditor
          cakeImageUrl={originalImages[editingPhotoOnCakeIndex] || generatedImages[editingPhotoOnCakeIndex]}
          userPhotoUrl={userPhotoPreview}
          initialPosition={photoPosition || FALLBACK_PHOTO_POSITIONS.top}
          onSave={(processedImageUrl) => {
            const newImages = [...generatedImages];
            newImages[editingPhotoOnCakeIndex] = processedImageUrl;
            setGeneratedImages(newImages);
            setEditingPhotoOnCakeIndex(null);
            toast({
              title: "Photo updated!",
              description: "Your photo placement has been updated.",
            });
          }}
          onCancel={() => setEditingPhotoOnCakeIndex(null)}
        />
      )}
    </div>
  );
};