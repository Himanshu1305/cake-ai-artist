import { Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { BreadcrumbSchema, HowToSchema, SoftwareApplicationSchema } from "@/components/SEOSchema";
import { Sparkles, Check, Star, Zap, Heart, Download, Share2, Palette } from "lucide-react";
import { motion } from "framer-motion";

const CakeCreator = lazy(() => import("@/components/CakeCreator").then(mod => ({ default: mod.CakeCreator })));

const FreeCakeDesigner = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Zap, title: "30-Second Generation", description: "Get beautiful cake designs in just 30 seconds" },
    { icon: Palette, title: "Full Customization", description: "Choose colors, layers, themes, and characters" },
    { icon: Heart, title: "AI-Written Messages", description: "Personalized messages that sound like you" },
    { icon: Download, title: "High-Res Downloads", description: "Download print-ready images instantly" },
    { icon: Share2, title: "Easy Sharing", description: "Share directly to WhatsApp, Instagram & more" },
    { icon: Star, title: "3 Free Designs Daily", description: "No credit card required, use forever" },
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration">
      <Helmet>
        <title>Free AI Cake Designer - Create Personalized Cakes in Seconds | Cake AI Artist</title>
        <meta name="description" content="Design beautiful personalized cakes for free with our AI cake generator. Create stunning birthday, anniversary, and celebration cakes in 30 seconds. No design skills needed!" />
        <meta name="keywords" content="free AI cake designer, free cake generator, AI cake maker, personalized cake design, virtual cake creator, birthday cake designer, free cake design tool" />
        <link rel="canonical" href="https://cakeaiartist.com/free-ai-cake-designer" />
        <meta property="og:title" content="Free AI Cake Designer - Create Personalized Cakes in Seconds" />
        <meta property="og:description" content="Design beautiful personalized cakes for free with our AI cake generator. Create stunning celebration cakes in 30 seconds." />
        <meta property="og:url" content="https://cakeaiartist.com/free-ai-cake-designer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI Cake Designer - Create Personalized Cakes in Seconds" />
        <meta name="twitter:description" content="Design beautiful personalized cakes for free with our AI cake generator." />
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
      <header className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

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
              Free AI Cake Designer
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Create stunning personalized cakes in 30 seconds. No design skills required. 
              Just type a name, pick an occasion, and let AI do the magic.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-party-mint" />
                <span>3 free designs per day</span>
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
          <Suspense fallback={
            <Card className="max-w-4xl mx-auto p-8 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-party-pink animate-pulse" />
              <p className="text-muted-foreground">Loading cake designer...</p>
            </Card>
          }>
            <CakeCreator />
          </Suspense>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Why Use Our Free AI Cake Designer?
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
            No signup required to try • Upgrade anytime for unlimited designs
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FreeCakeDesigner;
