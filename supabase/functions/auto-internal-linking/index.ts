import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  main_keyword: string | null;
}

interface LinkSuggestion {
  sourceId: string;
  targetId: string;
  anchorText: string;
  matchType: "keyword" | "title" | "topic";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { articleId, mode = "single" } = await req.json();

    console.log(`[Auto-Linking] Starting process - Mode: ${mode}, ArticleId: ${articleId || "all"}`);

    // Fetch all published articles for potential linking
    const { data: allArticles, error: fetchError } = await supabase
      .from("articles")
      .select("id, title, slug, content, main_keyword")
      .eq("status", "published");

    if (fetchError) throw fetchError;

    if (!allArticles || allArticles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No articles to process", linksCreated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine which articles to process
    let articlesToProcess: Article[] = [];
    if (mode === "single" && articleId) {
      articlesToProcess = allArticles.filter((a) => a.id === articleId);
    } else {
      articlesToProcess = allArticles;
    }

    console.log(`[Auto-Linking] Processing ${articlesToProcess.length} articles against ${allArticles.length} potential targets`);

    const linkSuggestions: LinkSuggestion[] = [];
    const stopWords = ["sobre", "como", "para", "entre", "desde", "pelos", "pelas"];

    // Process each article
    for (const sourceArticle of articlesToProcess) {
      const contentLower = sourceArticle.content.toLowerCase();

      // Find potential links from other articles
      for (const targetArticle of allArticles) {
        // Skip self-linking
        if (sourceArticle.id === targetArticle.id) continue;

        // Check if source already links to target
        const { data: existingLink } = await supabase
          .from("internal_links")
          .select("id")
          .eq("source_article_id", sourceArticle.id)
          .eq("target_article_id", targetArticle.id)
          .single();

        if (existingLink) continue;

        // Match by main keyword
        if (targetArticle.main_keyword) {
          const keyword = targetArticle.main_keyword.toLowerCase();
          if (contentLower.includes(keyword) && keyword.length > 3) {
            linkSuggestions.push({
              sourceId: sourceArticle.id,
              targetId: targetArticle.id,
              anchorText: targetArticle.main_keyword,
              matchType: "keyword",
            });
            continue;
          }
        }

        // Match by title words (significant words only)
        const titleWords = targetArticle.title
          .toLowerCase()
          .split(/\s+/)
          .filter((word: string) => word.length > 4)
          .filter((word: string) => !stopWords.includes(word));

        const significantMatch = titleWords.filter((word: string) => contentLower.includes(word));
        if (significantMatch.length >= 2) {
          linkSuggestions.push({
            sourceId: sourceArticle.id,
            targetId: targetArticle.id,
            anchorText: targetArticle.title,
            matchType: "title",
          });
        }
      }
    }

    console.log(`[Auto-Linking] Found ${linkSuggestions.length} potential links`);

    // Insert links (limit to 5 per article to avoid over-linking)
    const linksPerArticle: Record<string, number> = {};
    let linksCreated = 0;

    for (const suggestion of linkSuggestions) {
      if (!linksPerArticle[suggestion.sourceId]) {
        linksPerArticle[suggestion.sourceId] = 0;
      }

      if (linksPerArticle[suggestion.sourceId] >= 5) continue;

      const { error: insertError } = await supabase.from("internal_links").insert({
        source_article_id: suggestion.sourceId,
        target_article_id: suggestion.targetId,
        anchor_text: suggestion.anchorText,
      });

      if (!insertError) {
        linksPerArticle[suggestion.sourceId]++;
        linksCreated++;
        console.log(`[Auto-Linking] Created link: ${suggestion.sourceId} -> ${suggestion.targetId} (${suggestion.anchorText})`);
      }
    }

    // Update SEO metrics for processed articles
    for (const article of articlesToProcess) {
      const { count: internalCount } = await supabase
        .from("internal_links")
        .select("id", { count: "exact", head: true })
        .eq("source_article_id", article.id);

      const { count: externalCount } = await supabase
        .from("external_links")
        .select("id", { count: "exact", head: true })
        .eq("article_id", article.id);

      await supabase
        .from("seo_metrics")
        .upsert(
          {
            article_id: article.id,
            internal_links_count: internalCount || 0,
            external_links_count: externalCount || 0,
            analyzed_at: new Date().toISOString(),
          },
          { onConflict: "article_id" }
        );
    }

    console.log(`[Auto-Linking] Complete. Created ${linksCreated} new links.`);

    return new Response(
      JSON.stringify({
        success: true,
        linksCreated,
        articlesProcessed: articlesToProcess.length,
        suggestions: linkSuggestions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Auto-Linking] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
