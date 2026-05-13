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
    { code: "US", name: "USA", flag: "🇺🇸", pct: 35 },
    { code: "IN", name: "India", flag: "🇮🇳", pct: 18 },
    { code: "CA", name: "Canada", flag: "🇨🇦", pct: 12 },
    { code: "GB", name: "UK", flag: "🇬🇧", pct: 9 },
    { code: "AU", name: "Australia", flag: "🇦🇺", pct: 6 },
    { code: "DE", name: "Germany", flag: "🇩🇪", pct: 4 },
  ],
  others_pct: 16,
  total_countries: 30,
};

// Brand-aligned palette (party pink → purple spectrum + neutral for "Others")
const SEGMENT_COLORS = [
  "hsl(330 81% 60%)", // pink
  "hsl(322 75% 46%)", // deep pink
  "hsl(280 60% 52%)", // magenta
  "hsl(265 55% 47%)", // purple
  "hsl(258 80% 72%)", // light purple
  "hsl(340 82% 71%)", // soft pink
  "hsl(280 50% 65%)", // extra
];
const OTHERS_COLOR = "hsl(220 14% 88%)";

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

  // Build conic-gradient from data
  let acc = 0;
  const stops: string[] = [];
  s.top.forEach((c, i) => {
    const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
    stops.push(`${color} ${acc}% ${acc + c.pct}%`);
    acc += c.pct;
  });
  const othersPct = typeof s.others_pct === "number" ? s.others_pct : Math.max(0, 100 - acc);
  if (othersPct > 0) {
    stops.push(`${OTHERS_COLOR} ${acc}% ${acc + othersPct}%`);
  }
  const conicGradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-cream/40">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative bg-card/60 backdrop-blur-xl rounded-[40px] border border-party-pink/20 p-6 md:p-12 shadow-[0_32px_64px_-16px_hsl(var(--party-pink)/0.18)] overflow-hidden">
          {/* Decorative sprinkles */}
          <div className="absolute top-8 right-10 w-3 h-3 rounded-full bg-party-pink/30 blur-sm" aria-hidden />
          <div className="absolute bottom-16 left-8 w-5 h-1.5 rounded-full bg-party-purple/30 rotate-45 blur-sm" aria-hidden />
          <div className="absolute top-1/2 -right-3 w-8 h-8 rounded-full border-4 border-party-yellow/30" aria-hidden />

          {/* Header */}
          <div className="text-center mb-10 md:mb-14 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-party-pink/10 text-party-pink text-xs font-bold tracking-widest uppercase mb-5">
              <span className="flex h-2 w-2 rounded-full bg-party-pink animate-pulse" />
              Global Community
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground leading-tight">
              The world is{" "}
              <span className="text-party-pink italic">whisking</span> together
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              From home kitchens in Toronto to studios in Sydney, creators in {s.total_countries ?? 30}+ countries are decorating the future with Cake AI.
            </p>
          </div>

          {/* Chart + Legend */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 relative z-10">
            {/* Donut */}
            <div className="relative w-60 h-60 md:w-80 md:h-80 shrink-0 group">
              <div
                className="w-full h-full rounded-full shadow-2xl transition-all duration-500 group-hover:scale-[1.02]"
                style={{
                  background: conicGradient,
                  filter:
                    "drop-shadow(0 0 0 transparent)",
                }}
              >
                {/* Hover neon glow */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: conicGradient,
                    filter: "blur(24px)",
                    transform: "scale(0.92)",
                  }}
                  aria-hidden
                />
                {/* Inner hole */}
                <div className="absolute inset-7 md:inset-9 bg-background rounded-full flex flex-col items-center justify-center shadow-inner z-10">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">
                    {s.total_countries ?? 30}+
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                    Nations
                  </span>
                </div>
              </div>

              {/* Confetti accents */}
              <div className="absolute -top-3 -left-3 w-5 h-5 bg-party-pink/20 rounded-lg rotate-12" aria-hidden />
              <div className="absolute -bottom-2 -right-5 w-7 h-7 border-2 border-party-purple/30 rounded-full" aria-hidden />
              <div className="absolute top-1/4 -right-6 w-3 h-3 bg-party-yellow rounded-full opacity-50" aria-hidden />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full md:w-auto md:min-w-[380px]">
              {s.top.map((c, i) => (
                <div
                  key={c.code}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all duration-300 hover:bg-party-pink/5 hover:translate-x-0.5"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                  />
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="font-medium text-foreground text-sm md:text-base">
                    {c.name}
                  </span>
                  <span className="ml-auto text-sm font-bold text-party-pink tabular-nums">
                    {c.pct}%
                  </span>
                </div>
              ))}
              {othersPct > 0 && (
                <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg sm:col-span-2 mt-1 pt-3 border-t border-dashed border-party-pink/20">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: OTHERS_COLOR }}
                  />
                  <span className="text-lg leading-none">🌍</span>
                  <span className="font-medium text-muted-foreground text-sm md:text-base">
                    Other countries
                  </span>
                  <span className="ml-auto text-sm font-bold text-muted-foreground tabular-nums">
                    {othersPct}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="mt-10 text-center text-sm text-party-pink/70 font-medium tracking-wide relative z-10">
            Join the global celebration — one cake at a time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GlobalReachWidget;
