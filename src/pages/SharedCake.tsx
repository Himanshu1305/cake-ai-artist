import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Volume2, Sparkles } from "lucide-react";

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

export default function SharedCake() {
  const { id } = useParams<{ id: string }>();
  const [cake, setCake] = useState<PublicCake | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

  useEffect(() => {
    if (cake?.recipient_name) {
      document.title = `A cake for ${cake.recipient_name} 🎂`;
    } else {
      document.title = "A cake just for you 🎂";
    }
  }, [cake]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-party-cream to-background">
        <Loader2 className="h-10 w-10 animate-spin text-party-purple" />
      </div>
    );
  }

  if (notFound || !cake) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-party-cream to-background p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Cake not found 🎂</h1>
        <p className="text-muted-foreground mb-6">This share link may have expired.</p>
        <Link to="/">
          <Button>Make your own cake</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-party-cream via-background to-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Card className="overflow-hidden border-2 border-party-purple/20 shadow-2xl">
          <div className="relative">
            <img
              src={cake.image_url}
              alt={cake.recipient_name ? `Cake for ${cake.recipient_name}` : "Personalized cake"}
              className="w-full aspect-square object-cover"
              loading="eager"
            />
          </div>

          <div className="p-6 space-y-4 text-center">
            {cake.recipient_name && (
              <h1 className="text-3xl font-bold text-party-purple">
                For {cake.recipient_name} 🎂
              </h1>
            )}

            {cake.message && (
              <p className="text-lg italic text-foreground/80 whitespace-pre-line">
                "{cake.message}"
              </p>
            )}

            {cake.audio_url && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-party-pink">
                  <Volume2 className="h-4 w-4" />
                  <span>Voice message</span>
                  {cake.audio_duration_seconds ? (
                    <span className="text-muted-foreground">
                      ({cake.audio_duration_seconds}s)
                    </span>
                  ) : null}
                </div>
                <audio
                  controls
                  src={cake.audio_url}
                  className="w-full"
                  preload="metadata"
                >
                  Your browser doesn't support audio playback.
                </audio>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Create your own cake
            </Button>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Made with Cake AI Artist
          </p>
        </div>
      </div>
    </div>
  );
}
