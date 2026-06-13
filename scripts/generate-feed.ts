// Generates public/feed.xml — RSS 2.0 feed of the 50 most recent articles.

import { writeFileSync } from "fs";
import { resolve } from "path";
import {
  BASE_URL,
  SITE_NAME,
  SITE_LANG,
  supabase,
  xmlEscape,
  cdata,
  rfc822,
} from "./_shared";

async function main() {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "slug, title, excerpt, content, published_at, updated_at, featured_image, featured_image_alt, main_keyword",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) console.error("[feed] query error:", error);

  const buildDate = rfc822(new Date());

  const items = (data ?? [])
    .map((a) => {
      const link = `${BASE_URL}/blog/${a.slug}`;
      const img = a.featured_image
        ? `    <media:content url="${xmlEscape(a.featured_image)}" medium="image">
      <media:title type="plain">${xmlEscape(a.featured_image_alt || a.title)}</media:title>
    </media:content>`
        : "";
      return [
        "  <item>",
        `    <title>${xmlEscape(a.title)}</title>`,
        `    <link>${link}</link>`,
        `    <guid isPermaLink="true">${link}</guid>`,
        `    <pubDate>${rfc822(a.published_at || a.updated_at!)}</pubDate>`,
        `    <description>${cdata(a.excerpt ?? "")}</description>`,
        `    <content:encoded>${cdata(a.content ?? "")}</content:encoded>`,
        a.main_keyword ? `    <category>${xmlEscape(a.main_keyword)}</category>` : null,
        img || null,
        "  </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xmlEscape(SITE_NAME)}</title>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Insights de finanças sustentáveis, mercado de carbono e economia regenerativa.</description>
    <language>${SITE_LANG}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <generator>amazonia-research-feed</generator>
${items}
  </channel>
</rss>
`;

  writeFileSync(resolve("public/feed.xml"), xml);
  console.log(`feed.xml written (${(data ?? []).length} items)`);
}

main().catch((err) => {
  console.error("[generate-feed] failed:", err);
  process.exit(0);
});