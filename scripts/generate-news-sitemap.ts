// Generates public/sitemap-news.xml — Google News spec.
// Only articles published in the last 48h, max 1000 entries.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { BASE_URL, SITE_NAME, supabase, xmlEscape, iso } from "./_shared";

async function main() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, published_at, main_keyword, long_tail_keywords")
    .eq("status", "published")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("[news-sitemap] query error:", error);
  }

  const items = (data ?? [])
    .map((a) => {
      const kw = [a.main_keyword, ...(a.long_tail_keywords ?? [])]
        .filter(Boolean)
        .slice(0, 10)
        .join(", ");
      return [
        "  <url>",
        `    <loc>${BASE_URL}/blog/${xmlEscape(a.slug)}</loc>`,
        "    <news:news>",
        "      <news:publication>",
        `        <news:name>${xmlEscape(SITE_NAME)}</news:name>`,
        "        <news:language>pt</news:language>",
        "      </news:publication>",
        `      <news:publication_date>${iso(a.published_at!)}</news:publication_date>`,
        `      <news:title>${xmlEscape(a.title)}</news:title>`,
        kw ? `      <news:keywords>${xmlEscape(kw)}</news:keywords>` : null,
        "    </news:news>",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>
`;

  writeFileSync(resolve("public/sitemap-news.xml"), xml);
  console.log(`sitemap-news.xml written (${(data ?? []).length} entries, 48h window)`);
}

main().catch((err) => {
  console.error("[generate-news-sitemap] failed:", err);
  process.exit(0);
});