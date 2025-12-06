import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Snowflake, Heart, CheckCircle2, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

const CanadaLanding = () => {
  const testimonials = [
    {
      name: "Mike T.",
      location: "Toronto",
      rating: 5,
      text: "Made a Pikachu birthday cake for my son's 8th. The rainbow colors were perfect - he's still talking about it!",
      character: "Pikachu",
      theme: "Rainbow"
    },
    {
      name: "Nicole B.",
      location: "Calgary",
      rating: 5,
      text: "Used the Frozen theme with Olaf character for my daughter's party. The pastel 3-layer cake design was stunning!",
      character: "Olaf",
      theme: "Pastel 3-Layer"
    },
    {
      name: "Ryan D.",
      location: "Vancouver",
      rating: 5,
      text: "Created a Minions graduation cake with funfetti style. The AI-generated message was heartfelt and perfect!",
      character: "Minions",
      theme: "Funfetti"
    },
    {
      name: "Sarah L.",
      location: "Montreal",
      rating: 5,
      text: "The Hello Kitty option was exactly what my daughter wanted. Pink 2-layer design looked professional!",
      character: "Hello Kitty",
      theme: "Pink 2-Layer"
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Canada Day", icon: Heart },
    { name: "Winter Celebrations", icon: Snowflake },
    { name: "Anniversary", icon: Cake }
  ];

  return (
    <>
      <Helmet>
        <title>AI Cake Designer Canada - Beautiful Personalized Cakes | Cake AI Artist</title>
        <meta name="description" content="Create stunning personalized cakes for Canadian celebrations. Perfect for birthdays, Canada Day, hockey parties. Trusted by customers across Canada." />
        <meta name="keywords" content="Canada cake designer, Canadian celebration cakes, personalized birthday cake Canada, AI cake design Canada, virtual cake creator Canada" />
        <link rel="canonical" href="https://cakeaiartist.com/canada" />
        <link rel="alternate" hrefLang="en-CA" href="https://cakeaiartist.com/canada" />
        <meta property="og:title" content="AI Cake Designer Canada - Beautiful Personalized Cakes" />
        <meta property="og:description" content="Create stunning personalized cakes for Canadian celebrations. Trusted by customers across Canada." />
        <meta property="og:url" content="https://cakeaiartist.com/canada" />
        <meta property="og:locale" content="en_CA" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-party-pink drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
              🎂 Cake AI Artist
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">🇨🇦 Canada</Badge>
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
              🇨🇦 Trusted by customers across Canada
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Design Beautiful Cakes for <span className="text-party-pink">Canadian Celebrations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create stunning personalized cakes in seconds. Perfect for birthdays, Canada Day, hockey parties, and winter celebrations. No design skills needed!
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

        {/* Canada Celebrations Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Perfect for Canadian Celebrations
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              From Canada Day BBQs to cozy winter birthday parties, create the perfect cake for any occasion
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
              Loved by Cake Creators Across Canada
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              See what our Canadian customers are creating
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
                        <Badge variant="secondary" className="text-xs">{testimonial.character}</Badge>
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
              Prices shown in USD with approximate CAD conversion
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
                  <p className="text-sm text-muted-foreground mb-4">(~CAD$67)</p>
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
                  <p className="text-sm text-muted-foreground mb-4">(~CAD$13.50/mo)</p>
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
              Join thousands of happy customers across Canada. Start designing your personalized cake in seconds!
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

export default CanadaLanding;
