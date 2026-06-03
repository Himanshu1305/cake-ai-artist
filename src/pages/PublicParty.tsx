import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PartyPopper,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Mail,
  Phone,
  Sparkles,
  CalendarPlus,
  Share2,
} from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { downloadICS } from "@/utils/icsCalendar";
import { toast } from "sonner";

type PublicParty = {
  id: string;
  title: string;
  occasion: string | null;
  event_date: string | null;
  event_timezone: string | null;
  venue: string | null;
  city: string | null;
  theme: string | null;
  invite_headline: string | null;
  invite_message: string | null;
  invite_artwork_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  rsvp_deadline: string | null;
  public_slug: string;
  attending: { first_name: string; plus_ones: number }[];
  attending_count: number;
};

const CountdownBox = ({ targetDate }: { targetDate: Date }) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  if (isExpired) {
    return (
      <div className="text-center py-3 px-4 bg-white/20 backdrop-blur rounded-xl text-white">
        <p className="text-sm font-medium">🎉 It's party time!</p>
      </div>
    );
  }
  const Cell = ({ n, l }: { n: number; l: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-2xl sm:text-3xl font-bold tabular-nums leading-none">{n}</div>
      <div className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80 mt-1">{l}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-white/15 backdrop-blur rounded-xl px-4 py-3 text-white">
      <Cell n={days} l="days" />
      <Cell n={hours} l="hrs" />
      <Cell n={minutes} l="min" />
      <Cell n={seconds} l="sec" />
    </div>
  );
};

export default function PublicParty() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [party, setParty] = useState<PublicParty | null>(null);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data, error } = await supabase.rpc("get_party_public", { p_slug: slug });
      if (error) console.error(error);
      setParty((data as any) || null);
      setLoading(false);
    })();
  }, [slug]);

  const eventDateObj = useMemo(
    () => (party?.event_date ? new Date(party.event_date) : null),
    [party?.event_date],
  );

  const formattedDate = useMemo(() => {
    if (!eventDateObj || !party) return "";
    try {
      return eventDateObj.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: party.event_timezone || undefined,
        timeZoneName: "short",
      });
    } catch {
      return eventDateObj.toLocaleString();
    }
  }, [eventDateObj, party]);

  const mapsHref = useMemo(() => {
    if (!party) return "";
    const q = [party.venue, party.city].filter(Boolean).join(", ");
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "";
  }, [party]);

  const handleAddToCalendar = () => {
    if (!party || !eventDateObj) return;
    downloadICS(
      {
        title: party.title,
        description: [party.invite_headline, party.invite_message].filter(Boolean).join("\n\n"),
        location: [party.venue, party.city].filter(Boolean).join(", "),
        start: eventDateObj,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      },
      `${party.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`,
    );
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const text = party ? `You're invited to ${party.title}` : "You're invited!";
    if (navigator.share) {
      try {
        await navigator.share({ title: party?.title, text, url });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Invite link copied");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading invite…</div>;
  }
  if (!party) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <PartyPopper className="w-12 h-12 text-muted-foreground mb-3" />
        <h1 className="text-2xl font-bold mb-2">Invite not found</h1>
        <p className="text-muted-foreground mb-4">This party link may have been removed.</p>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  const totalAttending = party.attending.reduce(
    (acc, g) => acc + 1 + (g.plus_ones || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-amber-50 to-rose-50">
      <Helmet>
        <title>{party.title} — You're invited</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
        {/* Hero */}
        <div className="rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          {party.invite_artwork_url ? (
            <div
              className="aspect-[4/5] w-full bg-cover bg-center relative"
              style={{ backgroundImage: `url('${party.invite_artwork_url}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                {party.occasion && (
                  <Badge className="bg-white/25 backdrop-blur text-white border-0 mb-3 capitalize">
                    {party.occasion}
                  </Badge>
                )}
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow">
                  {party.invite_headline || `You're invited to ${party.title}`}
                </h1>
                <p className="mt-2 text-white/90 text-sm">{party.title}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <PartyPopper className="w-14 h-14 mx-auto mb-3" />
              {party.occasion && (
                <p className="opacity-90 capitalize text-sm mb-1">{party.occasion}</p>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                {party.invite_headline || `You're invited to ${party.title}`}
              </h1>
            </div>
          )}

          {eventDateObj && (
            <div className="px-4 sm:px-6 py-4 bg-black/20">
              <CountdownBox targetDate={eventDateObj} />
            </div>
          )}
        </div>

        {/* Personal note */}
        {party.invite_message && (
          <Card className="mt-4">
            <CardContent className="p-5">
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {party.invite_message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card className="mt-4">
          <CardContent className="p-5 space-y-3 text-sm">
            {formattedDate && (
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <div className="font-medium">When</div>
                  <div className="text-muted-foreground">{formattedDate}</div>
                </div>
              </div>
            )}
            {(party.venue || party.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Where</div>
                  <div className="text-muted-foreground">
                    {[party.venue, party.city].filter(Boolean).join(", ")}
                  </div>
                  {mapsHref && (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      Open in Maps →
                    </a>
                  )}
                </div>
              </div>
            )}
            {party.theme && (
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-muted-foreground">{party.theme}</div>
                </div>
              </div>
            )}
            {party.rsvp_deadline && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Please RSVP by{" "}
                <span className="font-medium text-foreground">
                  {new Date(party.rsvp_deadline).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Host contact */}
        {(party.contact_email || party.contact_phone) && (
          <Card className="mt-4">
            <CardContent className="p-5 space-y-2 text-sm">
              <div className="font-medium">Hosted by</div>
              {party.contact_email && (
                <a
                  href={`mailto:${party.contact_email}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Mail className="w-4 h-4" /> {party.contact_email}
                </a>
              )}
              {party.contact_phone && (
                <a
                  href={`tel:${party.contact_phone}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Phone className="w-4 h-4" /> {party.contact_phone}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Who's coming */}
        {party.attending_count > 0 && (
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <div className="font-medium text-sm">
                  Who's coming
                  <span className="text-muted-foreground font-normal ml-1">
                    ({totalAttending})
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {party.attending.map((g, i) => (
                  <Badge key={i} variant="secondary" className="font-normal">
                    {g.first_name}
                    {g.plus_ones > 0 && ` +${g.plus_ones}`}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {eventDateObj && (
            <Button variant="outline" onClick={handleAddToCalendar}>
              <CalendarPlus className="w-4 h-4 mr-2" /> Add to calendar
            </Button>
          )}
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share invite
          </Button>
        </div>

        <p className="mt-3 text-xs text-center text-muted-foreground">
          Got a personal RSVP link? Open it to confirm your spot.
        </p>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Crafted with <span className="font-semibold text-primary">Cake AI Artist</span> · Plan your own party →
          </Link>
        </div>
      </div>
    </div>
  );
}
