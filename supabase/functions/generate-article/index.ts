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
  suggestedTags: string[];
}

// Helper function to find matching tags based on content
function findMatchingTags(
  content: string,
  title: string,
  mainKeyword: string,
  tags: Array<{ id: string; name: string; slug: string }>
): Array<{ id: string; name: string }> {
  const textToAnalyze = `${title} ${mainKeyword} ${content}`.toLowerCase();
  const matchedTags: Array<{ id: string; name: string }> = [];

  for (const tag of tags) {
    const tagName = tag.name.toLowerCase();
    // Check if tag name appears in the content
    if (textToAnalyze.includes(tagName)) {
      matchedTags.push({ id: tag.id, name: tag.name });
    }
  }

  // Return max 5 tags
  return matchedTags.slice(0, 5);
}

type SectionType = 'full' | 'title' | 'excerpt' | 'content' | 'meta';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

function getSectionPrompt(section: SectionType, keyword: string, context?: { title?: string; content?: string; excerpt?: string }): { system: string; user: string } {
  const baseContext = `Você é um especialista em SEO e jornalismo especializado em mercado de crédito de carbono, sustentabilidade, ESG, finanças verdes, tokenização e economia regenerativa (ReFi) para o blog "Byoma Research".`;

  switch (section) {
    case 'title':
      return {
        system: `${baseContext}
TAREFA: Gerar apenas um título H1 otimizado para SEO.
REGRAS:
- Máximo 60 caracteres
- Incluir a palavra-chave principal naturalmente
- Ser atrativo e descritivo
- Gerar também um slug URL-friendly

FORMATO DE RESPOSTA (JSON apenas):
{"title": "Título Otimizado", "slug": "slug-url-friendly"}`,
        user: `Gere um título SEO-otimizado para um artigo sobre: ${keyword}
${context?.content ? `\nCONTEXTO DO ARTIGO:\n${context.content.substring(0, 500)}...` : ''}`
      };

    case 'excerpt':
      return {
        system: `${baseContext}
TAREFA: Gerar apenas um resumo/excerpt otimizado.
REGRAS:
- Máximo 300 caracteres
- Resumir o conteúdo de forma atrativa
- Incluir a palavra-chave naturalmente
- Despertar curiosidade para leitura

FORMATO DE RESPOSTA (JSON apenas):
{"excerpt": "Resumo atrativo do artigo..."}`,
        user: `Gere um resumo atrativo para um artigo sobre: ${keyword}
${context?.title ? `\nTÍTULO: ${context.title}` : ''}
${context?.content ? `\nCONTEÚDO:\n${context.content.substring(0, 800)}...` : ''}`
      };

    case 'content':
      return {
        system: `${baseContext}
TAREFA: Gerar apenas o corpo do artigo em HTML otimizado para SEO 85+.
REGRAS OBRIGATÓRIAS PARA SEO 85+:
- MÍNIMO 1200 palavras, ideal 1500+ palavras
- Usar H2 (mínimo 4) e H3 (mínimo 3) para estrutura (NÃO incluir H1)
- Densidade de keyword: 1.5-2.5% (repetir a keyword naturalmente ao longo do texto)
- Conteúdo informativo, aprofundado e bem estruturado
- Incluir listas com bullets, parágrafos curtos (2-3 frases)
- Cada seção H2 deve ter pelo menos 150 palavras
- Incluir dados estatísticos, exemplos práticos e citações de especialistas
- Usar formatação: <strong>, <em>, listas <ul><li>

FORMATO DE RESPOSTA (JSON apenas):
{"content": "<h2>Subtítulo</h2><p>Conteúdo...</p>...", "readingTime": 8}`,
        user: `Gere o corpo do artigo sobre: ${keyword}
${context?.title ? `\nTÍTULO: ${context.title}` : ''}
${context?.excerpt ? `\nRESUMO: ${context.excerpt}` : ''}

IMPORTANTE: O artigo deve ter NO MÍNIMO 1200 palavras para atingir SEO score 85+. Seja completo e aprofundado.`
      };

    case 'meta':
      return {
        system: `${baseContext}
TAREFA: Gerar meta title e meta description para SEO.
REGRAS:
- Meta title: máximo 60 caracteres, incluir keyword
- Meta description: máximo 155 caracteres, incluir keyword naturalmente
- Otimizados para CTR nos resultados de busca

FORMATO DE RESPOSTA (JSON apenas):
{"meta_title": "Título Meta SEO", "meta_description": "Descrição meta para busca..."}`,
        user: `Gere meta tags SEO para um artigo sobre: ${keyword}
${context?.title ? `\nTÍTULO: ${context.title}` : ''}
${context?.excerpt ? `\nRESUMO: ${context.excerpt}` : ''}`
      };

    default:
      return { system: '', user: '' };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId, categoryId, keyword, type, section = 'full', context } = await req.json();

    // Support two modes: from news OR from keyword
    const isKeywordMode = !newsId && keyword;
    const isSectionMode = section !== 'full' && keyword;
    
    if (!newsId && !keyword) {
      return new Response(
        JSON.stringify({ error: "Either newsId or keyword is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECTION MODE: Generate only specific section
    if (isSectionMode) {
      console.log(`Generating section: ${section} for keyword: ${keyword}`);
      
      const { system: sectionSystemPrompt, user: sectionUserPrompt } = getSectionPrompt(
        section as SectionType,
        keyword,
        context
      );

      const sectionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sectionSystemPrompt },
            { role: "user", content: sectionUserPrompt },
          ],
        }),
      });

      if (!sectionResponse.ok) {
        const errorText = await sectionResponse.text();
        console.error("AI section generation failed:", sectionResponse.status, errorText);
        
        if (sectionResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (sectionResponse.status === 402) {
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

      const sectionAiData = await sectionResponse.json();
      const sectionContent = sectionAiData.choices?.[0]?.message?.content;

      if (!sectionContent) {
        return new Response(
          JSON.stringify({ error: "No content generated" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const cleanContent = sectionContent.replace(/```json\n?|\n?```/g, "").trim();
        const sectionData = JSON.parse(cleanContent);
        
        console.log(`Section ${section} generated successfully`);
        
        return new Response(
          JSON.stringify({
            success: true,
            section,
            ...sectionData,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error("Failed to parse section response:", sectionContent);
        return new Response(
          JSON.stringify({ error: "Failed to parse AI response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // FULL ARTICLE MODE (existing logic)
    let newsData = null;

    if (newsId) {
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
      newsData = news;
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

    // Get existing tags for association
    const { data: existingTags } = await supabase
      .from("tags")
      .select("id, name, slug");

    // Get authority sources for external links
    const { data: authoritySources } = await supabase
      .from("authority_sources")
      .select("id, name, url, domain, category")
      .eq("is_active", true)
      .order("trust_score", { ascending: false })
      .limit(10);

    const existingArticlesList = existingArticles?.map(a => `- "${a.title}" (slug: ${a.slug})`).join("\n") || "Nenhum artigo publicado ainda.";
    const tagsList = existingTags?.map(t => t.name).join(", ") || "";
    const authoritySourcesList = authoritySources?.map(s => `- ${s.name}: ${s.url}`).join("\n") || "";

    const systemPrompt = `Você é um especialista em SEO e jornalismo especializado em mercado de crédito de carbono, sustentabilidade, ESG, finanças verdes, tokenização e economia regenerativa (ReFi).

Sua tarefa é criar um artigo completo e ALTAMENTE otimizado para SEO (score 85+) para o blog "Byoma Research".

REGRAS DE SEO OBRIGATÓRIAS PARA SCORE 85+:
1. Título (H1): máximo 60 caracteres, INCLUIR palavra-chave principal no início
2. Meta description: máximo 155 caracteres (ideal 140-155), incluir palavra-chave naturalmente
3. Meta title: máximo 60 caracteres (ideal 50-60), incluir palavra-chave
4. Estrutura: usar MÍNIMO 4 H2 e 3 H3 para organizar o conteúdo
5. Densidade de keyword: 1.5-2.5% (repetir keyword naturalmente 15-25 vezes em 1200 palavras)
6. Conteúdo: MÍNIMO 1200 palavras, ideal 1500+ palavras
7. Links internos: sugerir 5 links para artigos existentes (se disponíveis)
8. Links externos: sugerir 5 links para fontes confiáveis (.gov, .org, publicações renomadas)
9. Incluir: listas com bullets, dados estatísticos, exemplos práticos
10. Cada seção H2 deve ter pelo menos 150 palavras

ARTIGOS EXISTENTES PARA LINKS INTERNOS:
${existingArticlesList}

FONTES AUTORITATIVAS PARA LINKS EXTERNOS:
${authoritySourcesList}

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título otimizado H1 com keyword",
  "slug": "slug-do-artigo",
  "metaTitle": "Meta título para SEO (50-60 chars com keyword)",
  "metaDescription": "Meta description para SEO (140-155 chars com keyword)",
  "excerpt": "Resumo atrativo (max 300 chars)",
  "content": "<h2>Subtítulo</h2><p>Conteúdo extenso...</p>...",
  "mainKeyword": "palavra-chave principal",
  "readingTime": 8,
  "suggestedInternalLinks": [{"anchor": "texto âncora", "targetSlug": "slug-do-artigo"}],
  "suggestedExternalLinks": [{"anchor": "texto âncora", "url": "https://...", "domain": "dominio.com"}],
  "featuredImageAlt": "Descrição da imagem com keyword para acessibilidade"
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem markdown ou texto adicional
- O conteúdo DEVE ter no mínimo 1200 palavras para atingir score 85+
- Repita a keyword de forma natural ao longo do texto para densidade de 1.5-2.5%`;

    // Build user prompt based on mode
    let userPrompt: string;
    
    if (isKeywordMode) {
      userPrompt = `Crie um artigo SEO-otimizado sobre o tema:

PALAVRA-CHAVE PRINCIPAL: ${keyword}

TIPO DE CONTEÚDO: ${type === 'full' ? 'Artigo completo e aprofundado' : 'Artigo informativo'}

CONTEXTO: O blog Byoma Research foca em mercado de crédito de carbono, sustentabilidade, ESG, finanças verdes, tokenização e economia regenerativa (ReFi). Crie um conteúdo original, informativo e bem estruturado sobre o tema fornecido.`;
    } else {
      userPrompt = `Transforme esta notícia em um artigo SEO-otimizado:

TÍTULO ORIGINAL: ${newsData.original_title}

CONTEÚDO/DESCRIÇÃO: ${newsData.original_content || "Sem conteúdo adicional disponível"}

FONTE: ${newsData.news_sources?.name || "Fonte não especificada"} (${newsData.news_sources?.url || ""})

URL ORIGINAL: ${newsData.original_url}`;
    }

    console.log(`Calling Lovable AI to generate article (mode: ${isKeywordMode ? 'keyword' : 'news'})...`);

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
      const cleanContent = aiContent.replace(/```json\n?|\n?```/g, "").trim();
      article = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For keyword mode, just return the generated content without saving
    if (isKeywordMode) {
      console.log("Keyword mode: returning generated content without saving");
      return new Response(
        JSON.stringify({
          success: true,
          title: article.title,
          slug: article.slug || generateSlug(article.title),
          excerpt: article.excerpt,
          content: article.content,
          meta_title: article.metaTitle,
          meta_description: article.metaDescription,
          main_keyword: article.mainKeyword || keyword,
          reading_time: article.readingTime,
          featured_image_alt: article.featuredImageAlt,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mode 1: Save article from news
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
        source_url: newsData.original_url,
        source_name: newsData.news_sources?.name,
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

    // Associate tags based on content analysis
    if (existingTags?.length) {
      const matchedTags = findMatchingTags(
        article.content,
        article.title,
        article.mainKeyword,
        existingTags
      );

      if (matchedTags.length > 0) {
        for (const tag of matchedTags) {
          await supabase.from("article_tags").insert({
            article_id: newArticle.id,
            tag_id: tag.id,
          });
        }
        console.log(`Associated ${matchedTags.length} tags to article`);
      }
    }

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
      console.log(`Added ${article.suggestedExternalLinks.length} external links`);
    }

    // Insert internal links
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
