import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import TableOfContents from "@/components/TableOfContents";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Clock, Eye, BookOpen, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Article } from "@/hooks/useBlogArticles";

interface PillarPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  main_keyword: string | null;
  table_of_contents: { id: string; title: string; level: number }[] | null;
  featured_articles: string[] | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  views: number | null;
  reading_time: number | null;
  created_at: string;
  updated_at: string;
  category: { name: string; slug: string } | null;
  author: { name: string; avatar: string | null; bio: string | null } | null;
}

const PillarPageComponent = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch pillar page data
  const { data: page, isLoading, error } = useQuery({
    queryKey: ["pillar-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pillar_pages")
        .select(`
          id, title, slug, content, excerpt, meta_title, meta_description,
          main_keyword, table_of_contents, featured_articles, featured_image,
          featured_image_alt, views, reading_time, created_at, updated_at,
          category:categories(name, slug),
          author:authors(name, avatar, bio)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data as PillarPage;
    },
    enabled: !!slug,
  });

  // Fetch featured articles
  const { data: featuredArticles } = useQuery({
    queryKey: ["pillar-featured-articles", page?.featured_articles],
    queryFn: async () => {
      if (!page?.featured_articles || page.featured_articles.length === 0) return [];

      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, title, slug, excerpt, content, featured_image, featured_image_alt,
          published_at, reading_time, views, meta_title, meta_description, main_keyword,
          category:categories(name, slug),
          author:authors(name, avatar)
        `)
        .in("id", page.featured_articles)
        .eq("status", "published");

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
    enabled: !!page?.featured_articles && page.featured_articles.length > 0,
  });

  // Increment views
  useEffect(() => {
    if (slug) {
      supabase.rpc("increment_pillar_views", { page_slug: slug });
    }
  }, [slug]);

  const breadcrumbItems = [
    { label: "Guias", href: "/guias" },
    ...(page?.category ? [{ label: page.category.name }] : []),
    { label: page?.title || "Guia" },
  ];

  const schemaBreadcrumbItems = [
    { name: "Guias", url: "/guias" },
    ...(page?.category ? [{ name: page.category.name, url: `/blog?categoria=${page.category.slug}` }] : []),
    { name: page?.title || "Guia", url: `/guia/${slug}` },
  ];

  const formattedDate = page?.updated_at
    ? format(new Date(page.updated_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-6 py-32">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-16 w-full max-w-3xl mb-6" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="aspect-video w-full max-w-4xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Guia não encontrado</h1>
            <Button asChild>
              <Link to="/guias">Voltar aos guias</Link>
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
        title={page.meta_title || `${page.title} - Guia Completo`}
        description={page.meta_description || page.excerpt || `Guia completo sobre ${page.title}`}
        url={`/guia/${slug}`}
        image={page.featured_image || undefined}
        keywords={page.main_keyword ? [page.main_keyword, "guia completo", "byoma research"] : undefined}
        type="article"
        author={page.author?.name}
        publishedAt={page.created_at}
        modifiedAt={page.updated_at}
      />
      <BreadcrumbSchema items={schemaBreadcrumbItems} />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6" />

            <Link
              to="/guias"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos guias
            </Link>

            <div className="max-w-4xl">
              {page.category && (
                <Badge variant="default" className="mb-4">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Guia Completo
                </Badge>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {page.title}
              </h1>

              {page.excerpt && (
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {page.excerpt}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {page.author && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={page.author.avatar || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{page.author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Atualizado em {formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{page.reading_time || 15} min de leitura</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{page.views || 0} visualizações</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Image */}
      {page.featured_image && (
        <section className="py-8">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <img
                src={page.featured_image}
                alt={page.featured_image_alt || page.title}
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
            {/* Table of Contents - Sticky Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24">
                <TableOfContents
                  items={page.table_of_contents || []}
                  className="hidden lg:block"
                />

                {/* Author Bio Card */}
                {page.author && (
                  <Card className="mt-8">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={page.author.avatar || undefined} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{page.author.name}</h4>
                          <p className="text-sm text-muted-foreground">Autor</p>
                        </div>
                      </div>
                      {page.author.bio && (
                        <p className="text-sm text-muted-foreground">
                          {page.author.bio}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>

            {/* Article Content */}
            <article className="lg:col-span-3 order-1 lg:order-2">
              {/* Mobile TOC */}
              <TableOfContents
                items={page.table_of_contents || []}
                className="lg:hidden mb-8"
              />

              <div className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary
                prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-table:border prose-table:border-border
                prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-border
                prose-td:p-3 prose-td:border prose-td:border-border"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {page.content}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles && featuredArticles.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-8">
                  Artigos Relacionados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredArticles.map((article) => (
                    <BlogCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default PillarPageComponent;