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
  suggestedInternalLinks: Array<{ anchor: string; targetSlug: string }>;
  suggestedExternalLinks: Array<{ anchor: string; url: string; domain: string }>;
  featuredImageAlt: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId, categoryId } = await req.json();

    if (!newsId) {
      return new Response(
        JSON.stringify({ error: "newsId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the curated news item
    const { data: news, error: newsError } = await supabase
      .from("curated_news")
      .select(`
        *,
        news_sources (name, url)
      `)
      .eq("id", newsId)
      .single();

    if (newsError || !news) {
      console.error("Error fetching news:", newsError);
      return new Response(
        JSON.stringify({ error: "News item not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing articles for internal link suggestions
    const { data: existingArticles } = await supabase
      .from("articles")
      .select("id, title, slug")
      .eq("status", "published")
      .limit(20);

    // Get AI author
    const { data: aiAuthor } = await supabase
      .from("authors")
      .select("id")
      .eq("is_ai", true)
      .single();

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingArticlesList = existingArticles?.map(a => `- "${a.title}" (slug: ${a.slug})`).join("\n") || "Nenhum artigo publicado ainda.";

    const systemPrompt = `Você é um especialista em SEO e jornalismo especializado em mercado de crédito de carbono, sustentabilidade, ESG, finanças verdes, tokenização e economia regenerativa (ReFi).

Sua tarefa é transformar uma notícia curada em um artigo completo e otimizado para SEO para o blog "Byoma Research".

REGRAS DE SEO OBRIGATÓRIAS:
1. Título (H1): máximo 60 caracteres, incluir palavra-chave principal
2. Meta description: máximo 155 caracteres, incluir palavra-chave naturalmente
3. Estrutura: usar H2 e H3 para organizar o conteúdo
4. Densidade de keyword: 1-2% (natural, sem keyword stuffing)
5. Conteúdo: mínimo 800 palavras, máximo 1500 palavras
6. Links internos: sugerir 5 links para artigos existentes
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
  "suggestedInternalLinks": [{"anchor": "texto âncora", "targetSlug": "slug-do-artigo"}],
  "suggestedExternalLinks": [{"anchor": "texto âncora", "url": "https://...", "domain": "dominio.com"}],
  "featuredImageAlt": "Descrição da imagem para acessibilidade"
}

IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto adicional.`;

    const userPrompt = `Transforme esta notícia em um artigo SEO-otimizado:

TÍTULO ORIGINAL: ${news.original_title}

CONTEÚDO/DESCRIÇÃO: ${news.original_content || "Sem conteúdo adicional disponível"}

FONTE: ${news.news_sources?.name || "Fonte não especificada"} (${news.news_sources?.url || ""})

URL ORIGINAL: ${news.original_url}`;

    console.log("Calling Lovable AI to generate article...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
      const errorText = await response.text();
      console.error("AI generation failed:", response.status, errorText);
      
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
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error("No content from AI");
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    let article: GeneratedArticle;
    try {
      // Remove possible markdown code blocks
      const cleanContent = aiContent.replace(/```json\n?|\n?```/g, "").trim();
      article = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure slug is unique
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

    // Insert the article
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
        featured_image_alt: article.featuredImageAlt,
        status: "draft",
        ai_generated: true,
        is_curated: true,
        author_id: aiAuthor?.id,
        category_id: categoryId || null,
        source_url: news.original_url,
        source_name: news.news_sources?.name,
      })
      .select()
      .single();

    if (articleError) {
      console.error("Error inserting article:", articleError);
      return new Response(
        JSON.stringify({ error: "Failed to save article" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Article created: ${newArticle.id}`);

    // Insert external links
    if (article.suggestedExternalLinks?.length) {
      for (const link of article.suggestedExternalLinks) {
        await supabase.from("external_links").insert({
          article_id: newArticle.id,
          anchor_text: link.anchor,
          url: link.url,
          domain: link.domain,
        });
      }
    }

    // Insert internal links (only if target articles exist)
    if (article.suggestedInternalLinks?.length && existingArticles?.length) {
      for (const link of article.suggestedInternalLinks) {
        const targetArticle = existingArticles.find(a => a.slug === link.targetSlug);
        if (targetArticle) {
          await supabase.from("internal_links").insert({
            source_article_id: newArticle.id,
            target_article_id: targetArticle.id,
            anchor_text: link.anchor,
          });
        }
      }
    }

    // Mark curated news as processed
    await supabase
      .from("curated_news")
      .update({ processed: true, article_id: newArticle.id })
      .eq("id", newsId);

    console.log(`News ${newsId} marked as processed`);

    return new Response(
      JSON.stringify({
        success: true,
        articleId: newArticle.id,
        slug: finalSlug,
        message: "Artigo gerado com sucesso",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-article:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
