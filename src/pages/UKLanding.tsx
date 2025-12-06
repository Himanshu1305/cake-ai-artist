import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Crown, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

const UKLanding = () => {
  const testimonials = [
    {
      name: "James K.",
      location: "Manchester",
      rating: 5,
      text: "Made a Peppa Pig cake for my daughter's 4th birthday. The pastel pink design was spot on, and she couldn't stop smiling!",
      character: "Peppa Pig",
      theme: "Pastel Pink"
    },
    {
      name: "Emma W.",
      location: "London",
      rating: 5,
      text: "The Elsa character option was brilliant! Created a proper tiered birthday cake for my nan's 70th with an elegant theme.",
      character: "Elsa",
      theme: "Elegant Tiered"
    },
    {
      name: "Sophie R.",
      location: "Edinburgh",
      rating: 5,
      text: "Used the fun/cartoon style for my son's Spider-Man cake. The multicolor frosting looked absolutely gorgeous!",
      character: "Spider-Man",
      theme: "Multicolor Cartoon"
    },
    {
      name: "David M.",
      location: "Birmingham",
      rating: 5,
      text: "Created a beautiful red velvet anniversary cake with gold/silver accents. My wife loved it!",
      character: "None",
      theme: "Red Velvet Gold"
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Royal Celebrations", icon: Crown },
    { name: "Garden Parties", icon: Sparkles },
    { name: "Anniversary", icon: Cake }
  ];

  return (
    <>
      <Helmet>
        <title>AI Cake Designer UK - Beautiful Personalised Cakes | Cake AI Artist</title>
        <meta name="description" content="Create stunning personalised cakes for British celebrations. Perfect for birthdays, royal celebrations, garden parties. Trusted by customers across the UK." />
        <meta name="keywords" content="UK cake designer, British celebration cakes, personalised birthday cake UK, AI cake design UK, virtual cake creator UK" />
        <link rel="canonical" href="https://cakeaiartist.com/uk" />
        <link rel="alternate" hrefLang="en-GB" href="https://cakeaiartist.com/uk" />
        <meta property="og:title" content="AI Cake Designer UK - Beautiful Personalised Cakes" />
        <meta property="og:description" content="Create stunning personalised cakes for British celebrations. Trusted by customers across the UK." />
        <meta property="og:url" content="https://cakeaiartist.com/uk" />
        <meta property="og:locale" content="en_GB" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-party-pink drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
              🎂 Cake AI Artist
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">🇬🇧 United Kingdom</Badge>
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
              🇬🇧 Trusted by customers across the United Kingdom
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Create Stunning Cakes for <span className="text-party-pink">British Celebrations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Design beautiful personalised cakes in seconds. Perfect for birthdays, royal celebrations, garden parties, and afternoon tea. No design skills needed!
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

        {/* UK Celebrations Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Perfect for British Celebrations
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              From Jubilee street parties to cosy family birthdays, create the perfect cake for any occasion
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
              Loved by Cake Creators Across the UK
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              See what our British customers are creating
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
              Prices shown in USD with approximate GBP conversion
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Free</h3>
                  <p className="text-3xl font-bold text-party-pink mb-4">£0</p>
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
                  <p className="text-sm text-muted-foreground mb-4">(~£39)</p>
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
                  <p className="text-sm text-muted-foreground mb-4">(~£7.99/mo)</p>
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
              Join thousands of happy customers across the UK. Start designing your personalised cake in seconds!
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

export default UKLanding;
