import { SiteHeader } from "@/components/SiteHeader";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { OrganizationSchema, ProductReviewSchema, BreadcrumbSchema, ProductSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Sparkles, CheckCircle2, Palette, Menu, Download, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { CountryRecipesSection } from "@/components/CountryRecipesSection";
import { CountryBlogFeed } from "@/components/CountryBlogFeed";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { FloatingEmojis } from "@/components/FloatingEmojis";
import { ConfettiRain } from "@/components/ConfettiRain";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { PricingPlans } from "@/components/PricingPlans";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Autoplay from "embla-carousel-autoplay";
import partyHero from "@/assets/party-hero.jpg";
import celebrationCake from "@/assets/celebration-cake.jpg";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";
import { supabase } from "@/integrations/supabase/client";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useDynamicCakeCount } from "@/hooks/useDynamicCakeCount";

const USALanding = () => {
  const navigate = useNavigate();
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(48);
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);

  usePageTracking('/usa', 'US');

  const localImageMap: Record<string, string> = {
    'featured-cake-1.jpg': featuredCake1,
    'featured-cake-2.jpg': featuredCake2,
    'featured-cake-3.jpg': featuredCake3,
    'featured-cake-4.jpg': featuredCake4,
    'featured-cake-5.jpg': featuredCake5,
  };

  const resolveImageUrl = (url: string): string => localImageMap[url] || url;

  useEffect(() => {
    loadFeaturedCakes();
  }, []);

  const loadFeaturedCakes = async () => {
    try {
      const { data, error } = await supabase
        .from("public_featured_images" as any)
        .select("id, image_url, created_at, occasion_type")
        .or('featured_pages.cs.{"home"},featured_pages.cs.{"usa"},featured_pages.cs.{"halloween"},featured_pages.cs.{"christmas"}')
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      if (data && data.length > 0) {
        setFeaturedCakes(data.map((item: any) => ({
          image_url: item.image_url,
          prompt: `${item.occasion_type || 'Celebration'} cake`,
        })));
      }
    } catch (error) {
      console.error("Error loading featured cakes:", error);
    }
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

  const testimonials = [
    {
      name: "Sarah M.",
      location: "New York",
      rating: 5,
      text: "Made the most stunning 4th of July cake for our backyard cookout. Red, white and blue layers with fireworks toppers — everyone wanted to know how I did it!",
      occasion: "4th of July",
      theme: "Patriotic Layered",
    },
    {
      name: "Mike T.",
      location: "Los Angeles",
      rating: 5,
      text: "Used it for my wife's baby shower and the elephant-themed pink ombre design was perfect. Took 30 seconds and everyone thought I'd hired a pro baker.",
      occasion: "Baby Shower",
      theme: "Pink Ombre",
    },
    {
      name: "Jennifer K.",
      location: "Chicago",
      rating: 5,
      text: "Thanksgiving just got a whole lot sweeter! Designed a gorgeous autumn harvest cake with pumpkin and maple accents. My family was blown away.",
      occasion: "Thanksgiving",
      theme: "Autumn Harvest",
    },
    {
      name: "David R.",
      location: "Houston",
      rating: 5,
      text: "My son's graduation cake with the school colors and cap-and-diploma design was incredible. He posted it on Instagram and got 300 likes!",
      occasion: "Graduation",
      theme: "School Colors",
    },
    {
      name: "Ashley B.",
      location: "Phoenix",
      rating: 5,
      text: "Halloween party was a hit because of the spooky ghost cake I designed here. Black and orange, three tiers, and a haunted house topper. Perfection!",
      occasion: "Halloween",
      theme: "Haunted House",
    },
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "4th of July", icon: Sparkles },
    { name: "Thanksgiving", icon: Cake },
    { name: "Halloween", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration relative overflow-hidden">
      <Helmet>
        <title>Free AI Cake Generator USA — Design Custom Birthday Cakes in Seconds</title>
        <meta name="description" content="America's best free AI cake generator. Create stunning birthday, 4th of July, Thanksgiving, Halloween and wedding cakes with AI. No signup needed for your first cake." />
        <meta name="keywords" content="ai cake generator usa, ai cake usa, ai birthday cake generator, free ai cake generator usa, best ai cake designer usa, personalized birthday cake usa, 4th of july cake, thanksgiving cake design, halloween cake ai, christmas cake ai, wedding cake ai usa, baby shower cake generator, graduation cake design, american cake designer, ai cake maker usa, super bowl cake" />
        <link rel="canonical" href="https://cakeaiartist.com/usa" />
        <link rel="alternate" hrefLang="en-US" href="https://cakeaiartist.com/usa" />
        <meta property="og:title" content="Best AI Cake Generator USA — Free Online Cake Designer" />
        <meta property="og:description" content="America's best free AI cake generator. Design stunning birthday, 4th of July, Thanksgiving, Halloween and wedding cakes in 30 seconds." />
        <meta property="og:url" content="https://cakeaiartist.com/usa" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best AI Cake Generator USA — Free Online" />
        <meta name="twitter:description" content="America's best free AI cake generator for birthdays, 4th of July, Thanksgiving, Halloween &amp; every celebration." />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "USA", url: "https://cakeaiartist.com/usa" },
        ]}
      />

      <ProductSchema
        name="Cake AI Artist Lifetime Plan — USA"
        description="Lifetime access to AI-powered personalized cake designs for American celebrations."
        price="49"
        priceCurrency="USD"
        availability="InStock"
        url="https://cakeaiartist.com/usa"
      />

      <FAQSchema
        faqs={[
          { question: "Can I design American-themed cakes like 4th of July or Thanksgiving?", answer: "Yes — the AI cake designer supports 4th of July, Thanksgiving, Halloween, Christmas, Super Bowl, baby shower, graduation and all birthday themes popular in the USA." },
          { question: "Is there a free tier?", answer: "Yes — you get 5 free cake designs with no signup required. After that, paid plans start from $4.99/month." },
          { question: "What's the pricing in USD?", answer: "Three plans in USD: Monthly $4.99/month, Yearly $19.99/year, or Lifetime $49 once. The free plan lets you try 5 designs instantly." },
        ]}
      />

      <HowToSchema
        name="How to Design a Custom AI Birthday Cake — Free Online"
        description="Create stunning birthday, 4th of July, Thanksgiving and celebration cakes with AI in 30 seconds — America's favourite free cake designer"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Pick your occasion", text: "Choose from birthday, 4th of July, Thanksgiving, Halloween, Christmas, graduation, baby shower or any American celebration." },
          { name: "Describe your cake", text: "Type the recipient's name and describe your cake — flavors, colors, tiers, themes and decorations in plain English." },
          { name: "AI generates in 30 seconds", text: "Our AI creates four photorealistic cake designs based on your description. Pick the one that feels right." },
          { name: "Download and share", text: "Save your cake design at full resolution. Send it to your baker as a reference or share it directly on social media." }
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <OrganizationSchema
        name="Cake AI Artist"
        url="https://cakeaiartist.com/usa"
        description="AI-powered cake design for American celebrations — birthdays, 4th of July, Thanksgiving, Halloween and more"
      />

      <ProductReviewSchema
        itemName="Cake AI Artist - AI Cake Generator USA"
        description="AI-powered cake design platform for American celebrations"
        url="https://cakeaiartist.com/usa"
        ratingValue={4.9}
        ratingCount={512}
        reviewCount={512}
        reviews={[
          { author: "Sarah M.", reviewBody: "Made the most stunning 4th of July cake for our backyard cookout. Red, white and blue layers with fireworks toppers — everyone wanted to know how I did it!", ratingValue: 5, datePublished: "2024-07-05" },
          { author: "Mike T.", reviewBody: "Used it for my wife's baby shower and the elephant-themed pink ombre design was perfect. Took 30 seconds and everyone thought I'd hired a pro baker.", ratingValue: 5, datePublished: "2024-09-12" },
          { author: "Jennifer K.", reviewBody: "Thanksgiving just got a whole lot sweeter! Designed a gorgeous autumn harvest cake with pumpkin and maple accents. My family was blown away.", ratingValue: 5, datePublished: "2024-11-28" },
          { author: "David R.", reviewBody: "My son's graduation cake with school colors and cap-and-diploma design was incredible. He posted it on Instagram and got 300 likes!", ratingValue: 5, datePublished: "2024-05-20" },
          { author: "Ashley B.", reviewBody: "Halloween party was a hit because of the spooky ghost cake I designed here. Black and orange, three tiers, and a haunted house topper. Perfection!", ratingValue: 5, datePublished: "2024-10-31" },
        ]}
      />

      <FloatingEmojis />
      <ConfettiRain count={32} />
      <UrgencyBanner onVisibilityChange={setIsBannerVisible} onHeightChange={setBannerHeight} countryCode="US" />

      <SiteHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-10" />
        <img
          src={partyHero}
          alt="Vibrant American birthday party celebration"
          className="w-full h-auto md:h-[600px] object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-6 px-4 max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
            >
              🇺🇸 America's #1 Free AI Cake Generator
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white text-lg md:text-xl drop-shadow-md"
            >
              Design stunning birthday, holiday and celebration cakes in 30 seconds — free to try, no signup needed
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-gradient-gold hover:shadow-gold text-lg px-8 py-6 font-bold pulse-glow"
                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See Plans →
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-party opacity-30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
            <img
              src={celebrationCake}
              alt="Beautiful American celebration cake"
              className="relative w-full h-80 md:h-96 object-contain rounded-2xl shadow-party transition-transform duration-500 hover:scale-105"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-foreground">
              Create Beautiful Custom Cakes in Seconds
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Whether it&apos;s a red, white and blue <strong>4th of July</strong> showstopper, a spooky{" "}
              <strong>Halloween</strong> masterpiece, or a personalized birthday cake for your little one —
              AI designs it in 30 seconds. No bakery waitlist, no crazy price tag. Just stunning results, instantly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Why People Love This */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Why Americans Love This</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: "🎨",
              title: "Actually Looks Good",
              desc: "Not your typical AI slop. These cakes look like something you'd actually post on Instagram or Pinterest.",
            },
            {
              icon: "💝",
              title: "Genuinely Personal",
              desc: "AI that understands the difference between a Super Bowl party cake and a sweet 16 birthday cake. Every detail matters.",
            },
            {
              icon: "⚡",
              title: "Stupid Fast",
              desc: "Four unique designs in 20 seconds. Yes, we timed it. Multiple times. We're nerds.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="text-center group"
            >
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:animate-bounce">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Proof Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="container mx-auto px-4 mb-12"
      >
        <div className="bg-gradient-to-r from-party-purple/10 to-party-pink/10 rounded-lg p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-party-purple mb-2">{useDynamicCakeCount().toLocaleString()}+</p>
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
        </div>
      </motion.div>

      {/* USA Celebrations Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center text-foreground mb-4"
          >
            Perfect for Every American Celebration
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From Fourth of July barbecues to spooky Halloween parties, create the perfect cake for any occasion
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {celebrations.map((celebration, idx) => (
              <motion.div
                key={celebration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all hover:scale-105 hover:border-party-pink/50">
                  <CardContent className="pt-6">
                    <celebration.icon className="h-10 w-10 mx-auto mb-3 text-party-pink" />
                    <p className="font-medium text-foreground">{celebration.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Occasion */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">Design Cakes for Every Occasion</h2>
          <p className="text-center text-muted-foreground mb-10">Explore our dedicated cake designers for your special moment</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { emoji: "💍", name: "Wedding Cakes", desc: "Elegant tiered designs for your perfect day", href: "/wedding-cake-designer" },
              { emoji: "🎓", name: "Graduation Cakes", desc: "Celebrate every achievement with a personalised cake", href: "/graduation-cake-ideas" },
              { emoji: "🎂", name: "Free AI Cake Designer", desc: "Design any cake in 30 seconds — free to try", href: "/free-ai-cake-designer" },
              { emoji: "🎃", name: "Halloween Cakes", desc: "Spooky and fun Halloween cake designs for the whole family", href: "/free-ai-cake-designer?occasion=halloween" },
              { emoji: "🦃", name: "Thanksgiving Cakes", desc: "Warm and festive Thanksgiving celebration cakes", href: "/free-ai-cake-designer?occasion=thanksgiving" },
            ].map((item) => (
              <Link key={item.name} to={item.href}>
                <Card className="p-5 h-full border-2 hover:border-party-pink/40 transition-colors hover:shadow-lg cursor-pointer">
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                  <span className="text-sm font-semibold text-party-pink">Design Now →</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cakes Carousel */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Recent Creations from Our Community
          </h2>
          <p className="text-xl text-muted-foreground mb-2">
            Real cakes made by real people across America. Yours could be here next!
          </p>
        </div>
        <Carousel
          className="w-full max-w-5xl mx-auto"
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]}
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
                        alt={cake.prompt ? `Personalized AI cake design USA — ${cake.prompt}` : "Personalized AI-designed cake by Cake AI Artist USA user"}
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
                {[featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5].map((cake, idx) => (
                  <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2">
                      <div className="relative group overflow-hidden rounded-xl border-2 border-party-pink/30 hover:border-party-pink transition-all">
                        <img
                          src={cake}
                          alt={`Featured cake ${idx + 1}`}
                          className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
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
                loading="lazy"
                decoding="async"
                src={resolveImageUrl(selectedCarouselImage.image_url)}
                alt={selectedCarouselImage.prompt ? `Personalized AI cake — ${selectedCarouselImage.prompt}` : "Personalized AI-designed celebration cake — Cake AI Artist USA"}
                className="w-full h-auto rounded-lg"
              />
              <Button
                onClick={() => handleDownloadCarouselImage(selectedCarouselImage.image_url, selectedCarouselImage.prompt)}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Party Pack Feature */}
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
                  Add your event date, time &amp; location
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
              <Button
                onClick={() => navigate("/how-it-works")}
                variant="outline"
                className="border-party-purple text-party-purple hover:bg-party-purple/10"
              >
                Learn How It Works
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-purple/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">💌</span>
                <p className="font-semibold text-foreground">Invitations</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-pink/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">🎊</span>
                <p className="font-semibold text-foreground">Banners</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-gold/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">💝</span>
                <p className="font-semibold text-foreground">Thank You Cards</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-coral/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">🎂</span>
                <p className="font-semibold text-foreground">Cake Toppers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Loved by Cake Creators Across America
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            See what our American customers are creating
          </p>
          <Carousel
            className="w-full max-w-4xl mx-auto"
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 30000, stopOnInteraction: false, stopOnMouseEnter: true })]}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-party-gold text-party-gold" />
                          ))}
                        </div>
                        <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            <Badge variant="secondary" className="text-xs">{testimonial.occasion}</Badge>
                            <Badge variant="outline" className="text-xs">{testimonial.theme}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-center text-muted-foreground mb-12">Monthly, yearly or lifetime — pay in USD.</p>
          <PricingPlans country="US" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-party-pink/20 via-party-purple/20 to-party-gold/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Create Your Perfect Cake?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of happy customers across America. Start designing your personalized cake in seconds!
            </p>
            <Link to="/">
              <Button size="lg" className="bg-gradient-to-r from-party-pink to-party-purple text-white text-lg px-8 py-6 pulse-glow">
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your Cake Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <CountryRecipesSection countryCode="US" countryName="USA" adjective="American" />
      <ExitIntentModal isLoggedIn={false} isPremium={false} />
      <StickyMobileCTA />
      <CountryBlogFeed countryCode="US" countryName="USA" />
      <Footer />
    </div>
  );
};

export default USALanding;
