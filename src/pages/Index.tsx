import { CakeCreator } from "@/components/CakeCreator";
import partyHero from "@/assets/party-hero.jpg";
import celebrationCake from "@/assets/celebration-cake.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-celebration">
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
            <h1 className="text-5xl md:text-7xl font-bold text-foreground drop-shadow-lg">
              <span className="bg-gradient-party bg-clip-text text-transparent animate-pulse">
                <span className="floating-flame">🕯️</span> Cake Magic <span className="dancing-flame">🔥</span>
              </span>
              <br />
              <span className="text-foreground">Creator <span className="floating-flame">✨</span></span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto font-medium">
              Turn any celebration into pure joy with stunning, AI-powered personalized cakes! 🎉
            </p>
            <div className="flex items-center justify-center gap-4 text-lg">
              <span className="animate-bounce floating-flame">🎈</span>
              <span className="text-foreground/80">Make Every Moment Special</span>
              <span className="animate-bounce dancing-flame">🎊</span>
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
      <div className="container mx-auto px-4 py-8">
        <CakeCreator />
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 mt-16 bg-gradient-surface">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-2xl mb-4">
            <span>🎂</span>
            <h3 className="font-bold text-foreground">Cake Magic Creator</h3>
            <span>✨</span>
          </div>
          <p className="text-foreground/70 text-lg">
            Bringing joy to every celebration, one personalized cake at a time! 🎉
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-foreground/60">
            <span>Made with 💖</span>
            <span>•</span>
            <span>Powered by AI 🤖</span>
            <span>•</span>
            <span>Spread the Joy 🌈</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;