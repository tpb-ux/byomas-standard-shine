import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead, ArticleSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ScrollReveal";
import { useBlogArticle, useRelatedArticles } from "@/hooks/useBlogArticles";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { data: article, isLoading, error } = useBlogArticle(slug || "");
  const { data: relatedArticles } = useRelatedArticles(
    article?.category?.id,
    article?.id || ""
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="pt-24 pb-12 bg-muted/30">
          <div className="container mx-auto px-6 max-w-4xl space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </section>
        <section className="container mx-auto px-6 max-w-4xl">
          <Skeleton className="aspect-video w-full mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead
          title="Artigo não encontrado"
          description="O artigo que você procura não foi encontrado."
          noIndex
        />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Artigo não encontrado
            </h1>
            <Button onClick={() => navigate("/blog")}>Voltar para o Blog</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    ...(article.category ? [{ label: article.category.name, href: `/blog?category=${article.category.slug || article.category.name}` }] : []),
    { label: article.title },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO Meta Tags */}
      <SEOHead
        title={article.meta_title || article.title}
        description={article.meta_description || article.excerpt || ""}
        image={article.featured_image || undefined}
        url={`/blog/${slug}`}
        type="article"
        author={article.author?.name}
        publishedAt={article.published_at || undefined}
        keywords={article.tags?.map(t => t.name)}
      />
      
      {/* Article JSON-LD */}
      <ArticleSchema
        title={article.title}
        description={article.meta_description || article.excerpt || ""}
        image={article.featured_image || undefined}
        url={`/blog/${slug}`}
        author={article.author?.name}
        publishedAt={article.published_at || undefined}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} className="mb-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/blog")}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Blog
            </Button>

            {article.category && (
              <Badge className="mb-4" style={{ backgroundColor: article.category.color || undefined }}>
                {article.category.name}
              </Badge>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author.name}</span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={article.published_at || undefined}>{formattedDate}</time>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.reading_time || 5} min de leitura</span>
              </div>
              {article.views && article.views > 0 && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{article.views.toLocaleString("pt-BR")} visualizações</span>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Image */}
      {article.featured_image && (
        <section>
          <div className="container mx-auto px-6 max-w-4xl">
            <ScrollReveal>
              <div className="aspect-video overflow-hidden bg-muted mb-12 rounded-lg">
                <img
                  src={article.featured_image}
                  alt={article.featured_image_alt || article.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  width={1200}
                  height={675}
                />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <article
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </ScrollReveal>

          {/* Author Bio */}
          {article.author && (
            <ScrollReveal delay={0.2}>
              <aside className="mt-12 p-6 bg-muted rounded-lg border-l-4 border-primary">
                <div className="flex items-center gap-4">
                  {article.author.avatar && (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-16 h-16 rounded-full object-cover"
                      loading="lazy"
                      width={64}
                      height={64}
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground mb-1">
                      {article.author.name}
                    </p>
                    {article.author.role && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {article.author.role}
                      </p>
                    )}
                    {article.author.bio && (
                      <p className="text-sm text-muted-foreground">
                        {article.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </ScrollReveal>
          )}

          {/* Tags Section */}
          {article.tags.length > 0 && (
            <ScrollReveal>
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Tags do Artigo
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/blog?tag=${encodeURIComponent(tag.name)}`}
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Related Posts */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Artigos Relacionados
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedArticles.map((related, index) => (
                <ScrollReveal key={related.id} delay={index * 0.1}>
                  <article
                    onClick={() => navigate(`/blog/${related.slug}`)}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-video overflow-hidden bg-muted mb-4 rounded-lg">
                      <img
                        src={related.featured_image || "/placeholder.svg"}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        width={400}
                        height={225}
                      />
                    </div>
                    {related.category && (
                      <Badge className="mb-2">{related.category.name}</Badge>
                    )}
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {related.reading_time || 5} min de leitura
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
