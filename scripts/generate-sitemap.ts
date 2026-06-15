// Generates public/sitemap.xml and public/sitemap-index.xml.
// Runs via `predev` and `prebuild`.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { BASE_URL, supabase, xmlEscape } from "./_shared";

interface Entry {
  path: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
}

function toUrl(e: Entry): string {
  return [
    "  <url>",
    `    <loc>${BASE_URL}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  const staticEntries: Entry[] = [
    { path: "/", changefreq: "daily", priority: "1.0", lastmod: today },
    { path: "/blog", changefreq: "daily", priority: "0.9", lastmod: today },
    { path: "/guias", changefreq: "weekly", priority: "0.9", lastmod: today },
    { path: "/glossario", changefreq: "weekly", priority: "0.8", lastmod: today },
    { path: "/tags", changefreq: "weekly", priority: "0.6", lastmod: today },
    { path: "/casos-de-sucesso", changefreq: "weekly", priority: "0.8", lastmod: today },
    { path: "/ranking-sustentabilidade", changefreq: "weekly", priority: "0.7", lastmod: today },
    { path: "/calculadora-carbono", changefreq: "monthly", priority: "0.7", lastmod: today },
    { path: "/certificacoes-ambientais", changefreq: "monthly", priority: "0.7", lastmod: today },
    { path: "/educacional", changefreq: "weekly", priority: "0.8", lastmod: today },
    { path: "/educacional/ranking", changefreq: "weekly", priority: "0.6", lastmod: today },
    { path: "/sobre", changefreq: "monthly", priority: "0.5", lastmod: today },
    { path: "/contato", changefreq: "monthly", priority: "0.5", lastmod: today },
    { path: "/equipe-editorial", changefreq: "monthly", priority: "0.6", lastmod: today },
    { path: "/privacidade", changefreq: "yearly", priority: "0.3", lastmod: today },
    { path: "/termos", changefreq: "yearly", priority: "0.3", lastmod: today },
  ];

  const [
    { data: articles },
    { data: pillars },
    { data: terms },
    { data: tags },
    { data: topics },
    { data: categories },
    { data: authors },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000),
    supabase.from("pillar_pages").select("slug, updated_at").eq("status", "published"),
    supabase.from("glossary_terms").select("slug, updated_at"),
    supabase.from("tags").select("slug, created_at"),
    supabase.from("topic_clusters").select("slug, updated_at").eq("is_active", true),
    supabase.from("categories").select("slug, created_at"),
    supabase.from("authors").select("slug, updated_at").eq("is_ai", false),
  ]);

  const dynamic: Entry[] = [
    ...(articles ?? []).map((a) => ({
      path: `/blog/${a.slug}`,
      lastmod: a.updated_at ?? a.published_at ?? today,
      changefreq: "weekly" as const,
      priority: "0.8",
    })),
    ...(pillars ?? []).map((p) => ({
      path: `/guia/${p.slug}`,
      lastmod: p.updated_at ?? today,
      changefreq: "weekly" as const,
      priority: "0.8",
    })),
    ...(terms ?? []).map((t) => ({
      path: `/glossario/${t.slug}`,
      lastmod: t.updated_at ?? today,
      changefreq: "monthly" as const,
      priority: "0.6",
    })),
    ...(tags ?? []).map((t) => ({
      path: `/tag/${t.slug}`,
      lastmod: t.created_at ?? today,
      changefreq: "weekly" as const,
      priority: "0.5",
    })),
    ...(topics ?? []).map((t) => ({
      path: `/topico/${t.slug}`,
      lastmod: t.updated_at ?? today,
      changefreq: "weekly" as const,
      priority: "0.6",
    })),
    ...(categories ?? []).map((c) => ({
      path: `/blog?categoria=${encodeURIComponent(c.slug)}`,
      lastmod: c.created_at ?? today,
      changefreq: "weekly" as const,
      priority: "0.5",
    })),
    ...(authors ?? [])
      .filter((a) => !!a.slug)
      .map((a) => ({
        path: `/autores/${a.slug}`,
        lastmod: a.updated_at ?? today,
        changefreq: "monthly" as const,
        priority: "0.5",
      })),
  ];

  const all = [...staticEntries, ...dynamic].map(toUrl).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all}
</urlset>
`;

  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-news.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

  writeFileSync(resolve("public/sitemap.xml"), sitemap);
  writeFileSync(resolve("public/sitemap-index.xml"), index);
  // eslint-disable-next-line no-console
  console.log(
    `sitemap.xml written (${staticEntries.length + dynamic.length} entries) + sitemap-index.xml`,
  );
  // silence unused
  void xmlEscape;
}

main().catch((err) => {
  console.error("[generate-sitemap] failed:", err);
  process.exit(0); // never block build
});