import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratedArticle {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  mainKeyword: string;
  readingTime: number;
  featuredImageAlt: string;
}

interface AutomationSettings {
  articles_per_execution: number;
  daily_target: number;
  image_fallback_enabled: boolean;
  trending_boost_enabled: boolean;
}

// Default fallback images (Unsplash with free license)
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

async function getSettings(supabase: any): Promise<AutomationSettings> {
  const { data } = await supabase
    .from("automation_settings")
    .select("key, value");

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
        case "articles_per_execution":
          settings.articles_per_execution = parseInt(value, 10) || 3;
          break;
        case "daily_target":
          settings.daily_target = parseInt(value, 10) || 15;
          break;
        case "image_fallback_enabled":
          settings.image_fallback_enabled = value === "true" || value === true;
          break;
        case "trending_boost_enabled":
          settings.trending_boost_enabled = value === "true" || value === true;
          break;
      }
    }
  }

  return settings;
}

async function getFallbackImage(supabase: any, keyword: string): Promise<string> {
  try {
    // Try to get a category-specific fallback image
    const categoryMap: Record<string, string> = {
      "carbono": "carbon",
      "carbon": "carbon",
      "floresta": "forest",
      "forest": "forest",
      "energia": "energy",
      "energy": "energy",
      "solar": "energy",
      "eólica": "wind",
      "wind": "wind",
      "cidade": "urban",
      "urban": "urban",
      "finance": "finance",
      "financ": "finance",
      "investimento": "finance",
    };

    let category = "general";
    const lowerKeyword = keyword.toLowerCase();
    for (const [term, cat] of Object.entries(categoryMap)) {
      if (lowerKeyword.includes(term)) {
        category = cat;
        break;
      }
    }

    // Try to get from database
    const { data: fallbackImages } = await supabase
      .from("fallback_images")
      .select("url")
      .eq("category", category)
      .order("usage_count", { ascending: true })
      .limit(1);

    if (fallbackImages && fallbackImages.length > 0) {
      // Update usage count
      await supabase.rpc("increment_usage", { image_url: fallbackImages[0].url }).catch(() => {});
      return fallbackImages[0].url;
    }

    // Try general category
    const { data: generalImages } = await supabase
      .from("fallback_images")
      .select("url")
      .eq("category", "general")
      .order("usage_count", { ascending: true })
      .limit(1);

    if (generalImages && generalImages.length > 0) {
      return generalImages[0].url;
    }
  } catch (error) {
    console.log("Error fetching fallback from DB, using defaults:", error);
  }

  // Return random default fallback
  return DEFAULT_FALLBACK_IMAGES[Math.floor(Math.random() * DEFAULT_FALLBACK_IMAGES.length)];
}

