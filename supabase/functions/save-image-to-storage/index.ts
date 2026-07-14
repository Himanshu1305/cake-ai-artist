import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

// Only allow fetching images from known AI model CDNs
const ALLOWED_EXTERNAL_HOSTS = [
  "openrouter.ai",
  "cdn.openai.com",
  "oaidalleapiprodscus.blob.core.windows.net",
  "storage.googleapis.com",
  "generativelanguage.googleapis.com",
  "replicate.delivery",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and validate JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the JWT token and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the authenticated user's ID instead of request body
    const userId = user.id;

    const { imageUrl, prompt } = await req.json();

    // Input validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid imageUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate prompt length
    if (prompt && prompt.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Prompt exceeds maximum length of 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Saving image for authenticated user:', userId);
    console.log('Image source:', imageUrl.substring(0, 50) + '...');

    let imageBuffer: ArrayBuffer;
    let contentType = 'image/webp';

    // Check if imageUrl is a base64 data URL
    if (imageUrl.startsWith('data:')) {
      console.log('Processing base64 data URL...');
      // Extract base64 data from data URL
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return new Response(
          JSON.stringify({ error: 'Invalid base64 data URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      contentType = matches[1] || 'image/png';
      if (!contentType.startsWith('image/')) {
        return new Response(
          JSON.stringify({ error: `Data URL content-type must be an image (got: ${contentType})` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const base64Data = matches[2];

      // ~33% overhead: base64 length * 0.75 ≈ decoded bytes
      if (base64Data.length * 0.75 > MAX_IMAGE_BYTES) {
        return new Response(
          JSON.stringify({ error: 'Image exceeds 10 MB size limit' }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBuffer = bytes.buffer;
    } else {
      // Validate HTTPS URL and domain allowlist
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(imageUrl);
        if (parsedUrl.protocol !== 'https:') {
          throw new Error('URL must use HTTPS');
        }
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid imageUrl format - must be a valid HTTPS URL or base64 data URL' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const host = parsedUrl.hostname;
      const allowed = ALLOWED_EXTERNAL_HOSTS.some(
        (h) => host === h || host.endsWith(`.${h}`)
      );
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: `External host not permitted: ${host}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Download the image from external URL
      console.log('Downloading image from URL...');
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
      }

      // Enforce content-type must be an image
      const remoteCT = imageResponse.headers.get('content-type') || '';
      if (!remoteCT.startsWith('image/')) {
        return new Response(
          JSON.stringify({ error: `Remote URL did not return an image (got: ${remoteCT})` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      contentType = remoteCT.split(';')[0].trim();

      const imageBlob = await imageResponse.blob();
      if (imageBlob.size > MAX_IMAGE_BYTES) {
        return new Response(
          JSON.stringify({ error: `Image exceeds 10 MB size limit (got ${imageBlob.size} bytes)` }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      imageBuffer = await imageBlob.arrayBuffer();
    }
    
    // Generate unique filename using authenticated user ID
    const timestamp = new Date().getTime();
    // Determine file extension from content type
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const fileName = `${userId}/${timestamp}.${extension}`;

    console.log('Uploading to storage bucket:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cake-images')
      .upload(fileName, imageBuffer, {
        contentType: contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cake-images')
      .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        publicUrl,
        fileName 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in save-image-to-storage:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
