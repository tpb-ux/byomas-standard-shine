import { Calendar, Clock, User } from "lucide-react";
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
        month: 'long',
        year: 'numeric'
      })
    : '';

  const readTime = article.reading_time ? `${article.reading_time} min` : '5 min';

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/blog/${article.slug}`)}
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.featured_image_alt || article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl">📄</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        {article.category?.name && (
          <Badge className="mb-3" style={{ backgroundColor: article.category.color || undefined }}>
            {article.category.name}
          </Badge>
        )}
        
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
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
          {formattedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
