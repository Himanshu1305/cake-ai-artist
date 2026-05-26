import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { BreadcrumbSchema, FAQSchema } from "@/components/SEOSchema";
import { Type, Sparkles, Heart, Star, Cake } from "lucide-react";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";

const AiBirthdayCakeWithName = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Can the AI birthday cake really show any name?",
      answer: "Yes — any name, in any script the standard English alphabet supports. Short names (Sam, Eli), long names (Alessandra, Maximilian), double names (Mary-Jane), names with apostrophes (O'Brien) — all rendered cleanly on the cake.",
    },
    {
      question: "What if the AI spells the name wrong on the cake?",
      answer: "It almost never happens, but if it does, regenerate with the same name and it'll fix itself. We specifically trained the model to handle names — it's the #1 thing people care about, and most AI cake tools get it wrong.",
    },
    {
      question: "Can I add a personalized message too, not just a name?",
      answer: "Absolutely. You can add a short message like 'Happy 30th Sarah!' or 'You did it, Dad!' — the cake will show both the name and the greeting clearly.",
    },
    {
      question: "Does it work for non-English names?",
      answer: "For names spelled in the English alphabet (Priya, Aarav, Saoirse, Mateo, etc.) — yes, perfectly. For names in non-Latin scripts (Hindi, Mandarin, Arabic) — we recommend the English transliteration.",
    },
    {
      question: "How long does it take to make an AI birthday cake with a name?",
      answer: "About 30 seconds. Pick birthday → type the name → choose a style → generate. The name appears cleanly on the finished cake design.",
    },
  ];

  const samples = [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>AI Birthday Cake with Name — Personalized Birthday Cake AI | Cake AI Artist</title>
        <meta name="description" content="Design an AI birthday cake with any name. Cake AI Artist creates personalized birthday cakes with the recipient's name spelled correctly — free in 30 seconds." />
        <link rel="canonical" href="https://cakeaiartist.com/ai-birthday-cake-with-name" />
        <meta property="og:title" content="AI Birthday Cake with Name | Cake AI Artist" />
        <meta property="og:description" content="Personalized AI birthday cake with any name — spelled correctly, every time. Free in 30 seconds." />
        <meta property="og:url" content="https://cakeaiartist.com/ai-birthday-cake-with-name" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "AI Birthday Cake with Name", url: "https://cakeaiartist.com/ai-birthday-cake-with-name" },
      ]} />

      <FAQSchema faqs={faqs} />

      <nav className="border-b border-border bg-surface-elevated/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
            <span>Cake AI Artist</span>
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-foreground hover:text-party-pink">Pricing</Link>
        </div>
      </nav>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Type className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">Any Name · Spelled Correctly</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            AI Birthday Cake with{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Any Name on It</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The birthday cake AI that actually gets the name right. Most AI cake generators turn 'Sarah' into 'Saraah' or mangle anything longer than 5 letters. Cake AI Artist doesn't. Type the name, pick the style, hit generate — your personalized birthday cake AI design appears with the name rendered cleanly, every time. Free for your first 5 cakes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Cake className="w-5 h-5 mr-2" /> Make a Birthday Cake with a Name →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See real examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · 2,800+ birthdays celebrated</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">AI birthday cake samples with names</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Real cakes with real names — no cherry-picking. These are the kind of results you'll get on your first try.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {samples.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`AI birthday cake with name sample ${i + 1} — personalized birthday cake AI design`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Why the name on your AI birthday cake matters</h2>
          <div className="space-y-4">
            {[
              { title: "It's the whole point of a personalized cake", desc: "If the name is misspelled or unreadable, the cake doesn't feel personal anymore. Most generic AI cake tools treat the name as decoration — we treat it as the most important detail." },
              { title: "Short names, long names, double names — all handled", desc: "Whether it's 'Mo' or 'Maximilian' or 'Mary-Jane', the AI sizes and positions the text correctly so it fits cleanly on the cake without spilling off the edges." },
              { title: "Names from anywhere in the world", desc: "Priya, Aarav, Saoirse, Mateo, Yuki — if it's spelled in the English alphabet, the AI birthday cake renders it perfectly." },
            ].map((item, i) => (
              <Card key={i} className="p-5">
                <div className="flex gap-4">
                  <Heart className="w-6 h-6 text-party-pink flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">AI Birthday Cake with Name — FAQs</h2>
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
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Make a birthday cake with a name right now</h2>
          <p className="text-lg mb-8 opacity-95">30 seconds. Their name on a beautiful cake. They'll never forget it.</p>
          <Button size="lg" onClick={() => navigate("/")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design the Cake →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AiBirthdayCakeWithName;
