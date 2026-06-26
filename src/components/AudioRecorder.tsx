import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Loader2, Check, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MAX_SECONDS = 30;

interface AudioRecorderProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cakeImageId: string;
  userId: string;
  existingAudioUrl?: string | null;
  onSaved: (audioUrl: string, durationSeconds: number) => void;
}

function pickMimeType(): string {
  // Prefer formats playable on iOS/Safari/WhatsApp first.
  // Safari + iOS can record/play audio/mp4 (m4a/AAC). WebM/Opus often fails on iOS.
  const candidates = [
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/mpeg",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(t)) {
      return t;
    }
  }
  return "audio/webm";
}

function extFromMime(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  return "webm";
}

export const AudioRecorder = ({ open, onOpenChange, cakeImageId, userId, existingAudioUrl, onSaved }: AudioRecorderProps) => {
  const [phase, setPhase] = useState<"idle" | "recording" | "preview" | "uploading">("idle");
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const mimeRef = useRef<string>("audio/webm");
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanup();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) {
      cleanup();
      setPhase("idle");
      setSeconds(0);
      setError(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMimeType();
      mimeRef.current = mime;
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPhase("preview");
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
      rec.start();
      recorderRef.current = rec;
      setSeconds(0);
      setPhase("recording");
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const n = s + 1;
          if (n >= MAX_SECONDS) {
            stopRecording();
          }
          return n;
        });
      }, 1000);
    } catch (e: any) {
      console.error("Mic error", e);
      setError(
        e?.name === "NotAllowedError"
          ? "Mic permission denied. Enable it in your browser settings and try again."
          : "Couldn't access your microphone. Please try a different browser."
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      // Flush any pending audio data before stopping (prevents 0-byte / unplayable files on some browsers)
      try { recorderRef.current?.requestData?.(); } catch {}
      recorderRef.current?.stop();
    } catch {}
  };


  const discardPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSeconds(0);
    setPhase("idle");
  };

  const togglePlayback = () => {
    const el = audioElRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      const p = el.play();
      if (p && typeof p.catch === "function") {
        p.catch((err) => {
          console.error("Preview playback failed:", err);
          toast({
            title: "Couldn't play preview",
            description: "Try a different browser (Chrome / Safari latest).",
            variant: "destructive",
          });
        });
      }
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
      reader.readAsDataURL(blob);
    });

  const saveAudio = async () => {
    if (chunksRef.current.length === 0) return;
    setPhase("uploading");
    try {
      // Make sure we have a valid token before invoking the function. On mobile,
      // the access token can silently expire while the user is recording.
      let { data: sessionData } = await supabase.auth.getSession();
      let session = sessionData?.session ?? null;
      const nowSec = Math.floor(Date.now() / 1000);
      const secondsToExpiry = (session?.expires_at ?? 0) - nowSec;
      if (!session || secondsToExpiry < 60) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session ?? session;
      }
      if (!session?.user?.id) {
        toast({
          title: "Please sign in again",
          description: "Your session expired. Sign in and re-record your voice message.",
          variant: "destructive",
        });
        setPhase("preview");
        return;
      }

      const blob = new Blob(chunksRef.current, { type: mimeRef.current });
      const audioBase64 = await blobToBase64(blob);

      // Backend handles storage upload using trusted credentials, so flaky
      // mobile Storage RLS evaluation can't block the user anymore.
      const { data, error } = await supabase.functions.invoke("save-cake-audio", {
        body: {
          cakeImageId,
          audioBase64,
          mimeType: mimeRef.current,
          durationSeconds: seconds,
        },
      });

      if (error) throw error;
      if (!data?.publicUrl) throw new Error(data?.error || "Upload failed");

      toast({ title: "🎙️ Voice message saved!", description: "It will play on the cake's share link." });
      onSaved(data.publicUrl, seconds);
      onOpenChange(false);
    } catch (e: any) {
      console.error("Save audio error", e);
      toast({
        title: "Couldn't save voice message",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
      setPhase("preview");
    }
  };

  const remaining = MAX_SECONDS - seconds;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🎙️ Add a voice message</DialogTitle>
          <DialogDescription>
            Record up to {MAX_SECONDS} seconds. Whoever opens the cake link will hear your message.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {phase === "idle" && (
            <>
              <Button
                onClick={startRecording}
                size="lg"
                className="h-24 w-24 rounded-full bg-party-pink hover:bg-party-pink/90"
              >
                <Mic className="h-10 w-10" />
              </Button>
              <p className="text-sm text-muted-foreground">Tap the mic to start</p>
              {existingAudioUrl && (
                <p className="text-xs text-muted-foreground">
                  Recording will replace your existing voice message.
                </p>
              )}
            </>
          )}

          {phase === "recording" && (
            <>
              <Button
                onClick={stopRecording}
                size="lg"
                className="h-24 w-24 rounded-full bg-destructive hover:bg-destructive/90 animate-pulse"
              >
                <Square className="h-10 w-10 fill-current" />
              </Button>
              <div className="text-center">
                <p className="text-3xl font-bold tabular-nums">
                  0:{seconds.toString().padStart(2, "0")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {remaining}s remaining — tap to stop
                </p>
              </div>
            </>
          )}

          {phase === "preview" && previewUrl && (
            <>
              <audio
                ref={audioElRef}
                src={previewUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                controls
                playsInline
                className="w-full"
              />
              <Button
                onClick={togglePlayback}
                size="lg"
                variant="outline"
                className="h-20 w-20 rounded-full"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              <p className="text-sm text-muted-foreground">
                {seconds}s recorded · tap to preview
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={discardPreview} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Re-record
                </Button>
                <Button onClick={saveAudio} className="flex-1 bg-party-purple hover:bg-party-purple/90">
                  <Check className="h-4 w-4 mr-2" />
                  Save & attach
                </Button>
              </div>
            </>
          )}

          {phase === "uploading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-party-purple" />
              <p className="text-sm text-muted-foreground">Saving your voice message…</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
