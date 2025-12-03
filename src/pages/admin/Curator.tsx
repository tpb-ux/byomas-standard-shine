import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Newspaper,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  FileText,
  Loader2,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CuratedNews {
  id: string;
  original_title: string;
  original_url: string;
  original_content: string | null;
  engagement_potential: number;
  processed: boolean;
  fetched_at: string;
  source: { name: string } | null;
}

export default function AdminCurator() {
  const { user, isAdmin, isEditor, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<CuratedNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin && !isEditor) {
      navigate("/");
    }
  }, [user, isAdmin, isEditor, authLoading, navigate]);

  useEffect(() => {
    fetchNews();
  }, [user]);

  const fetchNews = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("curated_news")
        .select(`
          id,
          original_title,
          original_url,
          original_content,
          engagement_potential,
          processed,
          fetched_at,
          source:news_sources(name)
        `)
        .eq("processed", false)
        .order("engagement_potential", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Erro ao carregar notícias");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewNews = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-news");
      
      if (error) throw error;

      toast.success(`${data?.count || 0} novas notícias encontradas!`);
      await fetchNews();
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Erro ao buscar notícias");
    } finally {
      setIsFetching(false);
    }
  };

  const generateArticle = async (newsItem: CuratedNews) => {
    setIsGenerating(newsItem.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: {
          type: "from_news",
          newsId: newsItem.id,
          title: newsItem.original_title,
          content: newsItem.original_content,
          sourceUrl: newsItem.original_url,
        },
      });

      if (error) throw error;

      // Mark as processed
      await supabase
        .from("curated_news")
        .update({ processed: true, article_id: data?.articleId })
        .eq("id", newsItem.id);

      toast.success("Artigo gerado com sucesso!");
      navigate(`/admin/articles/${data?.articleId}`);
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error("Erro ao gerar artigo");
    } finally {
      setIsGenerating(null);
    }
  };

  const dismissNews = async (newsId: string) => {
    try {
      await supabase
        .from("curated_news")
        .update({ processed: true })
        .eq("id", newsId);

      setNews(news.filter((n) => n.id !== newsId));
      toast.success("Notícia descartada");
    } catch (error) {
      console.error("Error dismissing news:", error);
      toast.error("Erro ao descartar notícia");
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const filteredNews = news.filter((item) =>
    item.original_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curadoria de Notícias</h1>
          <p className="text-muted-foreground">
            Transforme notícias em artigos otimizados para SEO
          </p>
        </div>
        <Button onClick={fetchNewNews} disabled={isFetching}>
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Buscar Notícias
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="carbon">Crédito de Carbono</SelectItem>
                <SelectItem value="sustainability">Sustentabilidade</SelectItem>
                <SelectItem value="finance">Finanças Verdes</SelectItem>
                <SelectItem value="tech">Green Tech</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma notícia para curar
            </h3>
            <p className="text-muted-foreground mb-4">
              Clique em "Buscar Notícias" para obter novas notícias das fontes configuradas
            </p>
            <Button onClick={fetchNewNews} disabled={isFetching}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Buscar Agora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredNews.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {item.original_title}
                  </CardTitle>
                  <Badge variant="outline" className={getEngagementColor(item.engagement_potential)}>
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {Math.round(item.engagement_potential)}%
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span>{item.source?.name || "Fonte desconhecida"}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(item.fetched_at), "dd/MM HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.original_content && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.original_content.substring(0, 200)}...
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Potencial de Engajamento</span>
                    <span className={getEngagementColor(item.engagement_potential)}>
                      {Math.round(item.engagement_potential)}%
                    </span>
                  </div>
                  <Progress value={item.engagement_potential} className="h-2" />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => generateArticle(item)}
                    disabled={isGenerating === item.id}
                  >
                    {isGenerating === item.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Gerar Artigo
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(item.original_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => dismissNews(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
