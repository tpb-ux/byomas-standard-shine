import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationSettings {
  articles_per_execution: number;
  daily_target: number;
  image_fallback_enabled: boolean;
  trending_boost_enabled: boolean;
}

const DEFAULT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop",
];

const STOPWORDS = new Set([
  "a","o","e","de","da","do","das","dos","em","no","na","nos","nas","um","uma","uns","umas",
  "para","por","com","sem","sob","sobre","ao","aos","à","às","que","se","ou","mas","como",
  "the","a","an","of","in","on","for","to","and","or","but","with","by","as","is","are","be","this","that"
]);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractiveSummary(text: string, maxSentences = 4): string {
  const clean = stripHtml(text);
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.length > 30);
  if (sentences.length === 0) return clean.substring(0, 280);
  return sentences.slice(0, maxSentences).join(" ").substring(0, 600);
}

function extractKeywords(text: string, n = 8): string[] {
  const words = stripHtml(text)
    .toLowerCase()
    .replace(/[^a-záàâãéêíóôõúç0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
}

function estimateReadingTime(text: string): number {
  const words = stripHtml(text).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function buildEthicalArticleContent(
  originalTitle: string,
  originalDescription: string,
  sourceName: string,
  sourceUrl: string,
  originalUrl: string,
  publishedDate: string
): { excerpt: string; content: string; metaDescription: string } {
  const summary = extractiveSummary(originalDescription || originalTitle, 5);
  const shortSummary = extractiveSummary(originalDescription || originalTitle, 2);

  const content = [
    `<p><strong>Resumo:</strong> ${summary}</p>`,
    `<h2>O que aconteceu</h2>`,
    `<p>${summary}</p>`,
    `<h2>Fonte original</h2>`,
    `<p>Esta notícia foi originalmente publicada por <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer nofollow">${sourceName}</a>. Acesse a matéria completa em <a href="${originalUrl}" target="_blank" rel="noopener noreferrer nofollow canonical">${originalUrl}</a>.</p>`,
    `<h2>Por que importa</h2>`,
    `<p>O acompanhamento desta pauta integra a cobertura editorial da Amazonia Research sobre mercado de carbono, finanças sustentáveis e economia regenerativa. Continue acompanhando nossas atualizações para análises aprofundadas.</p>`,
    `<p><em>Publicado originalmente em ${publishedDate} por ${sourceName}.</em></p>`,
  ].join("\n");

  const metaDescription = shortSummary.length > 0
    ? shortSummary.substring(0, 155)
    : `${originalTitle.substring(0, 120)} - cobertura Amazonia Research.`;

  return {
    excerpt: shortSummary.substring(0, 280),
    content,
    metaDescription,
  };
}

async function getSettings(supabase: any): Promise<AutomationSettings> {
  const { data } = await supabase.from("automation_settings").select("key, value");
  const settings: AutomationSettings = {
    articles_per_execution: 3,
    daily_target: 15,
    image_fallback_enabled: true,
    trending_boost_enabled: true,
  };
  if (data) {
    for (const item of data) {
      const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
      switch (item.key) {
        case "articles_per_execution": settings.articles_per_execution = parseInt(value, 10) || 3; break;
        case "daily_target": settings.daily_target = parseInt(value, 10) || 15; break;
        case "image_fallback_enabled": settings.image_fallback_enabled = value === "true" || value === true; break;
        case "trending_boost_enabled": settings.trending_boost_enabled = value === "true" || value === true; break;
      }
    }
  }
  return settings;
}

async function getFallbackImage(supabase: any, keyword: string): Promise<string> {
  try {
    const map: Record<string, string> = {
      carbono: "carbon", carbon: "carbon", floresta: "forest", forest: "forest",
      energia: "energy", energy: "energy", solar: "energy", "eólica": "wind",
      wind: "wind", cidade: "urban", urban: "urban", finance: "finance",
      financ: "finance", investimento: "finance",
    };
    let category = "general";
    const lk = keyword.toLowerCase();
    for (const [term, cat] of Object.entries(map)) {
      if (lk.includes(term)) { category = cat; break; }
    }
    const { data } = await supabase
      .from("fallback_images")
      .select("url")
      .eq("category", category)
      .order("usage_count", { ascending: true })
      .limit(1);
    if (data && data.length) return data[0].url;
    const { data: g } = await supabase
      .from("fallback_images")
      .select("url")
      .eq("category", "general")
      .order("usage_count", { ascending: true })
      .limit(1);
    if (g && g.length) return g[0].url;
  } catch (e) {
    console.log("fallback image error:", e);
  }
  return DEFAULT_FALLBACK_IMAGES[Math.floor(Math.random() * DEFAULT_FALLBACK_IMAGES.length)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const settings = await getSettings(supabase);

    let articlesToPublish = settings.articles_per_execution;
    let publishStatus: "draft" | "published" = "draft";
    try {
      const body = await req.json();
      if (body.count) articlesToPublish = Math.min(body.count, 10);
      if (body.publish === true) publishStatus = "published";
    } catch { /* no body */ }

    console.log(`Auto-promote starting: targeting ${articlesToPublish} items as ${publishStatus}`);

    // Get top-scored unprocessed news
    let query = supabase
      .from("curated_news")
      .select(`*, news_sources (name, url)`)
      .eq("processed", false)
      .order("engagement_potential", { ascending: false })
      .limit(articlesToPublish);

    if (settings.trending_boost_enabled) {
      query = query.gte("engagement_potential", 50);
    }

    let { data: newsItems } = await query;
    if ((!newsItems || newsItems.length === 0) && settings.trending_boost_enabled) {
      const { data: anyNews } = await supabase
        .from("curated_news")
        .select(`*, news_sources (name, url)`)
        .eq("processed", false)
        .order("engagement_potential", { ascending: false })
        .limit(articlesToPublish);
      newsItems = anyNews || [];
    }

    if (!newsItems || newsItems.length === 0) {
      return new Response(
        JSON.stringify({ message: "No news items to process", published: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: defaultAuthor } = await supabase
      .from("authors")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const results: any[] = [];
    const errors: string[] = [];

    for (const newsItem of newsItems) {
      try {
        const sourceName = newsItem.news_sources?.name || newsItem.source_name || "Fonte original";
        const sourceUrl = newsItem.news_sources?.url || newsItem.original_url;
        const publishedDate = new Date().toLocaleDateString("pt-BR");

        const { excerpt, content, metaDescription } = buildEthicalArticleContent(
          newsItem.original_title,
          newsItem.original_content || "",
          sourceName,
          sourceUrl,
          newsItem.original_url,
          publishedDate
        );

        const keywords = extractKeywords(`${newsItem.original_title} ${newsItem.original_content || ""}`);
        const mainKeyword = keywords[0] || newsItem.original_title.split(" ").slice(0, 3).join(" ");

        const baseSlug = generateSlug(newsItem.original_title);
        let finalSlug = baseSlug;
        let counter = 1;
        while (true) {
          const { data: existingSlug } = await supabase
            .from("articles")
            .select("id")
            .eq("slug", finalSlug)
            .maybeSingle();
          if (!existingSlug) break;
          finalSlug = `${baseSlug}-${counter++}`;
        }

        const imageUrl = settings.image_fallback_enabled
          ? await getFallbackImage(supabase, mainKeyword)
          : null;

        const title = newsItem.original_title.substring(0, 120);
        const metaTitle = title.substring(0, 60);

        const { data: newArticle, error: articleError } = await supabase
          .from("articles")
          .insert({
            title,
            slug: finalSlug,
            meta_title: metaTitle,
            meta_description: metaDescription,
            excerpt,
            content,
            main_keyword: mainKeyword,
            reading_time: estimateReadingTime(content),
            featured_image: imageUrl,
            featured_image_alt: `${title} — Amazonia Research`,
            status: publishStatus,
            published_at: publishStatus === "published" ? new Date().toISOString() : null,
            ai_generated: false,
            is_curated: true,
            author_id: defaultAuthor?.id ?? null,
            source_url: newsItem.original_url,
            source_name: sourceName,
          })
          .select()
          .single();

        if (articleError) {
          errors.push(`Failed to insert: ${newsItem.original_title} — ${articleError.message}`);
          continue;
        }

        await supabase
          .from("curated_news")
          .update({ processed: true, article_id: newArticle.id })
          .eq("id", newsItem.id);

        results.push({
          slug: newArticle.slug,
          title: newArticle.title,
          status: publishStatus,
          imageUrl,
        });
      } catch (e: any) {
        errors.push(`Error processing ${newsItem.id}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        published: results.length,
        status: publishStatus,
        articles: results,
        errors: errors.length ? errors : undefined,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-publish error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});