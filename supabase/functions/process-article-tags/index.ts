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
    const { articleId, processAll, useAI } = await req.json();

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

    console.log(`Processing ${articles.length} articles for tag association (useAI: ${useAI})`);

    let totalAssociations = 0;
    const results: Array<{ articleId: string; title: string; tagsAdded: string[] }> = [];

    for (const article of articles) {
      let matchingTags: Array<{ id: string; name: string }> = [];

      if (useAI) {
        // Use AI for semantic analysis
        matchingTags = await analyzeWithAI(article, tags);
      } else {
        // Simple keyword matching
        matchingTags = simpleKeywordMatch(article, tags);
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
        method: useAI ? "ai" : "keyword",
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

// Simple keyword matching function
function simpleKeywordMatch(
  article: { title: string; content: string; main_keyword: string | null; excerpt: string | null },
  tags: Array<{ id: string; name: string; slug: string }>
): Array<{ id: string; name: string }> {
  const textToAnalyze = `${article.title} ${article.main_keyword || ""} ${article.excerpt || ""} ${article.content}`.toLowerCase();
  const matchingTags: Array<{ id: string; name: string }> = [];

  for (const tag of tags) {
    const tagName = tag.name.toLowerCase();
    if (
      textToAnalyze.includes(tagName) ||
      textToAnalyze.includes(tagName.replace(/\s+/g, "-")) ||
      textToAnalyze.includes(tagName.replace(/\s+/g, ""))
    ) {
      matchingTags.push({ id: tag.id, name: tag.name });
    }
  }

  return matchingTags;
}

// AI-powered semantic analysis function
async function analyzeWithAI(
  article: { title: string; content: string; main_keyword: string | null; excerpt: string | null },
  tags: Array<{ id: string; name: string; slug: string }>
): Promise<Array<{ id: string; name: string }>> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured, falling back to keyword matching");
    return simpleKeywordMatch(article, tags);
  }

  const tagsList = tags.map(t => t.name).join(", ");
  
  // Truncate content to avoid token limits
  const contentSummary = article.content.substring(0, 2000);

  const prompt = `Você é um especialista em categorização de conteúdo sobre mercado financeiro sustentável, crédito de carbono, ESG e economia verde.

Analise o seguinte artigo e selecione as 3-5 tags MAIS RELEVANTES da lista fornecida. Considere:
- O tema principal do artigo
- Conceitos mencionados ou implícitos
- Relações semânticas (ex: "Verra" relaciona-se com "Verificação de Carbono")
- Contexto do mercado de sustentabilidade

TAGS DISPONÍVEIS:
${tagsList}

ARTIGO:
Título: ${article.title}
Palavra-chave principal: ${article.main_keyword || "Não especificada"}
Resumo: ${article.excerpt || "Não disponível"}
Conteúdo (início): ${contentSummary}

INSTRUÇÕES:
- Retorne APENAS os nomes EXATOS das tags selecionadas, separados por vírgula
- Não adicione explicações ou comentários
- Selecione no mínimo 3 e no máximo 5 tags
- Use os nomes exatamente como aparecem na lista

RESPOSTA:`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return simpleKeywordMatch(article, tags);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim() || "";
    
    console.log(`AI response for "${article.title}": ${aiResponse}`);

    // Parse AI response and match to actual tags
    const suggestedTagNames = aiResponse
      .split(",")
      .map((name: string) => name.trim().toLowerCase())
      .filter((name: string) => name.length > 0);

    const matchingTags: Array<{ id: string; name: string }> = [];
    
    for (const suggestedName of suggestedTagNames) {
      const matchedTag = tags.find(t => 
        t.name.toLowerCase() === suggestedName ||
        t.name.toLowerCase().includes(suggestedName) ||
        suggestedName.includes(t.name.toLowerCase())
      );
      
      if (matchedTag && !matchingTags.some(mt => mt.id === matchedTag.id)) {
        matchingTags.push({ id: matchedTag.id, name: matchedTag.name });
      }
    }

    // If AI returned no valid tags, fall back to keyword matching
    if (matchingTags.length === 0) {
      console.log(`AI returned no valid tags for "${article.title}", falling back to keyword matching`);
      return simpleKeywordMatch(article, tags);
    }

    return matchingTags;
  } catch (error) {
    console.error("Error calling AI API:", error);
    return simpleKeywordMatch(article, tags);
  }
}
