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
import { AnswerBox, DefinitionBox } from "@/components/AeoBlocks";

const EGGLESS_FALLBACK = [
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&h=400&fit=crop",
];

const EgglessCakeDesign = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(EGGLESS_FALLBACK);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('is_premium').eq('id', user.id).single();
        setIsPremium(profile?.is_premium || false);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("public_featured_images" as any)
        .select("image_url")
        .filter("featured_pages", "cs", '{"eggless"}')
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length >= 3) {
        setFeaturedCakes((data as unknown as { image_url: string }[]).map((d) => d.image_url));
      }
    })();
  }, []);

  const faqs = [
    {
      question: "Is the eggless cake designer free?",
      answer: "Yes — your first 5 eggless cake designs are completely free with no credit card required. Design an eggless birthday or anniversary cake, spell the name correctly, and download it to share with your baker before you place an order.",
    },
    {
      question: "Can AI design an eggless birthday cake with a name?",
      answer: "Yes — type the name and your occasion, and the AI renders an eggless birthday cake with the name spelled correctly on top. Get three views of every design in about 30 seconds, so you can pick the perfect one.",
    },
    {
      question: "Do eggless cakes look different from regular cakes?",
      answer: "No — a well-made eggless cake looks identical to a regular one. The AI generates photorealistic eggless designs with the same frosting, layers and decorations, so your baker can recreate the exact look using egg-free ingredients.",
    },
    {
      question: "What eggless cake flavours can I design?",
      answer: "Any flavour you like — chocolate truffle, vanilla, red velvet, butterscotch, pineapple, mango or blackforest. Just describe the flavour in plain English and the AI designs an eggless cake to match your celebration.",
    },
    {
      question: "Can my baker use the eggless design?",
      answer: "Yes — download the high-resolution image and hand it to your baker as a visual brief. It gives a clear egg-free reference, cuts confusion, and helps your local baker recreate the design at your budget in ₹.",
    },
  ];

  const howToSteps = [
    { name: "Describe your occasion and eggless request", text: "Choose your occasion — birthday, anniversary or celebration — and specify eggless. Tell the AI the theme, colours and vibe you want for your egg-free cake." },
    { name: "Add the name and flavour", text: "Enter the name to be spelled on the cake and pick a flavour — chocolate, vanilla, butterscotch, red velvet or any favourite. The AI incorporates them naturally." },
    { name: "Generate your designs", text: "The AI produces photorealistic eggless cake designs in about 30 seconds. Get multiple variations, each with three views to compare." },
    { name: "Download for your baker", text: "Download at full resolution and share it with your baker as an egg-free brief. Saves time and helps them price and recreate the cake in ₹." },
  ];

  const whyChoose = [
    { title: "Names spelled correctly", desc: "Add any name and the AI spells it correctly on your eggless cake — no more garbled text, just a clean, personalised design." },
    { title: "Egg-free, baker-ready designs", desc: "Download high-resolution eggless cake images your baker can recreate with egg-free ingredients — a clear brief instead of a vague description." },
    { title: "Free to explore", desc: "Five full eggless designs free, no credit card. Explore birthday and anniversary ideas before you order from your local baker." },
  ];


  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Eggless Cake Design — Free AI Eggless Cake Designer</title>
        <meta name="description" content="Design eggless birthday and anniversary cakes free with AI. Add names, pick flavours, get photorealistic egg-free designs in 30 seconds to share with your baker (priced in ₹)." />
        <link rel="canonical" href="https://cakeaiartist.com/eggless-cake-design" />
        <meta name="keywords" content="eggless cake design, eggless birthday cake, eggless cake ideas, eggless cake with name, egg-free cake design, ai eggless cake designer, eggless cake maker online" />
        <meta property="og:title" content="Free AI Eggless Cake Designer | Cake AI Artist" />
        <meta property="og:description" content="Design eggless birthday and anniversary cakes with AI in 30 seconds. Free to try, names spelled correctly, no credit card needed." />
        <meta property="og:url" content="https://cakeaiartist.com/eggless-cake-design" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Eggless Cake Design", url: "https://cakeaiartist.com/eggless-cake-design" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Design an Eggless Cake with AI"
        description="Create a personalised eggless cake design in 30 seconds — free to try"
        totalTime="PT30S"
        estimatedCost={{ currency: "INR", value: "0" }}
        steps={[
          { name: "Describe your occasion and eggless request", text: "Pick your occasion — birthday, anniversary or celebration — and specify eggless. Add the theme, colours and style you want." },
          { name: "Add the name and flavour", text: "Enter the name to be spelled on the cake and choose a flavour like chocolate, vanilla, butterscotch or red velvet." },
          { name: "Generate your designs", text: "The AI creates photorealistic eggless cake designs in about 30 seconds. Get multiple variations, each with three views." },
          { name: "Download for your baker", text: "Download your egg-free design at full resolution and share it with your baker as a visual brief to recreate and price in ₹." },
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">Egg-free designs for 20+ occasions</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Design an Eggless Cake with AI —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Free</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            From eggless birthday cakes to anniversary designs — describe your idea, add a name and flavour, and get a photorealistic egg-free cake in 30 seconds. Free to try, no signup needed.
          </p>

          <AnswerBox stats={["~30 seconds","Egg-free designs","5 free designs","3 views per cake"]}>
            To design an eggless cake with AI, describe your occasion, say "eggless", and add the name and flavour in plain English. Cake AI Artist generates a photorealistic egg-free design with three views in about 30 seconds — with the name spelled correctly. Your first 5 designs are free, no signup required.
          </AnswerBox>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
            {["First 5 designs free", "No credit card required", "High-resolution download"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=birthday")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Design My Eggless Cake →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See real examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · 20+ occasions covered</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Real AI-Generated Eggless Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Photorealistic eggless cake designs generated with AI. Download, share with your baker, and bring your egg-free idea to life.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Eggless cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the AI eggless cake designer works</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why people choose this AI eggless cake designer</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that genuinely matter when ordering an egg-free cake.</p>
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

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <DefinitionBox term="an eggless cake design" definition={<>An eggless cake design is a cake made without eggs — using alternatives like curd, condensed milk or applesauce — that looks identical to a regular cake. Cake AI Artist generates photorealistic eggless designs in about 30 seconds with the name spelled correctly, and your first 5 designs are free.</>} />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Eggless Cake Design — FAQs</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Designing Your Eggless Cake</h2>
          <p className="text-lg mb-8 opacity-95">Join thousands who used AI to design egg-free birthday and anniversary cakes before ordering from their baker.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=birthday")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Eggless Cake Free →
          </Button>
        </div>
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}
      <Footer />
    </div>
  );
};

export default EgglessCakeDesign;
