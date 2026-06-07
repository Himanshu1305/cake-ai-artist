import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { CheckCircle2, Sparkles, Zap, Heart, Star } from "lucide-react";
import { ExitIntentModal } from "@/components/ExitIntentModal";

const EID_FALLBACK = [
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
];

const EidCakeDesigner = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(EID_FALLBACK);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('is_premium').eq('id', user.id).single();
        setIsPremium(profile?.is_premium || false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("public_featured_images" as any)
        .select("image_url")
        .filter("featured_pages", "cs", '{"eid"}')
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length >= 3) {
        setFeaturedCakes((data as unknown as { image_url: string }[]).map((d) => d.image_url));
      }
    })();
  }, []);

  const faqs = [
    {
      question: "Can the AI design a traditional Eid Mubarak cake?",
      answer: "Yes — describe crescent moons, stars, geometric patterns, lanterns or Arabic calligraphy and the AI incorporates them into a culturally respectful Eid cake design.",
    },
    {
      question: "What colours work best for Eid cake designs?",
      answer: "Gold, emerald green, white, deep teal and royal blue are the most popular Eid palettes. Mention a specific combination in your description and the AI applies it exactly.",
    },
    {
      question: "Can I design an Eid cake with Arabic text or calligraphy?",
      answer: "Yes — request Eid Mubarak, Eid al-Fitr or any celebratory phrase in your description and the AI incorporates calligraphy-style lettering into the cake design.",
    },
    {
      question: "Is the Eid cake designer free to use?",
      answer: "Yes — your first 5 Eid cake designs are completely free with no account required for your first design.",
    },
    {
      question: "Can I design Eid cakes for both Eid al-Fitr and Eid al-Adha?",
      answer: "Yes — both occasions are fully supported. Mention which Eid you are celebrating and any specific elements you want and the AI creates an appropriate, respectful design.",
    },
  ];

  const howToSteps = [
    { name: "Choose your Eid occasion", text: "Select Eid al-Fitr, Eid al-Adha or a general Eid Mubarak celebration. Add the recipient's name for personalisation." },
    { name: "Describe your design", text: "Choose colours — gold, green, white, emerald — and elements like crescent moon, star, lanterns, geometric patterns or Arabic calligraphy." },
    { name: "Generate your Eid cake", text: "The AI creates a beautiful, culturally respectful Eid cake design in 30 seconds — photorealistic and ready to share." },
    { name: "Share with family", text: "Download your design and send to your baker or share directly with family on WhatsApp to celebrate together." },
  ];

  const whyChoose = [
    { title: "Culturally respectful designs", desc: "The AI understands Eid traditions — crescent moons, geometric patterns, Arabic calligraphy and festive colour palettes are all handled beautifully." },
    { title: "Both Eid celebrations covered", desc: "Whether you're celebrating Eid al-Fitr or Eid al-Adha, the AI creates appropriate, personalised designs for both occasions." },
    { title: "Free to try", desc: "Your first 5 Eid cake designs are completely free. No account needed for your first design — just type and generate." },
  ];


  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Eid Cake Ideas — Free AI Eid Mubarak Cake Designer Online</title>
        <meta name="description" content="Design beautiful Eid Mubarak cakes with AI in 30 seconds. Personalised Eid al-Fitr and Eid al-Adha cake designs — free to try, no credit card needed." />
        <link rel="canonical" href="https://cakeaiartist.com/eid-cake-ideas" />
        <meta name="keywords" content="eid cake ideas, eid mubarak cake, ai eid cake, eid al fitr cake design, eid cake design online, eid mubarak cake ideas, islamic celebration cake" />
        <meta property="og:title" content="Eid Cake Ideas — Free AI Designer | Cake AI Artist" />
        <meta property="og:description" content="Design a beautiful personalised Eid Mubarak cake with AI in 30 seconds. Free to try, no credit card needed." />
        <meta property="og:url" content="https://cakeaiartist.com/eid-cake-ideas" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Eid Cake Ideas", url: "https://cakeaiartist.com/eid-cake-ideas" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Design an Eid Mubarak Cake with AI"
        description="Create a beautiful personalised Eid cake design in 30 seconds — free to try, no credit card needed"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Choose your Eid occasion", text: "Select Eid al-Fitr, Eid al-Adha or a general Eid Mubarak celebration. Add the recipient's name for personalisation." },
          { name: "Describe your design", text: "Choose colours — gold, green, white, emerald — and elements like crescent moon, star, lanterns, geometric patterns or Arabic calligraphy." },
          { name: "Generate your Eid cake", text: "The AI creates a beautiful, culturally respectful Eid cake design in 30 seconds — photorealistic and ready to share." },
          { name: "Share with family", text: "Download your design and send to your baker or share directly with family on WhatsApp to celebrate together." },
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">100% Free · No Credit Card</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Eid Cake Ideas —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Design a Beautiful Eid Mubarak Cake with AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Celebrate Eid al-Fitr and Eid al-Adha with a personalised AI cake design. Crescent moons, gold accents, geometric patterns — describe your vision in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=eid")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Design My Eid Cake →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See real examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · loved by 2,800+ celebrators worldwide</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Beautiful AI-Generated Eid Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Beautiful celebration cake designs generated with AI. Perfect for Eid al-Fitr, Eid al-Adha and every special occasion.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Eid celebration cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the AI Eid cake designer works</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {howToSteps.map((step, i) => (
              <Card key={i} className="p-6 border-2 hover:border-party-pink/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-party text-white font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{step.name}</h3>
                    <p className="text-muted-foreground">{step.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why choose this AI Eid cake designer</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that make it the easiest way to design your Eid celebration cake.</p>
          <div className="space-y-4">
            {whyChoose.map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-background rounded-xl border border-border">
                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Eid Cake Ideas — FAQs</h2>
          {faqs.map((faq, i) => (
            <details key={i} className="mb-3 p-4 bg-surface-elevated rounded-lg border border-border">
              <summary className="font-semibold cursor-pointer">{faq.question}</summary>
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-party text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Design Your Eid Cake Free</h2>
          <p className="text-lg mb-8 opacity-95">Create a beautiful personalised Eid cake design in 30 seconds. Free to try, no signup needed.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=eid")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Eid Cake Free →
          </Button>
        </div>
      </section>

      <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />
      <Footer />
    </div>
  );
};

export default EidCakeDesigner;
