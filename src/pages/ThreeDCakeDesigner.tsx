import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema } from "@/components/SEOSchema";
import { Box, Sparkles, Layers, Eye, Star } from "lucide-react";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";

const ThreeDCakeDesigner = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Is the 3D cake designer actually free online?",
      answer: "Yes — 5 full 3D cake designs are free with no credit card required. Results are high-resolution with no watermark.",
    },
    {
      question: "How is this different from regular 2D cake design tools?",
      answer: "A 2D tool produces a flat sketch. This 3D AI designer renders photorealistic depth, lighting and dimension so you can see exactly what the finished cake will look like before ordering from a baker.",
    },
    {
      question: "Can I customise the 3D cake design — colours, tiers, decorations?",
      answer: "Yes — choose tier count, frosting style, decoration theme and colour palette. Describe specific details (gold drip, edible flowers, fondant figures) in plain English and the AI incorporates them.",
    },
    {
      question: "Can my baker use the 3D cake design as a reference?",
      answer: "Yes — that is the most common use case. The high-resolution render shows tier sizes, decorations, colours and proportions clearly enough for any professional baker to recreate.",
    },
    {
      question: "Does it work on phones?",
      answer: "Yes — fully mobile-optimised. The design tool works on any smartphone browser with no app download required.",
    },
  ];

  const samples = [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>3D Cake Designer Free Online — AI Cake Design Tool | Cake AI Artist</title>
        <meta name="description" content="The best 3D cake designer free online. Design realistic 3D AI cakes for birthdays, weddings, and celebrations in 30 seconds. No download needed." />
        <link rel="canonical" href="https://cakeaiartist.com/3d-cake-designer" />
        <meta property="og:title" content="3D Cake Designer Free Online | Cake AI Artist" />
        <meta property="og:description" content="Design realistic 3D AI cakes free online. No download, no signup to explore." />
        <meta property="og:url" content="https://cakeaiartist.com/3d-cake-designer" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "3D Cake Designer", url: "https://cakeaiartist.com/3d-cake-designer" },
      ]} />

      <FAQSchema faqs={faqs} />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-purple/10 border border-party-purple/30">
            <Box className="w-3.5 h-3.5 text-party-purple" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-purple">3D Renders · Free Online</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            3D Cake Designer —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Free Online AI Cake Design Tool</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The best 3D cake designer free online. Cake AI Artist renders realistic 3D AI cakes with depth, lighting, and dimension — so you can see exactly what your birthday, wedding, or anniversary cake will look like before a single ingredient is touched. No download, no software, no credit card.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Sparkles className="w-5 h-5 mr-2" /> Design Your 3D Cake Free →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See 3D examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · trusted by home celebrators and bakers alike</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">3D cake design samples</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Realistic, baker-ready 3D renders — these are the kind of results you'll get on the free plan.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {samples.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`3D cake designer sample render ${i + 1} — realistic AI-generated celebration cake`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Why this 3D cake designer is different</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Layers, title: "Real 3D depth, not flat sketches", desc: "Every cake is rendered with proper lighting, tier proportions, and dimension — not the flat outlines most 'cake design tools' produce." },
              { icon: Eye, title: "See it before you bake it", desc: "Bring the 3D render to your baker or use it to plan your home bake. Either way, no surprises on cake day." },
              { icon: Sparkles, title: "Designed for celebrations, not just cakes", desc: "Birthdays, weddings, anniversaries, baby showers, festivals — the AI understands the occasion and styles the 3D design to match." },
            ].map((f, i) => (
              <Card key={i} className="p-6 border-2 hover:border-party-purple/40 transition-colors">
                <f.icon className="w-10 h-10 text-party-purple mb-3" />
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">3D Cake Designer — FAQs</h2>
          {faqs.map((faq, i) => (
            <details key={i} className="mb-3 p-4 bg-background rounded-lg border border-border">
              <summary className="font-semibold cursor-pointer">{faq.question}</summary>
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-party text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <Box className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try the 3D cake designer free</h2>
          <p className="text-lg mb-8 opacity-95">Your first realistic 3D cake takes 30 seconds. No download needed.</p>
          <Button size="lg" onClick={() => navigate("/")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My 3D Cake →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ThreeDCakeDesigner;
