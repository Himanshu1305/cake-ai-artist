import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChefHat, ChevronDown } from "lucide-react";

interface RecipeItem {
  slug: string;
  title: string;
  country: string;
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
const ORDER = ["IN", "UK", "CA", "AU"];

let cache: RecipeItem[] | null = null;

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<RecipeItem[]>(cache || []);
  useEffect(() => {
    if (cache) return;
    (async () => {
      const { data } = await supabase
        .from("cake_recipes")
        .select("slug,title,country")
        .eq("is_published", true)
        .order("country");
      if (data) {
        cache = data as RecipeItem[];
        setRecipes(cache);
      }
    })();
  }, []);
  return recipes;
};

export const RecipesNavDropdown = () => {
  const recipes = useRecipes();
  const grouped = ORDER.map((c) => ({
    code: c,
    items: recipes.filter((r) => r.country === c),
  })).filter((g) => g.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10 gap-1"
        >
          <ChefHat className="w-3.5 h-3.5" />
          Recipes
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[320px] p-3 bg-background/95 backdrop-blur-md border-party-pink/20 max-h-[70vh] overflow-y-auto"
      >
        {grouped.map((g) => (
          <div key={g.code} className="mb-3 last:mb-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-party-purple px-2 mb-1">
              {COUNTRY_FLAGS[g.code]} {COUNTRY_LABELS[g.code]}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/recipes/${r.slug}`}
                    className="block text-sm px-2 py-1.5 rounded hover:bg-party-pink/10 hover:text-party-pink transition-colors"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="border-t border-party-pink/20 mt-2 pt-2">
          <Link
            to="/recipes"
            className="block text-center text-sm font-bold text-party-pink hover:text-party-purple"
          >
            Browse all recipes →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const RecipesMobileMenu = () => {
  const recipes = useRecipes();
  const grouped = ORDER.map((c) => ({
    code: c,
    items: recipes.filter((r) => r.country === c),
  })).filter((g) => g.items.length > 0);

  return (
    <details className="group">
      <summary className="list-none cursor-pointer">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-between text-foreground/80 hover:text-foreground hover:bg-party-pink/10"
        >
          <div>
            <span className="inline-flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> Recipes
            </span>
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </div>
        </Button>
      </summary>
      <div className="pl-3 mt-1 space-y-2">
        {grouped.map((g) => (
          <div key={g.code}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-party-purple px-2 mb-1">
              {COUNTRY_FLAGS[g.code]} {COUNTRY_LABELS[g.code]}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/recipes/${r.slug}`}
                    className="block text-sm px-2 py-1.5 rounded hover:bg-party-pink/10"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link
          to="/recipes"
          className="block text-sm font-bold text-party-pink px-2 py-1.5 hover:text-party-purple"
        >
          Browse all recipes →
        </Link>
      </div>
    </details>
  );
};
