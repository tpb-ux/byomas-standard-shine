import { Calendar, Clock, User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { Article } from "@/hooks/useBlogArticles";

interface BlogCardProps {
  article: Article;
}

const BlogCard = ({ article }: BlogCardProps) => {
  const navigate = useNavigate();

  const formattedDate = article.published_at 
    ? new Date(article.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' às ' + new Date(article.published_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const readTime = article.reading_time ? `${article.reading_time} min` : '5 min';

  return (
    <article>
      <Card 
        className="overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full"
        onClick={() => navigate(`/blog/${article.slug}`)}
      >
        <div className="aspect-video overflow-hidden bg-muted">
          {article.featured_image ? (
            <img
              src={article.featured_image}
              alt={article.featured_image_alt || article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              width={400}
              height={225}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
          )}
        </div>
        <CardContent className="p-6">
          {/* Label AMAZONIA estilo Kinexys */}
          <span className="text-xs font-medium tracking-widest text-primary mb-3 block">
            AMAZONIA
          </span>
          
          {article.category?.name && (
            <Badge 
              variant="outline" 
              className="mb-3 border-border text-muted-foreground"
            >
              {article.category.name}
            </Badge>
          )}
          
          <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          
          {article.excerpt && (
            <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              {article.author?.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>

          {/* Link "SABER MAIS >" estilo Kinexys */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <time dateTime={article.published_at || undefined}>{formattedDate}</time>
              </div>
            )}
            <span className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
              SABER MAIS
              <ChevronRight className="ml-1 h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </article>
  );
};

export default BlogCard;