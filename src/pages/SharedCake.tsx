import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Volume2, Sparkles, Gift, Play, Pause, RotateCcw, Music, VolumeX } from "lucide-react";
import { ConfettiRain } from "@/components/ConfettiRain";
import { CandleRow } from "@/components/CandleRow";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { CakeConvergeReveal } from "@/components/CakeConvergeReveal";
import { BirthdayJingle } from "@/utils/birthdayJingle";
import { toast } from "@/hooks/use-toast";


interface PublicCake {
  id: string;
  image_url: string;
  recipient_name: string | null;
  message: string | null;
  occasion_type: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  created_at: string;
  sender_name?: string | null;
  share_group_id?: string | null;
  sibling_image_urls?: string[] | null;
}

const SHARE_BASE_URL = "https://cakeaiartist.com";

export default function SharedCake() {
  const { id } = useParams<{ id: string }>();
  const [cake, setCake] = useState<PublicCake | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealStage, setRevealStage] = useState(0);
  const [emailValue, setEmailValue] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [jinglePlaying, setJinglePlaying] = useState(false);
  const [jingleMuted, setJingleMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const jingleRef = useRef<BirthdayJingle | null>(null);
  const interactedRef = useRef(false);


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

  // Show email capture unless already submitted for this cake
  useEffect(() => {
    if (!id) return;
    if (!localStorage.getItem(`receiver_email_captured_${id}`)) {
      setShowEmailCapture(true);
    }
  }, [id]);

  // Staged reveal — starts after cake data is ready
  useEffect(() => {
    if (!cake || !id) return;
    const seenKey = `reveal_seen_${id}`;
    if (sessionStorage.getItem(seenKey)) {
      setRevealStage(4);
      return;
    }
    sessionStorage.setItem(seenKey, "1");
    const t1 = setTimeout(() => setRevealStage(1), 500);
    const t2 = setTimeout(() => setRevealStage(2), 1500);
    const t3 = setTimeout(() => setRevealStage(3), 2500);
    const t4 = setTimeout(() => setRevealStage(4), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [cake, id]);

  // Confetti fires at stage 4, not on load
  useEffect(() => {
    if (revealStage !== 4) return;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.35 },
      colors: ["#ec4899", "#a855f7", "#eab308", "#f97316", "#22c55e"],
    });
  }, [revealStage]);

  // Jingle: lazy-init + autoplay rule — start on first user interaction
  useEffect(() => {
    jingleRef.current = new BirthdayJingle();
    return () => {
      jingleRef.current?.dispose();
      jingleRef.current = null;
    };
  }, []);

  const startJingleIfNeeded = () => {
    if (!jingleRef.current || jinglePlaying) return;
    const hasVoice = !!cake?.audio_url;
    // Loop softly if there's a voice message (so it can duck under voice); otherwise play once.
    jingleRef.current.play({ loop: hasVoice, volume: hasVoice ? 0.1 : 0.18 }).then(() => {
      setJinglePlaying(true);
    }).catch(() => {});
  };

  // Auto-start jingle on first interaction anywhere on the page
  useEffect(() => {
    if (!cake) return;
    const onFirstInteract = () => {
      if (interactedRef.current) return;
      interactedRef.current = true;
      startJingleIfNeeded();
    };
    window.addEventListener("pointerdown", onFirstInteract, { once: true });
    window.addEventListener("keydown", onFirstInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
  }, [cake]);

  const toggleJingleMute = () => {
    const next = !jingleMuted;
    setJingleMuted(next);
    jingleRef.current?.setMuted(next);
    if (!next && !jinglePlaying) startJingleIfNeeded();
  };

  const handleBlowCandles = () => {
    if (candlesBlown) return;
    setCandlesBlown(true);
    startJingleIfNeeded();
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
    if (a.paused) {
      // Duck the jingle while voice plays
      jingleRef.current?.setVolume(0.04);
      const p = a.play();
      if (p && typeof p.catch === "function") {
        p.then(() => setIsPlaying(true)).catch((err) => {
          console.error("Audio play failed:", err);
          toast({
            title: "Couldn't play voice message",
            description: "Try the controls below, or open this link in another browser.",
            variant: "destructive",
          });
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(true);
      }
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (id) sessionStorage.removeItem(`cake_reveal_seen_${id}`);
    setRevealStage(0);
    setRevealKey((k) => k + 1);
    setCandlesBlown(false);
    // Restart staged reveal
    setTimeout(() => setRevealStage(1), 500);
    setTimeout(() => setRevealStage(2), 1800);
    setTimeout(() => setRevealStage(3), 3200);
    setTimeout(() => setRevealStage(4), 4400);
  };

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) return;
    setEmailSubmitting(true);
    try {
      await supabase.functions.invoke("add-contact-to-brevo", {
        body: { email: emailValue, firstName: "", lastName: "" },
      });
    } catch (err) {
      console.error("Failed to capture email:", err);
    }
    if (id) localStorage.setItem(`receiver_email_captured_${id}`, "1");
    setEmailSubmitted(true);
    setEmailSubmitting(false);
  };

  const shareUrl = id ? `${SHARE_BASE_URL}/cake/${id}` : SHARE_BASE_URL;
  const ogTitle = cake?.recipient_name
    ? `A cake for ${cake.recipient_name} 🎂`
    : "A cake just for you 🎂";
  const ogDesc = cake?.message
    ? `"${cake.message.slice(0, 140)}"`
    : "Open your personalized cake from Cake AI Artist.";

  // Generic CTA — recipient may want to create a cake for any occasion
  const ctaHref = "/free-ai-cake-designer?ref=shared_cake";
  const ctaText = "🎂 Make a cake for someone you love →";

  // Personalized chip — use sender's name if we have it
  const kickerText = cake?.sender_name && cake.sender_name.trim().length > 0
    ? `${cake.sender_name.trim()} made this just for you 💝`
    : "Someone special made this for you";


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

      {/* Stage 0 overlay — fades out when stage advances to 1 */}
      <AnimatePresence>
        {revealStage === 0 && (
          <motion.div
            key="reveal-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black"
          >
            <div className="text-6xl mb-4 animate-pulse">🎂</div>
            <p className="text-white text-lg font-semibold tracking-wide">Opening your cake...</p>
          </motion.div>
        )}
      </AnimatePresence>

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
          {/* Kicker chip — fades in at stage 1 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealStage >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-party-purple/30 shadow-sm">
              <Gift className="h-4 w-4 text-party-pink" />
              <span className="text-sm font-semibold bg-gradient-to-r from-party-pink to-party-purple bg-clip-text text-transparent">
                Someone special made this for you
              </span>
            </div>
          </motion.div>

          {/* Candles — appear at stage 1 with existing flicker animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealStage >= 1 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className={`transition-all duration-500 ${candlesBlown ? "opacity-30 scale-95" : ""}`}>
              <CandleRow count={5} size="sm" className="mb-2" />
            </div>
          </motion.div>

          {/* Cake card — slides up from below at stage 2 */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{
              opacity: revealStage >= 2 ? 1 : 0,
              y: revealStage >= 2 ? 0 : 60,
            }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <Card className="relative overflow-hidden border-2 border-party-purple/30 shadow-2xl rounded-2xl">
              {/* Glow ring */}
              <div aria-hidden className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-party-pink via-party-purple to-party-mint opacity-40 blur-xl -z-10" />

              <div className="relative group p-6 bg-gradient-to-b from-white via-muted/30 to-white">
                {/* Image with watermark overlay (Task 5) */}
                <div className="relative">
                  <CakeConvergeReveal
                    images={cake.sibling_image_urls ?? [cake.image_url]}
                    primary={cake.image_url}
                    alt={cake.recipient_name ? `Cake for ${cake.recipient_name}` : "Personalized cake"}
                    cacheKey={cake.id}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded pointer-events-none select-none">
                    🎂 cakeaiartist.com
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5 text-center bg-gradient-to-b from-white via-muted/40 to-white">
                {/* Message — fades in at stage 3 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: revealStage >= 3 ? 1 : 0 }}
                  transition={{ duration: 0.7 }}
                >
                  {cake.message && (
                    <p className="text-xl md:text-2xl font-display italic leading-snug text-foreground/90 whitespace-pre-line">
                      "{cake.message}"
                    </p>
                  )}
                </motion.div>

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
          </motion.div>

          {/* Email capture — shown after reveal completes (Task 3) */}
          <AnimatePresence>
            {revealStage >= 4 && showEmailCapture && !emailSubmitted && (
              <motion.div
                key="email-capture"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6"
              >
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-pink-50 border border-party-pink/20 p-6 text-center shadow-md">
                  <div className="text-3xl mb-3">🎂</div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Want to make one for someone special?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your email and we'll remind you before their next birthday.
                  </p>
                  <form onSubmit={handleEmailCapture} className="flex flex-col gap-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      required
                      className="text-center"
                    />
                    <Button
                      type="submit"
                      disabled={emailSubmitting}
                      className="bg-party-pink hover:bg-party-pink/90 text-white font-semibold"
                    >
                      {emailSubmitting ? "Saving..." : "Remind Me 🎂"}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-3">
                    No spam. Just one reminder when it matters.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email submitted confirmation */}
          <AnimatePresence>
            {emailSubmitted && (
              <motion.div
                key="email-confirmed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 text-center"
              >
                <p className="text-sm font-semibold text-green-700">
                  ✅ We'll remind you! Check your inbox.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main CTA — occasion-aware, fades in at stage 4 (Task 4) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealStage >= 4 ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center pb-24 sm:pb-8"
          >
            <Link to={ctaHref}>
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-party-pink to-party-purple text-white hover:opacity-90 shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                {ctaText}
              </Button>
            </Link>
            {cake.recipient_name && (
              <p className="mt-2 text-xs text-muted-foreground">
                Takes 30 seconds — just like {cake.recipient_name}'s was made
              </p>
            )}
            {/* Sender attribution (Task 2) */}
            <p className="mt-3 text-xs text-muted-foreground">
              Made with ❤️ by {cake.sender_name || "a friend"} using{" "}
              <a
                href="https://cakeaiartist.com/"
                className="text-party-purple font-semibold hover:underline"
              >
                Cake AI Artist
              </a>
            </p>
          </motion.div>
        </div>

        {/* Sticky mobile CTA — occasion-aware (Task 4) */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 p-3 bg-white/90 backdrop-blur-md border-t border-party-purple/20 shadow-2xl">
          <Link to={ctaHref} className="block">
            <Button className="w-full bg-gradient-to-r from-party-pink to-party-purple text-white font-semibold shadow-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              {ctaText}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
