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
  image?: string;
}

// Deterministic, AI-free scoring signals
const TRENDING_KEYWORDS = [
  "COP30","COP31","CBAM","EUDR","carbono","carbon","ESG","verde","sustent",
  "clima","climate","net zero","tokeniz","ReFi","green bond","título verde",
  "biodiversidade","desmatamento","floresta","REDD","crédito de carbono",
  "transição energética","hidrogênio verde","mercado regulado","Verra","Gold Standard"
];

const TRUSTED_SOURCES = [
  "Carbon Pulse","Climate Home","Reuters","Bloomberg","Valor","Estadão",
  "BNDES","CVM","Mongabay","Carbon Brief","Environmental Finance","GreenBiz"
];

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function pickTag(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  if (!m) return undefined;
  return decodeEntities(stripCdata(m[1])).trim();
}

function pickAttr(xml: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"`, "i");
  const m = xml.match(re);
  return m?.[1];
}

async function parseRSS(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      console.log(`Failed to fetch RSS from ${url}: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const items: RSSItem[] = [];
    const isAtom = /<feed[\s>]/i.test(text) && !/<rss[\s>]/i.test(text);
    const itemTag = isAtom ? "entry" : "item";
    const itemMatches = text.match(new RegExp(`<${itemTag}[^>]*>[\\s\\S]*?<\\/${itemTag}>`, "gi")) || [];

    for (const itemXml of itemMatches.slice(0, 15)) {
      const title = pickTag(itemXml, "title");
      let link: string | undefined;
      if (isAtom) {
        link = pickAttr(itemXml, "link", "href") || pickTag(itemXml, "id");
      } else {
        link = pickTag(itemXml, "link");
      }
      const description =
        pickTag(itemXml, "content:encoded") ||
        pickTag(itemXml, "description") ||
        pickTag(itemXml, "summary") ||
        pickTag(itemXml, "content");
      const pubDate = pickTag(itemXml, "pubDate") || pickTag(itemXml, "published") || pickTag(itemXml, "updated");
      const image =
        pickAttr(itemXml, "media:content", "url") ||
        pickAttr(itemXml, "media:thumbnail", "url") ||
        pickAttr(itemXml, "enclosure", "url") ||
        (description ? description.match(/<img[^>]+src="([^"]+)"/i)?.[1] : undefined);

      if (title && link) {
        items.push({ title, link, description, pubDate, image });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error parsing RSS from ${url}:`, error);
    return [];
  }
}

async function getRecentKeywords(supabase: any): Promise<string[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { data } = await supabase
      .from("articles")
      .select("main_keyword")
      .gte("published_at", yesterday.toISOString())
      .eq("status", "published");
    return (data || []).map((a: any) => a.main_keyword?.toLowerCase()).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Deterministic engagement scoring — NO AI.
 * Inputs: title, description, source name + trust score, recent keywords.
 * Output: integer score 0-100 + isTrending flag.
 */
function scoreEngagement(
  title: string,
  description: string,
  sourceName: string,
  sourceTrustScore: number,
  hasImage: boolean,
  pubDate: string | undefined,
  recentKeywords: string[]
): { score: number; isTrending: boolean } {
  let score = 40;
  let isTrending = false;
  const text = `${title} ${description}`.toLowerCase();

  // Trending keyword boost (max +20)
  let kwHits = 0;
  for (const kw of TRENDING_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      kwHits++;
      isTrending = true;
    }
  }
  score += Math.min(kwHits * 5, 20);

  // Trusted source boost (+0..10)
  const matchedTrusted = TRUSTED_SOURCES.some(s => sourceName.toLowerCase().includes(s.toLowerCase()));
  if (matchedTrusted) score += 6;
  score += Math.round(((sourceTrustScore || 50) - 50) / 10); // -5..+5 around 50

  // Has image (+5)
  if (hasImage) score += 5;

  // Freshness (+0..10)
  if (pubDate) {
    const ageHours = (Date.now() - new Date(pubDate).getTime()) / 3_600_000;
    if (!isNaN(ageHours)) {
      if (ageHours <= 6) score += 10;
      else if (ageHours <= 24) score += 6;
      else if (ageHours <= 72) score += 2;
    }
  }

  // Novelty: penalize if matches recently published keyword (-8), boost if novel (+5)
  let saturated = false;
  for (const kw of recentKeywords) {
    if (kw && text.includes(kw)) { saturated = true; break; }
  }
  score += saturated ? -8 : 5;

  // Title quality heuristic (length sweet-spot 35..90 chars)
  if (title.length >= 35 && title.length <= 90) score += 4;

  return { score: Math.min(100, Math.max(0, Math.round(score))), isTrending };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const recentKeywords = await getRecentKeywords(supabase);
    console.log(`Found ${recentKeywords.length} recent keywords for novelty check`);

    const { data: sources, error: sourcesError } = await supabase
      .from("news_sources")
      .select("id, name, url, rss_feed, trust_score")
      .eq("is_active", true)
      .not("rss_feed", "is", null);

    if (sourcesError) throw sourcesError;
    console.log(`Found ${sources?.length || 0} active sources with RSS feeds`);

    let totalFetched = 0;
    let totalNew = 0;
    let totalTrending = 0;

    for (const source of sources || []) {
      if (!source.rss_feed) continue;
      console.log(`Fetching ${source.name}: ${source.rss_feed}`);
      const items = await parseRSS(source.rss_feed);

      // Build batch payload — relies on unique index + ON CONFLICT DO NOTHING
      const rows = items.map((item) => {
        const { score, isTrending } = scoreEngagement(
          item.title,
          item.description || "",
          source.name,
          source.trust_score ?? 50,
          !!item.image,
          item.pubDate,
          recentKeywords
        );
        if (isTrending) totalTrending++;
        totalFetched++;
        return {
          original_title: item.title.substring(0, 500),
          original_url: item.link,
          original_content: item.description?.substring(0, 8000) || null,
          source_id: source.id,
          engagement_potential: score,
          processed: false,
        };
      });

      if (rows.length > 0) {
        // upsert with ignore-duplicates strategy on original_url
        const { data: inserted, error: insertError } = await supabase
          .from("curated_news")
          .upsert(rows, { onConflict: "original_url", ignoreDuplicates: true })
          .select("id");
        if (insertError) {
          console.error(`Insert error for ${source.name}:`, insertError.message);
        } else {
          totalNew += inserted?.length || 0;
        }
      }

      await supabase
        .from("news_sources")
        .update({ last_fetched_at: new Date().toISOString() })
        .eq("id", source.id);
    }

    console.log(`Fetch complete: ${totalNew} new / ${totalFetched} total (${totalTrending} trending)`);

    return new Response(
      JSON.stringify({
        success: true,
        totalFetched,
        totalNew,
        totalTrending,
        message: `${totalNew} novas notícias de ${sources?.length || 0} fontes (${totalTrending} trending)`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-news:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});