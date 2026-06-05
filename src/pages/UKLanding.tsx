import { SiteHeader } from "@/components/SiteHeader";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { OrganizationSchema, ProductReviewSchema, BreadcrumbSchema, ProductSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Crown, CheckCircle2, Sparkles, Menu, Download, Loader2, Heart, Baby, Gift } from "lucide-react";
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

const UKLanding = () => {
  const navigate = useNavigate();
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(48);
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);

  // Track page visits
  usePageTracking('/uk', 'UK');

  const localImageMap: Record<string, string> = {
    'featured-cake-1.jpg': featuredCake1,
    'featured-cake-2.jpg': featuredCake2,
    'featured-cake-3.jpg': featuredCake3,
    'featured-cake-4.jpg': featuredCake4,
    'featured-cake-5.jpg': featuredCake5,
  };

  const resolveImageUrl = (url: string): string => {
    return localImageMap[url] || url;
  };

  useEffect(() => {
    loadFeaturedCakes();
  }, []);

  const loadFeaturedCakes = async () => {
    try {
      const { data, error } = await supabase
        .from("public_featured_images" as any)
        .select("id, image_url, created_at, occasion_type")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFeaturedCakes(data.map((item: any) => ({
          image_url: item.image_url,
          prompt: `${item.occasion_type || 'Celebration'} cake`
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
      name: "James K.",
      location: "Manchester",
      rating: 5,
      text: "Made a Peppa Pig cake for my daughter's 4th birthday. The pastel pink design was spot on, and she couldn't stop smiling!",
      character: "Peppa Pig",
      theme: "Pastel Pink"
    },
    {
      name: "Emma W.",
      location: "London",
      rating: 5,
      text: "The Elsa character option was brilliant! Created a proper tiered birthday cake for my nan's 70th with an elegant theme.",
      character: "Elsa",
      theme: "Elegant Tiered"
    },
    {
      name: "Sophie R.",
      location: "Edinburgh",
      rating: 5,
      text: "Used the fun/cartoon style for my son's Spider-Man cake. The multicolor frosting looked absolutely gorgeous!",
      character: "Spider-Man",
      theme: "Multicolor Cartoon"
    },
    {
      name: "David M.",
      location: "Birmingham",
      rating: 5,
      text: "Created a beautiful red velvet anniversary cake with gold/silver accents. My wife loved it!",
      character: "None",
      theme: "Red Velvet Gold"
    },
    {
      name: "Charlotte B.",
      location: "Bristol",
      rating: 5,
      text: "Made a stunning Victoria sponge-inspired birthday cake for my mum's 60th. The cream and strawberry design looked absolutely spot on — proper British elegance!",
      character: "None",
      theme: "Victoria Sponge"
    },
    {
      name: "Oliver P.",
      location: "Leeds",
      rating: 5,
      text: "Designed a royal blue and gold cake for the King's Coronation street party. Everyone thought I'd hired a professional baker. Brilliant tool!",
      character: "None",
      theme: "Royal Blue Gold"
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Royal Celebrations", icon: Crown },
    { name: "Garden Parties", icon: Sparkles },
    { name: "Anniversary", icon: Cake },
    { name: "Wedding Cakes", icon: Heart },
    { name: "Christening Cakes", icon: Baby },
    { name: "Christmas Cakes", icon: Gift },
    { name: "Coronation Parties", icon: Crown }
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration relative overflow-hidden">
      <Helmet>
        <title>Free AI Cake Generator UK — Design Personalised Birthday Cakes in Seconds</title>
        <meta name="description" content="The UK's best free AI cake generator. Design personalised birthday, wedding, christening & celebration cakes with AI in 30 seconds. Loved by thousands across Britain." />
        <meta name="keywords" content="ai cake generator uk, ai cake uk, ai cakes uk, cake ai uk, birthday cake ai, ai birthday cakes, free ai cake generator, best ai cake designer uk, personalised birthday cake uk, anniversary cake uk, wedding cake design uk, christening cake, ai cake maker england, virtual cake creator uk, ai cake generator free uk, personalised cake design uk, cake designer online uk, birthday cake ideas uk" />
        <link rel="canonical" href="https://cakeaiartist.com/uk" />
        <link rel="alternate" hrefLang="en-GB" href="https://cakeaiartist.com/uk" />
        <meta property="og:title" content="Best AI Cake Designer UK — Personalised Cakes" />
        <meta property="og:description" content="The UK's best AI cake designer for personalised birthday cakes & every British celebration — weddings, christenings & more." />
        <meta property="og:url" content="https://cakeaiartist.com/uk" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best AI Cake Designer UK — Personalised Cakes" />
        <meta name="twitter:description" content="The UK's best AI cake designer for birthdays, weddings & every celebration." />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "UK", url: "https://cakeaiartist.com/uk" },
        ]}
      />

      <ProductSchema
        name="Cake AI Artist Lifetime Plan — UK"
        description="Lifetime access to AI-powered personalised cake designs for British celebrations."
        price="49"
        priceCurrency="GBP"
        availability="InStock"
        url="https://cakeaiartist.com/uk"
      />

      <FAQSchema
        faqs={[
          { question: "Can I design British-themed cakes?", answer: "Yes — the AI supports christenings, royal-themed parties, garden parties, weddings and traditional British birthday designs." },
          { question: "What's the price in GBP?", answer: "Three plans in GBP: Monthly £4.99/month, Yearly £29/year, or Lifetime £49 once. A free plan is available forever." },
          { question: "Are the designs print-ready?", answer: "Yes — high-resolution PNGs suitable for printing on cake toppers, invitations and party stationery." },
          { question: "Is the AI cake generator free in the UK?", answer: "Yes — Cake AI Artist is completely free to try in the UK. Design your first AI cake with no signup required. Premium plans are available for unlimited designs." },
          { question: "Can I design a traditional British cake with AI?", answer: "Absolutely. Our AI understands British cake traditions — from Victoria sponge and Christmas cake to christening cakes and royal celebration cakes." },
          { question: "Does it work on mobile in the UK?", answer: "Yes — Cake AI Artist is fully optimised for mobile, tablet and desktop. Design a cake on your phone in seconds, wherever you are in Britain." },
        ]}
      />

      <HowToSchema
        name="How to Create a Free AI Cake Design in the UK"
        description="Design a personalised birthday, wedding or celebration cake with AI in 30 seconds — free to try, no signup needed"
        totalTime="PT30S"
        estimatedCost={{ currency: "GBP", value: "0" }}
        steps={[
          { name: "Describe your cake", text: "Type the recipient's name and choose your occasion — birthday, wedding, christening, anniversary or any British celebration." },
          { name: "Choose your style", text: "Pick from elegant, fun, kids themed or classic British styles. Add colours, tiers and decorations in plain English." },
          { name: "Generate in 30 seconds", text: "Click generate and your personalised AI cake design appears in under 30 seconds — photorealistic and ready to share." },
          { name: "Download or share", text: "Save your high-resolution cake image and send it to your baker, share on WhatsApp, or use it as inspiration for your celebration." }
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <OrganizationSchema
        name="Cake AI Artist"
        url="https://cakeaiartist.com/uk"
        description="AI-powered personalised cake design for UK celebrations - birthdays, royal events, and garden parties"
      />

      <ProductReviewSchema
        itemName="Cake AI Artist - AI Cake Designer UK"
        description="AI-powered personalised cake design platform for British celebrations"
        url="https://cakeaiartist.com/uk"
        ratingValue={4.9}
        ratingCount={312}
        reviewCount={312}
        reviews={[
          { author: "James K.", reviewBody: "Made a Peppa Pig cake for my daughter's 4th birthday. The pastel pink design was spot on!", ratingValue: 5, datePublished: "2024-11-20" },
          { author: "Emma W.", reviewBody: "The Elsa character option was brilliant! Created a proper tiered birthday cake for my nan's 70th.", ratingValue: 5, datePublished: "2024-11-28" },
          { author: "Sophie R.", reviewBody: "Used the fun/cartoon style for my son's Spider-Man cake. The multicolor frosting looked absolutely gorgeous!", ratingValue: 5, datePublished: "2024-12-05" },
          { author: "David M.", reviewBody: "Created a beautiful red velvet anniversary cake with gold/silver accents. My wife loved it!", ratingValue: 5, datePublished: "2024-12-10" },
          { author: "Charlotte B.", reviewBody: "Made a stunning Victoria sponge-inspired birthday cake for my mum's 60th. Proper British elegance!", ratingValue: 5, datePublished: "2025-01-08" },
          { author: "Oliver P.", reviewBody: "Designed a royal blue and gold cake for the King's Coronation street party. Everyone thought I'd hired a professional baker!", ratingValue: 5, datePublished: "2025-01-15" }
        ]}
      />

      <FloatingEmojis />
      <ConfettiRain count={32} />
      <UrgencyBanner onVisibilityChange={setIsBannerVisible} onHeightChange={setBannerHeight} countryCode="UK" />

      <SiteHeader />

      {/* Hero Section with Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-10" />
        <img
          src={partyHero}
          alt="Vibrant birthday party celebration"
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
              🇬🇧 The UK's Favourite Free AI Cake Generator
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white text-lg md:text-xl drop-shadow-md"
            >
              Design personalised birthday, wedding &amp; celebration cakes in 30 seconds — free to try, no signup needed
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

      {/* Feature Highlight with Cake Image */}
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
              alt="Beautiful celebration cake"
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
              Create Beautiful Personalised Cakes in Seconds
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Here&apos;s the thing about British celebrations—they&apos;re only as special as the thought you put into them. 
              From jubilee street parties to cosy family birthdays, get gorgeous, personalised cake designs in the time it takes to brew a cuppa.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Why People Love This */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Why People Love This</h2>
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
              desc: "AI that understands your nan's birthday needs different vibes than your mate's 21st."
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

      {/* UK Celebrations Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center text-foreground mb-4"
          >
            Perfect for British Celebrations
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From royal celebrations to cosy family birthdays, weddings, christenings and more — create the perfect cake for any British occasion
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
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
              { emoji: "🌙", name: "Eid Cakes", desc: "Beautiful Eid Mubarak cake designs for the UK's Muslim community", href: "/eid-cake-ideas" },
              { emoji: "👶", name: "Baby Shower Cakes", desc: "Sweet and personalised baby shower cake designs", href: "/free-ai-cake-designer?occasion=baby+shower" },
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
            Real cakes made by real people. Yours could be here next!
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
                        alt={cake.prompt ? `Personalized AI cake design UK — ${cake.prompt}` : "Personalized AI-designed cake by Cake AI Artist UK user"}
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
              <img loading="lazy" decoding="async" 
                src={resolveImageUrl(selectedCarouselImage.image_url)} 
                alt={selectedCarouselImage.prompt ? `Personalized AI cake — ${selectedCarouselImage.prompt}` : "Personalized AI-designed celebration cake — Cake AI Artist UK"}
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

      {/* How It Works */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center text-foreground mb-4"
          >
            How It Works — 3 Simple Steps
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From idea to stunning cake design in under a minute
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: "Describe Your Cake", desc: "Type what you want: occasion, flavour, colours, theme, characters", color: "bg-party-purple" },
              { step: 2, title: "AI Generates in Seconds", desc: "Our AI creates a stunning, photorealistic cake design just for you", color: "bg-party-pink" },
              { step: 3, title: "Download & Share", desc: "Save your design, share with your baker, or inspire your own creation", color: "bg-party-gold" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.15 }}
              >
                <Card className="text-center hover:shadow-lg transition-all">
                  <CardContent className="pt-8 pb-6">
                    <div className={`w-12 h-12 rounded-full ${item.color} ${item.color === 'bg-party-gold' ? 'text-background' : 'text-white'} flex items-center justify-center text-xl font-bold mx-auto mb-4`}>
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Loved by Cake Creators Across the UK
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            See what our British customers are creating
          </p>
          <Carousel 
            className="w-full max-w-4xl mx-auto"
            opts={{ align: "start", loop: true }}
            plugins={[
              Autoplay({
                delay: 30000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
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
                            {testimonial.character !== "None" && (
                              <Badge variant="secondary" className="text-xs">{testimonial.character}</Badge>
                            )}
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
          <p className="text-center text-muted-foreground mb-12">Monthly, yearly or lifetime — pay in GBP.</p>
          <PricingPlans country="GB" />
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
              Join thousands of happy customers across the UK. Start designing your personalised cake in seconds!
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

      <CountryRecipesSection countryCode="UK" countryName="UK" adjective="British" />
      <ExitIntentModal isLoggedIn={false} isPremium={false} />
      <StickyMobileCTA />
      <CountryBlogFeed countryCode="UK" countryName="the UK" />
      <Footer />
    </div>
  );
};

export default UKLanding;