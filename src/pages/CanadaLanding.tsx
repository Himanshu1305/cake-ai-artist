import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Snowflake, CheckCircle2, Sparkles, Menu, Download, Leaf } from "lucide-react";
import { Footer } from "@/components/Footer";
import { FloatingEmojis } from "@/components/FloatingEmojis";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SpotsRemainingCounter } from "@/components/SpotsRemainingCounter";
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

const CanadaLanding = () => {
  const navigate = useNavigate();
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);

  // Track page visits
  usePageTracking('/canada', 'CA');

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
      name: "Mike T.",
      location: "Toronto",
      rating: 5,
      text: "Made a Pikachu birthday cake for my son's 8th. The rainbow colors were perfect - he's still talking about it!",
      character: "Pikachu",
      theme: "Rainbow"
    },
    {
      name: "Nicole B.",
      location: "Calgary",
      rating: 5,
      text: "Used the Frozen theme with Olaf character for my daughter's party. The pastel 3-layer cake design was stunning!",
      character: "Olaf",
      theme: "Frozen Pastel"
    },
    {
      name: "Ryan D.",
      location: "Vancouver",
      rating: 5,
      text: "Created a Minions graduation cake with funfetti style. The AI-generated message was heartfelt and perfect!",
      character: "Minions",
      theme: "Funfetti"
    },
    {
      name: "Sarah L.",
      location: "Montreal",
      rating: 5,
      text: "The Hello Kitty option was exactly what my daughter wanted. Pink 2-layer design looked professional!",
      character: "Hello Kitty",
      theme: "Pink 2-Layer"
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Canada Day", icon: Leaf },
    { name: "Winter Wonderland", icon: Snowflake },
    { name: "Anniversary", icon: Cake }
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration relative overflow-hidden">
      <Helmet>
        <title>AI Cake Designer Canada - Beautiful Personalized Cakes | Cake AI Artist</title>
        <meta name="description" content="Create stunning personalized cakes for Canadian celebrations. Perfect for birthdays, Canada Day, hockey parties. Trusted by customers across Canada." />
        <meta name="keywords" content="Canada cake designer, Canadian celebration cakes, personalized birthday cake Canada, AI cake design Canada, virtual cake creator Canada" />
        <link rel="canonical" href="https://cakeaiartist.com/canada" />
        <link rel="alternate" hrefLang="en-CA" href="https://cakeaiartist.com/canada" />
        <meta property="og:title" content="AI Cake Designer Canada - Beautiful Personalized Cakes" />
        <meta property="og:description" content="Create stunning personalized cakes for Canadian celebrations. Trusted by customers across Canada." />
        <meta property="og:url" content="https://cakeaiartist.com/canada" />
        <meta property="og:locale" content="en_CA" />
      </Helmet>

      <FloatingEmojis />
      <UrgencyBanner onVisibilityChange={setIsBannerVisible} />

      {/* Navigation */}
      <nav className={`sticky ${isBannerVisible ? 'top-12' : 'top-0'} z-40 bg-gradient-to-b from-party-pink/10 via-background/95 to-background backdrop-blur-md transition-all duration-300`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-party-pink hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_hsl(var(--party-pink)/0.4)]">
              🎂 Cake AI Artist
            </Link>
            
            <div className="hidden lg:flex gap-2 items-center">
              <Badge variant="outline" className="border-party-gold text-party-gold">🇨🇦 Canada</Badge>
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
                <div className="flex flex-col gap-2 mt-8">
                  <Badge variant="outline" className="w-fit border-party-gold text-party-gold mb-4">🇨🇦 Canada</Badge>
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
              <p className="text-white font-bold text-lg"><span className="inline-block animate-bounce">🎊</span> NEW YEAR LIFETIME DEAL ENDS IN:</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <CountdownTimer />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              🇨🇦 Get LIFETIME ACCESS for just $49 <span className="text-lg md:text-2xl">(~CAD$67)</span>
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
              <span className="text-white text-xl md:text-2xl font-semibold drop-shadow-md block">
                First 50 members only • <SpotsRemainingCounter tier="tier_1_49" className="inline-block" />
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-surface-elevated/95 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="grid md:grid-cols-3 gap-4 text-center mb-4">
                <div><p className="text-sm text-muted-foreground">Regular price:</p><p className="text-lg font-bold line-through text-muted-foreground">CAD$162/year forever</p></div>
                <div><p className="text-sm text-muted-foreground">Your price:</p><p className="text-3xl font-bold text-gold">~CAD$67 ONCE</p></div>
                <div><p className="text-sm text-muted-foreground">You save:</p><p className="text-lg font-bold text-party-pink">CAD$1,553+ over 10 years</p></div>
              </div>
              <Button size="lg" className="w-full bg-gradient-gold hover:shadow-gold text-lg px-8 py-6 font-bold pulse-glow" onClick={() => navigate('/pricing')}>
                Claim Your Lifetime Deal Now →
              </Button>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>"After Dec 31, this becomes CAD$13.50/month forever"</p>
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
            <h2 className="text-4xl font-bold text-foreground">Create Beautiful Personalized Cakes in Seconds</h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Here&apos;s the thing about Canadian celebrations—they&apos;re only as special as the thought you put into them. 
              From Canada Day BBQs to cozy winter birthday parties, get gorgeous, personalized cake designs faster than you can say "double-double".
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
            { icon: "💝", title: "Genuinely Personal", desc: "AI that understands your grandma's birthday needs different vibes than your buddy's stag party." },
            { icon: "⚡", title: "Stupid Fast", desc: "Four unique designs in 20 seconds. Yes, we timed it. Multiple times. We're nerds, eh." }
          ].map((feature, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }} className="text-center group">
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:animate-bounce">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Celebrations Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center text-foreground mb-4">Perfect for Canadian Celebrations</motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">From Canada Day fireworks to hockey-themed parties, create the perfect cake for any occasion</p>
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
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Loved by Cake Creators Across Canada</h2>
          <p className="text-center text-muted-foreground mb-12">See what our Canadian customers are creating</p>
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
                            <Badge variant="secondary" className="text-xs">{testimonial.character}</Badge>
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
          <p className="text-center text-muted-foreground mb-12">Prices shown in USD with approximate CAD conversion</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="text-center h-full">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Free</h3>
                  <p className="text-3xl font-bold text-party-pink mb-4">CAD$0</p>
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
                  <p className="text-3xl font-bold text-party-pink mb-1">US$49</p>
                  <p className="text-sm text-muted-foreground mb-4">(~CAD$67)</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Unlimited cakes forever</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />All characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Party Pack Generator</li>
                  </ul>
                  <Link to="/pricing"><Button className="w-full bg-gradient-to-r from-party-pink to-party-purple text-white pulse-glow">Get Lifetime Access</Button></Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="text-center h-full">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Monthly</h3>
                  <p className="text-3xl font-bold text-party-pink mb-1">US$9.99/mo</p>
                  <p className="text-sm text-muted-foreground mb-4">(~CAD$13.50/mo)</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />150 cakes per year</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />All characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Cancel anytime</li>
                  </ul>
                  <Link to="/pricing"><Button variant="outline" className="w-full">Subscribe</Button></Link>
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
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of happy customers across Canada. Start designing your personalized cake in seconds!</p>
            <Link to="/"><Button size="lg" className="bg-gradient-to-r from-party-pink to-party-purple text-white text-lg px-8 py-6 pulse-glow"><Sparkles className="mr-2 h-5 w-5" />Create Your Cake Now</Button></Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CanadaLanding;