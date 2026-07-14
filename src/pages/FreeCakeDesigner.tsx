import { Suspense, lazy, useState, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
const FREE_TOTAL_LIMIT = 5; // keep in sync with CakeCreator.tsx
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { Helmet } from "react-helmet-async";
import { BreadcrumbSchema, HowToSchema, SoftwareApplicationSchema } from "@/components/SEOSchema";
import { Sparkles, Check, Star, Zap, Heart, Download, Share2, Palette, X, Crown, Gift, Copy } from "lucide-react";
import { motion } from "framer-motion";
import WelcomeModal from "@/components/WelcomeModal";
import { toast } from "@/hooks/use-toast";

const CakeCreator = lazy(() => import("@/components/CakeCreator").then(mod => ({ default: mod.CakeCreator })));

const FreeCakeDesigner = () => {
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [welcomeOccasion, setWelcomeOccasion] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showStartBanner, setShowStartBanner] = useState(false);
  const [cakeGenerated, setCakeGenerated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? null;
      setCurrentUserId(userId);

      if (userId) {
        const bannerKey = `start_banner_dismissed_${userId}`;
        if (!localStorage.getItem(bannerKey)) {
          setShowStartBanner(true);
        }
        const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
        setIsPremium(profile?.is_premium || false);
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('welcome') === 'true') {
        const welcomeKey = userId ? `welcome_shown_${userId}` : 'welcome_shown_guest';
        if (!localStorage.getItem(welcomeKey)) {
          localStorage.setItem(welcomeKey, 'true');
          setShowWelcome(true);
        }
        // Strip ?welcome=true from URL without adding a history entry
        navigate('/free-ai-cake-designer', { replace: true });
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWelcomeStart = (occasion: string, name: string) => {
    setWelcomeOccasion(occasion);
    setWelcomeName(name);
    setShowWelcome(false);
    document.getElementById('creator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWelcomeSkip = () => {
    setShowWelcome(false);
  };

  const handleDismissBanner = () => {
    if (currentUserId) {
      localStorage.setItem(`start_banner_dismissed_${currentUserId}`, 'true');
    }
    setShowStartBanner(false);
  };

  const features = [
    { icon: Zap, title: "30-Second Generation", description: "Get beautiful cake designs in just 30 seconds" },
    { icon: Palette, title: "Full Customization", description: "Choose colors, layers, themes, and characters" },
    { icon: Heart, title: "AI-Written Messages", description: "Personalized messages that sound like you" },
    { icon: Download, title: "High-Res Downloads", description: "Download print-ready images instantly" },
    { icon: Share2, title: "Easy Sharing", description: "Share directly to WhatsApp, Instagram & more" },
    { icon: Star, title: `${FREE_TOTAL_LIMIT} Free Designs`, description: "No credit card required, use forever" },
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration">
      {showWelcome && (
        <WelcomeModal
          userId={currentUserId}
          onStart={handleWelcomeStart}
          onSkip={handleWelcomeSkip}
        />
      )}

      <Helmet>
        <title>Free AI Cake Designer — Create Custom Cakes in 30 Seconds</title>
        <meta name="description" content="Design free AI cakes online in 30 seconds. Personalised birthday, wedding and celebration cakes with AI. No design skills needed." />
        <meta name="keywords" content="ai cake generator free, free ai cake generator, cake generator, ai cakes, cake ai, ai cake, birthday cake ai, ai birthday cakes, free ai cake designer, ai cake maker, personalized cake design, virtual cake creator, birthday cake designer" />
        <link rel="canonical" href="https://cakeaiartist.com/free-ai-cake-designer" />
        <meta property="og:title" content="Free AI Cake Generator — AI Cake Designer Online" />
        <meta property="og:description" content="Free AI cake generator. Design AI birthday cakes & personalized celebration cakes in 30 seconds." />
        <meta property="og:url" content="https://cakeaiartist.com/free-ai-cake-designer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI Cake Generator — AI Cake Designer Online" />
        <meta name="twitter:description" content="Free AI cake generator. Design AI cakes & birthday cakes in 30 seconds." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "Free AI Cake Designer", url: "https://cakeaiartist.com/free-ai-cake-designer" },
        ]}
      />

      <SoftwareApplicationSchema />

      <HowToSchema
        name="How to Create a Free AI Cake Design"
        description="Create a beautiful personalized cake design in 30 seconds using our free AI cake designer"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Enter the recipient's name", text: "Type the name you want on the cake (e.g., 'Sarah' or 'Happy Birthday Mom')" },
          { name: "Choose the occasion", text: "Select from birthday, anniversary, wedding, graduation, or other celebrations" },
          { name: "Customize your design", text: "Pick colors, layers, themes, and optionally add a character" },
          { name: "Generate your cake", text: "Click generate and wait 30 seconds for your AI-designed cake" },
          { name: "Download and share", text: "Download your high-resolution cake image or share directly to social media" },
        ]}
      />

      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-gradient-party text-white text-sm font-semibold px-4 py-1 rounded-full mb-4">
              100% Free to Try
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Free AI Cake Generator & Designer
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Create stunning personalized AI cakes in 30 seconds with the #1 free AI cake generator. No design skills required.
              Just type a name, pick an occasion, and let our birthday cake AI do the magic.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-party-mint" />
                <span>{FREE_TOTAL_LIMIT} free designs to get started</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-party-mint" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-party-mint" />
                <span>High-resolution downloads</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cake Creator */}
        <div id="creator" className="mb-16">
          {showStartBanner && (
            <div className="max-w-4xl mx-auto mb-4 bg-party-pink/10 border border-party-pink/30 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-foreground">
                👋 <strong>First time here?</strong> You have {FREE_TOTAL_LIMIT} free cake designs. Fill in the name and occasion below to get started!
              </p>
              <button
                onClick={handleDismissBanner}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <ErrorBoundary component="CakeCreator">
            <Suspense fallback={
              <Card className="max-w-4xl mx-auto p-8 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-4 text-party-pink animate-pulse" />
                <p className="text-muted-foreground">Loading cake designer...</p>
              </Card>
            }>
              <CakeCreator onGenerate={() => setCakeGenerated(true)} />
            </Suspense>
          </ErrorBoundary>
        </div>

        {cakeGenerated && (
          <div className="max-w-4xl mx-auto mt-8 mb-16 space-y-4">
            {isPremium ? (
              <div className="rounded-2xl border-2 border-party-purple/30 bg-gradient-to-br from-party-purple/10 to-party-pink/10 p-6 text-center">
                <h3 className="text-xl font-bold mb-2">🎊 Now plan the whole party!</h3>
                <p className="text-muted-foreground mb-4">Your cake is ready — let AI build the full party checklist, invites and RSVP tracking.</p>
                <Button
                  onClick={() => navigate('/party-planner')}
                  className="bg-gradient-to-r from-party-purple to-party-pink text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Open AI Party Planner →
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-party-gold/30 bg-gradient-to-br from-party-gold/10 to-party-orange/10 p-6 text-center">
                <h3 className="text-xl font-bold mb-2">✨ Love your cake? Unlock unlimited designs</h3>
                <p className="text-muted-foreground mb-2">You have used 1 of your {FREE_TOTAL_LIMIT} free designs. Premium unlocks unlimited cakes, Party Pack Generator, and AI Party Planner.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-party-gold to-party-orange text-white font-bold"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/party-planner')}
                    className="border-party-purple/30"
                  >
                    Try Party Planner Free →
                  </Button>
                </div>
              </div>

              {/* Referral card — invite friends for bonus generations */}
              {currentUserId && (
                <div className="rounded-2xl border-2 border-party-purple/30 bg-gradient-to-br from-party-purple/10 to-party-pink/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-party-purple/20 rounded-lg">
                      <Gift className="w-5 h-5 text-party-purple" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Love your cake? Share the love!</h3>
                      <p className="text-sm text-muted-foreground">Give a friend 2 free bonus designs — and get 2 yourself!</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`https://cakeaiartist.com/free-ai-cake-designer?ref=${currentUserId}`}
                      className="flex-1 text-xs font-mono bg-background border border-border rounded-md px-3 py-2 text-foreground/70 truncate"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://cakeaiartist.com/free-ai-cake-designer?ref=${currentUserId}`);
                        toast({ title: "Link copied!", description: "Share it with friends to earn 2 bonus designs." });
                      }}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            )}
          </div>
        )}

        {!cakeGenerated && (
          <>
            {/* Features Grid */}
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-8">
                Why Our Free AI Cake Generator Is the Best AI Cake Designer Online
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full bg-surface-elevated border-border/50 hover:border-party-pink/30 transition-all">
                      <feature.icon className="w-10 h-10 text-party-pink mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-party-gold fill-party-gold" />
                ))}
              </div>
              <p className="text-xl text-foreground mb-2">Rated 4.9/5 by 2,800+ users</p>
              <p className="text-muted-foreground">
                "I couldn't believe how easy it was. Typed my daughter's name, picked birthday,
                and got the most beautiful cake design in seconds!" - Sarah M.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-gradient-party text-white hover:opacity-90 px-8 py-6 text-lg"
                onClick={() => document.getElementById('creator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Designing for Free
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Sign up free — no credit card required • Upgrade anytime for unlimited designs
              </p>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default FreeCakeDesigner;
