import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  PartyPopper,
  Calendar,
  MapPin,
  Sparkles,
  Check,
  X,
  HelpCircle,
  CalendarPlus,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { downloadICS } from "@/utils/icsCalendar";

type CustomQ = {
  id: string;
  question: string;
  type?: "text" | "choice";
  options?: string[];
};

export default function PartyRSVP() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState<any>(null);
  const [party, setParty] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // RSVP form extras
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [plusOneNames, setPlusOneNames] = useState<string[]>([]);
  const [mealPreference, setMealPreference] = useState<string>("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data: g } = await supabase
        .from("party_guests")
        .select("*")
        .eq("rsvp_token", token!)
        .maybeSingle();
      if (!g) {
        setLoading(false);
        return;
      }
      setGuest(g);
      setPlusOnes(g.plus_ones || 0);
      setPlusOneNames(
        Array.isArray(g.plus_one_names)
          ? (g.plus_one_names as unknown[]).map((x) => String(x ?? ""))
          : [],
      );
      setMealPreference(g.meal_preference || "");
      setCustomAnswers(
        g.custom_answers && typeof g.custom_answers === "object" && !Array.isArray(g.custom_answers)
          ? (g.custom_answers as Record<string, string>)
          : {},
      );

      const { data: p } = await supabase
        .from("parties")
        .select(
          "id, public_slug, title, occasion, event_date, event_timezone, venue, city, theme, rsvp_deadline, custom_questions",
        )
        .eq("id", g.party_id)
        .maybeSingle();
      setParty(p);
      setDone(g.rsvp_status !== "pending");
      setLoading(false);
    })();
  }, [token]);

  const customQuestions: CustomQ[] = Array.isArray(party?.custom_questions)
    ? (party.custom_questions as CustomQ[])
    : [];

  const respond = async (status: "yes" | "no" | "maybe") => {
    setSubmitting(true);
    const payload: any = {
      rsvp_status: status,
      responded_at: new Date().toISOString(),
    };
    if (status === "yes") {
      payload.plus_ones = plusOnes;
      payload.plus_one_names = plusOneNames.slice(0, plusOnes).filter(Boolean);
      if (mealPreference) payload.meal_preference = mealPreference;
      if (Object.keys(customAnswers).length) payload.custom_answers = customAnswers;
    }
    const { error } = await supabase
      .from("party_guests")
      .update(payload)
      .eq("rsvp_token", token!);
    setSubmitting(false);
    if (error) {
      toast.error("Could not save your response");
      return;
    }
    setDone(true);
    setGuest({ ...guest, ...payload });
  };

  const handleAddToCalendar = () => {
    if (!party?.event_date) return;
    downloadICS(
      {
        title: party.title,
        description: party.theme ? `Theme: ${party.theme}` : "",
        location: [party.venue, party.city].filter(Boolean).join(", "),
        start: new Date(party.event_date),
        url:
          typeof window !== "undefined" && party.public_slug
            ? `${window.location.origin}/party/${party.public_slug}`
            : undefined,
      },
      `${party.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`,
    );
  };

  const updatePlusOneName = (i: number, val: string) => {
    setPlusOneNames((arr) => {
      const next = [...arr];
      next[i] = val;
      return next;
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!guest || !party) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card><CardContent className="p-8 text-center">Invitation not found.</CardContent></Card>
      </div>
    );
  }

  const showMealField = guest.meal_preference !== undefined; // column exists; show prompt for "yes"
  const formattedDate = party.event_date
    ? new Date(party.event_date).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: party.event_timezone || undefined,
        timeZoneName: "short",
      })
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-100 to-rose-50 flex items-center justify-center p-4">
      <Helmet>
        <title>RSVP — {party?.title || "Party invitation"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
            {formattedDate && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                <span>{formattedDate}</span>
              </div>
            )}
            {(party.venue || party.city) && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <span>{[party.venue, party.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {party.theme && (
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 text-primary" />
                <span>{party.theme}</span>
              </div>
            )}
            {party.rsvp_deadline && !done && (
              <p className="text-xs text-muted-foreground pt-1">
                Please respond by{" "}
                {new Date(party.rsvp_deadline).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>

          {done ? (
            <div className="space-y-3 pt-2">
              <div className="text-center py-3">
                <p className="text-lg font-semibold">
                  {guest.rsvp_status === "yes" && "🎉 Yay! See you there!"}
                  {guest.rsvp_status === "no" && "Thanks for letting us know."}
                  {guest.rsvp_status === "maybe" && "Got it — keep us posted!"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">You can change your response anytime.</p>
              </div>
              {guest.rsvp_status === "yes" && party.event_date && (
                <Button onClick={handleAddToCalendar} variant="outline" className="w-full">
                  <CalendarPlus className="w-4 h-4 mr-2" /> Add to calendar
                </Button>
              )}
              {party.public_slug && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  <a
                    href={`/party/${party.public_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" /> View full invite & who's coming
                  </a>
                </Button>
              )}
              <Button size="sm" variant="outline" className="w-full" onClick={() => setDone(false)}>
                Change response
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Plus ones */}
              <div className="space-y-2">
                <Label className="text-sm">Bringing anyone with you?</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))}
                    disabled={plusOnes === 0}
                  >
                    −
                  </Button>
                  <span className="w-10 text-center font-medium">{plusOnes}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPlusOnes(Math.min(5, plusOnes + 1))}
                  >
                    +
                  </Button>
                  <span className="text-xs text-muted-foreground ml-2">plus-ones</span>
                </div>
                {plusOnes > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {Array.from({ length: plusOnes }).map((_, i) => (
                      <Input
                        key={i}
                        placeholder={`Plus-one ${i + 1} name`}
                        value={plusOneNames[i] || ""}
                        onChange={(e) => updatePlusOneName(i, e.target.value)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Meal preference — shown by default; host can ignore if not collecting */}
              <div className="space-y-2">
                <Label className="text-sm">Meal preference or allergies (optional)</Label>
                <Input
                  placeholder="e.g. vegetarian, no nuts"
                  value={mealPreference}
                  onChange={(e) => setMealPreference(e.target.value)}
                />
              </div>

              {/* Custom questions */}
              {customQuestions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label className="text-sm">{q.question}</Label>
                  {q.type === "choice" && q.options && q.options.length > 0 ? (
                    <RadioGroup
                      value={customAnswers[q.id] || ""}
                      onValueChange={(v) =>
                        setCustomAnswers((a) => ({ ...a, [q.id]: v }))
                      }
                    >
                      {q.options.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                          <Label htmlFor={`${q.id}-${opt}`} className="text-sm font-normal">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Textarea
                      rows={2}
                      value={customAnswers[q.id] || ""}
                      onChange={(e) =>
                        setCustomAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}

              <div className="pt-2 space-y-2">
                <p className="text-sm font-medium text-center">Will you make it?</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => respond("yes")} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-1" /> Yes
                  </Button>
                  <Button onClick={() => respond("maybe")} disabled={submitting} variant="secondary">
                    <HelpCircle className="w-4 h-4 mr-1" /> Maybe
                  </Button>
                  <Button onClick={() => respond("no")} disabled={submitting} variant="outline">
                    <X className="w-4 h-4 mr-1" /> No
                  </Button>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground pt-4 border-t">Powered by Cake AI Artist</p>
        </CardContent>
      </Card>
    </div>
  );
}
