import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Sun, Waves, CheckCircle2, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

const AustraliaLanding = () => {
  const testimonials = [
    {
      name: "Emily R.",
      location: "Sydney",
      rating: 5,
      text: "As a party planner, I use this weekly! Made a gorgeous tiered vanilla anniversary cake with white fondant. Absolutely stunning!",
      character: "None",
      theme: "Tiered Vanilla White"
    },
    {
      name: "Daniel H.",
      location: "Melbourne",
      rating: 5,
      text: "Created my mate's Goku birthday cake on the train! The modern style with blue accents was sick!",
      character: "Goku",
      theme: "Modern Blue"
    },
    {
      name: "Chloe M.",
      location: "Brisbane",
      rating: 5,
      text: "Made my daughter's Barbie cake with pink elegant styling. The fondant lettering looked like a real bakery did it!",
      character: "Barbie",
      theme: "Pink Elegant"
    },
    {
      name: "Josh W.",
      location: "Perth",
      rating: 5,
      text: "Used the Spider-Man character with chocolate 3-layer design for my nephew. Total legend move!",
      character: "Spider-Man",
      theme: "Chocolate 3-Layer"
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Australia Day", icon: Sun },
    { name: "Beach Parties", icon: Waves },
    { name: "Anniversary", icon: Cake }
  ];

  return (
    <>
      <Helmet>
        <title>AI Cake Designer Australia - Beautiful Personalised Cakes | Cake AI Artist</title>
        <meta name="description" content="Create stunning personalised cakes for Aussie celebrations. Perfect for birthdays, Australia Day, beach parties. Trusted by customers across Australia." />
        <meta name="keywords" content="Australia cake designer, Aussie celebration cakes, personalised birthday cake Australia, AI cake design Australia, virtual cake creator Australia" />
        <link rel="canonical" href="https://cakeaiartist.com/australia" />
        <link rel="alternate" hrefLang="en-AU" href="https://cakeaiartist.com/australia" />
        <meta property="og:title" content="AI Cake Designer Australia - Beautiful Personalised Cakes" />
        <meta property="og:description" content="Create stunning personalised cakes for Aussie celebrations. Trusted by customers across Australia." />
        <meta property="og:url" content="https://cakeaiartist.com/australia" />
        <meta property="og:locale" content="en_AU" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-party-pink drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
              🎂 Cake AI Artist
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">🇦🇺 Australia</Badge>
              <Link to="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link to="/">
                <Button className="bg-gradient-to-r from-party-pink to-party-purple text-white">
                  Create Your Cake
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-party-pink/10 via-background to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6 bg-party-gold/20 text-party-gold border-party-gold/30">
              🇦🇺 Trusted by customers across Australia
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Create Amazing Cakes for <span className="text-party-pink">Aussie Celebrations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Design beautiful personalised cakes in seconds. Perfect for birthdays, Australia Day, summer BBQs, and beach parties. No design skills needed!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="bg-gradient-to-r from-party-pink to-party-purple text-white text-lg px-8 py-6">
                  <Cake className="mr-2 h-5 w-5" />
                  Start Designing Free
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Australia Celebrations Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Perfect for Aussie Celebrations
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              From Australia Day backyard barbies to summer beach birthdays, create the perfect cake for any occasion
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {celebrations.map((celebration) => (
                <Card key={celebration.name} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <celebration.icon className="h-10 w-10 mx-auto mb-3 text-party-pink" />
                    <p className="font-medium text-foreground">{celebration.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Loved by Cake Creators Across Australia
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              See what our Aussie customers are creating
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-party-gold text-party-gold" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                      <div className="flex gap-2">
                        {testimonial.character !== "None" && (
                          <Badge variant="secondary" className="text-xs">{testimonial.character}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{testimonial.theme}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Special New Year Lifetime Deal
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Prices shown in USD with approximate AUD conversion
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Free</h3>
                  <p className="text-3xl font-bold text-party-pink mb-4">$0</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 5 cakes per day</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Basic characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Standard quality</li>
                  </ul>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="text-center border-party-pink shadow-lg relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-party-pink text-white">Most Popular</Badge>
                <CardContent className="pt-8">
                  <h3 className="text-xl font-bold text-foreground mb-2">Lifetime Deal</h3>
                  <p className="text-3xl font-bold text-party-pink mb-1">US$49</p>
                  <p className="text-sm text-muted-foreground mb-4">(~AUD$75)</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Unlimited cakes forever</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> All characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Party Pack Generator</li>
                  </ul>
                  <Link to="/pricing">
                    <Button className="w-full bg-gradient-to-r from-party-pink to-party-purple text-white">
                      Get Lifetime Access
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Monthly</h3>
                  <p className="text-3xl font-bold text-party-pink mb-1">US$9.99/mo</p>
                  <p className="text-sm text-muted-foreground mb-4">(~AUD$15.30/mo)</p>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 150 cakes per year</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> All characters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime</li>
                  </ul>
                  <Link to="/pricing">
                    <Button variant="outline" className="w-full">Subscribe</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-party-pink/20 via-party-purple/20 to-party-gold/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Create Your Perfect Cake?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of happy customers across Australia. Start designing your personalised cake in seconds!
            </p>
            <Link to="/">
              <Button size="lg" className="bg-gradient-to-r from-party-pink to-party-purple text-white text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your Cake Now
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AustraliaLanding;
