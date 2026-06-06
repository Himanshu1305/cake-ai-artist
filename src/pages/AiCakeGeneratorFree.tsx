import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { CheckCircle2, Sparkles, Zap, Heart, Star } from "lucide-react";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";

const AiCakeGeneratorFree = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Is the AI cake generator really free?",
      answer: "Yes — your first 5 designs are completely free with no credit card required. Each design takes about 30 seconds and you can download or share the result immediately.",
    },
    {
      question: "Do I need to sign up to use the free AI cake generator?",
      answer: "No signup is needed for your first design. To save or download, a free account takes under 10 seconds — Google login works.",
    },
    {
      question: "What makes this different from other free AI cake generators?",
      answer: "Three things: names are spelled correctly every time, the AI understands occasion context (a Diwali cake looks different from a baby shower cake), and pricing is shown in your local currency with no surprise charges.",
    },
    {
      question: "Can I use the AI cake design at a real bakery?",
      answer: "Yes — download the high-resolution image and take it to any bakery as a visual brief. The design shows colours, decorations and text clearly enough for most bakers to replicate.",
    },
    {
      question: "How long does the free AI cake generator take?",
      answer: "30 seconds from entering the occasion to a finished design. If you adjust the prompt and regenerate it takes another 30 seconds per variation.",
    },
  ];

  const howToSteps = [
    { name: "Pick your occasion", text: "Birthday, anniversary, baby shower, Diwali, retirement — choose what you're celebrating." },
    { name: "Type the name", text: "Enter the recipient's name. Our AI handles short names, long names, and unusual spellings correctly." },
    { name: "Choose a style", text: "Pick from elegant, fun, kids, or themed. You can also describe what you want in plain English." },
    { name: "Generate your cake", text: "Hit generate and wait about 30 seconds. Your free AI cake appears, ready to download or share." },
  ];

  const samples = [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Free AI Cake Generator — Design Personalized Cakes Online | Cake AI Artist</title>
        <meta name="description" content="The best free AI cake generator. Design personalized birthday cakes, anniversary cakes, and celebration cakes with AI in 30 seconds. No credit card needed." />
        <link rel="canonical" href="https://cakeaiartist.com/ai-cake-generator-free" />
        <meta property="og:title" content="Free AI Cake Generator | Cake AI Artist" />
        <meta property="og:description" content="Design personalized AI cakes free. 30 seconds, any name, any occasion." />
        <meta property="og:url" content="https://cakeaiartist.com/ai-cake-generator-free" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Free AI Cake Generator", url: "https://cakeaiartist.com/ai-cake-generator-free" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to design a cake with the free AI cake generator"
        description="Design a personalized AI cake in four simple steps."
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={howToSteps}
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">100% Free · No Credit Card</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Free AI Cake Generator —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Design a Personalized Cake in 30 Seconds</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Cake AI Artist is the free AI cake generator behind thousands of personalized birthday, anniversary, and celebration cakes. Type a name, pick the occasion, hit generate. Your AI cake is ready in about half a minute — no signup needed to explore, no credit card ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Design Your Free AI Cake →
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">What free AI cakes look like</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Real cakes generated by real people on the free plan. No filters, no cherry-picking — these are typical results.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {samples.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Free AI cake generator sample design ${i + 1} — personalized celebration cake created with AI`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the free AI cake generator works</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why people choose this free AI cake generator</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that genuinely matter — not feature spam.</p>
          <div className="space-y-4">
            {[
              { title: "Names actually spell correctly", desc: "Most AI cake tools mangle names. Ours doesn't. Short names, long names, double names, names with unusual spellings — all rendered cleanly on the cake." },
              { title: "Occasion-aware design", desc: "A Diwali cake looks like a Diwali cake. A baby shower cake looks like a baby shower cake. The AI understands context, not just keywords." },
              { title: "Free really means free", desc: "Five full cakes on the free plan, no credit card asked. Most generators ask for payment details upfront — we don't." },
            ].map((item, i) => (
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
          <h2 className="text-3xl font-bold text-center mb-8">Free AI Cake Generator — FAQs</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try the free AI cake generator now</h2>
          <p className="text-lg mb-8 opacity-95">Your first cake takes 30 seconds. Promise.</p>
          <Button size="lg" onClick={() => navigate("/")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Free AI Cake →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AiCakeGeneratorFree;
