import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

async function parseRSS(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Byoma Research Bot/1.0" },
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch RSS from ${url}: ${response.status}`);
      return [];
    }
    
    const text = await response.text();
    const items: RSSItem[] = [];
    
    // Simple RSS parsing
    const itemMatches = text.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    for (const itemXml of itemMatches.slice(0, 10)) { // Limit to 10 items per source
      const title = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
      const link = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim();
      const description = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim();
      const pubDate = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
      
      if (title && link) {
        items.push({ title, link, description, pubDate });
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error parsing RSS from ${url}:`, error);
    return [];
  }
}

async function analyzeEngagement(title: string, description: string): Promise<number> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    // Return default score if no API key
    return 50;
  }
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um analista de engajamento de conteúdo especializado em mercado de crédito de carbono, sustentabilidade, ESG e finanças verdes.
Analise o título e descrição da notícia e retorne APENAS um número de 0 a 100 representando o potencial de engajamento.

Critérios:
- Relevância para o público brasileiro interessado em sustentabilidade (peso 30%)
- Atualidade e urgência do tema (peso 25%)
- Potencial viral/compartilhamento (peso 20%)
- Valor educacional/informativo (peso 15%)
- Conexão com tendências de mercado (peso 10%)

Responda APENAS com o número, sem texto adicional.`,
          },
          {
            role: "user",
            content: `Título: ${title}\n\nDescrição: ${description || "Sem descrição"}`,
          },
        ],
      }),
    });
    
    if (!response.ok) {
      console.error("AI engagement analysis failed:", response.status);
      return 50;
    }
    
    const data = await response.json();
    const scoreText = data.choices?.[0]?.message?.content?.trim();
    const score = parseInt(scoreText, 10);
    
    return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error("Error analyzing engagement:", error);
    return 50;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active news sources
    const { data: sources, error: sourcesError } = await supabase
      .from("news_sources")
      .select("*")
      .eq("is_active", true)
      .not("rss_feed", "is", null);

    if (sourcesError) {
      console.error("Error fetching sources:", sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active sources with RSS feeds`);

    let totalFetched = 0;
    let totalNew = 0;

    for (const source of sources || []) {
      if (!source.rss_feed) continue;

      console.log(`Fetching from ${source.name}: ${source.rss_feed}`);
      const items = await parseRSS(source.rss_feed);
      console.log(`Found ${items.length} items from ${source.name}`);

      for (const item of items) {
        // Check if already exists
        const { data: existing } = await supabase
          .from("curated_news")
          .select("id")
          .eq("original_url", item.link)
          .single();

        if (existing) {
          console.log(`Skipping duplicate: ${item.title}`);
          continue;
        }

        // Analyze engagement potential
        const engagementScore = await analyzeEngagement(
          item.title,
          item.description || ""
        );

        // Insert new curated news
        const { error: insertError } = await supabase
          .from("curated_news")
          .insert({
            original_title: item.title,
            original_url: item.link,
            original_content: item.description,
            source_id: source.id,
            engagement_potential: engagementScore,
            processed: false,
          });

        if (insertError) {
          console.error(`Error inserting news: ${insertError.message}`);
        } else {
          totalNew++;
          console.log(`Added: ${item.title} (engagement: ${engagementScore})`);
        }

        totalFetched++;
      }

      // Update last_fetched_at
      await supabase
        .from("news_sources")
        .update({ last_fetched_at: new Date().toISOString() })
        .eq("id", source.id);
    }

    console.log(`Fetch complete: ${totalNew} new items out of ${totalFetched} total`);

    return new Response(
      JSON.stringify({
        success: true,
        totalFetched,
        totalNew,
        message: `Encontradas ${totalNew} novas notícias de ${sources?.length || 0} fontes`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in fetch-news:", error);
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
