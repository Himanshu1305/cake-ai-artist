import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Sparkles, Brain, Palette, Download, Share2, Gift } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { BreadcrumbSchema } from "@/components/SEOSchema";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-celebration">
      <Helmet>
        <title>About Us - The Story Behind Cake AI Artist</title>
        <meta name="description" content="We built Cake AI Artist because designing cakes shouldn't require a degree. Here's how we're making personalized celebrations accessible to everyone—no Photoshop needed." />
        <meta name="keywords" content="about cake AI artist, virtual cake platform, AI cake technology, cake design story" />
        <link rel="canonical" href="https://cakeaiartist.com/about" />
        <meta property="og:title" content="About Us - The Story Behind Cake AI Artist" />
        <meta property="og:description" content="We built Cake AI Artist because designing cakes shouldn't require a degree. Here's our story." />
        <meta property="og:url" content="https://cakeaiartist.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us - The Story Behind Cake AI Artist" />
        <meta name="twitter:description" content="We built Cake AI Artist because designing cakes shouldn't require a degree." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "About", url: "https://cakeaiartist.com/about" },
        ]}
      />
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            <span className="bg-gradient-party bg-clip-text text-transparent">
              About Cake AI Artist
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
            We're making celebrations a little sweeter, one AI-generated cake at a time. <span className="floating-flame">🎂</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 bg-surface-elevated border-party-pink/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-party rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Messages That Actually Sound Like You</h3>
              <p className="text-foreground/70">
                Here's the thing—the AI doesn't just slap "Happy Birthday" on a cake. It looks at who you're celebrating, 
                your relationship, and the occasion, then writes something that feels personal. Like you sat down and thought about it. 
                (Even if you didn't have time to.)
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-purple/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-gold rounded-full flex items-center justify-center">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Pick Your Style</h3>
              <p className="text-foreground/70">
                Multi-tiered elegance or simple single-layer charm? Chocolate or funfetti? 
                Tell us what you're imagining, and we'll bring it to life. It's honestly kind of fun to play with all the options.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-gold/30 border-2 shadow-gold hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-celebration rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Ready in About 30 Seconds</h3>
              <p className="text-foreground/70">
                Not "instantly"—we're being real here. It takes about half a minute for the AI to do its thing. 
                Grab a coffee, check your phone, and boom—three beautiful cake views waiting for you.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-coral/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-party-coral rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Download and Done</h3>
              <p className="text-foreground/70">
                Get high-res images you can actually use. Print them for decorations, share digitally, 
                or honestly just save them because they look pretty. No weird watermarks, no catches.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-mint/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-party-mint rounded-full flex items-center justify-center">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Share Wherever</h3>
              <p className="text-foreground/70">
                WhatsApp, Instagram, Facebook, X—you name it. On mobile, we'll open the app for you so sharing takes like 3 taps. 
                Desktop users, you'll need to download first then upload. Simple stuff.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface-elevated border-party-pink/30 border-2 shadow-party hover:shadow-elegant transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-party rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Try It Free, Seriously</h3>
              <p className="text-foreground/70">
                3 cakes a day, no credit card, no "free trial that secretly charges you." 
                Premium gets you more, but you can use the free version forever if that's your thing.
              </p>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="p-8 bg-gradient-surface border-party-purple/30 border-2 shadow-elegant mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 text-foreground">
            The Short Version <span className="floating-flame">✨</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg text-foreground">Type a Name</h3>
              <p className="text-foreground/70">Could be "Sarah" or "The Best Dad Ever"—we're flexible</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg text-foreground">Pick Your Vibe</h3>
              <p className="text-foreground/70">Birthday? Anniversary? Just because? Plus colors, layers, themes</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg text-foreground">Wait 30 Seconds</h3>
              <p className="text-foreground/70">The AI does its magic. No, really—that's it.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gold text-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg text-foreground">Download & Party</h3>
              <p className="text-foreground/70">Share it, print it, celebrate!</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-party text-white hover:opacity-90 transition-opacity shadow-party">
              <Sparkles className="w-5 h-5 mr-2" />
              Alright, Let's Make a Cake
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;