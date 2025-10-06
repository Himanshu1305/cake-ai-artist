import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Sparkles, Brain, Palette, Download, Share2, Gift } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-celebration">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            <span className="bg-gradient-party bg-clip-text text-transparent">
              About Cake Magic Creator
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
            Bringing joy to celebrations with AI-powered personalized cakes! <span className="floating-flame">🎂</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 bg-surface-elevated border-party-pink/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-party rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">AI-Powered Messages</h3>
              <p className="text-foreground/70">
                Our advanced AI creates heartfelt, personalized messages based on the occasion, relationship, and recipient. Every message is unique and thoughtful!
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-purple/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-gold rounded-full flex items-center justify-center">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Custom Cake Designs</h3>
              <p className="text-foreground/70">
                Choose from multiple cake types, layers, themes, and color schemes to create the perfect cake that matches your vision and celebration style.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-gold/30 border-2 shadow-gold hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-celebration rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Instant Generation</h3>
              <p className="text-foreground/70">
                Get your personalized cake design in seconds! Our powerful AI generates stunning, high-quality cake images instantly.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-coral/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-party-coral rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Easy Download</h3>
              <p className="text-foreground/70">
                Download your created cake images in high resolution. Perfect for sharing digitally or printing for your actual celebration!
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-mint/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-party-mint rounded-full flex items-center justify-center">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Social Sharing</h3>
              <p className="text-foreground/70">
                Share your beautiful cake creations directly to Facebook, Twitter, and WhatsApp. Spread the joy with friends and family!
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-pink/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-party rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Freemium Model</h3>
              <p className="text-foreground/70">
                Start for free! All users get access to basic features. Premium users enjoy 100 cake generations per year.
              </p>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="p-8 bg-gradient-surface border-party-purple/30 border-2 shadow-elegant mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 text-foreground">
            How It Works <span className="floating-flame">✨</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg text-foreground">Enter Details</h3>
              <p className="text-foreground/70">Provide the recipient's name and occasion details</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg text-foreground">Customize Design</h3>
              <p className="text-foreground/70">Choose cake type, layers, theme, and colors</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg text-foreground">AI Magic</h3>
              <p className="text-foreground/70">Our AI generates a stunning personalized cake</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gold text-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg text-foreground">Share & Celebrate</h3>
              <p className="text-foreground/70">Download and share your creation!</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-party text-white hover:opacity-90 transition-opacity shadow-party">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Now!
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
