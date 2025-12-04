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
    const { articleId, processAll } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all tags
    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("id, name, slug");

    if (tagsError || !tags) {
      console.error("Error fetching tags:", tagsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch tags" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get articles to process
    let articlesQuery = supabase
      .from("articles")
      .select("id, title, content, main_keyword, excerpt")
      .eq("status", "published");

    if (articleId) {
      articlesQuery = articlesQuery.eq("id", articleId);
    }

    const { data: articles, error: articlesError } = await articlesQuery;

    if (articlesError || !articles) {
      console.error("Error fetching articles:", articlesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch articles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${articles.length} articles for tag association`);

    let totalAssociations = 0;
    const results: Array<{ articleId: string; title: string; tagsAdded: string[] }> = [];

    for (const article of articles) {
      const textToAnalyze = `${article.title} ${article.main_keyword || ""} ${article.excerpt || ""} ${article.content}`.toLowerCase();
      
      // Find matching tags
      const matchingTags: Array<{ id: string; name: string }> = [];
      
      for (const tag of tags) {
        const tagName = tag.name.toLowerCase();
        // Check various forms of matching
        if (
          textToAnalyze.includes(tagName) ||
          textToAnalyze.includes(tagName.replace(/\s+/g, "-")) ||
          textToAnalyze.includes(tagName.replace(/\s+/g, ""))
        ) {
          matchingTags.push({ id: tag.id, name: tag.name });
        }
      }

      // Limit to 5 tags per article
      const tagsToAssociate = matchingTags.slice(0, 5);

      if (tagsToAssociate.length > 0) {
        // Check existing associations
        const { data: existingAssociations } = await supabase
          .from("article_tags")
          .select("tag_id")
          .eq("article_id", article.id);

        const existingTagIds = new Set(existingAssociations?.map(a => a.tag_id) || []);

        // Insert only new associations
        const newAssociations = tagsToAssociate.filter(t => !existingTagIds.has(t.id));

        if (newAssociations.length > 0) {
          const { error: insertError } = await supabase
            .from("article_tags")
            .insert(
              newAssociations.map(tag => ({
                article_id: article.id,
                tag_id: tag.id,
              }))
            );

          if (insertError) {
            console.error(`Error inserting tags for article ${article.id}:`, insertError);
          } else {
            totalAssociations += newAssociations.length;
            results.push({
              articleId: article.id,
              title: article.title,
              tagsAdded: newAssociations.map(t => t.name),
            });
            console.log(`Added ${newAssociations.length} tags to article: ${article.title}`);
          }
        }
      }
    }

    console.log(`Total tag associations created: ${totalAssociations}`);

    return new Response(
      JSON.stringify({
        success: true,
        articlesProcessed: articles.length,
        totalAssociations,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-article-tags:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
