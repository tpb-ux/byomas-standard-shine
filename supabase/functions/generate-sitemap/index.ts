import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

const BASE_URL = "https://byomaresearch.com"; // Atualizar com domínio real

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Generating sitemap...");

    // Buscar artigos publicados
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
      throw articlesError;
    }

    // Buscar categorias
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, created_at");

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      throw categoriesError;
    }

    // Data atual para páginas estáticas
    const today = new Date().toISOString().split("T")[0];

    // Gerar XML do sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Páginas Estáticas -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;

    // Adicionar artigos
    if (articles && articles.length > 0) {
      xml += `  <!-- Artigos -->\n`;
      for (const article of articles) {
        const lastmod = article.updated_at || article.published_at || today;
        const formattedDate = new Date(lastmod).toISOString().split("T")[0];
        xml += `  <url>
    <loc>${BASE_URL}/blog/${article.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // Adicionar categorias
    if (categories && categories.length > 0) {
      xml += `  <!-- Categorias -->\n`;
      for (const category of categories) {
        const formattedDate = category.created_at 
          ? new Date(category.created_at).toISOString().split("T")[0] 
          : today;
        xml += `  <url>
    <loc>${BASE_URL}/blog?category=${category.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    console.log(`Sitemap generated with ${articles?.length || 0} articles and ${categories?.length || 0} categories`);

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }
});
