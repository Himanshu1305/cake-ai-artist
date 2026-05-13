import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CountryStat {
  code: string;
  name: string;
  flag: string;
  pct: number;
}
interface CountryStats {
  enabled: boolean;
  top: CountryStat[];
  others_pct: number;
  total_countries: number;
}

const COUNTRY_META: Record<string, { name: string; flag: string }> = {
  US: { name: "USA", flag: "🇺🇸" },
  CA: { name: "Canada", flag: "🇨🇦" },
  GB: { name: "UK", flag: "🇬🇧" },
  UK: { name: "UK", flag: "🇬🇧" },
  DE: { name: "Germany", flag: "🇩🇪" },
  AU: { name: "Australia", flag: "🇦🇺" },
  IN: { name: "India", flag: "🇮🇳" },
  PH: { name: "Philippines", flag: "🇵🇭" },
  FR: { name: "France", flag: "🇫🇷" },
  IT: { name: "Italy", flag: "🇮🇹" },
  ES: { name: "Spain", flag: "🇪🇸" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
  BR: { name: "Brazil", flag: "🇧🇷" },
};

const DEFAULT_STATS: CountryStats = {
  enabled: false,
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

export const GlobalReachAdmin = ({
  liveCountryStats,
}: {
  liveCountryStats: { country: string; count: number }[];
}) => {
  const [stats, setStats] = useState<CountryStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "country_stats")
        .maybeSingle();
      if (data?.value) setStats({ ...DEFAULT_STATS, ...(data.value as any) });
      setLoading(false);
    })();
  }, []);

  const totalLive = liveCountryStats.reduce((s, x) => s + x.count, 0) || 1;

  const updateRow = (i: number, key: keyof CountryStat, val: string | number) => {
    const top = [...stats.top];
    (top[i] as any)[key] = val;
    setStats({ ...stats, top });
  };
  const removeRow = (i: number) =>
    setStats({ ...stats, top: stats.top.filter((_, idx) => idx !== i) });
  const addRow = () =>
    setStats({
      ...stats,
      top: [...stats.top, { code: "", name: "", flag: "🏳️", pct: 0 }],
    });

  const seedFromLive = () => {
    const top = liveCountryStats
      .filter((c) => c.country && c.country !== "Unknown")
      .slice(0, 6)
      .map((c) => {
        const meta = COUNTRY_META[c.country] ?? { name: c.country, flag: "🏳️" };
        return {
          code: c.country,
          name: meta.name,
          flag: meta.flag,
          pct: Math.round((c.count / totalLive) * 100),
        };
      });
    const sumTop = top.reduce((s, x) => s + x.pct, 0);
    setStats({
      ...stats,
      top,
      others_pct: Math.max(0, 100 - sumTop),
      total_countries: liveCountryStats.length,
    });
  };

  const save = async () => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "country_stats", value: stats as any }, { onConflict: "key" });
    if (error) toast.error("Save failed: " + error.message);
    else toast.success("Published to homepage");
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌍 Global Reach Stats (Homepage Widget)</CardTitle>
        <CardDescription>
          Edit the country % shown on the homepage. Click "Save & Publish" to update the live site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="font-semibold mb-1">Live data (from page visits)</div>
          <div className="flex flex-wrap gap-2">
            {liveCountryStats.slice(0, 8).map((c) => (
              <span key={c.country} className="px-2 py-1 rounded bg-background border text-xs">
                {c.country}: {((c.count / totalLive) * 100).toFixed(1)}%
              </span>
            ))}
          </div>
          <Button size="sm" variant="outline" className="mt-3" onClick={seedFromLive}>
            Use live data
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-lg border-2 border-party-pink/30 bg-party-pink/5 p-3">
          <Switch
            id="enabled"
            checked={stats.enabled}
            onCheckedChange={(v) => setStats({ ...stats, enabled: v })}
            className="data-[state=checked]:bg-party-pink data-[state=unchecked]:bg-foreground/40"
          />
          <Label htmlFor="enabled" className="font-semibold text-foreground cursor-pointer">
            Show widget on homepage {stats.enabled ? "✅" : "❌ (hidden)"}
          </Label>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground">
            <div className="col-span-2">Code</div>
            <div className="col-span-2">Flag</div>
            <div className="col-span-5">Display name</div>
            <div className="col-span-2">%</div>
            <div className="col-span-1"></div>
          </div>
          {stats.top.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-2"
                value={row.code}
                onChange={(e) => updateRow(i, "code", e.target.value.toUpperCase())}
              />
              <Input
                className="col-span-2"
                value={row.flag}
                onChange={(e) => updateRow(i, "flag", e.target.value)}
              />
              <Input
                className="col-span-5"
                value={row.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
              />
              <Input
                className="col-span-2"
                type="number"
                value={row.pct}
                onChange={(e) => updateRow(i, "pct", Number(e.target.value))}
              />
              <Button
                variant="ghost"
                size="sm"
                className="col-span-1"
                onClick={() => removeRow(i)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRow}>
            + Add country
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Others %</Label>
            <Input
              type="number"
              value={stats.others_pct}
              onChange={(e) => setStats({ ...stats, others_pct: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Total countries (display)</Label>
            <Input
              type="number"
              value={stats.total_countries}
              onChange={(e) => setStats({ ...stats, total_countries: Number(e.target.value) })}
            />
          </div>
        </div>

        <Button onClick={save} className="w-full">
          Save & Publish to Homepage
        </Button>
      </CardContent>
    </Card>
  );
};

export default GlobalReachAdmin;
