import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Clock, TrendingUp, Tag, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLatestArticles, usePopularTags } from "@/hooks/useBlogSidebar";

interface BlogSidebarProps {
  currentArticleId?: string;
  className?: string;
}

const BlogSidebar = ({ currentArticleId, className }: BlogSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const { data: latestArticles, isLoading: loadingLatest } = useLatestArticles(5, currentArticleId);
  const { data: popularTags, isLoading: loadingTags } = usePopularTags(12);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <aside className={`space-y-8 ${className}`}>
      {/* Search Box */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Buscar
        </h3>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              type="search"
              placeholder="Pesquisar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-background"
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Latest Posts */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Últimas Publicações
        </h3>
        
        {loadingLatest ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {latestArticles?.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="flex gap-3 group"
              >
                <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={article.featured_image || "/placeholder.svg"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(article.published_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link 
          to="/blog" 
          className="flex items-center gap-1 text-sm text-primary hover:underline mt-4 font-medium"
        >
          Ver todos os artigos
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Popular Tags */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          Tags Populares
        </h3>
        
        {loadingTags ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {popularTags?.map((tag) => (
              <Link
                key={tag.id}
                to={`/blog?tag=${encodeURIComponent(tag.name)}`}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                >
                  {tag.name}
                  <span className="ml-1 opacity-60">({tag.count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trending Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Tópicos em Alta
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link 
              to="/blog?tag=Crédito de Carbono" 
              className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Mercado de Crédito de Carbono
            </Link>
          </li>
          <li>
            <Link 
              to="/blog?tag=Tokenização" 
              className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Tokenização Verde
            </Link>
          </li>
          <li>
            <Link 
              to="/blog?tag=ReFi" 
              className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Finanças Regenerativas (ReFi)
            </Link>
          </li>
          <li>
            <Link 
              to="/blog?tag=ESG" 
              className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Investimentos ESG
            </Link>
          </li>
        </ul>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-primary text-primary-foreground rounded-lg p-4">
        <h3 className="font-semibold mb-2">Receba Insights Exclusivos</h3>
        <p className="text-sm opacity-90 mb-3">
          Assine nossa newsletter e receba análises semanais do mercado verde.
        </p>
        <Link to="/#newsletter">
          <Button variant="secondary" size="sm" className="w-full">
            Inscrever-se Grátis
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default BlogSidebar;
