import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { articleId, processAll } = await req.json();

    // Fetch authority sources
    const { data: authoritySources, error: sourcesError } = await supabase
      .from('authority_sources')
      .select('*')
      .eq('is_active', true)
      .order('trust_score', { ascending: false });

    if (sourcesError) {
      console.error('Error fetching authority sources:', sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${authoritySources?.length || 0} active authority sources`);

    // Fetch articles to process
    let articlesQuery = supabase
      .from('articles')
      .select('id, title, content, main_keyword, category_id')
      .eq('status', 'published');

    if (articleId) {
      articlesQuery = articlesQuery.eq('id', articleId);
    }

    const { data: articles, error: articlesError } = await articlesQuery;

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      throw articlesError;
    }

    console.log(`Processing ${articles?.length || 0} articles`);

    let totalLinksCreated = 0;
    let articlesProcessed = 0;

    for (const article of articles || []) {
      // Check existing external links for this article
      const { data: existingLinks } = await supabase
        .from('external_links')
        .select('url')
        .eq('article_id', article.id);

      const existingUrls = new Set((existingLinks || []).map(l => l.url));

      // Skip if article already has 5+ external links
      if (existingUrls.size >= 5) {
        console.log(`Article ${article.id} already has ${existingUrls.size} external links, skipping`);
        continue;
      }

      // Find relevant authority sources based on article content
      const articleText = `${article.title} ${article.main_keyword || ''} ${article.content}`.toLowerCase();
      const relevantSources: typeof authoritySources = [];

      // Keywords mapping for different categories
      const keywordMappings: Record<string, string[]> = {
        'carbono': ['carbon', 'carbono', 'crédito', 'emissões', 'co2', 'compensação'],
        'esg': ['esg', 'sustentável', 'sustentabilidade', 'governança', 'social', 'ambiental'],
        'blockchain': ['blockchain', 'token', 'tokenização', 'cripto', 'digital', 'smart contract'],
        'energia': ['energia', 'renovável', 'solar', 'eólica', 'limpa', 'green'],
        'financeiro': ['investimento', 'mercado', 'financeiro', 'fundo', 'bond', 'títulos'],
        'regulatório': ['regulação', 'lei', 'norma', 'compliance', 'certificação', 'padrão'],
      };

      // Score sources based on relevance
      for (const source of authoritySources || []) {
        if (existingUrls.has(source.url)) continue;

        let relevanceScore = 0;
        const sourceCategory = source.category?.toLowerCase() || '';
        const sourceName = source.name.toLowerCase();
        const sourceDescription = (source.description || '').toLowerCase();

        // Check keyword matches
        for (const [category, keywords] of Object.entries(keywordMappings)) {
          const categoryMatches = keywords.some(kw => articleText.includes(kw));
          const sourceMatches = keywords.some(kw => 
            sourceName.includes(kw) || 
            sourceDescription.includes(kw) ||
            sourceCategory.includes(kw)
          );

          if (categoryMatches && sourceMatches) {
            relevanceScore += 10;
          }
        }

        // Boost by trust score
        relevanceScore += (source.trust_score || 50) / 10;

        if (relevanceScore > 5) {
          relevantSources.push({ ...source, _relevanceScore: relevanceScore });
        }
      }

      // Sort by relevance and take top 5
      relevantSources.sort((a, b) => (b as any)._relevanceScore - (a as any)._relevanceScore);
      const sourcesToAdd = relevantSources.slice(0, 5 - existingUrls.size);

      if (sourcesToAdd.length === 0) {
        // If no relevant sources, add generic ones
        const genericSources = (authoritySources || [])
          .filter(s => !existingUrls.has(s.url))
          .slice(0, 3 - existingUrls.size);
        sourcesToAdd.push(...genericSources);
      }

      // Create external links
      const linksToInsert = sourcesToAdd.map(source => ({
        article_id: article.id,
        url: source.url,
        domain: source.domain,
        anchor_text: source.name,
      }));

      if (linksToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('external_links')
          .insert(linksToInsert);

        if (insertError) {
          console.error(`Error inserting links for article ${article.id}:`, insertError);
        } else {
          totalLinksCreated += linksToInsert.length;
          articlesProcessed++;
          console.log(`Added ${linksToInsert.length} external links to article: ${article.title}`);

          // Update usage count for sources
          for (const source of sourcesToAdd) {
            await supabase
              .from('authority_sources')
              .update({ usage_count: (source.usage_count || 0) + 1 })
              .eq('id', source.id);
          }
        }
      }
    }

    console.log(`Process complete: ${articlesProcessed} articles processed, ${totalLinksCreated} links created`);

    return new Response(
      JSON.stringify({
        success: true,
        articlesProcessed,
        totalLinksCreated,
        message: `Processed ${articlesProcessed} articles and created ${totalLinksCreated} external links`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in process-external-links:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
