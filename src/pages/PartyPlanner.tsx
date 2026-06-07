import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  PartyPopper,
  Plus,
  Calendar,
  Users,
  Sparkles,
  Lock,
  CheckCircle2,
  MessageSquare,
  Mail,
  ListChecks,
  Cake,
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ExitIntentModal } from "@/components/ExitIntentModal";

const SEO_TITLE = "Free AI Party Planner — Plan Birthdays & Showers in Minutes";
const SEO_DESC =
  "Plan birthdays, baby showers and anniversaries with a free AI party planner. Smart checklist, budget tracker, online invitations and live RSVP — all in one place.";
const SEO_URL = "https://cakeaiartist.com/party-planner";

const CHECKLIST_STEPS = [
  {
    when: "6–8 weeks before",
    title: "Pick the occasion, date & vibe",
    detail:
      "Lock the date, decide if it's a kids' party, milestone birthday, baby shower or anniversary, and choose a theme. The AI concierge suggests themes based on age and interests.",
  },
  {
    when: "4–6 weeks before",
    title: "Set a guest list & budget",
    detail:
      "Add guests with emails or phone numbers. Set a total budget — the planner splits it across cake, decor, food, venue and activities with realistic local prices.",
  },
  {
    when: "3–4 weeks before",
    title: "Send digital invitations",
    detail:
      "Generate matching invitation artwork from your cake design and send personalised email invites. Each guest gets a unique RSVP link with plus-one and meal-preference fields.",
  },
  {
    when: "2 weeks before",
    title: "Lock the cake, decor & food",
    detail:
      "Order or design the cake (use the AI cake generator), confirm decor list, finalise menu. The smart checklist nudges you when something's overdue.",
  },
  {
    when: "1 week before",
    title: "Track RSVPs & nudge non-responders",
    detail:
      "See live attending / maybe / declined counts. One click sends a polite reminder to everyone who hasn't replied.",
  },
  {
    when: "2 days before",
    title: "Run the day-of checklist",
    detail:
      "Pick-up times, setup order, music playlist, party-pack printables (banners, name tags, thank-you cards) — all generated from your party theme.",
  },
  {
    when: "Day of",
    title: "Celebrate & capture memories",
    detail:
      "Share the public event page with countdown so guests know exactly where and when. Add to Apple/Google Calendar with one tap.",
  },
];

