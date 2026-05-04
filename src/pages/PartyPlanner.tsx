import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PartyPopper, Plus, Calendar, Users, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

export default function PartyPlanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, lifetime_access")
        .eq("id", user.id)
        .maybeSingle();
      setIsPremium(!!(profile?.is_premium || profile?.lifetime_access));
      const { data } = await supabase
        .from("parties")
        .select("*")
        .order("created_at", { ascending: false });
      setParties(data || []);
      setLoading(false);
    })();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("parties")
      .insert({ user_id: user.id, title: title.trim() })
      .select()
      .single();
    setCreating(false);
    if (error) {
      toast.error("Could not create party");
      return;
    }
    setOpen(false);
    setTitle("");
    navigate(`/party-planner/${data.id}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <PartyPopper className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Party Planner</h1>
        <p className="text-muted-foreground mb-6 max-w-md">Sign in to start planning unforgettable celebrations with your AI Party Concierge.</p>
        <Button onClick={() => navigate("/auth?redirect=/party-planner")}>Sign in</Button>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Party Planner is a Premium feature</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Plan parties end-to-end with an AI concierge, smart checklists, and shareable digital invites with RSVP tracking.
        </p>
        <Button onClick={() => navigate("/pricing")} size="lg">Upgrade to unlock</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 mt-2">
              <PartyPopper className="w-8 h-8 text-primary" /> Your Parties
            </h1>
            <p className="text-muted-foreground mt-1">Plan, invite, and celebrate — your AI concierge handles the rest.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg"><Plus className="w-4 h-4 mr-2" /> New Party</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Start a new party</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="e.g. Mia's 7th Birthday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
                <Button onClick={handleCreate} disabled={creating || !title.trim()} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" /> Create & Start Planning
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {parties.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl">
            <PartyPopper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No parties yet — start your first celebration!</p>
            <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Party</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parties.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/party-planner/${p.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {p.event_date && (
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(p.event_date).toLocaleDateString()}</div>
                  )}
                  {p.guest_count > 0 && (
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {p.guest_count} guests</div>
                  )}
                  {p.occasion && <div className="capitalize">🎉 {p.occasion}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
