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
  audio_mime_type?: string | null;
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
  const [opened, setOpened] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [jinglePlaying, setJinglePlaying] = useState(false);
  const [jingleMuted, setJingleMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const jingleRef = useRef<BirthdayJingle | null>(null);


  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_public_cake", { p_id: id });
      if (error) {
        console.error("get_public_cake failed:", error);
        setNotFound(true);
      } else if (!data || (Array.isArray(data) && data.length === 0)) {
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

  // Staged reveal — only runs after the recipient taps the splash. That tap
  // is the user gesture that unlocks Web Audio so the jingle can play with
  // the animation (browsers block autoplay otherwise).
  useEffect(() => {
    if (!cake || !id || !opened) return;
    const t1 = setTimeout(() => setRevealStage(1), 300);
    const t2 = setTimeout(() => setRevealStage(2), 700);
    // Hold message + CTA until after the 3-image reveal (~6s) completes
    const t3 = setTimeout(() => setRevealStage(3), 6800);
    const t4 = setTimeout(() => setRevealStage(4), 7400);
    // Hard safety: force overlay off after 1.5s if a timer is throttled.
    const safety = setTimeout(() => {
      setRevealStage((s) => (s === 0 ? 1 : s));
    }, 1500);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      clearTimeout(safety);
    };
  }, [cake, id, opened]);

  // If the tab was hidden when the initial timers fired (Chrome throttles
  // background tabs aggressively), bump the stage as soon as it's visible
  // again so the recipient never lands on a stuck black overlay.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && opened) {
        setRevealStage((s) => (s === 0 ? 1 : s));
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [opened]);


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
    const occ = (cake?.occasion_type || "").toLowerCase().trim();
    // Only play the birthday jingle for actual birthday cakes — empty/null
    // occasion (sender didn't set one) should fall back to the generic
    // celebration variant, not the birthday tune.
    const isBirthday = occ.includes("birth") || occ === "bday";
    const variant: "birthday" | "celebration" = isBirthday ? "birthday" : "celebration";
    // Loop softly if there's a voice message (so it can duck under voice); otherwise play once.
    jingleRef.current.play({ loop: hasVoice, volume: hasVoice ? 0.1 : 0.18, variant }).then(() => {
      setJinglePlaying(true);
    }).catch(() => {});
  };

  // Splash tap — the gesture that unlocks audio and kicks off the reveal.
  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    // Call synchronously inside the click handler so the AudioContext is
    // created/resumed within the user gesture (required by Chrome/Safari/iOS).
    startJingleIfNeeded();
  };


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

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (!a.paused) {
      a.pause();
      setIsPlaying(false);
      return;
    }
    try {
      // Stop background music completely while voice plays
      jingleRef.current?.stop();
      setJinglePlaying(false);

      // Force a fresh load — some browsers (esp. iOS Safari) need this on
      // first play after the element mounted with <source> children.
      if (a.readyState < 2) {
        try { a.load(); } catch {}
      }
      a.currentTime = 0;
      await a.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio play failed:", err);
      toast({
        title: "Couldn't play voice message",
        description: "Try the controls below, or open this link in another browser.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  // Track replay timers so a second click (or unmount) doesn't leave stale
  // setTimeouts that flip revealStage on an unrelated render.
  const replayTimersRef = useRef<number[]>([]);
  useEffect(() => () => { replayTimersRef.current.forEach(clearTimeout); }, []);

  const handleReplay = () => {
    // Clear the convergeReveal skip key — its key format is
    // `cake_reveal_seen_${cake.id}_${revealKey}`, so removing
    // `cake_reveal_seen_${id}` alone misses it. Bumping revealKey produces a
    // fresh cacheKey anyway, but clear both for safety.
    if (id) {
      sessionStorage.removeItem(`cake_reveal_seen_${id}`);
      sessionStorage.removeItem(`cake_reveal_seen_${id}_${revealKey}`);
    }
    // Cancel any pending replay timers from a previous click.
    replayTimersRef.current.forEach(clearTimeout);
    replayTimersRef.current = [];
    setRevealStage(0);
    setRevealKey((k) => k + 1);
    setCandlesBlown(false);
    // Restart staged reveal — same timing as initial
    replayTimersRef.current.push(
      window.setTimeout(() => setRevealStage(1), 300),
      window.setTimeout(() => setRevealStage(2), 700),
      window.setTimeout(() => setRevealStage(3), 6800),
      window.setTimeout(() => setRevealStage(4), 7400),
    );
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

      {/* Splash — tap to unlock audio + start the reveal */}
      <AnimatePresence>
        {!opened && (
          <motion.button
            key="reveal-splash"
            type="button"
            onClick={handleOpen}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center cursor-pointer bg-gradient-to-br from-party-pink/95 via-party-purple/95 to-party-mint/95 backdrop-blur-sm"
            aria-label="Tap to open your cake"
          >
            {/* Soft floating blobs */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/20 blur-3xl animate-pulse" />
              <div className="absolute bottom-0 -right-24 w-96 h-96 rounded-full bg-white/15 blur-3xl animate-pulse [animation-delay:1.5s]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {cake?.sender_name && cake.sender_name.trim().length > 0 && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/50 shadow-sm">
                  <Gift className="h-4 w-4 text-party-pink" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-party-pink to-party-purple bg-clip-text text-transparent">
                    {cake.sender_name.trim()} made this just for you 💝
                  </span>
                </div>
              )}

              <div className="text-8xl mb-6 drop-shadow-lg animate-bounce">🎂</div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md mb-3">
                You've got a cake!
              </h1>
              <p className="text-white/90 text-base mb-8 max-w-xs">
                Turn up your volume <span className="inline-block">🔊</span> and tap below to open it.
              </p>

              <span
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-foreground text-lg font-bold shadow-2xl ring-4 ring-white/40 animate-pulse"
              >
                <Sparkles className="h-5 w-5 text-party-pink" />
                Tap to open your cake 🎂
              </span>

              <p className="mt-6 text-xs text-white/70">(tap anywhere)</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>


      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-party-pink/30 via-party-purple/20 to-party-mint/30 py-8 px-4">
        {/* Ambient celebration */}
        <ConfettiRain count={18} />

        {/* Jingle mute toggle */}
        <button
          type="button"
          onClick={toggleJingleMute}
          className="fixed top-3 right-3 z-40 h-10 w-10 rounded-full bg-white/85 hover:bg-white backdrop-blur shadow-md flex items-center justify-center text-foreground/80"
          aria-label={jingleMuted ? "Unmute music" : "Mute music"}
          title={jingleMuted ? "Unmute music" : "Mute music"}
        >
          {jingleMuted ? <VolumeX className="h-4 w-4" /> : <Music className="h-4 w-4" />}
        </button>


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
                {kickerText}
              </span>

            </div>
          </motion.div>

          {/* Candles — appear at stage 1 with existing flicker animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealStage >= 1 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="transition-all duration-500">
              <CandleRow count={5} size="sm" className="mb-2" blown={candlesBlown} />
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
                    key={revealKey}
                    images={cake.sibling_image_urls ?? [cake.image_url]}
                    primary={cake.image_url}
                    finale={
                      cake.sibling_image_urls && cake.sibling_image_urls.length > 0
                        ? cake.sibling_image_urls[cake.sibling_image_urls.length - 1]
                        : cake.image_url
                    }
                    alt={cake.recipient_name ? `Cake for ${cake.recipient_name}` : "Personalized cake"}
                    cacheKey={`${cake.id}_${revealKey}`}
                    enabled={opened}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded pointer-events-none select-none">
                    🎂 cakeaiartist.com
                  </div>
                  {/* Replay button */}
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="absolute top-2 left-2 z-30 inline-flex items-center gap-1 bg-white/85 hover:bg-white backdrop-blur text-xs px-2.5 py-1 rounded-full shadow text-foreground/80"
                    aria-label="Replay the cake reveal"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Replay
                  </button>
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
                      preload="auto"
                      playsInline
                      onEnded={() => {
                        setIsPlaying(false);
                        // Resume background music if user hasn't muted it
                        if (!jingleMuted && opened) startJingleIfNeeded();
                      }}
                      onPause={() => {
                        setIsPlaying(false);
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onError={() => {
                        toast({
                          title: "Voice message failed to load",
                          description: "Try the player controls below.",
                          variant: "destructive",
                        });
                      }}
                    >
                      <source src={cake.audio_url} type={cake.audio_mime_type || "audio/mp4"} />
                      <source src={cake.audio_url} />
                    </audio>

                    {/* Music mute toggle — visible in the card */}
                    <div className="flex items-center justify-center mt-3">
                      <button
                        type="button"
                        onClick={toggleJingleMute}
                        className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-white/80 border border-party-purple/30 hover:bg-white shadow-sm text-foreground/80"
                      >
                        {jingleMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Music className="h-3.5 w-3.5" />}
                        {jingleMuted ? "Music muted" : "Mute background music"}
                      </button>
                    </div>

                    {/* Native fallback so iOS/Safari users always have a working control */}
                    <details className="mt-2 text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">No sound? Use this player</summary>
                      <audio
                        controls
                        playsInline
                        preload="auto"
                        className="w-full mt-2"
                        onPlay={() => {
                          jingleRef.current?.stop();
                          setJinglePlaying(false);
                        }}
                      >
                        <source src={cake.audio_url} type={cake.audio_mime_type || "audio/mp4"} />
                        <source src={cake.audio_url} />
                      </audio>
                    </details>
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
