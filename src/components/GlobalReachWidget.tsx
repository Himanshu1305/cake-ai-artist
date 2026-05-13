import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CountryStat {
  code: string;
  name: string;
  flag: string;
  pct: number;
}
interface CountryStats {
  enabled: boolean;
  top: CountryStat[];
  others_pct?: number;
  total_countries?: number;
}

const FALLBACK: CountryStats = {
  enabled: true,
  top: [
    { code: "US", name: "USA", flag: "🇺🇸", pct: 44 },
    { code: "CA", name: "Canada", flag: "🇨🇦", pct: 12 },
    { code: "GB", name: "UK", flag: "🇬🇧", pct: 9 },
    { code: "DE", name: "Germany", flag: "🇩🇪", pct: 8 },
    { code: "AU", name: "Australia", flag: "🇦🇺", pct: 6 },
  ],
  others_pct: 21,
  total_countries: 32,
};

export const GlobalReachWidget = () => {
  const [stats, setStats] = useState<CountryStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "country_stats")
        .maybeSingle();
      if (data?.value) setStats(data.value as unknown as CountryStats);
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return null;
  const s = stats ?? FALLBACK;
  if (!s.enabled || !s.top?.length) return null;

  const max = Math.max(...s.top.map((t) => t.pct), 1);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-cream/40">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-party-pink uppercase tracking-wider mb-2">
            🌍 Global Reach
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Cake creators across the globe
          </h2>
          <p className="text-muted-foreground mt-2">
            Joined by people in {s.total_countries ?? 30}+ countries
          </p>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur p-6 md:p-10 shadow-lg relative overflow-hidden">
          {/* Dotted world-map backdrop */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--party-purple)) 1px, transparent 1.2px)",
              backgroundSize: "14px 14px",
            }}
            aria-hidden
          />

          <div className="relative grid gap-3 md:gap-4">
            {s.top.map((c) => (
              <div key={c.code} className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2 w-32 md:w-40 shrink-0">
                  <span className="text-2xl">{c.flag}</span>
                  <span className="font-semibold text-foreground text-sm md:text-base">
                    {c.name}
                  </span>
                </div>
                <div className="flex-1 h-3 md:h-4 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-party-pink to-party-purple transition-all duration-700"
                    style={{ width: `${(c.pct / max) * 100}%` }}
                  />
                </div>
                <div className="w-12 md:w-14 text-right font-bold text-foreground tabular-nums text-sm md:text-base">
                  {c.pct}%
                </div>
              </div>
            ))}
            {typeof s.others_pct === "number" && s.others_pct > 0 && (
              <div className="flex items-center gap-3 md:gap-4 opacity-80">
                <div className="flex items-center gap-2 w-32 md:w-40 shrink-0">
                  <span className="text-2xl">🌍</span>
                  <span className="font-semibold text-foreground text-sm md:text-base">
                    Others
                  </span>
                </div>
                <div className="flex-1 h-3 md:h-4 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-muted-foreground/40"
                    style={{ width: `${(s.others_pct / max) * 100}%` }}
                  />
                </div>
                <div className="w-12 md:w-14 text-right font-bold text-foreground tabular-nums text-sm md:text-base">
                  {s.others_pct}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalReachWidget;
