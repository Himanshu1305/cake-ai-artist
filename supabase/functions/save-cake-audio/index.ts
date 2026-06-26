import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5MB safety cap (30s recording is ~300KB)

function extFromMime(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      cakeImageId,
      audioBase64,
      mimeType,
      durationSeconds,
    }: {
      cakeImageId?: string;
      audioBase64?: string;
      mimeType?: string;
      durationSeconds?: number;
    } = body;

    if (!cakeImageId || typeof cakeImageId !== "string") {
      return new Response(JSON.stringify({ error: "Missing cakeImageId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!audioBase64 || typeof audioBase64 !== "string") {
      return new Response(JSON.stringify({ error: "Missing audioBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const mime = typeof mimeType === "string" && mimeType ? mimeType : "audio/webm";
    if (!mime.startsWith("audio/")) {
      return new Response(JSON.stringify({ error: "Invalid mime type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const duration =
      typeof durationSeconds === "number" && durationSeconds > 0 && durationSeconds <= 120
        ? Math.floor(durationSeconds)
        : null;

    // Verify the cake row exists and belongs to this user
    const { data: row, error: rowErr } = await admin
      .from("generated_images")
      .select("id, user_id, share_group_id")
      .eq("id", cakeImageId)
      .maybeSingle();
    if (rowErr) {
      console.error("[save-cake-audio] lookup error", rowErr);
      return new Response(JSON.stringify({ error: "Cake lookup failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!row) {
      return new Response(JSON.stringify({ error: "Cake not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (row.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Not your cake" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = decodeBase64(audioBase64);
    if (bytes.byteLength === 0) {
      return new Response(JSON.stringify({ error: "Empty audio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (bytes.byteLength > MAX_AUDIO_BYTES) {
      return new Response(JSON.stringify({ error: "Audio too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ext = extFromMime(mime);
    const path = `${userId}/${cakeImageId}-${Date.now()}.${ext}`;

    const { error: upErr } = await admin.storage
      .from("cake-audio")
      .upload(path, bytes, { contentType: mime, upsert: true });
    if (upErr) {
      console.error("[save-cake-audio] upload error", upErr);
      return new Response(JSON.stringify({ error: `Upload failed: ${upErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = admin.storage.from("cake-audio").getPublicUrl(path);
    const publicUrl = `${pub.publicUrl}?v=${Date.now()}`;

    // Attach audio to every sibling view in the share group, scoped to this user.
    const update = {
      audio_url: publicUrl,
      audio_duration_seconds: duration,
      audio_mime_type: mime,
    };

    if (row.share_group_id) {
      const { error: updErr } = await admin
        .from("generated_images")
        .update(update)
        .eq("share_group_id", row.share_group_id)
        .eq("user_id", userId);
      if (updErr) {
        console.error("[save-cake-audio] group update error", updErr);
        return new Response(JSON.stringify({ error: `Saving to cake failed: ${updErr.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: updErr } = await admin
        .from("generated_images")
        .update(update)
        .eq("id", cakeImageId)
        .eq("user_id", userId);
      if (updErr) {
        console.error("[save-cake-audio] single update error", updErr);
        return new Response(JSON.stringify({ error: `Saving to cake failed: ${updErr.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, publicUrl, durationSeconds: duration, mimeType: mime }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[save-cake-audio] fatal", e);
    return new Response(JSON.stringify({ error: (e as Error).message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
