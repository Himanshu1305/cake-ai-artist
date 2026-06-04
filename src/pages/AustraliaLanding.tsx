import { SiteHeader } from "@/components/SiteHeader";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { OrganizationSchema, ProductReviewSchema, BreadcrumbSchema, ProductSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Sun, CheckCircle2, Sparkles, Menu, Download, Waves, Loader2, Heart, Trophy } from "lucide-react";
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

const AustraliaLanding = () => {
  const navigate = useNavigate();
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(48);
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);

  // Track page visits
  usePageTracking('/australia', 'AU');

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
      name: "Emily R.",
      location: "Sydney",
      rating: 5,
      text: "As a party planner, I use this weekly! Made a gorgeous tiered vanilla anniversary cake with white fondant.",
      character: "None",
      theme: "Elegant White"
    },
    {
      name: "Daniel H.",
      location: "Melbourne",
      rating: 5,
      text: "Created my mate's Goku birthday cake on the train! The modern style with blue accents was sick!",
      character: "Goku",
      theme: "Modern Blue"
    },
    {
      name: "Chloe M.",
      location: "Brisbane",
      rating: 5,
      text: "Made my daughter's Barbie cake with pink elegant styling. The fondant lettering looked like a real bakery did it!",
      character: "Barbie",
      theme: "Pink Elegant"
    },
    {
      name: "Josh W.",
      location: "Perth",
      rating: 5,
      text: "Used the Spider-Man character with chocolate 3-layer design for my nephew. Total legend move!",
      character: "Spider-Man",
      theme: "Chocolate 3-Layer"
    },
    {
      name: "Sarah T.",
      location: "Adelaide",
      rating: 5,
      text: "Designed a lamington-inspired birthday cake for my husband — coconut white with chocolate drizzle. He absolutely loved it, proper Aussie classic!",
      character: "None",
      theme: "Lamington Style"
    },
    {
      name: "Liam K.",
      location: "Gold Coast",
      rating: 5,
      text: "Made a beach-themed Australia Day cake with blue waves and a tiny Aussie flag. Looked amazing on the barbie table. Top tool mate!",
      character: "None",
      theme: "Beach Australia Day"
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Australia Day", icon: Sun },
    { name: "Beach Parties", icon: Waves },
    { name: "Anniversary", icon: Cake },
    { name: "Wedding Cakes", icon: Heart },
    { name: "Christmas in July", icon: Sun },
    { name: "ANZAC Day", icon: Star },
    { name: "Footy Finals", icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration relative overflow-hidden">
      <Helmet>
        <title>Free AI Cake Generator Australia — Design Custom Birthday Cakes in Seconds</title>
        <meta name="description" content="Australia's best free AI cake generator. Design custom birthday, wedding, Australia Day & celebration cakes with AI in 30 seconds. Loved by thousands of Aussies." />
        <meta name="keywords" content="ai cake generator australia, ai cake australia, ai cakes australia, cake ai australia, birthday cake ai, ai birthday cakes, free ai cake generator, best ai cake designer australia, personalised birthday cake australia, anniversary cake australia, wedding cake design australia, australia day cake, ai cake maker au, ai cake generator free australia, custom cake design australia, cake designer online australia, birthday cake ideas australia" />
        <link rel="canonical" href="https://cakeaiartist.com/australia" />
        <link rel="alternate" hrefLang="en-AU" href="https://cakeaiartist.com/australia" />
        <meta property="og:title" content="AI Cake Designer Australia — Personalised Cakes" />
        <meta property="og:description" content="Australia's best AI cake designer for personalised birthday cakes & every Aussie celebration — weddings, Australia Day & more." />
        <meta property="og:url" content="https://cakeaiartist.com/australia" />
        <meta property="og:locale" content="en_AU" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Cake Designer Australia — Personalised Cakes" />
        <meta name="twitter:description" content="Australia's best AI cake designer for birthdays, Australia Day & every celebration." />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "Australia", url: "https://cakeaiartist.com/australia" },
        ]}
      />

      <ProductSchema
        name="Cake AI Artist Lifetime Deal — Australia"
        description="Lifetime access to AI-powered personalised cake designs for Australian celebrations."
        price="75"
        priceCurrency="AUD"
        availability="LimitedAvailability"
        url="https://cakeaiartist.com/australia"
      />

      <FAQSchema
        faqs={[
          { question: "Can I design cakes for Aussie celebrations?", answer: "Yes — Australia Day, Melbourne Cup, beach-themed parties, ANZAC Day, weddings, and traditional birthdays are all supported." },
          { question: "What's the price in AUD?", answer: "Three plans in AUD: Monthly A$7.99/month, Yearly A$49/year, or Lifetime A$79 once. A free plan is available forever." },
          { question: "Can event planners use the designs commercially?", answer: "Yes — premium plans include a commercial-use licence for businesses across Australia." },
          { question: "Is the AI cake generator free in Australia?", answer: "Yes — Cake AI Artist is completely free to try in Australia. Design your first AI cake with no signup required. Premium plans are available in AUD for unlimited designs." },
          { question: "Can I design a traditional Australian cake with AI?", answer: "Absolutely. Our AI understands Aussie cake culture — from lamingtons and pavlova-inspired designs to Australia Day themes and tropical celebration cakes." },
          { question: "Does it work on mobile in Australia?", answer: "Yes — Cake AI Artist is fully optimised for mobile, tablet and desktop. Design a cake on your phone in seconds, wherever you are in Australia." },
        ]}
      />

      <HowToSchema
        name="Free AI Cake Designer Australia — Custom Cake Design in 30 Seconds"
        description="Design birthday, Australia Day, wedding and celebration cakes with AI — free to try for all Australians"
        totalTime="PT30S"
        estimatedCost={{ currency: "AUD", value: "0" }}
        steps={[
          { name: "Choose your occasion", text: "Pick from birthday, Australia Day, ANZAC Day, Christmas, wedding, baby shower or any Aussie celebration." },
          { name: "Describe your cake", text: "Enter the recipient's name and describe your cake — lamington-inspired, pavlova style, beach themed or classic Australian designs." },
          { name: "Generate in 30 seconds", text: "The AI produces a photorealistic custom cake design in under 30 seconds. No design skills needed — just type and generate." },
          { name: "Download and share", text: "Download your cake image and send it to your local baker, share it on WhatsApp or post it to Instagram." }
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <OrganizationSchema
        name="Cake AI Artist"
        url="https://cakeaiartist.com/australia"
        description="AI-powered cake design for Australian celebrations - birthdays, Australia Day, and beach parties"
      />

      <ProductReviewSchema
        itemName="Cake AI Artist - AI Cake Designer Australia"
        description="AI-powered cake design platform for Australian celebrations"
        url="https://cakeaiartist.com/australia"
        ratingValue={4.9}
        ratingCount={245}
        reviewCount={245}
        reviews={[
          { author: "Emily R.", reviewBody: "As a party planner, I use this weekly! Made a gorgeous tiered vanilla anniversary cake.", ratingValue: 5, datePublished: "2024-11-22" },
          { author: "Daniel H.", reviewBody: "Created my mate's Goku birthday cake on the train! The modern style with blue accents was sick!", ratingValue: 5, datePublished: "2024-11-30" },
          { author: "Chloe M.", reviewBody: "Made my daughter's Barbie cake with pink elegant styling. Looked like a real bakery did it!", ratingValue: 5, datePublished: "2024-12-04" },
          { author: "Josh W.", reviewBody: "Used the Spider-Man character with chocolate 3-layer design for my nephew. Total legend move!", ratingValue: 5, datePublished: "2024-12-12" },
          { author: "Sarah T.", reviewBody: "Designed a lamington-inspired birthday cake for my husband — coconut white with chocolate drizzle. Proper Aussie classic!", ratingValue: 5, datePublished: "2025-01-10" },
          { author: "Liam K.", reviewBody: "Made a beach-themed Australia Day cake with blue waves and a tiny Aussie flag. Looked amazing on the barbie table!", ratingValue: 5, datePublished: "2025-01-18" }
        ]}
      />

      <FloatingEmojis />
      <ConfettiRain count={32} />
      <UrgencyBanner onVisibilityChange={setIsBannerVisible} onHeightChange={setBannerHeight} countryCode="AU" />

      <SiteHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-10" />
        <img loading="lazy" decoding="async" src={partyHero} alt="Vibrant birthday party celebration" className="w-full h-auto md:h-[600px] object-cover" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-6 px-4 max-w-4xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              🇦🇺 Australia's Favourite Free AI Cake Generator
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-white text-lg md:text-xl drop-shadow-md">
              Design custom birthday, wedding &amp; celebration cakes in 30 seconds — free to try, no signup needed
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Button size="lg" className="bg-gradient-gold hover:shadow-gold text-lg px-8 py-6 font-bold pulse-glow" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
                See Plans →
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-party opacity-30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
            <img loading="lazy" decoding="async" src={celebrationCake} alt="Beautiful celebration cake" className="relative w-full h-80 md:h-96 object-contain rounded-2xl shadow-party transition-transform duration-500 hover:scale-105" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground">Create Beautiful Personalised Cakes in Seconds</h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Here&apos;s the thing about Aussie celebrations—they&apos;re only as ripper as the thought you put into them. 
              From Australia Day BBQs to beach birthday bashes, get gorgeous, personalised cake designs faster than you can crack open a cold one.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Why People Love This */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Why People Love This</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: "🎨", title: "Actually Looks Good", desc: "Not your typical AI slop. These cakes look like something you'd actually want to share." },
            { icon: "💝", title: "Genuinely Personal", desc: "AI that understands your nan's birthday needs different vibes than your mate's bucks party." },
            { icon: "⚡", title: "Stupid Fast", desc: "Four unique designs in 20 seconds. Yeah, we timed it. Multiple times. We're legends." }
          ].map((feature, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }} className="text-center group">
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

      {/* Celebrations Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center text-foreground mb-4">Perfect for Aussie Celebrations</motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">From Australia Day barbies to weddings, ANZAC Day, Footy Finals and summer beach parties — create the perfect cake for any Aussie occasion</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {celebrations.map((celebration, idx) => (
              <motion.div key={celebration.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + idx * 0.1 }}>
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

      {/* Featured Cakes Carousel */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">Recent Creations from Our Community</h2>
          <p className="text-xl text-muted-foreground mb-2">Real cakes made by real people. Yours could be here next!</p>
        </div>
        <Carousel className="w-full max-w-5xl mx-auto" opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]}>
          <CarouselContent>
            {featuredCakes.length > 0 ? (
              featuredCakes.map((cake, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-gold/30 hover:border-gold transition-all cursor-pointer" onClick={() => setSelectedCarouselImage(cake)}>
                      <img loading="lazy" decoding="async" src={resolveImageUrl(cake.image_url)} alt={cake.prompt ? `Personalized AI cake design Australia — ${cake.prompt}` : "Personalized AI-designed cake by Cake AI Artist Australia user"} className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <p className="text-white text-sm font-semibold">Click to view</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))
            ) : (
              [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5].map((cake, idx) => (
                <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-party-pink/30 hover:border-party-pink transition-all">
                      <img loading="lazy" decoding="async" src={cake} alt={`Featured cake ${idx + 1}`} className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                  </div>
                </CarouselItem>
              ))
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
              <img loading="lazy" decoding="async" src={resolveImageUrl(selectedCarouselImage.image_url)} alt={selectedCarouselImage.prompt ? `Personalized AI cake — ${selectedCarouselImage.prompt}` : "Personalized AI-designed celebration cake — Cake AI Artist Australia"} className="w-full h-auto rounded-lg" />
              <Button onClick={() => handleDownloadCarouselImage(selectedCarouselImage.image_url, selectedCarouselImage.prompt)} className="w-full">
                <Download className="mr-2 h-4 w-4" />Download Image
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Party Pack Feature */}
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-r from-party-purple/20 via-party-pink/20 to-party-gold/20 rounded-2xl p-8 border-2 border-party-purple/30">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3"><span className="text-4xl">🎁</span>NEW: Party Pack Generator</h2>
              <p className="text-lg text-muted-foreground mb-6">Transform your cake design into a <strong>complete celebration kit</strong>! Generate matching invitations, banners, thank you cards, cake toppers, and place cards—all with one click.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-foreground"><span className="w-6 h-6 rounded-full bg-party-purple text-white flex items-center justify-center text-sm font-bold">✓</span>Add your event date, time & location</li>
                <li className="flex items-center gap-3 text-foreground"><span className="w-6 h-6 rounded-full bg-party-pink text-white flex items-center justify-center text-sm font-bold">✓</span>Preview all items before downloading</li>
                <li className="flex items-center gap-3 text-foreground"><span className="w-6 h-6 rounded-full bg-party-gold text-background flex items-center justify-center text-sm font-bold">✓</span>Download as print-ready PDF</li>
              </ul>
              <Button onClick={() => navigate("/how-it-works")} variant="outline" className="border-party-purple text-party-purple hover:bg-party-purple/10">Learn How It Works</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ icon: "💌", label: "Invitations" }, { icon: "🎊", label: "Banners" }, { icon: "💝", label: "Thank You Cards" }, { icon: "🎂", label: "Cake Toppers" }].map((item, idx) => (
                <div key={idx} className="bg-background/50 rounded-xl p-4 text-center border border-party-purple/20 hover:scale-105 transition-transform">
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <p className="font-semibold text-foreground">{item.label}</p>
                </div>
              ))}
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

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Loved by Cake Creators Across Australia</h2>
          <p className="text-center text-muted-foreground mb-12">See what our Aussie customers are creating</p>
          <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 30000, stopOnInteraction: false, stopOnMouseEnter: true })]}>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-1 mb-3">{[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-party-gold text-party-gold" />)}</div>
                        <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                        <div className="flex items-center justify-between">
                          <div><p className="font-semibold text-foreground">{testimonial.name}</p><p className="text-sm text-muted-foreground">{testimonial.location}</p></div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {testimonial.character !== "None" && <Badge variant="secondary" className="text-xs">{testimonial.character}</Badge>}
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

      {/* Pricing */}
      <section id="plans" className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Choose Your Plan</h2>
          <p className="text-center text-muted-foreground mb-12">Monthly, yearly or lifetime — pay in AUD.</p>
          <PricingPlans country="AU" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-party-pink/20 via-party-purple/20 to-party-gold/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Create Your Perfect Cake?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of happy customers across Australia. Start designing your personalised cake in seconds!</p>
            <Link to="/"><Button size="lg" className="bg-gradient-to-r from-party-pink to-party-purple text-white text-lg px-8 py-6 pulse-glow"><Sparkles className="mr-2 h-5 w-5" />Create Your Cake Now</Button></Link>
          </motion.div>
        </div>
      </section>

      <CountryRecipesSection countryCode="AU" countryName="Australia" adjective="Australian" />
      <ExitIntentModal isLoggedIn={false} isPremium={false} />
      <StickyMobileCTA />
      <CountryBlogFeed countryCode="AU" countryName="Australia" />
      <Footer />
    </div>
  );
};

export default AustraliaLanding;