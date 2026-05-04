import React, { Suspense, lazy, useEffect, useState, useMemo } from "react";
import { useGeoContext } from "@/contexts/GeoContext";
import { DeferredMount } from "@/components/DeferredMount";

// Lazy load CakeCreator for better initial page performance
const CakeCreator = lazy(() => import("@/components/CakeCreator").then(mod => ({ default: mod.CakeCreator })));

// Defer non-critical widgets — they don't need to block first paint / LCP
const ExitIntentModal = lazy(() => import("@/components/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const LiveActivityFeed = lazy(() => import("@/components/LiveActivityFeed").then(m => ({ default: m.LiveActivityFeed })));
const LivePurchaseNotifications = lazy(() => import("@/components/LivePurchaseNotifications").then(m => ({ default: m.LivePurchaseNotifications })));
const FeedbackWidget = lazy(() => import("@/components/FeedbackWidget").then(m => ({ default: m.FeedbackWidget })));
const FloatingEmojis = lazy(() => import("@/components/FloatingEmojis").then(m => ({ default: m.FloatingEmojis })));
const ConfettiRain = lazy(() => import("@/components/ConfettiRain").then(m => ({ default: m.ConfettiRain })));

import { UrgencyBanner } from "@/components/UrgencyBanner";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/config/adSlots";
import { CandleRow } from "@/components/CandleRow";
// Temporarily disabled CursorSparkles to fix blank page issue
// import { CursorSparkles } from "@/components/CursorSparkles";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import celebrationCake from "@/assets/celebration-cake.jpg";
// heroCake.jpg removed — hero now served from /public/hero-cake.webp for fast LCP
import { HeroCakeWithFlames } from "@/components/HeroCakeWithFlames";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Star, Download, Menu, MessageSquare } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Helmet } from "react-helmet-async";
import { OrganizationSchema, WebSiteSchema, ProductReviewSchema, SoftwareApplicationSchema, HowToSchema, FAQSchema, BreadcrumbSchema } from "@/components/SEOSchema";
import { PopularCakesSection } from "@/components/PopularCakesSection";
import { CakeWall } from "@/components/CakeWall";
import { HomepageFAQ, HOMEPAGE_FAQS } from "@/components/HomepageFAQ";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useDynamicCakeCount } from "@/hooks/useDynamicCakeCount";

// Lazy load TrustBadges to prevent render blocking
// Lazy load TrustBadges - disabled for now to fix blank screen
// const TrustBadges = lazy(() => import("@/components/TrustBadges").then(mod => ({ default: mod.TrustBadges })));

