import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { OrganizationSchema, ProductReviewSchema } from "@/components/SEOSchema";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Sun, CheckCircle2, Sparkles, Menu, Download, Waves, Loader2 } from "lucide-react";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import { Footer } from "@/components/Footer";
import { FloatingEmojis } from "@/components/FloatingEmojis";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SpotsRemainingCounter } from "@/components/SpotsRemainingCounter";
import { DynamicSaleLabel } from "@/components/DynamicSaleLabel";
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
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);
  const { isLoading, handlePayment, currentOrderId, checkPaymentStatus, isCheckingStatus } = useRazorpayPayment("AU");

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
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Australia Day", icon: Sun },
    { name: "Beach Parties", icon: Waves },
    { name: "Anniversary", icon: Cake }
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration relative overflow-hidden">
      <Helmet>
        <title>AI Cake Designer Australia - Beautiful Personalised Cakes | Cake AI Artist</title>
        <meta name="description" content="Create stunning personalised cakes for Australian celebrations. Perfect for birthdays, Australia Day, beach parties. Trusted by customers across Australia." />
        <meta name="keywords" content="Australia cake designer, Australian celebration cakes, personalised birthday cake Australia, AI cake design Australia, virtual cake creator Australia" />
        <link rel="canonical" href="https://cakeaiartist.com/australia" />
        <link rel="alternate" hrefLang="en-AU" href="https://cakeaiartist.com/australia" />
        <meta property="og:title" content="AI Cake Designer Australia - Beautiful Personalised Cakes" />
        <meta property="og:description" content="Create stunning personalised cakes for Australian celebrations. Trusted by customers across Australia." />
        <meta property="og:url" content="https://cakeaiartist.com/australia" />
        <meta property="og:locale" content="en_AU" />
      </Helmet>

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
          { author: "Josh W.", reviewBody: "Used the Spider-Man character with chocolate 3-layer design for my nephew. Total legend move!", ratingValue: 5, datePublished: "2024-12-12" }
        ]}
      />

      <FloatingEmojis />
      <UrgencyBanner onVisibilityChange={setIsBannerVisible} countryCode="AU" />

      {/* Navigation */}
      <nav className={`sticky ${isBannerVisible ? 'top-16 md:top-12' : 'top-0'} z-40 bg-gradient-to-b from-party-pink/10 via-background/95 to-background backdrop-blur-md transition-all duration-300`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_hsl(var(--party-pink)/0.4)]">
              <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
              <span>Cake AI Artist</span>
            </Link>
            
            <div className="hidden lg:flex gap-2 items-center">
              <Badge variant="outline" className="border-party-gold text-party-gold">🇦🇺 Australia</Badge>
              <Link to="/how-it-works"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">How It Works</Button></Link>
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="relative text-foreground/80 hover:text-foreground hover:bg-party-pink/10">
                  Pricing
                  <span className="absolute -top-1 -right-1 bg-gradient-party text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">🔥</span>
                </Button>
              </Link>
              <Link to="/faq"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-party-pink/10">FAQ</Button></Link>
              <Button onClick={() => navigate("/auth")} size="sm" className="bg-gradient-party hover:opacity-90 text-white border-0">Sign In</Button>
            </div>

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
                  <Badge variant="outline" className="w-fit border-party-gold text-party-gold mb-4">🇦🇺 Australia</Badge>
                  <Link to="/how-it-works"><Button variant="ghost" className="w-full justify-start">How It Works</Button></Link>
                  <Link to="/pricing"><Button variant="ghost" className="w-full justify-start">Pricing <span className="ml-2 bg-gradient-party text-white text-xs px-2 py-0.5 rounded-full">🔥 Sale</span></Button></Link>
                  <Link to="/faq"><Button variant="ghost" className="w-full justify-start">FAQ</Button></Link>
                  <div className="border-t border-party-pink/20 my-2" />
                  <Button onClick={() => navigate("/auth")} className="w-full bg-gradient-party hover:opacity-90 text-white border-0">Sign In</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-10" />
        <img src={partyHero} alt="Vibrant birthday party celebration" className="w-full h-auto md:h-[600px] object-cover" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-6 px-4 max-w-4xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-destructive/90 backdrop-blur-sm px-6 py-3 rounded-full inline-block animate-pulse">
              <p className="text-white font-bold text-lg"><DynamicSaleLabel countryCode="AU" suffix="ENDS IN:" /></p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <CountdownTimer countryCode="AU" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              🇦🇺 Get LIFETIME ACCESS for just A$75
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
              <span className="text-white text-xl md:text-2xl font-semibold drop-shadow-md block">
                Founding Member Special • <SpotsRemainingCounter tier="tier_1_49" className="inline-block" />
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-surface-elevated/95 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="grid md:grid-cols-3 gap-4 text-center mb-4">
                <div><p className="text-sm text-muted-foreground">Regular price:</p><p className="text-lg font-bold line-through text-muted-foreground">AUD$183/year forever</p></div>
                <div><p className="text-sm text-muted-foreground">Your price:</p><p className="text-3xl font-bold text-gold">~AUD$75 ONCE</p></div>
                <div><p className="text-sm text-muted-foreground">You save:</p><p className="text-lg font-bold text-party-pink">AUD$1,755+ over 10 years</p></div>
              </div>
              <Button size="lg" className="w-full bg-gradient-gold hover:shadow-gold text-lg px-8 py-6 font-bold pulse-glow" onClick={() => handlePayment('tier_1_49')} disabled={isLoading !== null}>
                {isLoading === 'tier_1_49' ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</> : 'Claim Your Lifetime Deal Now →'}
              </Button>
              {currentOrderId && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-3 border-party-purple text-party-purple hover:bg-party-purple/10"
                  onClick={() => checkPaymentStatus()}
                  disabled={isCheckingStatus}
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking Status...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Check Payment Status
                    </>
                  )}
                </Button>
              )}
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>"Once spots fill, price becomes A$14.99/month"</p>
                <p className="font-semibold text-destructive">"This offer will NEVER be repeated"</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-party opacity-30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
            <img src={celebrationCake} alt="Beautiful celebration cake" className="relative w-full h-80 md:h-96 object-contain rounded-2xl shadow-party transition-transform duration-500 hover:scale-105" />
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
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">From Australia Day barbies to summer beach parties, create the perfect cake for any occasion</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
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
                      <img src={resolveImageUrl(cake.image_url)} alt="Featured user cake design" className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
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
                      <img src={cake} alt={`Featured cake ${idx + 1}`} className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
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
              <img src={resolveImageUrl(selectedCarouselImage.image_url)} alt="Community creation" className="w-full h-auto rounded-lg" />
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
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Special New Year Lifetime Deal</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="text-center h-full">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Free</h3>
                  <p className="text-3xl font-bold text-party-pink mb-4">A$0</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />5 cakes per day</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Basic characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Standard quality</li>
                  </ul>
                  <Link to="/auth"><Button variant="outline" className="w-full">Get Started</Button></Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="text-center border-party-pink shadow-lg relative h-full">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-party-pink text-white">Most Popular</Badge>
                <CardContent className="pt-8">
                  <h3 className="text-xl font-bold text-foreground mb-2">Lifetime Deal</h3>
                  <p className="text-3xl font-bold text-party-pink mb-4">A$75</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Unlimited cakes forever</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />All characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Party Pack Generator</li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-party-pink to-party-purple text-white pulse-glow" onClick={() => handlePayment('tier_1_49')} disabled={isLoading !== null}>
                    {isLoading === 'tier_1_49' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : 'Get Lifetime Access'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="text-center h-full">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Monthly</h3>
                  <p className="text-3xl font-bold text-party-pink mb-4">A$14.99/mo</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />150 cakes per year</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />All characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Cancel anytime</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handlePayment('monthly_aud')}
                    disabled={isLoading !== null}
                  >
                    {isLoading === 'monthly_aud' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : 'Subscribe Monthly'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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

      <Footer />
    </div>
  );
};

export default AustraliaLanding;