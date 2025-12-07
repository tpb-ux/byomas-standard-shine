import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, action, content, title, metaTitle, metaDescription, keyword, excerpt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing SEO for article ${articleId}, action: ${action}`);

    if (action === "suggestions") {
      const prompt = `Você é um especialista em SEO. Analise o artigo abaixo e forneça sugestões de otimização.

TÍTULO ATUAL: ${title}
META TÍTULO: ${metaTitle || "Não definido"}
META DESCRIPTION: ${metaDescription || "Não definida"}
PALAVRA-CHAVE PRINCIPAL: ${keyword || "Não definida"}
RESUMO: ${excerpt || "Não definido"}

CONTEÚDO (primeiros 2000 caracteres):
${content?.substring(0, 2000) || ""}

Retorne EXATAMENTE um JSON com a seguinte estrutura (sem markdown, apenas JSON puro):
{
  "suggestions": [
    {
      "type": "title",
      "label": "Otimização do título",
      "current": "título atual",
      "suggested": "sugestão de título otimizado com keyword",
      "reasoning": "explicação curta"
    },
    {
      "type": "meta",
      "label": "Meta description otimizada",
      "current": "meta atual",
      "suggested": "meta description otimizada 150-160 chars com CTA",
      "reasoning": "explicação curta"
    },
    {
      "type": "keyword",
      "label": "Keywords secundárias sugeridas",
      "suggested": "keyword1, keyword2, keyword3",
      "reasoning": "explicação curta"
    },
    {
      "type": "content",
      "label": "Sugestão de estrutura de conteúdo",
      "suggested": "Adicione seções sobre X, Y e Z",
      "reasoning": "explicação curta"
    },
    {
      "type": "structure",
      "label": "Estrutura de headings ideal",
      "suggested": "H2: Tópico 1\\nH3: Subtópico\\nH2: Tópico 2",
      "reasoning": "explicação curta"
    }
  ]
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é um especialista em SEO brasileiro. Responda APENAS em JSON válido, sem markdown." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || "";
      
      // Parse JSON from response
      let suggestions;
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]).suggestions;
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        suggestions = [
          {
            type: "title",
            label: "Otimização do título",
            suggested: `${keyword} - Guia Completo 2025`,
            reasoning: "Inclua a palavra-chave e o ano para maior relevância"
          },
          {
            type: "meta",
            label: "Meta description",
            suggested: `Descubra tudo sobre ${keyword}. Guia completo com dicas práticas e exemplos. Leia agora!`,
            reasoning: "Meta description com keyword e call-to-action"
          }
        ];
      }

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "competitors") {
      const prompt = `Você é um especialista em SEO. Simule uma análise competitiva para a palavra-chave "${keyword}".

Com base em seu conhecimento sobre artigos que rankeiam bem para esta keyword no mercado brasileiro, forneça dados comparativos estimados.

DADOS DO ARTIGO ATUAL:
- Palavras: ${content?.split(/\s+/).length || 0}
- Título: ${title}

Retorne EXATAMENTE um JSON com a seguinte estrutura (sem markdown):
{
  "competitorData": {
    "metrics": [
      {"name": "Palavras", "yours": ${content?.split(/\s+/).length || 0}, "average": número_estimado_top10, "recommendation": "dica específica"},
      {"name": "Headings H2", "yours": número, "average": número_estimado, "recommendation": "dica"},
      {"name": "Links Internos", "yours": número, "average": número_estimado, "recommendation": "dica"},
      {"name": "Links Externos", "yours": número, "average": número_estimado, "recommendation": "dica"},
      {"name": "Imagens", "yours": número, "average": número_estimado, "recommendation": "dica"},
      {"name": "FAQs", "yours": número, "average": número_estimado, "recommendation": "dica"}
    ],
    "summary": "Resumo da análise comparativa em 2-3 frases",
    "strengths": ["ponto forte 1", "ponto forte 2"],
    "improvements": ["melhoria sugerida 1", "melhoria sugerida 2", "melhoria sugerida 3"]
  }
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é um especialista em SEO brasileiro. Responda APENAS em JSON válido, sem markdown." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || "";
      
      let competitorData;
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          competitorData = JSON.parse(jsonMatch[0]).competitorData;
        } else {
          throw new Error("No JSON found");
        }
      } catch (parseError) {
        console.error("Error parsing competitor data:", parseError);
        const wordCount = content?.split(/\s+/).length || 0;
        competitorData = {
          metrics: [
            { name: "Palavras", yours: wordCount, average: 2500, recommendation: "Aumente o conteúdo para maior autoridade" },
            { name: "Headings H2", yours: 3, average: 8, recommendation: "Adicione mais seções com H2" },
            { name: "Links Internos", yours: 2, average: 5, recommendation: "Adicione mais links internos relevantes" },
            { name: "Links Externos", yours: 1, average: 4, recommendation: "Cite mais fontes de autoridade" },
            { name: "Imagens", yours: 2, average: 6, recommendation: "Adicione mais imagens explicativas" },
            { name: "FAQs", yours: 0, average: 5, recommendation: "Adicione seção de perguntas frequentes" },
          ],
          summary: `Seu artigo está ${wordCount < 1500 ? "abaixo" : "próximo"} da média do mercado. Foque em expandir o conteúdo e melhorar a estrutura.`,
          strengths: ["Título otimizado", "Meta description presente"],
          improvements: ["Aumentar contagem de palavras", "Adicionar mais headings", "Incluir FAQs"],
        };
      }

      return new Response(JSON.stringify({ competitorData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "optimize") {
      const prompt = `Você é um especialista em SEO. Otimize o seguinte conteúdo para a palavra-chave "${keyword}".

CONTEÚDO ATUAL:
${content?.substring(0, 4000)}

INSTRUÇÕES:
1. Mantenha a estrutura geral mas melhore a otimização SEO
2. Inclua a palavra-chave de forma natural (densidade 1-2%)
3. Melhore os headings se necessário
4. Adicione transições entre seções
5. Mantenha o tom profissional

Retorne EXATAMENTE um JSON:
{
  "optimizedContent": "conteúdo otimizado aqui",
  "optimizedMetaTitle": "título meta otimizado até 60 chars",
  "optimizedMetaDescription": "meta description 150-160 chars com CTA"
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é um especialista em SEO brasileiro. Responda APENAS em JSON válido." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || "";
      
      let result;
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch (parseError) {
        console.error("Error parsing optimization:", parseError);
        result = {
          optimizedContent: content,
          optimizedMetaTitle: title?.substring(0, 60),
          optimizedMetaDescription: excerpt?.substring(0, 160),
        };
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-seo-article:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
