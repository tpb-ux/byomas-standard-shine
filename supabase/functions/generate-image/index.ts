import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, keyword, style = "professional" } = await req.json();

    if (!title && !keyword) {
      return new Response(
        JSON.stringify({ error: "Title or keyword is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build optimized prompt for sustainability/green finance blog
    const topic = keyword || title;
    const imagePrompt = `Create a professional, modern 16:9 hero image for a blog article about "${topic}".

Style: ${style}, clean, minimalist design with sustainable/green theme.
Visual elements:
- Nature-inspired: subtle leaves, forest silhouettes, earth tones, or green gradients
- Modern data visualization elements (charts, graphs) if financial topic
- Clean, uncluttered composition
- Color palette: deep greens (#2D5A3D), earth browns (#8B7355), soft blues (#87CEEB), white/cream backgrounds
- Professional corporate feel with environmental consciousness
- Soft lighting, modern aesthetic

IMPORTANT:
- Do NOT include any text, words, letters, or numbers in the image
- The image should work as a visual header/thumbnail
- Aspect ratio: 16:9, landscape orientation
- High quality, ultra resolution`;

    console.log("Generating image with Lovable AI for:", topic);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI image generation failed:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI image generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    console.log("AI response received");

    // Extract base64 image from response
    const images = aiData.choices?.[0]?.message?.images;
    if (!images || images.length === 0) {
      console.error("No image in AI response:", JSON.stringify(aiData).substring(0, 500));
      return new Response(
        JSON.stringify({ error: "No image generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageData = images[0]?.image_url?.url;
    if (!imageData || !imageData.startsWith("data:image")) {
      console.error("Invalid image data format");
      return new Response(
        JSON.stringify({ error: "Invalid image data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 content and mime type
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return new Response(
        JSON.stringify({ error: "Failed to parse image data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mimeType = matches[1];
    const base64Content = matches[2];
    
    // Determine file extension
    const extMap: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
    };
    const ext = extMap[mimeType] || "png";

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const slug = (keyword || title || "article")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 50);
    const fileName = `${timestamp}-${slug}-${randomId}.${ext}`;

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Uploading image to storage:", fileName);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(fileName, bytes, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload image: " + uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;
    console.log("Image uploaded successfully:", imageUrl);

    // Generate alt text
    const altText = `Imagem ilustrativa sobre ${topic} - Byoma Research`;

    return new Response(
      JSON.stringify({
        success: true,
        url: imageUrl,
        alt: altText,
        fileName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
