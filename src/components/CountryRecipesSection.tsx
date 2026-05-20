import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, Clock, ArrowRight } from "lucide-react";

interface Recipe {
  slug: string;
  title: string;
  excerpt: string | null;
  hero_image: string | null;
  prep_time: string | null;
  difficulty: string | null;
}

interface Props {
  countryCode: "IN" | "UK" | "CA" | "AU" | "US";
  countryName: string;
  adjective: string; // e.g. "British", "Indian"
}

const COUNTRY_PATH: Record<string, string> = {
  UK: "/uk",
  IN: "/india",
  CA: "/canada",
  AU: "/australia",
};

export const CountryRecipesSection = ({ countryCode, countryName, adjective }: Props) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cake_recipes")
        .select("slug,title,excerpt,hero_image,prep_time,difficulty")
        .eq("is_published", true)
        .eq("country", countryCode)
        .order("created_at", { ascending: false })
        .limit(6);
      setRecipes((data || []) as Recipe[]);
    })();
  }, [countryCode]);

  if (recipes.length === 0) return null;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Famous ${adjective} cake recipes`,
    itemListElement: recipes.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://cakeaiartist.com/recipes/${r.slug}`,
      name: r.title,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cakeaiartist.com/" },
      { "@type": "ListItem", position: 2, name: countryName, item: `https://cakeaiartist.com${COUNTRY_PATH[countryCode]}` },
      { "@type": "ListItem", position: 3, name: "Recipes", item: `https://cakeaiartist.com/recipes?country=${countryCode}` },
    ],
  };

  return (
    <section id="recipes" className="py-16 bg-white/50">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-party-pink uppercase tracking-wider mb-3">
            <ChefHat className="w-4 h-4" /> {countryName} Recipes
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Famous {adjective} cakes you can bake at home
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bake the classics — then design a matching celebration cake with our AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.slice(0, 6).map((r) => (
            <Link
              key={r.slug}
              to={`/recipes/${r.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {r.hero_image && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={r.hero_image}
                    alt={`${r.title} — ${adjective} cake recipe`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-party-pink transition-colors">
                  {r.title}
                </h3>
                {r.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {r.prep_time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.prep_time}
                      </span>
                    )}
                    {r.difficulty && <span>· {r.difficulty}</span>}
                  </div>
                  <span className="text-party-pink font-bold inline-flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to={`/recipes?country=${countryCode}`}
            className="inline-flex items-center gap-2 bg-party-pink text-white px-6 py-3 rounded-full font-bold hover:bg-party-pink/90 transition-colors"
          >
            Browse all {countryName} recipes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
