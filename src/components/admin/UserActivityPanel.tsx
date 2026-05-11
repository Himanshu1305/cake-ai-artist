import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Cake, Heart, MessageCircle, Package, PartyPopper, Eye } from "lucide-react";

interface UserActivityPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  email: string | null;
}

interface CakeImage {
  id: string;
  image_url: string;
  occasion_type: string | null;
  recipient_name: string | null;
  created_at: string;
}

interface PartyRow {
  id: string;
  title: string;
  occasion: string | null;
  event_date: string | null;
  status: string;
}

interface PageVisitRow {
  page_path: string;
  visited_at: string;
}

export function UserActivityPanel({ open, onOpenChange, userId, email }: UserActivityPanelProps) {
  const [loading, setLoading] = useState(false);
  const [cakes, setCakes] = useState<CakeImage[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [partyPackCount, setPartyPackCount] = useState(0);
  const [parties, setParties] = useState<PartyRow[]>([]);
  const [visits, setVisits] = useState<PageVisitRow[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);

  useEffect(() => {
    if (!open || !userId) return;
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const loadActivity = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [imagesRes, likesRes, commentsRes, packsRes, partiesRes, visitsRes] = await Promise.all([
        supabase.from("generated_images")
          .select("id, image_url, occasion_type, recipient_name, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase.from("gallery_likes").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("gallery_comments").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("party_packs").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("parties")
          .select("id, title, occasion, event_date, status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase.from("page_visits")
          .select("page_path, visited_at")
          .eq("user_id", userId)
          .order("visited_at", { ascending: false })
          .limit(500),
      ]);

      setCakes((imagesRes.data as CakeImage[]) || []);
      setLikeCount(likesRes.count || 0);
      setCommentCount(commentsRes.count || 0);
      setPartyPackCount(packsRes.count || 0);
      setParties((partiesRes.data as PartyRow[]) || []);
      const visitData = (visitsRes.data as PageVisitRow[]) || [];
      setVisits(visitData);

      const counts: Record<string, number> = {};
      visitData.forEach((v) => {
        counts[v.page_path] = (counts[v.page_path] || 0) + 1;
      });
      setTopPages(
        Object.entries(counts)
          .map(([page, count]) => ({ page, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8),
      );
    } finally {
      setLoading(false);
    }
  };

  const lastSeen = visits[0]?.visited_at;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>User Activity</DialogTitle>
          <DialogDescription className="break-all">{email}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<Cake className="w-4 h-4" />} label="Cakes" value={cakes.length} />
                <StatCard icon={<Package className="w-4 h-4" />} label="Party Packs" value={partyPackCount} />
                <StatCard icon={<PartyPopper className="w-4 h-4" />} label="Parties" value={parties.length} />
                <StatCard icon={<Eye className="w-4 h-4" />} label="Page Visits" value={visits.length} />
                <StatCard icon={<Heart className="w-4 h-4" />} label="Likes Given" value={likeCount} />
                <StatCard icon={<MessageCircle className="w-4 h-4" />} label="Comments" value={commentCount} />
                <StatCard
                  icon={<Eye className="w-4 h-4" />}
                  label="Last Seen"
                  value={lastSeen ? new Date(lastSeen).toLocaleDateString() : "Never"}
                />
              </div>

              {/* Cakes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cakes Created ({cakes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {cakes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No cakes created yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {cakes.slice(0, 15).map((c) => (
                        <div key={c.id} className="space-y-1">
                          <div className="aspect-square overflow-hidden rounded-md border">
                            <img src={c.image_url} alt={c.recipient_name || "cake"} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <p className="text-xs truncate" title={c.recipient_name || ""}>
                            {c.recipient_name || "—"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.occasion_type || ""} · {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Parties */}
              {parties.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Parties Planned ({parties.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {parties.slice(0, 10).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.occasion || "—"} · {p.event_date ? new Date(p.event_date).toLocaleDateString() : "no date"}
                          </p>
                        </div>
                        <Badge variant="outline">{p.status}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Top pages */}
              {topPages.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Top Pages Visited</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {topPages.map((p) => (
                      <div key={p.page} className="flex items-center justify-between text-sm">
                        <span className="truncate font-mono text-xs">{p.page}</span>
                        <Badge variant="secondary">{p.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          {icon}
          {label}
        </div>
        <div className="text-lg font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
