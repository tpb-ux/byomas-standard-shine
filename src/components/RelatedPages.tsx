import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ScrollReveal";

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featured_image: string | null;
  reading_time: number | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

interface RelatedPagesProps {
  articles: RelatedArticle[];
  isLoading?: boolean;
  title?: string;
  variant?: "horizontal" | "vertical";
}

const RelatedPages = ({ 
  articles, 
  isLoading = false, 
  title = "Páginas Relacionadas",
  variant = "horizontal"
}: RelatedPagesProps) => {
  if (isLoading) {
    return (
      <div className="bg-muted/50 rounded-lg p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-20 w-28 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  if (variant === "vertical") {
    return (
      <div className="bg-muted/30 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="h-1 w-6 bg-primary rounded-full" />
          {title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <ScrollReveal key={article.id} delay={index * 0.1}>
              <Link
                to={`/blog/${article.slug}`}
                className="group block"
              >
                <article className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.featured_image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    {article.category && (
                      <Badge 
                        variant="secondary" 
                        className="mb-2 text-xs"
                        style={{ backgroundColor: article.category.color || undefined }}
                      >
                        {article.category.name}
                      </Badge>
                    )}
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{article.reading_time || 5} min</span>
                    </div>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal variant (sidebar style - like the reference image)
  return (
    <div className="bg-muted/30 rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <span className="h-1 w-6 bg-primary rounded-full" />
        {title}
      </h3>
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <ScrollReveal key={article.id} delay={index * 0.1}>
            <Link
              to={`/blog/${article.slug}`}
              className="flex gap-4 group p-3 rounded-lg hover:bg-card transition-colors border border-transparent hover:border-border"
            >
              {/* Thumbnail */}
              <div className="h-20 w-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={article.featured_image || "/placeholder.svg"}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                {article.category && (
                  <Badge 
                    variant="outline" 
                    className="w-fit mb-1.5 text-xs px-2 py-0"
                    style={{ 
                      borderColor: article.category.color || undefined,
                      color: article.category.color || undefined 
                    }}
                  >
                    {article.category.name}
                  </Badge>
                )}
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.reading_time || 5} min
                  </span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Ler mais <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      <Link 
        to="/blog" 
        className="flex items-center justify-center gap-2 text-sm text-primary hover:underline mt-6 font-medium py-2 border-t border-border"
      >
        Ver mais artigos
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default RelatedPages;
