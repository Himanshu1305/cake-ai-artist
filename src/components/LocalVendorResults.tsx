import { Star, Phone, Globe, MapPin, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface VendorResult {
  name: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  openNow?: boolean;
}

interface LocalVendorResultsProps {
  results: VendorResult[];
  vendorLabel: string;
  location: string;
}

export function LocalVendorResults({ results, vendorLabel, location }: LocalVendorResultsProps) {
  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No results found for {vendorLabel} near {location}. Try a different area.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {results.length} {vendorLabel.toLowerCase()} found near <strong>{location}</strong>
      </p>
      {results.map((v, i) => (
        <Card key={i} className="border border-border/50 hover:border-party-pink/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">{v.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  {v.rating !== undefined && (
                    <>
                      <Star className="w-3 h-3 text-party-gold fill-party-gold" />
                      <span className="text-xs text-muted-foreground">
                        {v.rating.toFixed(1)}
                        {v.ratingCount !== undefined && ` (${v.ratingCount.toLocaleString()})`}
                      </span>
                    </>
                  )}
                  {v.openNow !== undefined && (
                    <Badge
                      variant="outline"
                      className={`ml-2 text-xs py-0 ${v.openNow ? "border-green-400 text-green-600" : "border-red-300 text-red-500"}`}
                    >
                      <Clock className="w-2.5 h-2.5 mr-1" />
                      {v.openNow ? "Open" : "Closed"}
                    </Badge>
                  )}
                </div>
                {v.address && (
                  <p className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="truncate">{v.address}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {v.phone && (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" asChild>
                    <a href={`tel:${v.phone}`}>
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                  </Button>
                )}
                {v.mapsUrl && (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" asChild>
                    <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                      Maps
                    </a>
                  </Button>
                )}
                {v.website && (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" asChild>
                    <a href={v.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-3 h-3" />
                      Web
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
