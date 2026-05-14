import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Volume2, Sparkles, Gift, Play, Pause } from "lucide-react";
import { ConfettiRain } from "@/components/ConfettiRain";
import { CandleRow } from "@/components/CandleRow";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { CakeSpinShowcase } from "@/components/CakeSpinShowcase";

interface PublicCake {
  id: string;
  image_url: string;
  recipient_name: string | null;
  message: string | null;
  occasion_type: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  created_at: string;
}

const SHARE_BASE_URL = "https://cakeaiartist.com";

export default function SharedCake() {
  const { id } = useParams<{ id: string }>();
  const [cake, setCake] = useState<PublicCake | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_public_cake", { p_id: id });
      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        setNotFound(true);
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        setCake(row as PublicCake);
      }
      setLoading(false);
    })();
  }, [id]);

  // One-time confetti burst on load
  useEffect(() => {
    if (!cake) return;
    const t = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.35 },
        colors: ["#ec4899", "#a855f7", "#eab308", "#f97316", "#22c55e"],
      });
    }, 350);
    return () => clearTimeout(t);
  }, [cake]);

  const handleBlowCandles = () => {
    if (candlesBlown) return;
    setCandlesBlown(true);
    confetti({
      particleCount: 200,
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.4 },
      colors: ["#ec4899", "#a855f7", "#eab308", "#f97316"],
    });
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setIsPlaying(true); }
    else { a.pause(); setIsPlaying(false); }
  };

  const shareUrl = id ? `${SHARE_BASE_URL}/cake/${id}` : SHARE_BASE_URL;
  const ogTitle = cake?.recipient_name
    ? `A cake for ${cake.recipient_name} 🎂`
    : "A cake just for you 🎂";
  const ogDesc = cake?.message
    ? `"${cake.message.slice(0, 140)}"`
    : "Open your personalized cake from Cake AI Artist.";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted to-background">
        <Loader2 className="h-10 w-10 animate-spin text-party-purple" />
      </div>
    );
  }

  if (notFound || !cake) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted to-background p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Cake not found 🎂</h1>
        <p className="text-muted-foreground mb-6">This share link may have expired.</p>
        <Link to="/">
          <Button>Make your own cake</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDesc} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:image" content={cake.image_url} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDesc} />
        <meta name="twitter:image" content={cake.image_url} />
        <link rel="canonical" href={shareUrl} />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-party-pink/30 via-party-purple/20 to-party-mint/30 py-8 px-4">
        {/* Ambient celebration */}
        <ConfettiRain count={18} />

        {/* Soft animated blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-party-pink/30 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-party-purple/30 blur-3xl animate-pulse [animation-delay:1.5s]" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-party-mint/30 blur-3xl animate-pulse [animation-delay:3s]" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto">
          {/* Kicker chip */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-party-purple/30 shadow-sm">
              <Gift className="h-4 w-4 text-party-pink" />
              <span className="text-sm font-semibold bg-gradient-to-r from-party-pink to-party-purple bg-clip-text text-transparent">
                Someone special made this for you
              </span>
            </div>
          </div>

          {/* Candles */}
          <div className={`transition-all duration-500 ${candlesBlown ? "opacity-30 scale-95" : "opacity-100"}`}>
            <CandleRow count={5} size="sm" className="mb-2" />
          </div>

          {/* Cake image card */}
          <Card className="relative overflow-hidden border-2 border-party-purple/30 shadow-2xl rounded-2xl">
            {/* Glow ring */}
            <div aria-hidden className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-party-pink via-party-purple to-party-mint opacity-40 blur-xl -z-10" />

            <div className="relative group p-6 bg-gradient-to-b from-white via-muted/30 to-white">
              <CakeSpinShowcase
                src={cake.image_url}
                alt={cake.recipient_name ? `Cake for ${cake.recipient_name}` : "Personalized cake"}
                duration={10}
              />
            </div>

            <div className="p-6 space-y-5 text-center bg-gradient-to-b from-white via-muted/40 to-white">
              {cake.message && (
                <p className="text-xl md:text-2xl font-display italic leading-snug text-foreground/90 whitespace-pre-line">
                  "{cake.message}"
                </p>
              )}

              {/* Blow candles CTA */}
              {!candlesBlown && (
                <Button
                  onClick={handleBlowCandles}
                  size="lg"
                  className="w-full bg-gradient-to-r from-party-pink to-party-purple hover:opacity-90 text-white font-semibold shadow-lg"
                >
                  🎂 Blow out the candles
                </Button>
              )}
              {candlesBlown && (
                <div className="text-sm text-party-purple font-semibold animate-fade-in">
                  ✨ Make a wish! ✨
                </div>
              )}

              {/* Voice message — styled player */}
              {cake.audio_url && (
                <div className="pt-2">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-party-pink mb-3">
                    <Volume2 className="h-4 w-4" />
                    <span>Voice message</span>
                    {cake.audio_duration_seconds ? (
                      <span className="text-muted-foreground font-normal">
                        ({cake.audio_duration_seconds}s)
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-center gap-3 p-3 rounded-full bg-gradient-to-r from-party-pink/15 to-party-purple/15 border border-party-purple/20">
                    <button
                      onClick={togglePlay}
                      className="h-12 w-12 rounded-full bg-gradient-to-r from-party-pink to-party-purple text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                      aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </button>

                    {/* Animated waveform bars */}
                    <div className="flex items-end gap-1 h-8">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full bg-gradient-to-t from-party-pink to-party-purple ${
                            isPlaying ? "animate-pulse" : ""
                          }`}
                          style={{
                            height: isPlaying ? `${30 + ((i * 13) % 70)}%` : "30%",
                            animationDelay: `${i * 0.12}s`,
                            animationDuration: "0.9s",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src={cake.audio_url}
                    preload="metadata"
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Re-share */}
              <div className="pt-2 border-t border-party-purple/10">
                <p className="text-xs text-muted-foreground mb-2">Share the love</p>
                <div className="flex justify-center">
                  <SocialShareButtons
                    url={shareUrl}
                    title={ogTitle}
                    description={ogDesc}
                    variant="inline"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="mt-8 text-center pb-24 sm:pb-8">
            <Link to="/">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-party-pink to-party-purple text-white hover:opacity-90 shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Make one for someone you love
              </Button>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Made with{" "}
              <Link to="/" className="text-party-purple font-semibold hover:underline">
                Cake AI Artist
              </Link>
            </p>
          </div>
        </div>

        {/* Sticky mobile CTA */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 p-3 bg-white/90 backdrop-blur-md border-t border-party-purple/20 shadow-2xl">
          <Link to="/" className="block">
            <Button className="w-full bg-gradient-to-r from-party-pink to-party-purple text-white font-semibold shadow-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Make one for someone you love →
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
