import { CakeCreator } from "@/components/CakeCreator";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import partyHero from "@/assets/party-hero.jpg";
import celebrationCake from "@/assets/celebration-cake.jpg";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-celebration">
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-end gap-4">
          {isLoggedIn && (
            <Button
              onClick={() => navigate("/gallery")}
              variant="outline"
              className="border-party-purple/30 hover:border-party-purple"
            >
              My Gallery
            </Button>
          )}
          <Link to="/about">
            <button className="px-5 py-2 bg-surface-elevated/80 backdrop-blur-sm text-foreground font-semibold rounded-lg border-2 border-party-pink/30 hover:border-party-pink hover:shadow-party transition-all duration-300">
              About Us
            </button>
          </Link>
          <a href="#creator">
            <button className="px-5 py-2 bg-surface-elevated/80 backdrop-blur-sm text-foreground font-semibold rounded-lg border-2 border-party-purple/30 hover:border-party-purple hover:shadow-party transition-all duration-300">
              Learn More
            </button>
          </a>
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-party-pink/30 hover:border-party-pink"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-party-pink hover:bg-party-pink/90"
            >
              Login / Sign Up
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
          className="w-full h-72 md:h-96 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-6 px-4">
            <h1 className="text-5xl md:text-7xl font-bold drop-shadow-lg">
              <span className="bg-gradient-party bg-clip-text text-transparent animate-pulse">
                <span className="animate-flame-flicker inline-block">🕯️</span> Cake Magic <span className="animate-flame-dance inline-block">🔥</span>
              </span>
              <br />
              <span className="text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">Creator <span className="animate-flame-flicker inline-block">✨</span></span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto font-medium">
              Turn any celebration into pure joy with stunning, AI-powered personalized cakes! 🎉
            </p>
            <div className="flex items-center justify-center gap-4 text-lg flex-wrap">
              <span className="animate-bounce inline-block">🎈</span>
              <span className="text-foreground/80">Make Every Moment Special</span>
              <span className="animate-bounce inline-block">🎊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              src={celebrationCake}
              alt="Beautiful celebration cake"
              className="w-full h-64 object-cover rounded-2xl shadow-party"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              🌟 Create Unforgettable Moments
            </h2>
            <p className="text-lg text-foreground/80">
              From birthdays to celebrations, our AI creates stunning personalized cakes 
              that make every occasion magical and memorable!
            </p>
            <div className="flex gap-3 flex-wrap">
              <span className="px-3 py-1 bg-party-pink/20 text-foreground rounded-full text-sm">
                <span className="floating-flame">🎂</span> Custom Messages
              </span>
              <span className="px-3 py-1 bg-party-purple/20 text-foreground rounded-full text-sm">
                <span className="dancing-flame">🎨</span> Beautiful Designs
              </span>
              <span className="px-3 py-1 bg-gold/20 text-foreground rounded-full text-sm candle-glow">
                <span className="floating-flame">✨</span> AI-Powered
              </span>
            </div>
          </div>
        </div>
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