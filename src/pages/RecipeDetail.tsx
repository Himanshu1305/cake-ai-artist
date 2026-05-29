import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowLeft, ChefHat, Clock, Users, Sparkles } from "lucide-react";

interface Recipe {
  slug: string;
  title: string;
  country: string;
  excerpt: string | null;
  story: string | null;
  hero_image: string | null;
  ingredients: string[];
  steps: string[];
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  difficulty: string | null;
  related_cake_design_prompt: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

const COUNTRY_LABELS: Record<string, string> = {
  IN: "India",
  UK: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
};

const RecipeDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("cake_recipes")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (data) {
        setRecipe({
          ...data,
          ingredients: Array.isArray(data.ingredients) ? (data.ingredients as string[]) : [],
          steps: Array.isArray(data.steps) ? (data.steps as string[]) : [],
        } as Recipe);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p>Recipe not found.</p>
        <Link to="/recipes" className="text-party-pink font-bold">Browse recipes</Link>
      </div>
    );
  }

  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt || recipe.meta_description,
    image: recipe.hero_image,
    recipeCuisine: COUNTRY_LABELS[recipe.country],
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    recipeYield: recipe.servings,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
    author: { "@type": "Organization", name: "Cake AI Artist" },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cakeaiartist.com/" },
      { "@type": "ListItem", position: 2, name: "Recipes", item: "https://cakeaiartist.com/recipes" },
      { "@type": "ListItem", position: 3, name: COUNTRY_LABELS[recipe.country], item: `https://cakeaiartist.com/recipes?country=${recipe.country}` },
      { "@type": "ListItem", position: 4, name: recipe.title, item: `https://cakeaiartist.com/recipes/${recipe.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Helmet>
        <title>{recipe.meta_title || recipe.title}</title>
        <meta name="description" content={recipe.meta_description || recipe.excerpt || ""} />
        <link rel="canonical" href={`https://cakeaiartist.com/recipes/${recipe.slug}`} />
        <meta property="og:title" content={recipe.title} />
        <meta property="og:description" content={recipe.excerpt || ""} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://cakeaiartist.com/recipes/${recipe.slug}`} />
        {recipe.hero_image && <meta property="og:image" content={recipe.hero_image} />}
        <script type="application/ld+json">{JSON.stringify(recipeSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/recipes" className="inline-flex items-center gap-1 text-sm font-bold text-party-purple mb-4 hover:text-party-pink">
          <ArrowLeft className="w-4 h-4" /> All recipes
        </Link>

        <div className="text-xs font-bold text-party-pink uppercase tracking-wider mb-2 inline-flex items-center gap-2">
          <ChefHat className="w-3.5 h-3.5" /> {COUNTRY_LABELS[recipe.country]} Classic
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">{recipe.title}</h1>
        {recipe.excerpt && <p className="text-lg text-muted-foreground mb-6">{recipe.excerpt}</p>}

        {recipe.hero_image && (
          <img
            src={recipe.hero_image}
            alt={recipe.title}
            className="w-full aspect-[16/10] object-cover rounded-2xl mb-6 shadow-lg"
          />
        )}

        <div className="flex flex-wrap gap-4 text-sm bg-white rounded-xl p-4 shadow-sm mb-8">
          {recipe.prep_time && (
            <div><span className="font-bold">Prep:</span> {recipe.prep_time}</div>
          )}
          {recipe.cook_time && (
            <div><span className="font-bold">Cook:</span> {recipe.cook_time}</div>
          )}
          {recipe.servings && (
            <div className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {recipe.servings}</div>
          )}
          {recipe.difficulty && (
            <div><span className="font-bold">Difficulty:</span> {recipe.difficulty}</div>
          )}
        </div>

        {recipe.story && (
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-3">The story</h2>
            <p className="text-muted-foreground leading-relaxed">{recipe.story}</p>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-party-pink mt-1">●</span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-3">Method</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-party-pink text-white font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {recipe.related_cake_design_prompt && (
          <section className="bg-gradient-to-br from-party-pink/10 to-party-purple/10 rounded-2xl p-6 my-8 text-center">
            <Sparkles className="w-6 h-6 text-party-pink mx-auto mb-2" />
            <h3 className="text-xl font-bold mb-2">Want it as a designer cake too?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Let our AI design a celebration version of this cake in 30 seconds.
            </p>
            <button
              onClick={() =>
                navigate(`/?prompt=${encodeURIComponent(recipe.related_cake_design_prompt!)}`)
              }
              className="inline-flex items-center gap-2 bg-party-pink text-white px-6 py-3 rounded-full font-bold hover:bg-party-pink/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Design this cake with AI
            </button>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default RecipeDetail;
