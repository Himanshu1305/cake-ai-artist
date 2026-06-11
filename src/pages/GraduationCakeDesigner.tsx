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

const GRADUATION_FALLBACK = [
  "https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop",
];

const GraduationCakeDesigner = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(GRADUATION_FALLBACK);
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
        .filter("featured_pages", "cs", '{"graduation"}')
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length >= 3) {
        setFeaturedCakes((data as unknown as { image_url: string }[]).map((d) => d.image_url));
      }
    })();
  }, []);

  const faqs = [
    {
      question: "Can I put a specific year like Class of 2026 on the graduation cake?",
      answer: "Yes — include the graduation year, school name or degree type in your description and the AI incorporates it accurately into the cake design.",
    },
    {
      question: "What graduation cake themes work best with AI?",
      answer: "Cap and gown, school colours, subject-specific themes (medical, law, engineering) and elegant number designs all produce strong results. Describe any combination in plain English.",
    },
    {
      question: "Can I design a graduation cake for a PhD or university graduation?",
      answer: "Yes — the AI handles every graduation level including high school, undergraduate, masters and PhD. Mention the level in your description and it tailors the design accordingly.",
    },
    {
      question: "How do I personalise the graduation cake with school colours?",
      answer: "Mention the school colours directly in your description — for example: navy blue and gold graduation cake, Class of 2026, with mortar board topper. The AI applies them exactly.",
    },
    {
      question: "Is the graduation cake designer really free?",
      answer: "Yes — your first 5 designs are completely free with no credit card required. Generate different styles and themes until you find the perfect graduation cake.",
    },
  ];

  const howToSteps = [
    { name: "Enter the graduate's name", text: "Type the graduate's name and year — Class of 2026, PhD, High School, University — the AI handles any level." },
    { name: "Choose your design theme", text: "Pick school colours, cap and gown theme, subject-specific designs or an elegant celebration style." },
    { name: "Generate in 30 seconds", text: "Get a photorealistic graduation cake design personalised to your graduate in under 30 seconds." },
    { name: "Download and order", text: "Save the image and use it as a reference for your local baker or as inspiration for a DIY cake." },
  ];

  const whyChoose = [
    { title: "Personalised to the graduate", desc: "Add their name, graduation year, school name and subject — the AI incorporates every detail into the design." },
    { title: "Every level, every school", desc: "From high school to PhD, undergraduate to masters — the AI understands every graduation level and tailors the design accordingly." },
    { title: "Free to explore", desc: "Five full designs free, no credit card. Try cap and gown, subject themes, school colours and more before choosing your favourite." },
  ];


  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Graduation Cake Ideas — Free AI Graduation Cake Designer Online</title>
        <meta name="description" content="Design stunning AI graduation cakes in 30 seconds. Personalised with names, years and school colours. Free graduation cake designer — no credit card needed." />
        <link rel="canonical" href="https://cakeaiartist.com/graduation-cake-ideas" />
        <meta name="keywords" content="graduation cake ideas, ai graduation cake, graduation cake design, graduation cake with name, free graduation cake designer, class of 2026 cake, graduation party cake ideas" />
        <meta property="og:title" content="Graduation Cake Ideas — Free AI Designer | Cake AI Artist" />
        <meta property="og:description" content="Design a personalised graduation cake with AI in 30 seconds. Free to try, no credit card needed." />
        <meta property="og:url" content="https://cakeaiartist.com/graduation-cake-ideas" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Graduation Cake Ideas", url: "https://cakeaiartist.com/graduation-cake-ideas" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Design a Personalised Graduation Cake with AI"
        description="Create a photorealistic graduation cake design personalised to your graduate in 30 seconds — free to try"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Enter the graduate's name", text: "Type the graduate's name and year — Class of 2026, PhD, High School, University — the AI handles any level." },
          { name: "Choose your design theme", text: "Pick school colours, cap and gown theme, subject-specific designs or an elegant celebration style." },
          { name: "Generate in 30 seconds", text: "Get a photorealistic graduation cake design personalised to your graduate in under 30 seconds." },
          { name: "Download and order", text: "Save the image and use it as a reference for your local baker or as inspiration for a DIY cake." },
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
            Graduation Cake Ideas —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Design a Personalised Cake with AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Celebrate their achievement with a cake as special as the moment. Type the graduate's name, year and theme — get a stunning design in 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=graduation")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Design My Graduation Cake →
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Real AI-Generated Graduation Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Photorealistic celebration cake designs generated with AI. Perfect for every graduation level — from high school to PhD.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Graduation cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the AI graduation cake designer works</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why choose this AI graduation cake designer</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that make it the easiest way to celebrate graduation.</p>
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
          <h2 className="text-3xl font-bold text-center mb-8">Graduation Cake Ideas — FAQs</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Design Your Graduation Cake Free</h2>
          <p className="text-lg mb-8 opacity-95">Celebrate their achievement with a personalised AI cake design. Ready in 30 seconds.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=graduation")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Graduation Cake Free →
          </Button>
        </div>
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}
      <Footer />
    </div>
  );
};

export default GraduationCakeDesigner;
