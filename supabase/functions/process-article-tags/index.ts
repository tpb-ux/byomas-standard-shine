import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function keywordMatch(
  article: { title: string; content: string; main_keyword: string | null; excerpt: string | null },
  tags: Array<{ id: string; name: string; slug: string }>
): Array<{ id: string; name: string }> {
  const text = normalize(
    `${article.title} ${article.main_keyword || ""} ${article.excerpt || ""} ${article.content}`
  );
  const matched: Array<{ id: string; name: string }> = [];
  for (const tag of tags) {
    const tagName = normalize(tag.name);
    if (!tagName) continue;
    if (
      text.includes(tagName) ||
      text.includes(tagName.replace(/\s+/g, "-")) ||
      text.includes(tagName.replace(/\s+/g, ""))
    ) {
      matched.push({ id: tag.id, name: tag.name });
    }
  }
  return matched;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let articleId: string | undefined;
    try {
      const body = await req.json();
      articleId = body.articleId;
    } catch { /* no body */ }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("id, name, slug");
    if (tagsError || !tags) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch tags" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let q = supabase
      .from("articles")
      .select("id, title, content, main_keyword, excerpt")
      .eq("status", "published");
    if (articleId) q = q.eq("id", articleId);

    const { data: articles, error: articlesError } = await q;
    if (articlesError || !articles) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch articles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalAssociations = 0;
    const results: Array<{ articleId: string; title: string; tagsAdded: string[] }> = [];

    for (const article of articles) {
      const matched = keywordMatch(article, tags).slice(0, 5);
      if (!matched.length) continue;

      const { data: existing } = await supabase
        .from("article_tags")
        .select("tag_id")
        .eq("article_id", article.id);
      const existingIds = new Set((existing || []).map(a => a.tag_id));
      const newOnes = matched.filter(t => !existingIds.has(t.id));

      if (newOnes.length) {
        const { error: insertError } = await supabase
          .from("article_tags")
          .insert(newOnes.map(t => ({ article_id: article.id, tag_id: t.id })));
        if (!insertError) {
          totalAssociations += newOnes.length;
          results.push({
            articleId: article.id,
            title: article.title,
            tagsAdded: newOnes.map(t => t.name),
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        articlesProcessed: articles.length,
        totalAssociations,
        results,
        method: "keyword",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});