const Index = () => {
  const navigate = useNavigate();
  const { detectedCountry } = useGeoContext();
  
  // Dynamic pricing based on detected country
  const countryPricing = useMemo(() => {
    const pricing: Record<string, { lifetime: string; tagline: string; code: string }> = {
      IN: { lifetime: '₹2,999', tagline: 'Monthly and Yearly options also available', code: 'IN' },
      GB: { lifetime: '£49', tagline: 'Monthly and Yearly options also available', code: 'GB' },
      CA: { lifetime: 'C$69', tagline: 'Monthly and Yearly options also available', code: 'CA' },
      AU: { lifetime: 'A$79', tagline: 'Monthly and Yearly options also available', code: 'AU' },
    };
    return pricing[detectedCountry || ''] || { lifetime: '$49', tagline: 'Monthly and Yearly options also available', code: 'US' };
  }, [detectedCountry]);
  
  // Call hooks at top level (React Rules of Hooks)
  const dynamicCakeCount = useDynamicCakeCount();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(48); // Default estimate
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Track page visits
  usePageTracking('/', 'US');

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
    checkAuth();
    // Defer featured cakes fetch so it doesn't compete with LCP image network
    const ric: any = (window as any).requestIdleCallback;
    let idleHandle: any;
    let timeoutHandle: any;
    if (typeof ric === "function") {
      idleHandle = ric(() => loadFeaturedCakes(), { timeout: 2500 });
    } else {
      timeoutHandle = setTimeout(() => loadFeaturedCakes(), 800);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        checkAuth();
      } else {
        setIsAdmin(false);
        setIsPremium(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      const cic: any = (window as any).cancelIdleCallback;
      if (idleHandle && typeof cic === "function") cic(idleHandle);
      if (timeoutHandle) clearTimeout(timeoutHandle);
    };
  }, []);

  const loadFeaturedCakes = async () => {
    try {
      // SECURITY: Query from secure view that only exposes safe columns
      const { data, error } = await supabase
        .from("public_featured_images" as any)
        .select("id, image_url, created_at, occasion_type")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      
      console.log("Featured cakes loaded:", data?.length || 0, "cakes");
      
      if (data && data.length > 0) {
        // Map to expected format with descriptive, SEO-friendly alt text
        setFeaturedCakes(data.map((item: any) => ({
          image_url: item.image_url,
          prompt: `Personalized ${item.occasion_type || 'celebration'} cake design — AI generated by Cake AI Artist`
        })));
      }
    } catch (error) {
      console.error("Error loading featured cakes:", error);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setIsPremium(profile.is_premium);
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!roleData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const handleDownloadCarouselImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cake-design-${prompt.slice(0, 20).replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-celebration relative overflow-hidden">
      <Helmet>
        <title>AI Cake Generator — Free AI Cake Designer & Birthday Cakes</title>
        <meta name="description" content="Free AI cake generator. Design personalized AI birthday cakes, anniversary & wedding cakes in 30 seconds. The best AI cake designer online." />
        <meta name="keywords" content="cake ai, ai cake, ai cakes, ai cake generator, ai cake generator free, cake generator, birthday cake ai, ai birthday cakes, ai cake designer, ai cake design, best ai cake designer, personalized birthday cake, custom cake design, anniversary cake design, wedding cake ai, baby shower cake, diwali cake, virtual cake maker, online cake design tool" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="application-name" content="Cake AI Artist" />
        <link rel="canonical" href="https://cakeaiartist.com/" />
        <meta property="og:title" content="AI Cake Generator — Free AI Cake Designer & Birthday Cakes" />
        <meta property="og:description" content="Free AI cake generator. Design personalized AI birthday cakes for birthdays, anniversaries & weddings in 30 seconds. The best AI cake designer online." />
        <meta property="og:url" content="https://cakeaiartist.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:image:alt" content="AI cake generator result — personalized birthday cake by Cake AI Artist" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Cake Generator — Free AI Cake Designer" />
        <meta name="twitter:description" content="Free AI cake generator. Design AI birthday cakes & personalized celebration cakes in 30 seconds." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta name="twitter:image:alt" content="AI cake generator result — personalized birthday cake by Cake AI Artist" />
      </Helmet>
      
      <OrganizationSchema 
        name="Cake AI Artist"
        url="https://cakeaiartist.com"
        description="Best AI cake designer for personalized birthday, anniversary and celebration cakes. Design custom cakes in 30 seconds."
      />
      
      <WebSiteSchema 
        name="Cake AI Artist"
        url="https://cakeaiartist.com"
      />
      
      <SoftwareApplicationSchema />

      <FAQSchema faqs={HOMEPAGE_FAQS.map(f => ({ question: f.question, answer: f.answer }))} />

      <BreadcrumbSchema items={[{ name: "Home", url: "https://cakeaiartist.com/" }]} />
      
      <ProductReviewSchema
        itemName="Cake AI Artist - AI Cake Designer"
        description="AI-powered personalized cake design platform"
        url="https://cakeaiartist.com"
        ratingValue={4.9}
        ratingCount={847}
        reviewCount={847}
        reviews={[
          {
            author: "Sarah M.",
            reviewBody: "Absolutely love this tool! Created the perfect birthday cake design for my daughter in minutes. The AI suggestions were spot on!",
            ratingValue: 5,
            datePublished: "2024-11-15"
          },
          {
            author: "Michael T.",
            reviewBody: "Game changer for party planning. The party pack feature saved me hours of design work. Highly recommend!",
            ratingValue: 5,
            datePublished: "2024-11-28"
          },
          {
            author: "Jessica L.",
            reviewBody: "Beautiful cake designs every time. The character options are fantastic and my kids love seeing their favorite characters on their cakes!",
            ratingValue: 5,
            datePublished: "2024-12-01"
          },
          {
            author: "David R.",
            reviewBody: "Worth every penny! The lifetime deal was a no-brainer. Already created cakes for multiple family events.",
            ratingValue: 5,
            datePublished: "2024-12-05"
          }
        ]}
      />
      
      <HowToSchema
        name="How to Create a Personalized Cake with AI"
        description="Create a beautiful personalized cake design in 30 seconds using our AI cake generator"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Enter the recipient's name", text: "Type the name you want on the cake" },
          { name: "Choose the occasion", text: "Select birthday, anniversary, wedding, or other celebration" },
          { name: "Customize your design", text: "Pick colors, layers, themes, and optionally add a character" },
          { name: "Generate your cake", text: "Click generate and wait 30 seconds for your AI-designed cake" },
          { name: "Download and share", text: "Download your high-resolution cake image or share to social media" },
        ]}
      />
      
      {/* All decorative + non-LCP-critical widgets are mounted after first paint */}
      <DeferredMount>
        <Suspense fallback={null}>
          <FloatingEmojis />
          <ConfettiRain count={14} />
          <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} />
          <LiveActivityFeed />
          <LivePurchaseNotifications />
          <FeedbackWidget externalOpen={feedbackOpen} onExternalOpenChange={setFeedbackOpen} />
        </Suspense>
      </DeferredMount>

      <UrgencyBanner onVisibilityChange={setIsBannerVisible} onHeightChange={setBannerHeight} countryCode="US" />
      
      {/* Navigation Header */}
      <nav className="sticky z-40 bg-gradient-to-b from-party-pink/10 via-background/95 to-background backdrop-blur-md transition-all duration-300" style={{ top: isBannerVisible ? `${bannerHeight}px` : '0px' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_hsl(var(--party-pink)/0.4)]">
              <img src="/logo.png" alt="Cake AI Artist" width={40} height={40} className="w-10 h-10 rounded-lg" loading="eager" decoding="async" />
              <span>Cake AI Artist</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-2 items-center">
              <Link to="/how-it-works"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">How It Works</Button></Link>
              <Link to="/party-planner">
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-purple/10 gap-1.5">
                  Party Planner
                  <span className="bg-gradient-to-r from-party-purple to-party-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">PREMIUM</span>
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="relative text-foreground/80 hover:text-foreground hover:bg-party-pink/10">
                  Pricing
                  <span className="absolute -top-1 -right-1 bg-gradient-party text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    🔥
                  </span>
                </Button>
              </Link>
              <Link to="/use-cases"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Examples</Button></Link>
              <Link to="/community"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Community</Button></Link>
              <Link to="/blog"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Blog</Button></Link>
              <Link to="/faq"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">FAQ</Button></Link>
              {isLoggedIn && <Button onClick={() => navigate("/gallery")} variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">My Gallery</Button>}
              {isLoggedIn && <Button onClick={() => navigate("/settings")} variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Settings</Button>}
              {isAdmin && <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="text-party-gold hover:text-party-gold/80 hover:bg-party-gold/10">Admin</Button>}
              {isLoggedIn ? (
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-party-pink/30 hover:bg-party-pink/10">Logout</Button>
              ) : (
                <Button onClick={() => navigate("/auth")} size="sm" className="bg-gradient-party hover:opacity-90 text-white border-0">Sign In</Button>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-party-pink/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background/95 backdrop-blur-md border-l border-party-pink/20">
                <div className="flex items-center gap-2 mb-6">
                  <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
                  <span className="text-lg font-bold text-party-pink">Cake AI Artist</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/how-it-works">
                    <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">How It Works</Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="ghost" className="w-full justify-start relative text-foreground/80 hover:text-foreground hover:bg-party-pink/10">
                      Pricing
                      <span className="ml-2 bg-gradient-party text-white text-xs px-2 py-0.5 rounded-full">🔥 Sale</span>
                    </Button>
                  </Link>
                  <Link to="/use-cases">
                    <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Examples</Button>
                  </Link>
                  <Link to="/community">
                    <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Community</Button>
                  </Link>
                  <Link to="/blog">
                    <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Blog</Button>
                  </Link>
                  <Link to="/faq">
                    <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">FAQ</Button>
                  </Link>
                  
                  {isLoggedIn && (
                    <>
                      <div className="border-t border-party-pink/20 my-2" />
                      <Button onClick={() => navigate("/gallery")} variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">My Gallery</Button>
                      <Button onClick={() => navigate("/settings")} variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Settings</Button>
                    </>
                  )}
                  
                  {isAdmin && (
                    <Button onClick={() => navigate("/admin")} variant="ghost" className="w-full justify-start text-party-gold hover:text-party-gold/80 hover:bg-party-gold/10">Admin Dashboard</Button>
                  )}
                  
                  <div className="border-t border-party-pink/20 my-2" />
                  
                  <Button 
                    onClick={() => setFeedbackOpen(true)} 
                    variant="ghost" 
                    className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Feedback
                  </Button>
                  
                  <div className="border-t border-party-pink/20 my-2" />
                  
                  {isLoggedIn ? (
                    <Button onClick={handleLogout} variant="outline" className="w-full border-party-pink/30 hover:bg-party-pink/10">Logout</Button>
                  ) : (
                    <Button onClick={() => navigate("/auth")} className="w-full bg-gradient-party hover:opacity-90 text-white border-0">Sign In</Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium / Elegant */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface via-background to-party-pink/5">
        {/* Decorative blurred gold orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] rounded-full bg-party-pink/15 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 py-12 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1 text-center md:text-left"
            >
              

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-surface-elevated/60 backdrop-blur-sm mb-6">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
                  AI Cake Design Studio
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                The Best{" "}
                <span className="bg-gradient-gold bg-clip-text text-transparent">
                  AI Cake Generator & Designer
                </span>{" "}
                for Personalized Birthday Cakes
              </h1>

              <p className="mt-5 md:mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
                Birthdays, anniversaries, weddings, baby showers, Diwali, retirements — our AI cake generator designs personalized AI cakes in 30 seconds. Just type a name, pick the occasion, and get a stunning birthday cake AI design you can share, save, or take to your local baker.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-gold hover:shadow-gold text-base md:text-lg px-7 py-6 font-semibold btn-shimmer"
                  onClick={() => {
                    const el = document.getElementById('creator');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Design Your Cake Free →
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-gold hover:shadow-gold text-base md:text-lg px-7 py-6 font-semibold"
                  onClick={() => navigate('/community')}
                >
                  See examples
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <span className="font-semibold text-foreground">4.9</span>
                <span>·</span>
                <span>{Math.max(dynamicCakeCount, 100).toLocaleString()}+ cakes designed</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">No signup to start</span>
              </div>
            </motion.div>

            {/* Right: cake wall — proof of breadth & quality */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="order-1 md:order-2 relative mx-auto w-full max-w-md md:max-w-none"
            >
              <CakeWall cakeCount={Math.max(dynamicCakeCount, 5000)} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Creator Section - Moved Up for mobile */}
      <div id="creator" className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">Try the Best Personalized Cake Designer — Free</h2>
            <p className="text-sm md:text-xl text-muted-foreground">Takes about 30 seconds. No credit card needed to start.</p>
          </div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-muted-foreground">Loading cake creator...</div>}>
            <CakeCreator />
          </Suspense>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-party opacity-30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
            <img
              src={celebrationCake}
              alt="Beautiful personalized celebration cake designed by AI"
              className="relative w-full h-80 md:h-96 object-contain rounded-2xl shadow-party transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground">
              Beautiful Personalized Cakes, Designed by AI in 30 Seconds
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Here&apos;s the thing about celebrations—they&apos;re only as special as the thought you put into them. 
              But when you&apos;re juggling everything else, who has three hours to browse stock photos? 
              That&apos;s where we come in. Get gorgeous, personalized cake designs in the time it takes to make coffee.
            </p>
            <Button
              size="lg"
              className="bg-gradient-party hover:opacity-90 text-white font-bold px-8 py-6 text-lg"
              onClick={() => {
                const creatorEl = document.getElementById('creator');
                if (creatorEl) {
                  const headerOffset = 80;
                  const elementPosition = creatorEl.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              🎂 Start Creating Your Cake Now
            </Button>
          </div>
        </div>
      </div>

      {/* (Creator section moved above Feature Highlight) */}

      {/* Why Choose Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Why People Call Us the Best AI Cake Generator & Cake AI Tool</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: "🎨",
              title: "Actually Looks Good",
              desc: "Not your typical AI slop. These cakes look like something you'd actually want to share."
            },
            {
              icon: "💝",
              title: "Genuinely Personal",
              desc: "AI that understands your grandma's birthday needs different vibes than your buddy's 21st."
            },
            {
              icon: "⚡",
              title: "Stupid Fast",
              desc: "Four unique designs in 20 seconds. Yes, we timed it. Multiple times. We're nerds."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="text-center group"
            >
              <div className="text-5xl mb-4 icon-hover-glow">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Party Pack Feature Highlight */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-party-purple/20 via-party-pink/20 to-party-gold/20 rounded-2xl p-8 border-2 border-party-purple/30"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="text-4xl">🎁</span>
                NEW: Party Pack Generator
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Transform your cake design into a <strong>complete celebration kit</strong>! Generate matching invitations, 
                banners, thank you cards, cake toppers, and place cards—all with one click.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-party-purple text-white flex items-center justify-center text-sm font-bold">✓</span>
                  Add your event date, time & location
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-party-pink text-white flex items-center justify-center text-sm font-bold">✓</span>
                  Preview all items before downloading
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-party-gold text-background flex items-center justify-center text-sm font-bold">✓</span>
                  Download as print-ready PDF
                </li>
              </ul>
              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate("/how-it-works")} 
                  variant="outline"
                  className="border-party-purple text-party-purple hover:bg-party-purple/10"
                >
                  Learn How It Works
                </Button>
                {isLoggedIn && (
                  <Button 
                    onClick={() => navigate("/gallery")}
                    className="btn-shimmer bg-gradient-to-r from-party-purple to-party-pink text-white"
                  >
                    Try Party Pack Now
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-purple/20">
                <span className="text-3xl mb-2 block">💌</span>
                <p className="font-semibold text-foreground">Invitations</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-pink/20">
                <span className="text-3xl mb-2 block">🎊</span>
                <p className="font-semibold text-foreground">Banners</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-gold/20">
                <span className="text-3xl mb-2 block">💝</span>
                <p className="font-semibold text-foreground">Thank You Cards</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-coral/20">
                <span className="text-3xl mb-2 block">🎂</span>
                <p className="font-semibold text-foreground">Cake Toppers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cake Carousel */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <CandleRow count={7} size="md" className="mb-6" />
          <h2 className="text-4xl font-bold text-foreground mb-4">
            1,000s of AI-Designed Cakes for Every Occasion
          </h2>
          <p className="text-xl text-muted-foreground mb-2">
            Real cakes made by real people. Yours could be here next!
          </p>
          <p className="inline-block text-base font-bold bg-gradient-to-r from-party-purple/20 via-party-pink/20 to-party-gold/20 px-4 py-2 rounded-full border border-party-gold/40 text-foreground animate-sparkle">
            ⭐ Create an account and star your favorite designs to feature them here
          </p>
        </div>
        <Carousel 
          className="w-full max-w-5xl mx-auto"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
        >
          <CarouselContent>
            {featuredCakes.length > 0 ? (
              featuredCakes.map((cake, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div 
                      className="relative group overflow-hidden rounded-xl border-2 border-gold/30 hover:border-gold transition-all cursor-pointer"
                      onClick={() => setSelectedCarouselImage(cake)}
                    >
                      <img
                        src={resolveImageUrl(cake.image_url)}
                        alt={cake.prompt ? `Personalized AI-designed cake — ${cake.prompt}` : "Personalized AI-designed celebration cake by Cake AI Artist user"}
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <p className="text-white text-sm font-semibold">Click to view</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))
            ) : (
              <>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-party-pink/30 hover:border-party-pink transition-all">
                      <img
                        src={featuredCake1}
                        alt="Elegant birthday cake with roses"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4">
                        <p className="text-sm font-semibold text-foreground">Elegant Birthday Cake</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-party-purple/30 hover:border-party-purple transition-all">
                      <img
                        src={featuredCake2}
                        alt="Anniversary cake with lace patterns"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4">
                        <p className="text-sm font-semibold text-foreground">Romantic Anniversary</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-gold/30 hover:border-gold transition-all">
                      <img
                        src={featuredCake3}
                        alt="Spider-Man superhero cake"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4">
                        <p className="text-sm font-semibold text-foreground">Superhero Birthday</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-party-pink/30 hover:border-party-pink transition-all">
                      <img
                        src={featuredCake4}
                        alt="Princess castle cake"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4">
                        <p className="text-sm font-semibold text-foreground">Princess Dream Cake</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-party-purple/30 hover:border-party-purple transition-all">
                      <img
                        src={featuredCake5}
                        alt="Chocolate celebration cake"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4">
                        <p className="text-sm font-semibold text-foreground">Luxury Chocolate</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={!!selectedCarouselImage} onOpenChange={() => setSelectedCarouselImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedCarouselImage && (
            <div className="space-y-4">
              <img 
                src={resolveImageUrl(selectedCarouselImage.image_url)} 
                alt={selectedCarouselImage.prompt ? `Personalized AI cake — ${selectedCarouselImage.prompt}` : "Personalized AI-designed celebration cake from Cake AI Artist community"}
                className="w-full h-auto rounded-lg"
              />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  A beautiful cake creation from our community
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleDownloadCarouselImage(selectedCarouselImage.image_url, selectedCarouselImage.prompt)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCarouselImage(null);
                      navigate('#creator');
                    }}
                    className="flex-1"
                  >
                    Create Similar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Real Testimonials - Carousel */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          Why People Call Us the Best AI Cake Generator & AI Cake Designer
        </h2>
        <Carousel 
          className="w-full max-w-5xl mx-auto mb-12"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 30000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
        >
          <CarouselContent>
            {[
              {
                quote: "I was literally googling 'birthday cake images' at 2 AM when I found this. Saved my butt. Five stars.",
                author: "Sarah M.",
                role: "Perpetual Last-Minute Planner",
                location: "🇺🇸 Texas, USA",
                rating: 5
              },
              {
                quote: "My daughter saw her name on the cake and her face lit up. That's all that matters, isn't it?",
                author: "James K.",
                role: "Dad of Two",
                location: "🇬🇧 Manchester, UK",
                rating: 5
              },
              {
                quote: "As a party planner in Sydney, this tool saves me hours every week. My clients absolutely love the designs!",
                author: "Emily R.",
                role: "Event Coordinator",
                location: "🇦🇺 Sydney, Australia",
                rating: 5
              },
              {
                quote: "Used this for my son's hockey-themed birthday. The personalized message was spot on - better than what I could write!",
                author: "Mike T.",
                role: "Busy Hockey Dad",
                location: "🇨🇦 Toronto, Canada",
                rating: 5
              },
              {
                quote: "As a small business owner, this saves me SO much time on social media content. Game changer for my bakery's Instagram!",
                author: "Jessica T.",
                role: "Bakery Owner",
                location: "🇺🇸 California, USA",
                rating: 5
              },
              {
                quote: "The character options are brilliant! Made a proper British tea party cake for my nan's 80th birthday.",
                author: "Emma W.",
                role: "Primary School Teacher",
                location: "🇬🇧 London, UK",
                rating: 5
              },
              {
                quote: "Finally something that works on mobile! Created a cake design for my mate's barbie while on the train.",
                author: "Daniel H.",
                role: "Marketing Manager",
                location: "🇦🇺 Melbourne, Australia",
                rating: 5
              },
              {
                quote: "So easy to use! Made matching party invitations and cake design for my daughter's princess party.",
                author: "Nicole B.",
                role: "Mom & Crafter",
                location: "🇨🇦 Calgary, Canada",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <Card className="p-6 bg-surface-elevated border-border h-full">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">{testimonial.location}</p>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-party-purple/10 to-party-pink/10 rounded-lg p-8 mb-16"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-party-purple mb-2">{dynamicCakeCount.toLocaleString()}+</p>
              <p className="text-muted-foreground">Cakes Created This Month</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-party-pink mb-2">4.9★</p>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gold mb-2">20 sec</p>
              <p className="text-muted-foreground">Average Creation Time</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trust Badges - temporarily disabled to fix blank screen
      <Suspense fallback={null}>
        <TrustBadges />
      </Suspense>
      */}

      {/* Most Popular Cakes This Week */}
      <PopularCakesSection />

      {/* From Our Blog Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">From Our Blog</h2>
          <Link to="/blog">
            <Button variant="outline" className="border-party-pink/30 hover:bg-party-pink/10">
              View All Posts →
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              id: "creative-cake-ideas-birthday",
              title: "10 Creative Cake Ideas for Birthday Celebrations",
              category: "Ideas & Inspiration",
              readTime: "5 min read",
              image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=400&fit=crop"
            },
            {
              id: "perfect-birthday-messages",
              title: "50 Birthday Message Ideas (Because 'HBD' Isn't Cutting It)",
              category: "Writing Tips",
              readTime: "8 min read",
              image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=400&fit=crop"
            },
            {
              id: "cake-design-trends-2025",
              title: "Cake Design Trends: What's Popular in 2025",
              category: "Trends",
              readTime: "7 min read",
              image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop"
            }
          ].map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all group bg-card/50 backdrop-blur-sm">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-party-purple">
                    {post.category}
                  </span>
                  <h3 className="font-semibold mt-1 text-foreground group-hover:text-party-purple transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">{post.readTime}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Ad Banner before CTA */}
      <div className="container mx-auto px-4 py-8">
        <AdSlot size="horizontal" slotId={AD_SLOTS.homepage_horizontal} className="max-w-3xl mx-auto" />
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-party-purple/20 to-party-pink/20 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Best Value Personalized Cake Designer — Join 10,000+ Creators
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop wasting time on generic designs. Start creating cakes that actually mean something.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {!isLoggedIn ? (
              <>
                <Button size="lg" onClick={() => navigate("/auth")} className="btn-shimmer text-lg px-8">
                  Get Started Free
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate("/pricing")} className="text-lg px-8">
                  View Pricing
                </Button>
              </>
            ) : isPremium ? (
              <Button 
                size="lg" 
                onClick={() => document.getElementById('creator')?.scrollIntoView({ behavior: 'smooth' })} 
                className="btn-shimmer text-lg px-8"
              >
                Create Your Next Masterpiece
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('creator')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="btn-shimmer text-lg px-8"
                >
                  Create a Cake Now
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate("/pricing")} className="text-lg px-8">
                  Upgrade to Premium
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Homepage FAQ — SEO + rich results */}
      <HomepageFAQ />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
