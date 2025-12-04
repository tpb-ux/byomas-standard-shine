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
    const { limit = 10, dryRun = false } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch articles without featured_image
    const { data: articles, error: fetchError } = await supabase
      .from("articles")
      .select("id, title, main_keyword, slug")
      .eq("status", "published")
      .or("featured_image.is.null,featured_image.eq.")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fetchError) {
      console.error("Error fetching articles:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch articles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No articles without images found",
          fixed: 0,
          failed: [],
          total: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${articles.length} articles without images`);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Dry run - no changes made",
          articlesToFix: articles.map(a => ({ id: a.id, title: a.title })),
          total: articles.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      fixed: 0,
      failed: [] as Array<{ id: string; title: string; error: string }>,
      total: articles.length,
    };

    // Process each article
    for (const article of articles) {
      try {
        console.log(`Processing article: ${article.title}`);

        // Call generate-image function
        const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: article.title,
            keyword: article.main_keyword || article.title,
          }),
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.error || "Image generation failed");
        }

        const imageData = await imageResponse.json();

        if (!imageData.url) {
          throw new Error("No image URL returned");
        }

        // Update article with new image
        const { error: updateError } = await supabase
          .from("articles")
          .update({
            featured_image: imageData.url,
            featured_image_alt: imageData.alt,
          })
          .eq("id", article.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        console.log(`✓ Fixed article: ${article.title}`);
        results.fixed++;

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`✗ Failed to fix article ${article.title}:`, error);
        results.failed.push({
          id: article.id,
          title: article.title,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`Finished: ${results.fixed} fixed, ${results.failed.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fixed ${results.fixed} of ${results.total} articles`,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fix-missing-images:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
