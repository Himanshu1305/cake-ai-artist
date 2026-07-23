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

const ANNIVERSARY_FALLBACK = [
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&h=400&fit=crop",
];

const AnniversaryCakeDesigner = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(ANNIVERSARY_FALLBACK);
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
        .filter("featured_pages", "cs", '{"anniversary"}')
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length >= 3) {
        setFeaturedCakes((data as unknown as { image_url: string }[]).map((d) => d.image_url));
      }
    })();
  }, []);

  const faqs = [
    {
      question: "Can I add a photo and names to the anniversary cake?",
      answer: "Yes — upload a couple's photo and enter both names, and the AI incorporates them into the design with the names spelled correctly. It's perfect for a personalised anniversary cake with a photo and name.",
    },
    {
      question: "What are good anniversary cake ideas for husband or wife?",
      answer: "Popular ideas include a romantic heart cake with both names, a photo cake of the couple, or a themed cake around a shared hobby or your wedding colours. Describe it in plain English and the AI renders it — great anniversary cake ideas for a husband or wife.",
    },
    {
      question: "Can I design a milestone cake like 25th or 50th anniversary?",
      answer: "Yes — enter the milestone year and the AI adds it to the design, from a 25th silver anniversary cake to a 50th golden anniversary showpiece. Any number of years together works.",
    },
    {
      question: "Is the anniversary cake designer free?",
      answer: "Yes — your first 5 anniversary cake designs are completely free with no credit card required. Most couples use it to visualise ideas before ordering from a baker.",
    },
    {
      question: "Can my baker use the anniversary cake design?",
      answer: "Yes — download the high-resolution image and bring it to your baker as a visual brief. It gives your baker an exact reference, cutting down on misunderstandings and revision time.",
    },
  ];

  const howToSteps = [
    { name: "Add your names and years", text: "Enter both names and the number of years together — or the milestone year like 25th or 50th. The AI spells names correctly on the cake." },
    { name: "Add a photo or theme", text: "Upload a couple's photo and pick a theme — romantic hearts, floral, elegant gold, or your wedding colours." },
    { name: "Generate your designs", text: "The AI produces photorealistic anniversary cake designs in about 30 seconds. Get multiple variations with three views each." },
    { name: "Download and share", text: "Download at full resolution and share it with your baker or your partner. Saves hours of consultation and back-and-forth." },
  ];

  const whyChoose = [
    { title: "Photo and names built in", desc: "Add a couple's photo and both names spelled correctly — a truly personalised anniversary cake without describing your vision in words." },
    { title: "Every milestone covered", desc: "From a first anniversary to a 25th silver or 50th golden anniversary — enter the years and the AI handles the design." },
    { title: "Free to explore", desc: "Five full designs free, no credit card. Try romantic, floral and photo-cake styles before ordering from any baker." },
  ];


  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Anniversary Cake Designer — Free AI Cake &amp; Photo</title>
        <meta name="description" content="Design free AI anniversary cakes with a photo and names for your husband or wife. Milestone 25th & 50th designs, names spelled right, ready in 30 seconds." />
        <link rel="canonical" href="https://cakeaiartist.com/anniversary-cake-designer" />
        <meta name="keywords" content="anniversary cake designer, anniversary cake with photo and name, anniversary cake ideas, wedding anniversary cake, anniversary cake for husband, anniversary cake for wife, 25th anniversary cake, 50th anniversary cake" />
        <meta property="og:title" content="Anniversary Cake Designer | Cake AI Artist" />
        <meta property="og:description" content="Design an anniversary cake with a photo and names in 30 seconds. Free to try, no credit card needed." />
        <meta property="og:url" content="https://cakeaiartist.com/anniversary-cake-designer" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Anniversary Cake Designer", url: "https://cakeaiartist.com/anniversary-cake-designer" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Design an Anniversary Cake with a Photo and Name"
        description="Create a personalised anniversary cake design with photo and names in 30 seconds — free to try"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Add your names and years", text: "Enter both names and the years together — or a milestone like 25th or 50th. The AI spells names correctly." },
          { name: "Add a photo or theme", text: "Upload a couple's photo and choose a theme — romantic hearts, floral, elegant gold, or your wedding colours." },
          { name: "Generate your designs", text: "The AI creates photorealistic anniversary cake designs in about 30 seconds. Get multiple variations to choose from." },
          { name: "Download and share", text: "Download your design at full resolution and share it with your baker as a visual brief. Saves hours of consultation." },
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">Loved by couples in 30+ countries</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Design an Anniversary Cake with Photo &amp; Name —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Free</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            From a romantic photo cake for your husband or wife to a 25th or 50th milestone showpiece — describe it, add your names and a photo, and get a photorealistic anniversary cake design in 30 seconds. Free to try, no signup needed.
          </p>

          <AnswerBox stats={["~30 seconds","Photo + name","5 free designs","3 views per cake"]}>
            To design an anniversary cake with a photo and name, enter both names and years together, upload a couple's photo, and pick a theme. Cake AI Artist renders a photorealistic design with three views in about 30 seconds, names spelled correctly. Your first 5 designs are free, no signup required.
          </AnswerBox>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
            {["Free first 5 designs", "No credit card required", "High-resolution download"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=anniversary")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Design My Anniversary Cake →
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Real AI-Generated Anniversary Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Photorealistic anniversary cake designs generated with AI. Add a photo and names, download, and share with your baker.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Anniversary cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the anniversary cake designer works</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why couples choose this anniversary cake designer</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that genuinely matter when celebrating your years together.</p>
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
          <DefinitionBox term="an AI anniversary cake designer" definition={<>An AI anniversary cake designer is an online tool that turns a couple&#39;s names, years together and a photo into a romantic, photorealistic anniversary cake design. Cake AI Artist renders each design in about 30 seconds with names spelled correctly, and your first 5 designs are free.</>} />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Anniversary Cake Designer — FAQs</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Designing Your Anniversary Cake</h2>
          <p className="text-lg mb-8 opacity-95">Join thousands of couples who used AI to design the perfect anniversary cake with a photo and their names.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=anniversary")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Anniversary Cake Free →
          </Button>
        </div>
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}
      <Footer />
    </div>
  );
};

export default AnniversaryCakeDesigner;
