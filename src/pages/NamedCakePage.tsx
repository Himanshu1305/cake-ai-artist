import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema, HowToSchema, ArticleSchema } from "@/components/SEOSchema";
import { Sparkles, Cake, Heart, Type, BookOpen, Calendar, Palette, Star } from "lucide-react";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";
import { CAKE_NAMES } from "@/data/cakeNames";
import { NAME_MEANINGS, fallbackMeaning } from "@/data/nameMeanings";
import { cakeMessagesFor } from "@/data/cakeMessages";

const samples = [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5];

const LAST_UPDATED = "2026-06-25";

const NamedCakePage = () => {
  const { name: slug } = useParams<{ name: string }>();

  const entry = useMemo(
    () => CAKE_NAMES.find((n) => n.slug === slug?.toLowerCase()),
    [slug],
  );

  if (!entry) return <Navigate to="/ai-birthday-cake-with-name" replace />;

  const { name } = entry;
  const meaning = NAME_MEANINGS[entry.slug] || fallbackMeaning(name, entry.origin);
  const url = `https://cakeaiartist.com/birthday-cake-for/${entry.slug}`;
  const title = `Birthday Cake with Name "${name}" — Meaning, Designs & Free AI Maker`;
  const description = `Design a birthday cake with the name ${name} in 30 seconds. ${name} means "${meaning.meaning.split(' — ')[0]}" (${meaning.origin}). Free AI cake maker, 12+ ready-to-use messages, expert tips.`;

  const messages = cakeMessagesFor();

  const faqs = [
    {
      question: `What does the name ${name} mean?`,
      answer: `${name} is of ${meaning.origin} origin and means ${meaning.meaning}. ${meaning.popularity ?? ""}`.trim(),
    },
    {
      question: `What is the best cake design for someone named ${name}?`,
      answer: `For ${name}, the most popular cake palettes are ${meaning.pairings?.join(", ") ?? "royal blue, floral and elegant gold"}. Pair the name with a theme the recipient already loves — a unicorn cake for a child, a floral or vintage Lambeth design for an adult, a sports or superhero design for a teenager. Our AI suggests a matching design automatically when you enter ${name}.`,
    },
    {
      question: `Will the cake actually have the name "${name}" spelled correctly?`,
      answer: `Yes. Our AI is specifically tuned for name accuracy — ${name} appears clearly and correctly on the finished cake design. Unlike ChatGPT or Gemini (which routinely render distorted lettering on cakes), our model uses post-generation text overlay to guarantee exact spelling. If anything looks off, regenerate once and it self-corrects.`,
    },
    {
      question: `What are good birthday cake messages to pair with the name ${name}?`,
      answer: `Popular short messages include: "Happy Birthday ${name}", "${name}, you make [age] look easy", "Wishing ${name} a magical day", "Bestie ${name} — happy birthday". We list 30+ ready-to-use messages by relationship (child, teen, adult, family, friends) further down this page.`,
    },
    {
      question: `Is the AI birthday cake design with ${name} really free?`,
      answer: `Completely free. Generate up to 5 cake designs for ${name} for free, no credit card, no signup wall on the first design. You'll see all three angles (front, side, top-down) and can share an animated link with birthday music. Premium unlocks unlimited generations and HD downloads.`,
    },
    {
      question: `Can I download or share the ${name} birthday cake?`,
      answer: `Yes. Share a live animated cake link on WhatsApp, Instagram, Facebook or email — recipients see ${name}'s cake spin in 3D with birthday music. You can also download the still image as a JPG for printing or for the cake-shop reference.`,
    },
    {
      question: `Can I order a real cake based on the AI design of ${name}?`,
      answer: `Yes — many users take the AI-generated cake image (with ${name}'s name on it) to their local bakery as a reference design. The three-view render (front, side, top-down) gives bakers everything they need to recreate it in fondant or buttercream.`,
    },
    {
      question: `What age groups does the ${name} cake design work for?`,
      answer: `Any age. ${name} cake designs work for 1st birthdays, kids' parties, teens, milestone adult birthdays (30, 40, 50) and senior birthdays. The AI adapts the cake style to the age you enter — kids get playful themes, adults get elegant or sophisticated designs.`,
    },
  ];

  const howToSteps = [
    { name: "Open the free AI cake designer", text: `Click the button above to open the free cake designer with ${name} pre-filled.` },
    { name: `Type "${name}" in the name field`, text: `Enter ${name} exactly as you want it to appear on the cake.` },
    { name: "Pick a theme or let the AI pick", text: `Choose a theme (unicorn, sports, floral, gaming) or let the AI suggest one based on ${name}'s age and style.` },
    { name: "Generate the cake", text: `Click generate — three cake views (front, side, top-down) for ${name} are ready in 30 seconds.` },
    { name: "Share or download", text: `Share the animated link with birthday music, or download the image as JPG.` },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta name="author" content="Cake AI Artist Editorial Team" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Birthday Cake with Name", url: "https://cakeaiartist.com/ai-birthday-cake-with-name" },
        { name, url },
      ]} />
      <FAQSchema faqs={faqs} />
      <HowToSchema
        name={`How to design a birthday cake with the name ${name}`}
        description={`Step-by-step guide to designing a personalised birthday cake with the name ${name} in 30 seconds.`}
        totalTime="PT30S"
        steps={howToSteps}
      />
      <ArticleSchema
        headline={`Birthday Cake with Name "${name}" — Meaning, Designs & Free AI Maker`}
        description={description}
        datePublished="2026-06-15"
        dateModified={LAST_UPDATED}
        author="Cake AI Artist Editorial Team"
        url={url}
      />

      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* EEAT byline */}
        <div className="text-xs text-muted-foreground mb-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Cake AI Artist Editorial Team</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Last updated: {new Date(LAST_UPDATED).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> 4.9/5 from 2,800+ users</span>
        </div>

        {/* Hero */}
        <section className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-party-pink font-semibold mb-3">
            Birthday cake with name
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Birthday Cake with Name <span className="text-party-pink">"{name}"</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Design a personalised birthday cake for {name} in 30 seconds. The AI spells {name} correctly the first time,
            renders three professional views, and lets you share an animated link with birthday music.
          </p>
          <Link to={`/free-ai-cake-designer?name=${encodeURIComponent(name)}`}>
            <Button size="lg" className="bg-gradient-party text-white font-bold text-lg px-8 py-6 shadow-elegant hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 mr-2" />
              Design {name}'s Cake Free →
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            ✅ Free • ✅ 30 seconds • ✅ Name spelled correctly, guaranteed
          </p>
        </section>

        {/* Name meaning — fact block (AEO-friendly) */}
        <section className="mb-12">
          <Card className="p-6 md:p-8 bg-card border-2 border-party-pink/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">About the name {name}</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="font-semibold text-foreground">Meaning</dt>
                <dd className="text-muted-foreground">{meaning.meaning}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Origin</dt>
                <dd className="text-muted-foreground">{meaning.origin}</dd>
              </div>
              {meaning.gender && (
                <div>
                  <dt className="font-semibold text-foreground">Typically used for</dt>
                  <dd className="text-muted-foreground capitalize">{meaning.gender === "unisex" ? "All genders" : `${meaning.gender}s`}</dd>
                </div>
              )}
              {meaning.popularity && (
                <div>
                  <dt className="font-semibold text-foreground">Popularity</dt>
                  <dd className="text-muted-foreground">{meaning.popularity}</dd>
                </div>
              )}
              {meaning.funFact && (
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-foreground">Notable bearers</dt>
                  <dd className="text-muted-foreground">{meaning.funFact}</dd>
                </div>
              )}
              {meaning.pairings && (
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-foreground">Cake palettes that suit {name}</dt>
                  <dd className="text-muted-foreground">{meaning.pairings.join(" · ")}</dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Naming reference compiled from common etymological sources (Behind the Name, Social Security Administration, UK ONS).
            </p>
          </Card>
        </section>

        {/* Sample gallery */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            What "{name}" cake designs look like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {samples.map((src, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-elegant transition-shadow">
                <img
                  src={src}
                  alt={`Birthday cake design idea for ${name} — style ${i + 1}`}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Each cake design you generate will have <strong>{name}</strong> piped clearly on top, in all three views.
          </p>
        </section>

        {/* Why our AI is the right tool */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <Type className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">Name spelled right, guaranteed</h3>
            <p className="text-sm text-muted-foreground">
              ChatGPT and Gemini routinely misspell {name} on cake images (a known limitation of general-purpose image AI).
              Our model uses post-generation text overlay so {name} renders crisply, correctly, every time.
            </p>
          </Card>
          <Card className="p-6">
            <Cake className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">3 professional cake views</h3>
            <p className="text-sm text-muted-foreground">
              Front, side and top-down — see {name}'s cake from every angle, the way a real bakery photo would show it.
              Perfect to take to your local bakery as a reference.
            </p>
          </Card>
          <Card className="p-6">
            <Heart className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">Animated share with music</h3>
            <p className="text-sm text-muted-foreground">
              Send {name} a link that opens with a spinning 3D cake reveal and birthday music — far more memorable than a flat
              image on WhatsApp or Instagram.
            </p>
          </Card>
        </section>

        {/* Message ideas — AEO gold */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">30+ birthday cake messages for {name}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Copy-paste a message into the designer, or use one as inspiration for the cake topper.
            Replace [age] with the actual age.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {messages.map((block) => (
              <Card key={block.heading} className="p-5">
                <h3 className="font-semibold text-base mb-3 text-party-pink">{block.heading}</h3>
                <ul className="space-y-1.5 text-sm">
                  {block.items.map((item, i) => (
                    <li key={i} className="text-muted-foreground">
                      • {item.replace(/\{NAME\}/g, name)}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Expert tips */}
        <section className="mb-12">
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
              <Palette className="w-7 h-7 text-party-pink" />
              Expert tips for a {name} cake that actually looks good
            </h2>
            <ol className="space-y-3 text-sm">
              <li>
                <strong className="text-foreground">1. Pick a single hero theme.</strong>{" "}
                <span className="text-muted-foreground">
                  A {name} cake works best when it commits to one design direction (e.g. unicorn, or floral, or sports — never two at once).
                  Mixed themes are the #1 reason DIY and bakery cakes look amateurish.
                </span>
              </li>
              <li>
                <strong className="text-foreground">2. Place {name}'s name centrally on the top view.</strong>{" "}
                <span className="text-muted-foreground">
                  The top-down photo is what gets shared on WhatsApp and Instagram — the name should sit dead-centre with breathing
                  space, not crammed against the edge.
                </span>
              </li>
              <li>
                <strong className="text-foreground">3. Match the colour palette to the age.</strong>{" "}
                <span className="text-muted-foreground">
                  For {name} as a child, use saturated, playful palettes ({meaning.pairings?.[0] ?? "royal blue"}). For {name} as an adult,
                  the same theme reads better in muted, tone-on-tone versions ({meaning.pairings?.[2] ?? "elegant ivory"}).
                </span>
              </li>
              <li>
                <strong className="text-foreground">4. Keep the message short.</strong>{" "}
                <span className="text-muted-foreground">
                  "Happy Birthday {name}" almost always beats a longer sentence. Cakes have limited real estate — the name should be the hero.
                </span>
              </li>
              <li>
                <strong className="text-foreground">5. Generate 2-3 versions before committing.</strong>{" "}
                <span className="text-muted-foreground">
                  The first generation is rarely the best. Generate three designs for {name}, pick the strongest, then share that one.
                </span>
              </li>
            </ol>
          </Card>
        </section>

        {/* How to */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            How to design {name}'s cake in 30 seconds
          </h2>
          <ol className="max-w-2xl mx-auto space-y-3 text-base">
            {howToSteps.map((step, i) => (
              <li key={i}>
                <strong>{i + 1}.</strong> {step.text}
              </li>
            ))}
          </ol>
          <div className="text-center mt-6">
            <Link to={`/free-ai-cake-designer?name=${encodeURIComponent(name)}`}>
              <Button size="lg" className="bg-gradient-party text-white font-bold">
                Start {name}'s Cake →
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <Card key={i} className="p-5">
                <h3 className="font-semibold mb-2 text-foreground">{f.question}</h3>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="mb-12 text-center">
          <h2 className="text-xl font-bold mb-4">More personalised birthday cakes</h2>
          <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {CAKE_NAMES.filter((n) => n.slug !== entry.slug)
              .slice(0, 24)
              .map((n) => (
                <Link
                  key={n.slug}
                  to={`/birthday-cake-for/${n.slug}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-party-pink/10 hover:border-party-pink transition-colors"
                >
                  {n.name}
                </Link>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NamedCakePage;
