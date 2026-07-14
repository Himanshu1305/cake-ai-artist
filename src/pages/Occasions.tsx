import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Calendar, Plus, Trash2, Sparkles, Clock } from "lucide-react";

interface Occasion {
  id: string;
  person_name: string;
  occasion_type: string;
  occasion_date: string;
  notes: string | null;
  created_at: string;
}

const OCCASION_TYPES = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "wedding", label: "Wedding" },
  { value: "graduation", label: "Graduation" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "christmas", label: "Christmas" },
  { value: "eid", label: "Eid" },
  { value: "diwali", label: "Diwali" },
  { value: "other", label: "Other" },
];

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  // Use this year or next year's occurrence for recurring events
  const thisYear = new Date(today.getFullYear(), target.getMonth(), target.getDate());
  if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);
  return Math.round((thisYear.getTime() - today.getTime()) / 86400000);
}

function countdownLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days === 0) return "Today! 🎉";
  if (days === 1) return "Tomorrow!";
  return `In ${days} days`;
}

const Occasions = () => {
  const navigate = useNavigate();
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [personName, setPersonName] = useState("");
  const [occasionType, setOccasionType] = useState("birthday");
  const [occasionDate, setOccasionDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      await loadOccasions(user.id);
    };
    init();
  }, [navigate]);

  const loadOccasions = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_occasions" as any)
      .select("*")
      .eq("user_id", uid)
      .order("occasion_date", { ascending: true });
    if (!error && data) setOccasions(data as Occasion[]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !personName.trim() || !occasionDate) return;
    setSaving(true);
    const { error } = await supabase.from("user_occasions" as any).insert({
      user_id: userId,
      person_name: personName.trim(),
      occasion_type: occasionType,
      occasion_date: occasionDate,
      notes: notes.trim() || null,
    });
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Occasion saved!" });
      setPersonName("");
      setOccasionType("birthday");
      setOccasionDate("");
      setNotes("");
      setShowForm(false);
      await loadOccasions(userId);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("user_occasions" as any).delete().eq("id", id);
    if (!error) {
      setOccasions((prev) => prev.filter((o) => o.id !== id));
      toast({ title: "Occasion removed" });
    }
  };

  const handleDesign = (occ: Occasion) => {
    const params = new URLSearchParams({
      name: occ.person_name,
      occasion: occ.occasion_type,
    });
    navigate(`/free-ai-cake-designer?${params.toString()}`);
  };

  const occasionLabel = (type: string) =>
    OCCASION_TYPES.find((o) => o.value === type)?.label ?? type;

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>My Occasions — Cake AI Artist</title>
        <meta name="description" content="Save upcoming birthdays, anniversaries and celebrations. Get reminders and design cakes in one click." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <SiteHeader />

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-7 h-7 text-party-pink" />
              My Occasions
            </h1>
            <p className="text-muted-foreground mt-1">Save upcoming celebrations and design cakes in one click.</p>
          </div>
          <Button
            onClick={() => setShowForm((v) => !v)}
            className="bg-gradient-party text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Occasion
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="p-6 mb-8 border-2 border-party-pink/30 bg-surface-elevated">
            <h2 className="text-lg font-semibold mb-4">New Occasion</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="person-name">Who is it for?</Label>
                  <Input
                    id="person-name"
                    placeholder="e.g. Sarah, Mom, Best Friend"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    required
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Occasion type</Label>
                  <Select value={occasionType} onValueChange={setOccasionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCASION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occ-date">Date</Label>
                  <Input
                    id="occ-date"
                    type="date"
                    value={occasionDate}
                    onChange={(e) => setOccasionDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occ-notes">Notes (optional)</Label>
                  <Input
                    id="occ-notes"
                    placeholder="e.g. loves chocolate cake"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="bg-party-pink text-white hover:bg-party-pink/90">
                  {saving ? "Saving…" : "Save Occasion"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : occasions.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-party-pink/30">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-party-pink/40" />
            <p className="text-lg font-semibold text-foreground mb-2">No occasions yet</p>
            <p className="text-muted-foreground mb-6">Add a birthday or anniversary to get reminders and one-click cake designs.</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-party text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add your first occasion
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {occasions.map((occ) => {
              const days = daysUntil(occ.occasion_date);
              const urgent = days <= 7;
              return (
                <Card
                  key={occ.id}
                  className={`p-5 border-2 transition-all ${urgent ? "border-party-pink/50 bg-party-pink/5" : "border-border hover:border-party-purple/30"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">{occ.person_name}</h3>
                        <span className="text-xs bg-party-purple/10 text-party-purple px-2 py-0.5 rounded-full font-medium">
                          {occasionLabel(occ.occasion_type)}
                        </span>
                        {urgent && (
                          <span className="text-xs bg-party-pink text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Soon!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{countdownLabel(occ.occasion_date)}</span>
                        <span className="text-border">·</span>
                        <span>{new Date(occ.occasion_date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</span>
                      </div>
                      {occ.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic">"{occ.notes}"</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleDesign(occ)}
                        className="bg-gradient-party text-white hover:opacity-90"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Design cake →
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(occ.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Occasions;
