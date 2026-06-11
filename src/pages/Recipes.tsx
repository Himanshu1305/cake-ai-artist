import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ChefHat, Clock, Users, Sparkles } from "lucide-react";
import { ExitIntentModal } from "@/components/ExitIntentModal";

interface Recipe {
  slug: string;
  title: string;
  country: string;
  excerpt: string | null;
  hero_image: string | null;
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  difficulty: string | null;
}

const COUNTRY_LABELS: Record<string, string> = {
  IN: "India",
  UK: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  UK: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [params, setParams] = useSearchParams();
  const country = params.get("country");


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
      setLoading(true);
      let q = supabase
        .from("cake_recipes")
        .select("slug,title,country,excerpt,hero_image,prep_time,cook_time,servings,difficulty")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (country) q = q.eq("country", country);
      const { data } = await q;
      setRecipes((data || []) as Recipe[]);
      setLoading(false);
    })();
  }, [country]);

  const title = country
    ? `${COUNTRY_LABELS[country] || country} Cake Recipes — Famous Cakes & How to Bake Them`
    : "Famous Cake Recipes from Around the World | Cake AI Artist";
  const desc = country
    ? `Traditional and modern cake recipes from ${COUNTRY_LABELS[country] || country}. Step-by-step instructions, prep times and design ideas.`
    : "Traditional cake recipes from India, UK, Canada and Australia. Step-by-step bakes with prep time, ingredients and matching cake design ideas.";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: desc,
    url: `https://cakeaiartist.com/recipes${country ? `?country=${country}` : ""}`,
    hasPart: recipes.map((r) => ({
      "@type": "Recipe",
      name: r.title,
      url: `https://cakeaiartist.com/recipes/${r.slug}`,
      image: r.hero_image || undefined,
      recipeCuisine: COUNTRY_LABELS[r.country],
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cakeaiartist.com/" },
      { "@type": "ListItem", position: 2, name: "Recipes", item: "https://cakeaiartist.com/recipes" },
      ...(country
        ? [{ "@type": "ListItem", position: 3, name: COUNTRY_LABELS[country] || country, item: `https://cakeaiartist.com/recipes?country=${country}` }]
        : []),
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`https://cakeaiartist.com/recipes${country ? `?country=${country}` : ""}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <section className="px-4 pt-12 pb-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-party-pink uppercase tracking-wider mb-3">
          <ChefHat className="w-4 h-4" /> Recipes Hub
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
          {country ? `${COUNTRY_LABELS[country]} cake recipes` : "Famous cakes of the world"}
        </h1>
        <p className="text-muted-foreground">
          Bake the classics. Then design a matching cake with our AI — or the other way round.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button
            onClick={() => setParams({})}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
              !country ? "bg-party-pink text-white border-party-pink" : "border-border hover:border-party-pink"
            }`}
          >
            All countries
          </button>
          {Object.entries(COUNTRY_LABELS).map(([code, name]) => (
            <button
              key={code}
              onClick={() => setParams({ country: code })}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                country === code
                  ? "bg-party-pink text-white border-party-pink"
                  : "border-border hover:border-party-pink"
              }`}
            >
              {COUNTRY_FLAGS[code]} {name}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pb-4 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-party-pink/10 to-party-purple/10 border border-party-pink/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-party-pink flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xl font-bold">See what these cakes look like as AI designs</p>
              <p className="text-sm text-muted-foreground">Generate a photorealistic AI version of any cake in 30 seconds — free</p>
            </div>
          </div>
          <Link
            to="/free-ai-cake-designer?ref=recipes_hub"
            className="whitespace-nowrap bg-party-pink text-white px-6 py-3 rounded-full font-bold hover:bg-party-pink/90 transition-colors"
          >
            Try AI Cake Designer →
          </Link>
        </div>
      </section>

      <section className="px-4 pb-16 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading recipes…</div>
        ) : recipes.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No recipes yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => (
              <Link
                key={r.slug}
                to={`/recipes/${r.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {r.hero_image && (
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={r.hero_image}
                      alt={r.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-party-purple uppercase mb-2">
                    <span>{COUNTRY_FLAGS[r.country]} {COUNTRY_LABELS[r.country]}</span>
                    {r.difficulty && <span className="text-muted-foreground">· {r.difficulty}</span>}
                  </div>
                  <h2 className="text-lg font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-party-pink transition-colors">
                    {r.title}
                  </h2>
                  {r.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {r.prep_time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.prep_time}
                      </span>
                    )}
                    {r.servings && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> {r.servings}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}
      <Footer />
    </div>
  );
};

export default Recipes;
