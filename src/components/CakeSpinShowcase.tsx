import { useRef, useState } from "react";
import { Pause, Play, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CakeSpinShowcaseProps {
  src: string;
  alt?: string;
  className?: string;
  /** seconds per full rotation */
  duration?: number;
  /** show the WebM download button */
  allowDownload?: boolean;
}

/**
 * CSS-driven 3D "turntable" rotation for any cake image.
 * - No JS animation loop, uses pure CSS keyframes for smooth GPU rotation.
 * - Click / hover pauses the spin.
 * - Optional "Download spinning preview" records ~3s to WebM via MediaRecorder.
 */
export const CakeSpinShowcase = ({
  src,
  alt = "Rotating AI-designed cake",
  className = "",
  duration = 9,
  allowDownload = true,
}: CakeSpinShowcaseProps) => {
  const [paused, setPaused] = useState(false);
  const [recording, setRecording] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const recordWebM = async () => {
    if (!imgRef.current) return;
    setRecording(true);
    try {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      // Load image fresh with CORS so canvas isn't tainted
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Image failed to load"));
      });

      const stream = (canvas as any).captureStream(30) as MediaStream;
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      const totalMs = 3200;
      const start = performance.now();
      let raf = 0;
      const draw = (now: number) => {
        const t = (now - start) / 1000;
        const angle = (t / duration) * Math.PI * 2;
        ctx.clearRect(0, 0, size, size);
        // soft floor shadow
        ctx.save();
        ctx.translate(size / 2, size * 0.86);
        ctx.scale(1, 0.25);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.45);
        grad.addColorStop(0, "rgba(0,0,0,0.35)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // rotated image (flatten rotateY by squashing X)
        const scaleX = Math.abs(Math.cos(angle)) * 0.85 + 0.15;
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.scale(scaleX, 1);
        const drawSize = size * 0.92;
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();

        if (now - start < totalMs) {
          raf = requestAnimationFrame(draw);
        }
      };

      recorder.start();
      raf = requestAnimationFrame(draw);
      await new Promise((r) => setTimeout(r, totalMs));
      cancelAnimationFrame(raf);
      recorder.stop();

      const blob: Blob = await new Promise((res) => {
        recorder.onstop = () => res(new Blob(chunks, { type: "video/webm" }));
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cake-spin-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Spinning preview downloaded! 🎂");
    } catch (e: any) {
      console.error(e);
      toast.error("Couldn't record preview. Try the still image instead.");
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative mx-auto"
        style={{ perspective: "1200px", width: "min(100%, 360px)", aspectRatio: "1 / 1" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onClick={() => setPaused((p) => !p)}
      >
        {/* floor shadow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-1 w-[78%] h-6 rounded-[50%] blur-md bg-black/30"
          style={{
            animation: paused ? "none" : `cake-shadow-pulse ${duration}s linear infinite`,
            transformOrigin: "center",
          }}
        />
        {/* turntable */}
        <div
          className="absolute inset-0 rounded-3xl will-change-transform"
          style={{
            transformStyle: "preserve-3d",
            animation: paused ? "none" : `cake-spin ${duration}s linear infinite`,
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            crossOrigin="anonymous"
            className="w-full h-full object-cover rounded-3xl shadow-[0_30px_60px_-20px_hsl(var(--party-pink)/0.55)] ring-1 ring-white/40"
            draggable={false}
          />
        </div>
        {/* play/pause hint */}
        <div className="absolute top-2 right-2 z-10 bg-white/85 backdrop-blur rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </div>
      </div>

      {allowDownload && (
        <div className="mt-4 flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={recordWebM}
            disabled={recording}
            className="gap-2"
          >
            {recording ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {recording ? "Recording…" : "Download spinning preview"}
          </Button>
        </div>
      )}

      {/* Inline keyframes (scoped via unique animation names) */}
      <style>{`
        @keyframes cake-spin {
          0%   { transform: rotateY(0deg) }
          100% { transform: rotateY(360deg) }
        }
        @keyframes cake-shadow-pulse {
          0%, 100% { transform: scaleX(1); opacity: 0.55 }
          50%      { transform: scaleX(0.55); opacity: 0.35 }
        }
      `}</style>
    </div>
  );
};
