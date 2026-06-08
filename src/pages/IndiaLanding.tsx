import { SiteHeader } from "@/components/SiteHeader";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { OrganizationSchema, ProductReviewSchema, BreadcrumbSchema, ProductSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cake, PartyPopper, Sparkles, CheckCircle2, Palette, Menu, Download, Loader2, Gift, Heart } from "lucide-react";
import { Footer } from "@/components/Footer";
import { CountryRecipesSection } from "@/components/CountryRecipesSection";
import { CountryBlogFeed } from "@/components/CountryBlogFeed";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { FloatingEmojis } from "@/components/FloatingEmojis";
import { ConfettiRain } from "@/components/ConfettiRain";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { PricingPlans } from "@/components/PricingPlans";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Autoplay from "embla-carousel-autoplay";
import partyHero from "@/assets/party-hero.jpg";
import celebrationCake from "@/assets/celebration-cake.jpg";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";
import { supabase } from "@/integrations/supabase/client";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useDynamicCakeCount } from "@/hooks/useDynamicCakeCount";

const IndiaLanding = () => {
  const navigate = useNavigate();
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(48);
  const [featuredCakes, setFeaturedCakes] = useState<Array<{ image_url: string; prompt: string }>>([]);
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<{ image_url: string; prompt: string } | null>(null);

  // Track page visits
  usePageTracking('/india', 'IN');

  const localImageMap: Record<string, string> = {
    'featured-cake-1.jpg': featuredCake1,
    'featured-cake-2.jpg': featuredCake2,
    'featured-cake-3.jpg': featuredCake3,
    'featured-cake-4.jpg': featuredCake4,
    'featured-cake-5.jpg': featuredCake5,
  };

  const resolveImageUrl = (url: string): string => {
    return localImageMap[url] || url;
  };

  useEffect(() => {
    loadFeaturedCakes();
  }, []);

  const loadFeaturedCakes = async () => {
    try {
      const { data, error } = await supabase
        .from("public_featured_images" as any)
        .select("id, image_url, created_at, occasion_type")
        .or('featured_pages.cs.{"home"},featured_pages.cs.{"india"},featured_pages.cs.{"diwali"}')
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFeaturedCakes(data.map((item: any) => ({
          image_url: item.image_url,
          prompt: `${item.occasion_type || 'Celebration'} cake`
        })));
      }
    } catch (error) {
      console.error("Error loading featured cakes:", error);
    }
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

  const testimonials = [
    {
      name: "Priya S.",
      location: "Mumbai",
      rating: 5,
      text: "Made a Chhota Bheem cake for my son's 5th birthday. The chocolate 2-layer design with vibrant colours was exactly what he wanted!",
      character: "Chhota Bheem",
      theme: "Chocolate 2-Layer"
    },
    {
      name: "Rahul M.",
      location: "Delhi",
      rating: 5,
      text: "The Motu Patlu option was brilliant for my nephew! Created a fun cartoon vanilla 3-layer cake that made everyone laugh.",
      character: "Motu Patlu",
      theme: "Vanilla 3-Layer"
    },
    {
      name: "Ananya K.",
      location: "Bangalore",
      rating: 5,
      text: "My daughter is obsessed with Hello Kitty. The pastel pink elegant tiered design was absolutely perfect for her princess party!",
      character: "Hello Kitty",
      theme: "Pastel Pink Tiered"
    },
    {
      name: "Arjun P.",
      location: "Hyderabad",
      rating: 5,
      text: "Created a gorgeous Barbie cake with pink and magenta theme for my daughter. The princess design was stunning!",
      character: "Barbie",
      theme: "Pink Princess"
    }
  ];

  const celebrations = [
    { name: "Birthday Parties", icon: PartyPopper },
    { name: "Anniversaries", icon: Heart },
    { name: "Weddings", icon: Sparkles },
    { name: "Christmas", icon: Gift }
  ];

  return (
    <div className="min-h-screen bg-gradient-celebration relative overflow-hidden">
      <Helmet>
        <title>AI Cake Generator India — Birthday Cake AI Designer</title>
        <meta name="description" content="India's #1 AI cake generator. Design personalized AI cakes for birthdays, anniversaries, weddings & Christmas in 30 seconds. Free to try, priced in ₹." />
        <meta name="keywords" content="ai cake generator india, ai cake india, ai cakes india, cake ai india, birthday cake ai india, ai birthday cakes, free ai cake generator, best ai cake designer india, personalized birthday cake india, anniversary cake india, wedding cake design india, christmas cake india, ai cake maker india, chhota bheem cake, motu patlu cake" />
        <link rel="canonical" href="https://cakeaiartist.com/india" />
        <link rel="alternate" hrefLang="en-IN" href="https://cakeaiartist.com/india" />
        <link rel="alternate" hrefLang="en-GB" href="https://cakeaiartist.com/uk" />
        <link rel="alternate" hrefLang="en-US" href="https://cakeaiartist.com/usa" />
        <link rel="alternate" hrefLang="en-CA" href="https://cakeaiartist.com/canada" />
        <link rel="alternate" hrefLang="en-AU" href="https://cakeaiartist.com/australia" />
        <link rel="alternate" hrefLang="x-default" href="https://cakeaiartist.com/" />
        <meta property="og:title" content="Best AI Cake Designer in India — Free Online" />
        <meta property="og:description" content="India's best AI cake designer for birthdays, anniversaries, weddings, Christmas & every celebration — priced in ₹." />
        <meta property="og:url" content="https://cakeaiartist.com/india" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best AI Cake Designer in India — Free Online" />
        <meta name="twitter:description" content="India's best AI cake designer for birthdays, anniversaries, weddings & every celebration." />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "India", url: "https://cakeaiartist.com/india" },
        ]}
      />

      <ProductSchema
        name="Cake AI Artist Lifetime Plan — India"
        description="Lifetime access to AI-powered personalized cake designs for Indian celebrations."
        price="2999"
        priceCurrency="INR"
        availability="InStock"
        url="https://cakeaiartist.com/india"
      />

      <FAQSchema
        faqs={[
          { question: "What occasions does the AI cake designer support?", answer: "Birthdays, anniversaries, weddings, baby showers, Christmas, New Year and every personal celebration — with Indian cartoon characters and themes built in." },
          { question: "Does it support Indian cartoon characters?", answer: "Yes — Chhota Bheem, Motu Patlu and 50+ characters loved by Indian kids are available." },
          { question: "What's the price in INR?", answer: "Three plans in INR: Monthly ₹299/month, Yearly ₹1,999/year, or Lifetime ₹2,999 once. A free plan is available forever." },
          { question: "Can I design eggless cakes with the AI cake generator?", answer: "Yes — describe your cake as eggless in the prompt and the AI generates designs appropriate for eggless cake styles. The design works as a visual brief for any baker offering eggless options." },
          { question: "Does the AI cake designer support Indian regional occasions like Onam, Pongal or Navratri?", answer: "Yes — describe any Indian regional occasion in plain English and the AI incorporates relevant design elements. For Onam, mention Kerala boat race or floral themes. For Pongal, describe harvest festival elements. The AI adapts to any occasion you describe." },
        ]}
      />

      <HowToSchema
        name="AI Cake Designer India — Free Online Cake Design in 30 Seconds"
        description="Design personalised birthday, Diwali, wedding and celebration cakes with AI — free for your first 5 designs"
        totalTime="PT30S"
        estimatedCost={{ currency: "INR", value: "0" }}
        steps={[
          { name: "Enter the name and occasion", text: "Type the recipient's name and choose your occasion — birthday, Diwali, wedding, anniversary, Holi or any Indian celebration." },
          { name: "Choose your design style", text: "Pick from traditional, modern, kids themed or festive styles. Describe colours, decorations and themes in Hindi or English." },
          { name: "Generate your cake", text: "Click generate and get a beautiful photorealistic AI cake design in under 30 seconds — personalised just for you." },
          { name: "Download and share", text: "Download your cake image in high resolution. Share on WhatsApp with family, send to your baker, or post on Instagram." }
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <OrganizationSchema
        name="Cake AI Artist"
        url="https://cakeaiartist.com/india"
        description="AI-powered cake design for Indian celebrations - birthdays, anniversaries, weddings and Christmas"
      />

      <ProductReviewSchema
        itemName="Cake AI Artist - AI Cake Designer India"
        description="AI-powered cake design platform for Indian celebrations"
        url="https://cakeaiartist.com/india"
        ratingValue={4.9}
        ratingCount={423}
        reviewCount={423}
        reviews={[
          { author: "Priya S.", reviewBody: "Made a Chhota Bheem cake for my son's 5th birthday. The chocolate 2-layer design was exactly what he wanted!", ratingValue: 5, datePublished: "2024-11-16" },
          { author: "Rahul M.", reviewBody: "The Motu Patlu option was brilliant for my nephew! Created a fun cartoon vanilla 3-layer cake.", ratingValue: 5, datePublished: "2024-11-24" },
          { author: "Ananya K.", reviewBody: "My daughter is obsessed with Hello Kitty. The pastel pink elegant tiered design was absolutely perfect!", ratingValue: 5, datePublished: "2024-12-01" },
          { author: "Arjun P.", reviewBody: "Created a gorgeous Barbie cake with pink and magenta theme for my daughter. The princess design was stunning!", ratingValue: 5, datePublished: "2024-12-09" }
        ]}
      />

      <FloatingEmojis />
      <ConfettiRain count={32} />
      <UrgencyBanner onVisibilityChange={setIsBannerVisible} onHeightChange={setBannerHeight} countryCode="IN" />

      <SiteHeader />

      {/* Hero Section with Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-10" />
        <img
          src={partyHero}
          alt="Vibrant birthday party celebration"
          className="w-full h-auto md:h-[600px] object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-6 px-4 max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
            >
              🇮🇳 India's #1 Free AI Cake Generator with Name
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white text-lg md:text-xl drop-shadow-md"
            >
              Design AI cakes for birthdays, anniversaries, weddings &amp; every celebration — ready in 30 seconds, priced in ₹
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-gradient-gold hover:shadow-gold text-lg px-8 py-6 font-bold pulse-glow"
                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See Plans →
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature Highlight with Cake Image */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-party opacity-30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
            <img
              src={celebrationCake}
              alt="Beautiful celebration cake"
              className="relative w-full h-80 md:h-96 object-contain rounded-2xl shadow-party transition-transform duration-500 hover:scale-105"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-foreground">
              Create Beautiful Personalised Cakes in Seconds
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Here&apos;s the thing about Indian celebrations—they&apos;re only as special as the thought you put into them. 
              From milestone birthdays to anniversaries and weddings, get gorgeous, personalised cake designs faster than ordering mithai from the corner shop.
              Your little one&apos;s favourite <strong>Chhota Bheem</strong> or <strong>Motu Patlu</strong> cake—ready in seconds!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Why People Love This */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Why People Love This</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: "🎨",
              title: "Actually Looks Good",
              desc: "Not your typical AI slop. These cakes look like something you'd actually want to share on WhatsApp."
            },
            {
              icon: "💝",
              title: "Genuinely Personal",
              desc: "AI that understands your kid's Chhota Bheem obsession and your parent's anniversary needs different vibes."
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
              className="text-center group"
            >
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:animate-bounce">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Proof Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="container mx-auto px-4 mb-12"
      >
        <div className="bg-gradient-to-r from-party-purple/10 to-party-pink/10 rounded-lg p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-party-purple mb-2">{useDynamicCakeCount().toLocaleString()}+</p>
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
        </div>
      </motion.div>

      {/* India Celebrations Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center text-foreground mb-4"
          >
            Perfect for Indian Celebrations
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From birthdays and anniversaries to weddings and Christmas, create the perfect cake for any occasion
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {celebrations.map((celebration, idx) => (
              <motion.div
                key={celebration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all hover:scale-105 hover:border-party-pink/50">
                  <CardContent className="pt-6">
                    <celebration.icon className="h-10 w-10 mx-auto mb-3 text-party-pink" />
                    <p className="font-medium text-foreground">{celebration.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Indian Cake Occasions */}
      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-3">AI Cake Designs for Every Indian Celebration</h2>
          <p className="text-center text-muted-foreground mb-10">From Diwali to weddings — India's most-loved celebration cakes, designed by AI in 30 seconds</p>
          <div className="space-y-6">

            <div className="border rounded-xl p-6 bg-background hover:border-party-pink/30 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">Birthday Cakes</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Birthday cakes in India have evolved from simple cream cakes to elaborate multi-tier creations. Popular styles include cartoon character themes for children (Chhota Bheem, Doraemon, Peppa Pig), elegant fondant designs for adults, and personalised photo cakes. Indian birthday cakes often feature the recipient's name prominently with vibrant colours and decorations that match the party theme.</p>
              <Link to="/free-ai-cake-designer?occasion=birthday&ref=india" className="text-sm font-semibold text-party-pink hover:underline">Design a Birthday Cake →</Link>
            </div>

            <div className="border rounded-xl p-6 bg-background hover:border-party-pink/30 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">Diwali Cakes</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Diwali cake designs blend traditional Indian festival aesthetics with modern cake artistry. Popular elements include diyas (oil lamps), rangoli patterns, lotus flowers, gold and orange colour palettes, and Lakshmi motifs. Diwali cakes are increasingly popular as gifting alternatives to traditional mithai, combining the festive spirit with a contemporary celebration touch.</p>
              <Link to="/free-ai-cake-designer?occasion=diwali&ref=india" className="text-sm font-semibold text-party-pink hover:underline">Design a Diwali Cake →</Link>
            </div>

            <div className="border rounded-xl p-6 bg-background hover:border-party-pink/30 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">Wedding Cakes</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Indian wedding cakes range from traditional white tiered designs to elaborate creations incorporating mehndi patterns, zari work motifs and floral designs inspired by bridal wear. Popular flavours include rose, kesar pista and fruit cake. South Indian weddings favour banana leaf-inspired designs while North Indian weddings often feature gold-accented fondant cakes with marigold decorations.</p>
              <Link to="/free-ai-cake-designer?occasion=wedding&ref=india" className="text-sm font-semibold text-party-pink hover:underline">Design a Wedding Cake →</Link>
            </div>

            <div className="border rounded-xl p-6 bg-background hover:border-party-pink/30 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">Holi Cakes</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Holi cake designs celebrate the festival of colours with vibrant, multi-coloured designs that capture the joy of the festival. Popular approaches include rainbow-layered interiors revealed on cutting, fondant splashes in Holi colours, and edible gulal (colour powder) effects. Holi cakes make memorable gifts and party centrepieces for the spring festival celebrations.</p>
              <Link to="/free-ai-cake-designer?occasion=holi&ref=india" className="text-sm font-semibold text-party-pink hover:underline">Design a Holi Cake →</Link>
            </div>

            <div className="border rounded-xl p-6 bg-background hover:border-party-pink/30 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">Eid Cakes</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Eid cake designs for Indian Muslim celebrations combine elegant aesthetics with festive symbolism. Crescent moon and star motifs, Arabic calligraphy, gold and green colour palettes, and intricate geometric patterns inspired by Islamic art are popular design elements. Eid cakes are shared with family during Eid al-Fitr and Eid al-Adha celebrations across India.</p>
              <Link to="/free-ai-cake-designer?occasion=eid&ref=india" className="text-sm font-semibold text-party-pink hover:underline">Design an Eid Cake →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* Indian Cake Traditions — E-E-A-T */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">About Indian Celebration Cakes</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            India's cake culture has grown dramatically over the past two decades, blending Western cake traditions with distinctly Indian aesthetics and flavours. Bakeries across Mumbai, Delhi, Bangalore, Chennai and Hyderabad now create elaborate custom cakes for every occasion — from intimate family birthdays to large wedding receptions.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Traditional Indian flavour preferences — kesar (saffron), rose, pista (pistachio), mango and cardamom — are increasingly incorporated into cake designs alongside globally popular choices like chocolate truffle and red velvet. Eggless cakes remain particularly popular across India due to dietary preferences, with bakeries offering eggless versions of virtually every cake style.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            AI cake design tools like Cake AI Artist have made it easier than ever to visualise personalised cake designs before ordering from a baker — helping customers communicate their vision clearly and reducing costly misunderstandings. The tool supports all major Indian occasions and characters, with pricing shown in Indian Rupees.
          </p>
        </div>
      </section>

      {/* Explore by Occasion */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">Design Cakes for Every Occasion</h2>
          <p className="text-center text-muted-foreground mb-10">Explore our dedicated cake designers for your special moment</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { emoji: "💍", name: "Wedding Cakes", desc: "Elegant tiered designs for your perfect day", href: "/wedding-cake-designer" },
              { emoji: "🎓", name: "Graduation Cakes", desc: "Celebrate every achievement with a personalised cake", href: "/graduation-cake-ideas" },
              { emoji: "🎂", name: "Free AI Cake Designer", desc: "Design any cake in 30 seconds — free to try", href: "/free-ai-cake-designer" },
              { emoji: "🌙", name: "Eid Cakes", desc: "Beautiful Eid Mubarak cake designs with crescent and star motifs", href: "/eid-cake-ideas" },
              { emoji: "🎆", name: "Diwali Cakes", desc: "Festive Diwali cake designs with diyas and rangoli themes", href: "/free-ai-cake-designer?occasion=diwali" },
            ].map((item) => (
              <Link key={item.name} to={item.href}>
                <Card className="p-5 h-full border-2 hover:border-party-pink/40 transition-colors hover:shadow-lg cursor-pointer">
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                  <span className="text-sm font-semibold text-party-pink">Design Now →</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cakes Carousel */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Recent Creations from Our Community
          </h2>
          <p className="text-xl text-muted-foreground mb-2">
            Real cakes made by real people. Yours could be here next!
          </p>
        </div>
        <Carousel 
          className="w-full max-w-5xl mx-auto"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
        >
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
                        src={resolveImageUrl(cake.image_url)}
                        alt={cake.prompt ? `Personalized AI cake design India — ${cake.prompt}` : "Personalized AI-designed cake by Cake AI Artist India user"}
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
                {[featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5].map((cake, idx) => (
                  <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2">
                      <div className="relative group overflow-hidden rounded-xl border-2 border-party-pink/30 hover:border-party-pink transition-all">
                        <img
                          src={cake}
                          alt={`Featured cake ${idx + 1}`}
                          className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
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
              <img loading="lazy" decoding="async" 
                src={resolveImageUrl(selectedCarouselImage.image_url)} 
                alt={selectedCarouselImage.prompt ? `Personalized AI cake — ${selectedCarouselImage.prompt}` : "Personalized AI-designed celebration cake — Cake AI Artist India"}
                className="w-full h-auto rounded-lg"
              />
              <Button
                onClick={() => handleDownloadCarouselImage(selectedCarouselImage.image_url, selectedCarouselImage.prompt)}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Party Pack Feature */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-party-purple/20 via-party-pink/20 to-party-gold/20 rounded-2xl p-8 border-2 border-party-purple/30"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="text-4xl">🎁</span>
                NEW: Party Pack Generator
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Transform your cake design into a <strong>complete celebration kit</strong>! Generate matching invitations, 
                banners, thank you cards, cake toppers, and place cards—all with one click.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-party-purple text-white flex items-center justify-center text-sm font-bold">✓</span>
                  Add your event date, time & location
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-party-pink text-white flex items-center justify-center text-sm font-bold">✓</span>
                  Preview all items before downloading
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-party-gold text-background flex items-center justify-center text-sm font-bold">✓</span>
                  Download as print-ready PDF
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/how-it-works")} 
                variant="outline"
                className="border-party-purple text-party-purple hover:bg-party-purple/10"
              >
                Learn How It Works
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-purple/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">💌</span>
                <p className="font-semibold text-foreground">Invitations</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-pink/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">🎊</span>
                <p className="font-semibold text-foreground">Banners</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-gold/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">💝</span>
                <p className="font-semibold text-foreground">Thank You Cards</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-party-coral/20 hover:scale-105 transition-transform">
                <span className="text-3xl mb-2 block">🎂</span>
                <p className="font-semibold text-foreground">Cake Toppers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Loved by Cake Creators Across India
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            See what our Indian customers are creating
          </p>
          <Carousel 
            className="w-full max-w-4xl mx-auto"
            opts={{ align: "start", loop: true }}
            plugins={[
              Autoplay({
                delay: 30000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow h-full">
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
                          <div className="flex gap-2 flex-wrap justify-end">
                            {testimonial.character !== "None" && (
                              <Badge variant="secondary" className="text-xs">{testimonial.character}</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{testimonial.theme}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-center text-muted-foreground mb-12">Monthly, yearly or lifetime — pay in INR.</p>
          <PricingPlans country="IN" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-party-pink/20 via-party-purple/20 to-party-gold/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Create Your Perfect Cake?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of happy customers across India. Start designing your personalised cake in seconds!
            </p>
            <Link to="/free-ai-cake-designer">
              <Button size="lg" className="bg-gradient-to-r from-party-pink to-party-purple text-white text-lg px-8 py-6 pulse-glow">
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your Cake Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <CountryRecipesSection countryCode="IN" countryName="India" adjective="Indian" />
      <ExitIntentModal isLoggedIn={false} isPremium={false} country="IN" />
      <StickyMobileCTA />
      <CountryBlogFeed countryCode="IN" countryName="India" />
      <Footer />
    </div>
  );
};

export default IndiaLanding;
