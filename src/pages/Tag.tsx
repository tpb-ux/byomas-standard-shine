import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tag as TagIcon, ArrowLeft, Hash } from "lucide-react";

interface TagData {
  id: string;
  name: string;
  slug: string;
}

import type { Article } from "@/hooks/useBlogArticles";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch tag data
  const { data: tag, isLoading: isLoadingTag } = useQuery({
    queryKey: ["tag", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, slug")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as TagData;
    },
    enabled: !!slug,
  });

  // Fetch articles with this tag
  const { data: articles, isLoading: isLoadingArticles } = useQuery({
    queryKey: ["tag-articles", tag?.id],
    queryFn: async () => {
      const { data: articleTags, error: tagsError } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tag!.id);

      if (tagsError) throw tagsError;

      const articleIds = articleTags.map((at) => at.article_id);
      if (articleIds.length === 0) return [];

      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, title, slug, excerpt, content, featured_image, featured_image_alt,
          published_at, reading_time, views, meta_title, meta_description, main_keyword,
          category:categories(name, slug),
          author:authors(name, avatar)
        `)
        .in("id", articleIds)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Fetch tags for each article
      const articlesWithTags = await Promise.all(
        (data || []).map(async (article) => {
          const { data: tags } = await supabase
            .from("article_tags")
            .select("tag:tags(name, slug)")
            .eq("article_id", article.id);

          return {
            ...article,
            tags: tags?.map((t: { tag: { name: string; slug: string } }) => t.tag) || [],
          };
        })
      );

      return articlesWithTags as Article[];
    },
    enabled: !!tag?.id,
  });

  // Fetch related tags (tags that appear together with this tag)
  const { data: relatedTags } = useQuery({
    queryKey: ["related-tags", tag?.id],
    queryFn: async () => {
      if (!articles || articles.length === 0) return [];

      const tagSet = new Set<string>();
      articles.forEach((article) => {
        article.tags.forEach((t) => {
          if (t.slug !== slug) tagSet.add(JSON.stringify(t));
        });
      });

      return Array.from(tagSet)
        .map((t) => JSON.parse(t) as { name: string; slug: string })
        .slice(0, 10);
    },
    enabled: !!articles && articles.length > 0,
  });

  const isLoading = isLoadingTag || isLoadingArticles;

  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    { label: "Tags", href: "/tags" },
    { label: tag?.name || "Tag" },
  ];

  const schemaBreadcrumbItems = [
    { name: "Blog", url: "/blog" },
    { name: "Tags", url: "/tags" },
    { name: tag?.name || "Tag", url: `/tag/${slug}` },
  ];

  if (!isLoading && !tag) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tag não encontrada</h1>
            <Button asChild>
              <Link to="/tags">Ver todas as tags</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`Artigos sobre ${tag?.name || "Tag"} - Byoma Research`}
        description={`Explore todos os artigos e análises sobre ${tag?.name || "este tema"} no Byoma Research. Informações atualizadas sobre ${tag?.name || "sustentabilidade"} e mercado verde.`}
        url={`/tag/${slug}`}
        keywords={[tag?.name || "", "byoma research", "finanças sustentáveis", "crédito de carbono"]}
      />
      <BreadcrumbSchema items={schemaBreadcrumbItems} />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6" />

            <Link
              to="/tags"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Todas as tags
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Hash className="h-8 w-8 text-primary" />
              </div>
              {isLoading ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {tag?.name}
                </h1>
              )}
            </div>

            <p className="text-xl text-muted-foreground max-w-2xl">
              {isLoading ? (
                <Skeleton className="h-6 w-64" />
              ) : (
                `${articles?.length || 0} artigo${(articles?.length || 0) !== 1 ? "s" : ""} encontrado${(articles?.length || 0) !== 1 ? "s" : ""}`
              )}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Related Tags */}
      {relatedTags && relatedTags.length > 0 && (
        <section className="py-6 bg-card border-b border-border">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground font-medium">
                Tags relacionadas:
              </span>
              {relatedTags.map((relTag) => (
                <Link key={relTag.slug} to={`/tag/${relTag.slug}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {relTag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <BlogCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TagIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Nenhum artigo encontrado com esta tag.
                </p>
                <Button asChild>
                  <Link to="/blog">Explorar todos os artigos</Link>
                </Button>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TagPage;
