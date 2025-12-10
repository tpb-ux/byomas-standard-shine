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
import { ArrowLeft, Folder, FileText, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Article } from "@/hooks/useBlogArticles";

interface TopicCluster {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  article_count: number;
  category: { name: string; slug: string } | null;
}

const TopicPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch topic data
  const { data: topic, isLoading: isLoadingTopic } = useQuery({
    queryKey: ["topic-cluster", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topic_clusters")
        .select(`
          id, name, slug, description, icon, article_count,
          category:categories(name, slug)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as TopicCluster | null;
    },
    enabled: !!slug,
  });

  // Fetch articles for this topic
  const { data: articles, isLoading: isLoadingArticles } = useQuery({
    queryKey: ["topic-articles", topic?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, title, slug, excerpt, content, featured_image, featured_image_alt,
          published_at, reading_time, views, meta_title, meta_description, main_keyword,
          category:categories(name, slug),
          author:authors(name, avatar)
        `)
        .eq("topic_cluster_id", topic!.id)
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
    enabled: !!topic?.id,
  });

  // Fetch related topics from same category
  const { data: relatedTopics } = useQuery({
    queryKey: ["related-topics", topic?.category?.slug, topic?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topic_clusters")
        .select("id, name, slug, icon, article_count")
        .neq("id", topic!.id)
        .eq("is_active", true)
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!topic,
  });

  const isLoading = isLoadingTopic || isLoadingArticles;

  // Dynamic icon component
  const IconComponent: LucideIcon = topic?.icon
    ? ((LucideIcons as unknown as Record<string, LucideIcon>)[topic.icon] || Folder)
    : Folder;

  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    ...(topic?.category ? [{ label: topic.category.name, href: `/blog?categoria=${topic.category.slug}` }] : []),
    { label: topic?.name || "Tópico" },
  ];

  const schemaBreadcrumbItems = [
    { name: "Blog", url: "/blog" },
    ...(topic?.category ? [{ name: topic.category.name, url: `/blog?categoria=${topic.category.slug}` }] : []),
    { name: topic?.name || "Tópico", url: `/topico/${slug}` },
  ];

  if (!isLoading && !topic) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tópico não encontrado</h1>
            <Button asChild>
              <Link to="/blog">Voltar ao blog</Link>
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
        title={`${topic?.name || "Tópico"} - Guia Completo | Byoma Research`}
        description={topic?.description || `Explore todos os artigos sobre ${topic?.name || "este tópico"} no Byoma Research. Análises aprofundadas e informações atualizadas.`}
        url={`/topico/${slug}`}
        keywords={[topic?.name || "", "byoma research", "finanças sustentáveis", topic?.category?.name || ""]}
      />
      <BreadcrumbSchema items={schemaBreadcrumbItems} />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6" />

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao blog
            </Link>

            <div className="flex items-start gap-6 mb-6">
              {isLoading ? (
                <Skeleton className="h-20 w-20 rounded-2xl" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComponent className="h-10 w-10 text-primary" />
                </div>
              )}
              <div>
                {topic?.category && (
                  <Badge variant="secondary" className="mb-2">
                    {topic.category.name}
                  </Badge>
                )}
                {isLoading ? (
                  <Skeleton className="h-10 w-64" />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    {topic?.name}
                  </h1>
                )}
              </div>
            </div>

            {topic?.description && (
              <p className="text-xl text-muted-foreground max-w-3xl mb-4">
                {topic.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  {articles?.length || 0} artigo{(articles?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Related Topics */}
      {relatedTopics && relatedTopics.length > 0 && (
        <section className="py-6 bg-card border-b border-border">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground font-medium">
                Tópicos relacionados:
              </span>
              {relatedTopics.map((relTopic) => {
                const RelIcon: LucideIcon = relTopic.icon
                  ? ((LucideIcons as unknown as Record<string, LucideIcon>)[relTopic.icon] || Folder)
                  : Folder;
                return (
                  <Link
                    key={relTopic.id}
                    to={`/topico/${relTopic.slug}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <RelIcon className="h-4 w-4" />
                    {relTopic.name}
                  </Link>
                );
              })}
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
                <Folder className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Nenhum artigo encontrado neste tópico ainda.
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

export default TopicPage;
