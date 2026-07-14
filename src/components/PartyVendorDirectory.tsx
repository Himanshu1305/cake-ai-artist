import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, MapPin } from "lucide-react";
import { VendorSearchGate } from "@/components/VendorSearchGate";
import { LocalVendorResults, VendorResult } from "@/components/LocalVendorResults";
import { VENDOR_CATEGORIES, getDefaultVendorCategories } from "@/data/vendorSearchMap";
import { toast } from "sonner";

interface PartyVendorDirectoryProps {
  isPremium: boolean;
  occasion?: string;
  defaultLocation?: string;
}

export function PartyVendorDirectory({ isPremium, occasion, defaultLocation = "" }: PartyVendorDirectoryProps) {
  const [location, setLocation] = useState(defaultLocation);
  const [selectedCategory, setSelectedCategory] = useState<string>("bakery");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VendorResult[] | null>(null);
  const [searchedLabel, setSearchedLabel] = useState("");
  const [searchedLocation, setSearchedLocation] = useState("");

  const suggestedCategories = getDefaultVendorCategories(occasion);

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error("Enter a city or area to search");
      return;
    }
    const cat = VENDOR_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!cat) return;

    setLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("search-local-vendors", {
        body: {
          vendorType: cat.searchTerm,
          location: location.trim(),
        },
      });
      if (error) throw error;
      if (data.error === "premium_required") {
        toast.error("Premium required for vendor search");
        return;
      }
      setResults(data.results ?? []);
      setSearchedLabel(cat.label);
      setSearchedLocation(location.trim());
    } catch (err: any) {
      if (err?.message?.includes("Rate limit")) {
        toast.error("You've reached the daily search limit (20 searches/day)");
      } else {
        toast.error("Vendor search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Find local vendors for your{occasion ? ` ${occasion}` : " party"} — powered by Google Places.
        </p>

        {/* Suggested categories for this occasion */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedCategory === cat.id
                  ? "bg-party-pink/20 border-party-pink text-foreground font-medium"
                  : "border-border hover:border-party-pink/50 text-muted-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
          {/* Show all remaining categories as overflow */}
          {VENDOR_CATEGORIES.filter((c) => !suggestedCategories.find((s) => s.id === c.id)).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors opacity-60 hover:opacity-100 ${
                selectedCategory === cat.id
                  ? "bg-party-pink/20 border-party-pink text-foreground font-medium opacity-100"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="vendor-location" className="text-xs mb-1 block">
              City or area
            </Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="vendor-location"
                placeholder="Mumbai, India or Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} disabled={loading || !isPremium} className="gap-1.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </div>
      </div>

      {results !== null && (
        <LocalVendorResults
          results={results}
          vendorLabel={searchedLabel}
          location={searchedLocation}
        />
      )}
    </div>
  );

  return (
    <VendorSearchGate isPremium={isPremium}>
      {content}
    </VendorSearchGate>
  );
}
