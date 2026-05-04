import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PartyPopper, Calendar, MapPin, Sparkles, Check, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export default function PartyRSVP() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState<any>(null);
  const [party, setParty] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: g } = await supabase.from("party_guests").select("*").eq("rsvp_token", token!).maybeSingle();
      if (!g) {
        setLoading(false);
        return;
      }
      setGuest(g);
      const { data: p } = await supabase.from("parties").select("title, occasion, event_date, event_timezone, venue, city, theme").eq("id", g.party_id).maybeSingle();
      setParty(p);
      setDone(g.rsvp_status !== "pending");
      setLoading(false);
    })();
  }, [token]);

  const respond = async (status: "yes" | "no" | "maybe") => {
    setSubmitting(true);
    const { error } = await supabase
      .from("party_guests")
      .update({ rsvp_status: status, responded_at: new Date().toISOString() })
      .eq("rsvp_token", token!);
    setSubmitting(false);
    if (error) {
      toast.error("Could not save your response");
      return;
    }
    setDone(true);
    setGuest({ ...guest, rsvp_status: status });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!guest || !party) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card><CardContent className="p-8 text-center">Invitation not found.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-100 to-rose-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-8 text-center">
          <PartyPopper className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">You're Invited!</h1>
          {party.occasion && <p className="opacity-90 mt-1 capitalize">{party.occasion}</p>}
        </div>
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Hi {guest.name},</p>
            <h2 className="text-xl font-bold mt-1">{party.title}</h2>
          </div>

          <div className="space-y-2 text-sm">
            {party.event_date && (
              <div className="flex items-start gap-2"><Calendar className="w-4 h-4 mt-0.5 text-primary" /><span>{new Date(party.event_date).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: party.event_timezone || undefined, timeZoneName: "short" })}</span></div>
            )}
            {(party.venue || party.city) && (
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-primary" /><span>{[party.venue, party.city].filter(Boolean).join(", ")}</span></div>
            )}
            {party.theme && (
              <div className="flex items-start gap-2"><Sparkles className="w-4 h-4 mt-0.5 text-primary" /><span>{party.theme}</span></div>
            )}
          </div>

          {done ? (
            <div className="text-center py-4">
              <p className="text-lg font-semibold">
                {guest.rsvp_status === "yes" && "🎉 Yay! See you there!"}
                {guest.rsvp_status === "no" && "Thanks for letting us know."}
                {guest.rsvp_status === "maybe" && "Got it — keep us posted!"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">You can change your response anytime.</p>
              <div className="flex gap-2 justify-center mt-3">
                <Button size="sm" variant="outline" onClick={() => setDone(false)}>Change response</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-center">Will you make it?</p>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => respond("yes")} disabled={submitting} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-1" /> Yes</Button>
                <Button onClick={() => respond("maybe")} disabled={submitting} variant="secondary"><HelpCircle className="w-4 h-4 mr-1" /> Maybe</Button>
                <Button onClick={() => respond("no")} disabled={submitting} variant="outline"><X className="w-4 h-4 mr-1" /> No</Button>
              </div>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground pt-4 border-t">Powered by Cake AI Artist</p>
        </CardContent>
      </Card>
    </div>
  );
}
