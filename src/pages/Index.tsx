import { CakeCreator } from "@/components/CakeCreator";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import partyHero from "@/assets/party-hero.jpg";
import celebrationCake from "@/assets/celebration-cake.jpg";
import heroCake from "@/assets/hero-cake.jpg";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);

  useEffect(() => {
    checkAuth();
    loadFeaturedCakes();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFeaturedCakes = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("image_url, prompt")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFeaturedCakes(data);
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
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-celebration">
      <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} />
      
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 py-6 backdrop-blur-sm bg-background/80 sticky top-0 z-50 border-b border-border/30">
        <div className="flex justify-end gap-4">
          {isLoggedIn && (
            <Button
              onClick={() => navigate("/gallery")}
              variant="outline"
              className="border-party-purple/30 hover:border-party-purple hover:scale-105 transition-transform duration-300"
            >
              🖼️ My Gallery
            </Button>
          )}
          <Link to="/about">
            <button className="px-5 py-2 bg-surface-elevated/80 backdrop-blur-sm text-foreground font-semibold rounded-lg border-2 border-party-pink/30 hover:border-party-pink hover:shadow-party transition-all duration-300 hover:scale-105">
              ℹ️ About Us
            </button>
          </Link>
          <a href="#creator">
            <button className="px-5 py-2 bg-surface-elevated/80 backdrop-blur-sm text-foreground font-semibold rounded-lg border-2 border-party-purple/30 hover:border-party-purple hover:shadow-party transition-all duration-300 hover:scale-105">
              📖 Learn More
            </button>
          </a>
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-party-pink/30 hover:border-party-pink hover:scale-105 transition-transform duration-300"
            >
              🚪 Logout
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-party-pink hover:bg-party-pink/90 hover:scale-105 transition-transform duration-300 hover:shadow-party"
            >
              🔐 Login / Sign Up
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-10" />
        <img
          src={partyHero}
          alt="Vibrant birthday party celebration"
          className="w-full h-72 md:h-96 object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-6 px-4 float">
            <h1 className="text-5xl md:text-7xl font-bold drop-shadow-lg">
              <span className="text-white drop-shadow-[0_4px_20px_rgba(255,20,147,0.8)] [text-shadow:_2px_2px_8px_rgb(255_20_147_/_80%),_-2px_-2px_8px_rgb(138_43_226_/_60%)] animate-pulse">
                Cake Magic
              </span>
              <br />
              <span className="text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">Creator ✨</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto font-medium">
              Turn any celebration into pure joy with stunning, AI-powered personalized cakes! 🎉
            </p>
            <div className="flex items-center justify-center gap-4 text-lg flex-wrap">
              <span className="animate-bounce inline-block text-2xl">🎈</span>
              <span className="text-foreground/80 font-semibold">Make Every Moment Special</span>
              <span className="animate-bounce inline-block text-2xl">🎊</span>
            </div>
            <div className="pt-4">
              <a href="#creator">
                <Button 
                  size="lg" 
                  className="bg-gradient-gold text-white hover:shadow-gold transition-all duration-300 hover:scale-110 text-lg px-8 py-6 animate-pulse"
                >
                  🎂 Start Creating Now! ✨
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-party opacity-30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
            <img
              src={celebrationCake}
              alt="Beautiful celebration cake"
              className="relative w-full h-64 object-cover rounded-2xl shadow-party transition-transform duration-500 hover:scale-105 pulse-glow"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground flex items-center gap-2">
              <span className="animate-bounce inline-block">🌟</span>
              Create Unforgettable Moments
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              From birthdays to celebrations, our AI creates stunning personalized cakes 
              that make every occasion magical and memorable!
            </p>
            <div className="flex gap-3 flex-wrap">
              <span className="px-4 py-2 bg-party-pink/20 text-foreground rounded-full text-base font-medium border-2 border-party-pink/40 hover:bg-party-pink/30 transition-all duration-300 hover:scale-110 cursor-pointer">
                <span className="floating-flame">🎂</span> Custom Messages
              </span>
              <span className="px-4 py-2 bg-party-purple/20 text-foreground rounded-full text-base font-medium border-2 border-party-purple/40 hover:bg-party-purple/30 transition-all duration-300 hover:scale-110 cursor-pointer">
                <span className="dancing-flame">🎨</span> Beautiful Designs
              </span>
              <span className="px-4 py-2 bg-gold/20 text-foreground rounded-full text-base font-medium border-2 border-gold/40 hover:bg-gold/30 transition-all duration-300 hover:scale-110 cursor-pointer candle-glow">
                <span className="floating-flame">✨</span> AI-Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cake Carousel */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            ✨ Get Inspired by These Amazing Creations ✨
          </h2>
          <p className="text-xl text-foreground/80">
            You can create stunning cakes like these too!
          </p>
        </div>
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {featuredCakes.length > 0 ? (
              featuredCakes.map((cake, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-gold/30 hover:border-gold transition-all">
                      <img
                        src={cake.image_url}
                        alt="Featured user cake design"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                        src={heroCake}
                        alt="Example cake design 1"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-foreground font-semibold">Birthday Celebration</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-party-purple/30 hover:border-party-purple transition-all">
                      <img
                        src={celebrationCake}
                        alt="Example cake design 2"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-foreground font-semibold">Special Occasion</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="relative group overflow-hidden rounded-xl border-2 border-gold/30 hover:border-gold transition-all">
                      <img
                        src={partyHero}
                        alt="Example cake design 3"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-foreground font-semibold">Party Theme</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>

      {/* Main Content */}
      <div id="creator" className="container mx-auto px-4 py-8">
        <CakeCreator />
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 mt-16 bg-gradient-surface">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2 text-2xl">
                <span className="animate-flame-flicker inline-block">🎂</span>
                <h3 className="font-bold text-foreground">Cake Magic Creator</h3>
                <span className="animate-flame-flicker inline-block">✨</span>
              </div>
              <p className="text-foreground/70">
                Bringing joy to every celebration with AI-powered personalized cakes!
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link to="/about" className="text-foreground/70 hover:text-primary transition-colors">
                  About Us
                </Link>
                <Link to="/privacy" className="text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
            
            <div className="text-center md:text-right space-y-2">
              <h4 className="font-semibold text-foreground mb-3">Freemium Model</h4>
              <p className="text-foreground/70 text-sm">
                Free for all users!
              </p>
              <p className="text-foreground/70 text-sm">
                Premium: 100 generations/year
              </p>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-border/30">
            <div className="flex items-center justify-center gap-6 text-sm text-foreground/60">
              <span>Made with 💖</span>
              <span>•</span>
              <span>Powered by AI 🤖</span>
              <span>•</span>
              <span>Spread the Joy 🌈</span>
            </div>
            <p className="text-foreground/50 text-xs mt-4">
              © 2025 Cake Magic Creator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;