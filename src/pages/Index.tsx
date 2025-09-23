import { CakeCreator } from "@/components/CakeCreator";
import heroImage from "@/assets/hero-cake.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background z-10" />
        <img
          src={heroImage}
          alt="Luxury cake background"
          className="w-full h-64 md:h-80 object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Custom Cake
              </span>
              <br />
              <span className="text-foreground">Creator</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Transform any name into a stunning, personalized cake design powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <CakeCreator />
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Create beautiful, personalized cakes with the power of AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;