const FAQS = [
  {
    q: "Is the AI party planner really free?",
    a: "Yes — creating a party, chatting with the concierge to build a plan and sending up to your free-tier invites is included. Unlimited invites and advanced features are part of the Premium plan.",
  },
  {
    q: "What kind of parties can I plan?",
    a: "Birthdays (kids, teen, milestone), baby showers, anniversaries, engagement parties, retirement and corporate celebrations. The concierge adapts the checklist to the occasion.",
  },
  {
    q: "How does the AI party concierge work?",
    a: "You chat in plain English — 'plan a 7th birthday for Mia, unicorn theme, 15 kids, Mumbai, ₹15,000 budget' — and the AI builds a full task list with realistic local price estimates, suggests vendors and drafts invitation copy.",
  },
  {
    q: "Can guests RSVP without creating an account?",
    a: "Yes. Each guest gets a unique link — they tap Yes / No / Maybe, add plus-ones, dietary preferences and answer any custom questions you set. No login required.",
  },
  {
    q: "Does it work for parties outside the US?",
    a: "Yes — the planner detects your location and shows prices in your local currency (INR, GBP, CAD, AUD, USD and more). Vendor suggestions are city-aware.",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to plan a birthday party with AI",
  description:
    "A step-by-step checklist to plan a birthday party, baby shower or anniversary using a free AI party planner.",
  totalTime: "P56D",
  step: CHECKLIST_STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: `${s.when}: ${s.detail}`,
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Cake AI Artist Party Planner",
  url: SEO_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1240" },
};

function PartyPlannerSEO() {
  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <link rel="canonical" href={SEO_URL} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SEO_URL} />
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="px-4 pt-12 pb-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-party-pink uppercase tracking-wider mb-3">
          <PartyPopper className="w-4 h-4" /> Free AI Party Planner
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Plan a party in minutes, not weekends
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          A free <strong>AI party planner</strong> for birthdays, baby showers and anniversaries. Get a
          smart <strong>party planning checklist</strong>, budget tracker, online invitations and live
          RSVP tracking — all guided by your AI Party Concierge.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            to="/auth?redirect=/party-planner"
            className="inline-flex items-center gap-2 bg-party-pink text-white px-6 py-3 rounded-full font-bold hover:bg-party-pink/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Start planning free
          </Link>
          <Link
            to="/free-ai-cake-designer"
            className="inline-flex items-center gap-2 border-2 border-party-purple text-party-purple px-6 py-3 rounded-full font-bold hover:bg-party-purple/5"
          >
            <Cake className="w-4 h-4" /> Design the cake first
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, title: "AI Party Concierge", desc: "Chat to build a full plan in seconds." },
            { icon: ListChecks, title: "Smart Checklist", desc: "Tasks adapt to your occasion & date." },
            { icon: Mail, title: "Digital Invitations", desc: "Beautiful invites with unique RSVP links." },
            { icon: CheckCircle2, title: "Live RSVP Tracking", desc: "See who's coming + reminder nudges." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm border border-border">
              <f.icon className="w-6 h-6 text-party-pink mb-2" />
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HowTo / Checklist */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Birthday party planning checklist
        </h2>
        <p className="text-muted-foreground mb-8">
          The full timeline our AI concierge follows — from 8 weeks out to the day of.
        </p>
        <ol className="space-y-4">
          {CHECKLIST_STEPS.map((s, i) => (
            <li key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-border flex gap-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-party-pink text-white font-bold flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <div>
                <div className="text-xs font-bold text-party-purple uppercase tracking-wider mb-1">
                  {s.when}
                </div>
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
          Party planner — questions people ask
        </h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="bg-white rounded-2xl p-5 shadow-sm border border-border group"
            >
              <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                {f.q}
                <span className="text-party-pink group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="px-4 pb-16 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Keep planning</h2>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <Link to="/free-ai-cake-designer" className="px-4 py-2 rounded-full border-2 border-border hover:border-party-pink font-bold">
            Free AI Cake Designer
          </Link>
          <Link to="/ai-birthday-cake-with-name" className="px-4 py-2 rounded-full border-2 border-border hover:border-party-pink font-bold">
            Birthday cake with name
          </Link>
          <Link to="/recipes" className="px-4 py-2 rounded-full border-2 border-border hover:border-party-pink font-bold">
            Famous cake recipes
          </Link>
          <Link to="/community" className="px-4 py-2 rounded-full border-2 border-border hover:border-party-pink font-bold">
            Community gallery
          </Link>
          <Link to="/pricing" className="px-4 py-2 rounded-full border-2 border-border hover:border-party-pink font-bold">
            Pricing
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-br from-party-pink/10 to-party-purple/10 rounded-3xl p-8">
          <Sparkles className="w-8 h-8 text-party-pink mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Ready to plan your party?</h2>
          <p className="text-muted-foreground mb-5">
            Sign up free — start chatting with your AI Party Concierge in seconds.
          </p>
          <Link
            to="/auth?redirect=/party-planner"
            className="inline-flex items-center gap-2 bg-party-pink text-white px-7 py-3 rounded-full font-bold hover:bg-party-pink/90 transition-colors"
          >
            <PartyPopper className="w-4 h-4" /> Start free
          </Link>
        </div>
      </section>
    </>
  );
}

export default function PartyPlanner() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [prefillOccasion, setPrefillOccasion] = useState<string | null>(null);
  const [prefillTheme, setPrefillTheme] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, lifetime_access")
        .eq("id", user.id)
        .maybeSingle();
      setIsPremium(!!(profile?.is_premium || profile?.lifetime_access));
      const { data } = await supabase
        .from("parties")
        .select("*")
        .order("created_at", { ascending: false });
      setParties(data || []);
      setLoading(false);

      const prefillName = searchParams.get("name");
      const prefillOcc = searchParams.get("occasion");
      const prefillThm = searchParams.get("theme");
      if (prefillName) {
        const suggestedTitle = prefillOcc
          ? `${prefillName}'s ${prefillOcc.charAt(0).toUpperCase() + prefillOcc.slice(1)}`
          : `${prefillName}'s Party`;
        const alreadyExists = (data || []).some((p) => p.title === suggestedTitle);
        if (!alreadyExists) {
          setTitle(suggestedTitle);
          setPrefillOccasion(prefillOcc);
          setPrefillTheme(prefillThm);
          setOpen(true);
        }
        setSearchParams({}, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    const insertPayload: any = { user_id: user.id, title: title.trim() };
    if (prefillOccasion) insertPayload.occasion = prefillOccasion;
    if (prefillTheme) insertPayload.theme = prefillTheme;
    const { data, error } = await supabase
      .from("parties")
      .insert(insertPayload)
      .select()
      .single();
    setCreating(false);
    if (error) {
      toast.error("Could not create party");
      return;
    }
    setOpen(false);
    setTitle("");
    setPrefillOccasion(null);
    setPrefillTheme(null);
    navigate(`/party-planner/${data.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">Loading…</div>
        <Footer />
      </div>
    );
  }

  // Public SEO landing for unauthenticated visitors
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <PartyPlannerSEO />
        <Footer />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <Helmet>
          <title>{SEO_TITLE}</title>
          <meta name="description" content={SEO_DESC} />
          <link rel="canonical" href={SEO_URL} />
        </Helmet>
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto py-16">
          <Lock className="w-16 h-16 text-primary mb-4" />
          <span className="bg-gradient-to-r from-party-purple to-party-pink text-white text-xs font-bold px-3 py-1 rounded-full mb-3">PREMIUM FEATURE</span>
          <h1 className="text-3xl font-bold mb-3">Party Planner is a Premium feature</h1>
          <p className="text-muted-foreground mb-4 max-w-md">
            Plan parties end-to-end with your AI Party Concierge — chat to build a plan, get a smart checklist that adapts to your event, and send digital invites with live RSVP tracking.
          </p>
          <ul className="text-left text-sm text-muted-foreground mb-6 space-y-1">
            <li>✓ Conversational AI Party Concierge</li>
            <li>✓ Smart checklist with countdown reminders</li>
            <li>✓ Digital invites with RSVP tracking</li>
          </ul>
          <p className="text-sm text-muted-foreground mb-6">Included with every Premium plan — Monthly, Yearly & Lifetime.</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button onClick={() => navigate("/pricing")} size="lg" className="bg-gradient-to-r from-party-purple to-party-pink text-white border-0">
              Upgrade to unlock
            </Button>
            <Button onClick={() => navigate("/pricing")} size="lg" variant="outline">
              See plans & pricing
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Helmet>
        <title>Your parties — AI Party Planner | Cake AI Artist</title>
        <link rel="canonical" href={SEO_URL} />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 mt-2">
              <PartyPopper className="w-8 h-8 text-primary" /> Your Parties
            </h1>
            <p className="text-muted-foreground mt-1">Plan, invite, and celebrate — your AI concierge handles the rest.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg"><Plus className="w-4 h-4 mr-2" /> New Party</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Start a new party</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="e.g. Mia's 7th Birthday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
                <Button onClick={handleCreate} disabled={creating || !title.trim()} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" /> Create & Start Planning
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {parties.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl">
            <PartyPopper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No parties yet — start your first celebration!</p>
            <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Party</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parties.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/party-planner/${p.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {p.event_date && (
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(p.event_date).toLocaleDateString()}</div>
                  )}
                  {p.guest_count > 0 && (
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {p.guest_count} guests</div>
                  )}
                  {p.occasion && <div className="capitalize">🎉 {p.occasion}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ExitIntentModal isLoggedIn={!!user} isPremium={isPremium} country="US" />
      <Footer />
    </div>
  );
}
