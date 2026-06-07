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

const WEDDING_FALLBACK = [
  "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522498628165-0f8c94b31534?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
];

const WeddingCakeDesigner = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(WEDDING_FALLBACK);
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
        .filter("featured_pages", "cs", '{"wedding"}')
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length >= 3) {
        setFeaturedCakes((data as unknown as { image_url: string }[]).map((d) => d.image_url));
      }
    })();
  }, []);

  const faqs = [
    {
      question: "Is the AI wedding cake designer really free?",
      answer: "Yes — your first 5 wedding cake designs are completely free with no credit card required. Most couples use it to visualise ideas before meeting their baker, saving time and money on consultations.",
    },
    {
      question: "Can I design a multi-tier wedding cake with AI?",
      answer: "Yes — describe the number of tiers, frosting style and decorations and the AI renders a photorealistic multi-tier cake. Three-tier, five-tier, or any configuration works.",
    },
    {
      question: "How do I use the AI wedding cake design with my baker?",
      answer: "Download the high-resolution image and bring it to your baker consultation. It gives your baker an exact visual reference, cutting down on misunderstandings and revision time.",
    },
    {
      question: "Can the AI design rustic, naked or geode wedding cakes?",
      answer: "Yes — describe the style in plain English: rustic naked cake with fresh berries, geode effect with amethyst crystals, or classic white fondant with sugar flowers. The AI handles any style.",
    },
    {
      question: "Can I add our names and wedding date to the cake design?",
      answer: "Yes — include the names and date in your description and the AI incorporates them naturally into the cake design.",
    },
    {
      question: "How accurate are the AI wedding cake designs?",
      answer: "Photorealistic and closely matched to your description. Most bakers find the output detailed enough to use as a direct brief. Generate multiple variations until one is exactly right.",
    },
  ];

  const howToSteps = [
    { name: "Describe your wedding style", text: "Choose your theme — rustic, elegant, modern, bohemian or vintage. Tell the AI your colour palette and the feel you want." },
    { name: "Add your personal details", text: "Enter your names, wedding date message, and decoration preferences — flowers, gold leaf, fondant figures, or custom toppers." },
    { name: "Generate your designs", text: "The AI produces photorealistic wedding cake designs in 30 seconds. Get four unique variations based on your description." },
    { name: "Share with your baker", text: "Download at full resolution and use it as a visual brief for your baker. Saves hours of consultation and reduces costly revisions." },
  ];

  const whyChoose = [
    { title: "Baker-ready designs", desc: "Download high-resolution images your baker can use as a direct brief — no more trying to describe your vision in words." },
    { title: "Every style, every budget", desc: "From simple two-tier cakes to elaborate 6-tier showpieces — describe what you want and the AI handles the complexity." },
    { title: "Free to explore", desc: "Five full designs free, no credit card. Explore different styles before committing to any one direction with your baker." },
  ];


  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Free AI Wedding Cake Designer — Design Your Dream Wedding Cake Online</title>
        <meta name="description" content="Design stunning AI wedding cakes online for free. From elegant tiered designs to rustic naked cakes — create your perfect wedding cake with AI in 30 seconds. Used by brides worldwide." />
        <link rel="canonical" href="https://cakeaiartist.com/wedding-cake-designer" />
        <meta name="keywords" content="ai wedding cake designer, wedding cake design online free, wedding cake ideas ai, custom wedding cake design, ai wedding cake generator, free wedding cake designer online, wedding cake maker ai" />
        <meta property="og:title" content="Free AI Wedding Cake Designer | Cake AI Artist" />
        <meta property="og:description" content="Design your dream wedding cake with AI in 30 seconds. Free to try, no credit card needed." />
        <meta property="og:url" content="https://cakeaiartist.com/wedding-cake-designer" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Wedding Cake Designer", url: "https://cakeaiartist.com/wedding-cake-designer" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Design Your Dream Wedding Cake with AI"
        description="Create a stunning personalised wedding cake design in 30 seconds — free to try"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Describe your wedding style", text: "Tell the AI your wedding theme — rustic, elegant, floral, modern, vintage or any style. Add colours and tier count." },
          { name: "Add personal details", text: "Enter your names, wedding date message, and any specific decoration requests like gold leaf, fresh flowers or fondant figures." },
          { name: "Generate your designs", text: "The AI creates photorealistic wedding cake designs in 30 seconds. Get multiple variations to choose from." },
          { name: "Share with your baker", text: "Download your design at full resolution and send it to your baker as a visual brief. Saves hours of back-and-forth consultation." },
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">Loved by brides in 30+ countries</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Design Your Dream Wedding Cake with AI —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Free</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            From elegant tiered masterpieces to rustic naked cakes — describe your vision and get a photorealistic wedding cake design in 30 seconds. Free to try, no signup needed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
            {["Free first 5 designs", "No credit card required", "High-resolution download"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=wedding")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Design My Wedding Cake →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See real examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · loved by 2,800+ couples worldwide</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Real AI-Generated Wedding Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Photorealistic wedding cake designs generated with AI. Download, share with your baker, and bring your vision to life.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Wedding cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the AI wedding cake designer works</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why couples choose this AI wedding cake designer</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that genuinely matter on your wedding journey.</p>
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
          <h2 className="text-3xl font-bold text-center mb-8">AI Wedding Cake Designer — FAQs</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Designing Your Dream Wedding Cake</h2>
          <p className="text-lg mb-8 opacity-95">Join thousands of couples who used AI to visualise their perfect wedding cake before the big day.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=wedding")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Wedding Cake Free →
          </Button>
        </div>
      </section>

      <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />
      <Footer />
    </div>
  );
};

export default WeddingCakeDesigner;
