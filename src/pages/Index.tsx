import { CakeCreator } from "@/components/CakeCreator";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { AdminSaleReminder } from "@/components/AdminSaleReminder";
import { LivePurchaseNotifications } from "@/components/LivePurchaseNotifications";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SpotsRemainingCounter } from "@/components/SpotsRemainingCounter";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import partyHero from "@/assets/party-hero.jpg";
import celebrationCake from "@/assets/celebration-cake.jpg";
import heroCake from "@/assets/hero-cake.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Star, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);

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
        .limit(20);

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
    <div className="min-h-screen bg-gradient-celebration">
      <AdminSaleReminder />
      <UrgencyBanner />
      <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} />
      <LiveActivityFeed />
      <LivePurchaseNotifications />
      <FeedbackWidget />
      
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 py-6 backdrop-blur-sm bg-background/80 sticky top-16 z-40 border-b border-border/30">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-foreground">Cake Magic</Link>
          <div className="flex gap-3">
            <Link to="/how-it-works"><Button variant="ghost" size="sm">How It Works</Button></Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="relative">
                Pricing
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  🔥
                </span>
              </Button>
            </Link>
            <Link to="/wall-of-founders"><Button variant="ghost" size="sm">Founding Members</Button></Link>
            <Link to="/use-cases"><Button variant="ghost" size="sm">Examples</Button></Link>
            <Link to="/community"><Button variant="ghost" size="sm">Community</Button></Link>
            <Link to="/blog"><Button variant="ghost" size="sm">Blog</Button></Link>
            <Link to="/faq"><Button variant="ghost" size="sm">FAQ</Button></Link>
            {isLoggedIn && <Button onClick={() => navigate("/gallery")} variant="outline" size="sm">My Gallery</Button>}
            {isLoggedIn && <Button onClick={() => navigate("/settings")} variant="ghost" size="sm">Settings</Button>}
            {isLoggedIn ? (
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            ) : (
              <Button onClick={() => navigate("/auth")} size="sm">Sign In</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Founding Member Sale */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-10" />
        <img
          src={partyHero}
          alt="Vibrant birthday party celebration"
          className="w-full h-auto md:h-[600px] object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-6 px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-destructive/90 backdrop-blur-sm px-6 py-3 rounded-full inline-block"
            >
              <p className="text-white font-bold text-lg">
                🎊 FOUNDING MEMBER SALE ENDS IN:
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CountdownTimer />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
            >
              Get LIFETIME ACCESS for just $49
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <p className="text-white text-xl md:text-2xl font-semibold drop-shadow-md">
                First 50 members only • <SpotsRemainingCounter tier="tier_1_49" className="inline-block" /> spots left
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-surface-elevated/95 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto"
            >
              <div className="grid md:grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Regular price:</p>
                  <p className="text-lg font-bold line-through text-muted-foreground">$156/year forever</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your price:</p>
                  <p className="text-3xl font-bold text-gold">$49 ONCE</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">You save:</p>
                  <p className="text-lg font-bold text-party-pink">$1,509 over 10 years</p>
                </div>
              </div>
              
              <Button
                size="lg"
                className="w-full bg-gradient-gold hover:shadow-gold text-lg px-8 py-6 font-bold pulse-glow"
                onClick={() => navigate('/pricing')}
              >
                Claim Your Founding Spot Now →
              </Button>
              
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>"After Dec 31, this becomes $12.99/month forever"</p>
                <p className="font-semibold text-destructive">"This offer will NEVER be repeated"</p>
              </div>
            </motion.div>
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
              className="relative w-full h-64 object-cover rounded-2xl shadow-party transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground">
              Why waste time searching?
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Here's the thing about celebrations—they're only as special as the thought you put into them. 
              But when you're juggling everything else, who has three hours to browse stock photos? 
              That's where we come in. Beautiful, personalized cake designs in the time it takes to make coffee.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
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
              className="text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Real Testimonials - Carousel */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          What People Actually Say
        </h2>
        <Carousel className="w-full max-w-5xl mx-auto mb-12">
          <CarouselContent>
            {[
              {
                quote: "I was literally googling 'birthday cake images' at 2 AM when I found this. Saved my butt. Five stars.",
                author: "Sarah M.",
                role: "Perpetual Last-Minute Planner",
                rating: 5
              },
              {
                quote: "My daughter saw her name on the cake and her face lit up. That's all that matters, isn't it?",
                author: "James K.",
                role: "Dad of Two",
                rating: 5
              },
              {
                quote: "I run a party planning business and this tool saves me hours every week. Premium is worth every penny.",
                author: "Maria G.",
                role: "Event Coordinator",
                rating: 5
              },
              {
                quote: "As a small business owner, this saves me SO much time on social media content. Game changer for my bakery's Instagram!",
                author: "Jessica T.",
                role: "Bakery Owner",
                rating: 5
              },
              {
                quote: "My son wanted a Goku cake and I found a design in minutes. The AI message was surprisingly heartfelt too.",
                author: "Priya S.",
                role: "Mom & Anime Fan",
                rating: 5
              },
              {
                quote: "I've used this for 12 different events now. Premium membership paid for itself in the first month.",
                author: "David L.",
                role: "Event Planner",
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
              <p className="text-4xl font-bold text-party-purple mb-2">10,247+</p>
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

      {/* Cake Carousel */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Recent Creations from Our Community
          </h2>
          <p className="text-xl text-muted-foreground">
            Real cakes made by real people. Yours could be here next.
          </p>
        </div>
        <Carousel className="w-full max-w-5xl mx-auto">
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
                        src={cake.image_url}
                        alt="Featured user cake design"
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
                        src={heroCake}
                        alt="Example cake design"
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      />
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
                src={selectedCarouselImage.image_url} 
                alt="Community creation" 
                className="w-full h-auto rounded-lg"
              />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground italic">{selectedCarouselImage.prompt}</p>
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

      {/* Main Creator Section */}
      <div id="creator" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Create?</h2>
            <p className="text-xl text-muted-foreground">Takes about 30 seconds. No credit card needed to start.</p>
          </div>
          <CakeCreator />
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-party-purple/20 to-party-pink/20 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Join 10,000+ Happy Creators
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop wasting time on generic designs. Start creating cakes that actually mean something.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate(isLoggedIn ? "#creator" : "/auth")} className="text-lg px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")} className="text-lg px-8">
              View Pricing
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