async function generateImage(keyword: string, title: string, apiKey: string): Promise<{ base64: string; contentType: string } | null> {
  try {
    console.log(`Generating image for: ${keyword}`);
    
    const prompt = `Create a professional, modern blog header image for an article about: "${keyword}". 
    Context: ${title}
    Style: Corporate sustainability, green finance, eco-friendly technology, carbon credits market.
    Visual elements: Abstract nature patterns, digital circuits merging with leaves, sustainable city skylines, or renewable energy visualizations.
    Colors: Teal (#14b8a6), charcoal gray (#36454F), white accents, subtle green gradients.
    Mood: Professional, trustworthy, innovative, environmentally conscious.
    No text overlay. High quality, 16:9 aspect ratio, suitable for blog header.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl || !imageUrl.startsWith("data:image")) {
      console.error("No valid image in response");
      return null;
    }

    // Parse base64 data URL
    const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      console.error("Invalid image data URL format");
      return null;
    }

    return {
      contentType: matches[1],
      base64: matches[2],
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

async function uploadImageToStorage(
  supabase: any,
  imageData: { base64: string; contentType: string },
  articleSlug: string
): Promise<string | null> {
  try {
    // Convert base64 to Uint8Array
    const binaryString = atob(imageData.base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const extension = imageData.contentType.split("/")[1] || "png";
    const fileName = `${articleSlug}-${Date.now()}.${extension}`;

    const { data, error } = await supabase.storage
      .from("article-images")
      .upload(fileName, bytes, {
        contentType: imageData.contentType,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    console.log(`Image uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

async function getArticleImage(
  supabase: any,
  keyword: string,
  title: string,
  slug: string,
  apiKey: string,
  fallbackEnabled: boolean
): Promise<{ url: string | null; isGenerated: boolean }> {
  // 1. Try to generate with AI
  const imageData = await generateImage(keyword, title, apiKey);
  
  if (imageData) {
    const uploadedUrl = await uploadImageToStorage(supabase, imageData, slug);
    if (uploadedUrl) {
      return { url: uploadedUrl, isGenerated: true };
    }
  }

  // 2. If AI failed and fallback is enabled, use fallback
  if (fallbackEnabled) {
    console.log("AI image failed, using fallback image");
    const fallbackUrl = await getFallbackImage(supabase, keyword);
    return { url: fallbackUrl, isGenerated: false };
  }

  return { url: null, isGenerated: false };
}

async function generateArticleContent(
  newsItem: { original_title: string; original_content: string | null; original_url: string; news_sources?: { name: string; url: string } | null },
  existingArticlesList: string,
  apiKey: string
): Promise<GeneratedArticle | null> {
  const systemPrompt = `Você é um especialista em SEO e jornalismo especializado em mercado de crédito de carbono, sustentabilidade, ESG, finanças verdes, tokenização e economia regenerativa (ReFi).

Sua tarefa é criar um artigo completo e otimizado para SEO para o blog "Byoma Research".

REGRAS DE SEO OBRIGATÓRIAS:
1. Título (H1): máximo 60 caracteres, incluir palavra-chave principal
2. Meta description: máximo 155 caracteres, incluir palavra-chave naturalmente
3. Estrutura: usar H2 e H3 para organizar o conteúdo
4. Densidade de keyword: 1-2% (natural, sem keyword stuffing)
5. Conteúdo: mínimo 800 palavras, máximo 1500 palavras
6. Links internos: sugerir 5 links para artigos existentes (se disponíveis)
7. Links externos: sugerir 5 links para fontes confiáveis (domínios .gov, .org, grandes publicações)

ARTIGOS EXISTENTES PARA LINKS INTERNOS:
${existingArticlesList}

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título otimizado H1",
  "slug": "slug-do-artigo",
  "metaTitle": "Meta título para SEO (max 60 chars)",
  "metaDescription": "Meta description para SEO (max 155 chars)",
  "excerpt": "Resumo atrativo (max 300 chars)",
  "content": "<h2>Subtítulo</h2><p>Conteúdo...</p>...",
  "mainKeyword": "palavra-chave principal",
  "readingTime": 5,
  "featuredImageAlt": "Descrição da imagem para acessibilidade"
}

IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto adicional.`;

  const userPrompt = `Transforme esta notícia em um artigo SEO-otimizado:

TÍTULO ORIGINAL: ${newsItem.original_title}

CONTEÚDO/DESCRIÇÃO: ${newsItem.original_content || "Sem conteúdo adicional disponível"}

FONTE: ${newsItem.news_sources?.name || "Fonte não especificada"} (${newsItem.news_sources?.url || ""})

URL ORIGINAL: ${newsItem.original_url}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Article generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return null;
    }

    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Error generating article:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get automation settings
    const settings = await getSettings(supabase);
    console.log("Automation settings:", settings);

    // Parse request body for optional parameters
    let articlesToPublish = settings.articles_per_execution;
    let isTestMode = false;
    
    try {
      const body = await req.json();
      if (body.count) articlesToPublish = Math.min(body.count, 10);
      if (body.test) isTestMode = true;
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log(`Auto-publish starting: targeting ${articlesToPublish} articles${isTestMode ? " (TEST MODE)" : ""}`);

    // 1. Get unprocessed news with highest engagement potential
    let query = supabase
      .from("curated_news")
      .select(`
        *,
        news_sources (name, url)
      `)
      .eq("processed", false)
      .order("engagement_potential", { ascending: false })
      .limit(articlesToPublish);

    // If trending boost is enabled, filter for higher engagement items
    if (settings.trending_boost_enabled) {
      query = query.gte("engagement_potential", 50);
    }

    const { data: newsItems, error: newsError } = await query;

    if (newsError) {
      console.error("Error fetching news:", newsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch news items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no high-engagement news and trending boost is on, get any available
    let finalNewsItems = newsItems || [];
    if (finalNewsItems.length === 0 && settings.trending_boost_enabled) {
      const { data: anyNews } = await supabase
        .from("curated_news")
        .select(`*, news_sources (name, url)`)
        .eq("processed", false)
        .order("engagement_potential", { ascending: false })
        .limit(articlesToPublish);
      finalNewsItems = anyNews || [];
    }

    if (!finalNewsItems || finalNewsItems.length === 0) {
      console.log("No unprocessed news items available");
      return new Response(
        JSON.stringify({ message: "No news items to process", published: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${finalNewsItems.length} news items to process`);

    // 2. Get existing articles for internal linking
    const { data: existingArticles } = await supabase
      .from("articles")
      .select("id, title, slug")
      .eq("status", "published")
      .limit(20);

    const existingArticlesList = existingArticles?.map(a => `- "${a.title}" (slug: ${a.slug})`).join("\n") || "Nenhum artigo publicado ainda.";

    // 3. Get AI author
    const { data: aiAuthor } = await supabase
      .from("authors")
      .select("id")
      .eq("is_ai", true)
      .single();

    const publishedArticles: Array<{ slug: string; title: string; imageGenerated: boolean; imageUrl: string | null }> = [];
    const errors: string[] = [];

    // 4. Process each news item
    for (const newsItem of finalNewsItems) {
      try {
        console.log(`Processing: ${newsItem.original_title}`);

        // Generate article content
        const article = await generateArticleContent(newsItem, existingArticlesList, LOVABLE_API_KEY);
        
        if (!article) {
          errors.push(`Failed to generate article for: ${newsItem.original_title}`);
          continue;
        }

        // Generate unique slug
        const baseSlug = article.slug || generateSlug(article.title);
        let finalSlug = baseSlug;
        let slugCounter = 1;

        while (true) {
          const { data: existingSlug } = await supabase
            .from("articles")
            .select("id")
            .eq("slug", finalSlug)
            .single();

          if (!existingSlug) break;
          finalSlug = `${baseSlug}-${slugCounter}`;
          slugCounter++;
        }

        // Get image (with fallback support)
        const imageResult = await getArticleImage(
          supabase,
          article.mainKeyword,
          article.title,
          finalSlug,
          LOVABLE_API_KEY,
          settings.image_fallback_enabled
        );

        // Insert article as published
        const { data: newArticle, error: articleError } = await supabase
          .from("articles")
          .insert({
            title: article.title,
            slug: finalSlug,
            meta_title: article.metaTitle,
            meta_description: article.metaDescription,
            excerpt: article.excerpt,
            content: article.content,
            main_keyword: article.mainKeyword,
            reading_time: article.readingTime || 5,
            featured_image: imageResult.url,
            featured_image_alt: article.featuredImageAlt,
            status: "published",
            published_at: new Date().toISOString(),
            ai_generated: true,
            is_curated: true,
            author_id: aiAuthor?.id,
            source_url: newsItem.original_url,
            source_name: newsItem.news_sources?.name,
          })
          .select()
          .single();

        if (articleError) {
          console.error("Error inserting article:", articleError);
          errors.push(`Failed to save article: ${article.title}`);
          continue;
        }

        // Mark news as processed
        await supabase
          .from("curated_news")
          .update({ processed: true, article_id: newArticle.id })
          .eq("id", newsItem.id);

        publishedArticles.push({
          slug: newArticle.slug,
          title: newArticle.title,
          imageGenerated: imageResult.isGenerated,
          imageUrl: imageResult.url,
        });
        console.log(`Published: ${newArticle.title} (${newArticle.slug}) - Image: ${imageResult.isGenerated ? "AI Generated" : "Fallback"}`);

        // Small delay between articles to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing news ${newsItem.id}:`, error);
        errors.push(`Error processing: ${newsItem.original_title}`);
      }
    }

    // 5. Log automation run
    console.log(`Auto-publish complete: ${publishedArticles.length} published, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        published: publishedArticles.length,
        articles: publishedArticles,
        settings: {
          fallbackEnabled: settings.image_fallback_enabled,
          trendingBoostEnabled: settings.trending_boost_enabled,
        },
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-publish error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
