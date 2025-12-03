import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Eye,
  TrendingUp,
  Newspaper,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  avgSeoScore: number;
  curatedNews: number;
}

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  views: number;
  published_at: string | null;
}

export default function AdminDashboard() {
  const { user, isAdmin, isEditor, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin && !isEditor) {
      navigate("/");
    }
  }, [user, isAdmin, isEditor, authLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch articles stats
        const { data: articles } = await supabase
          .from("articles")
          .select("id, status, views");

        const totalArticles = articles?.length || 0;
        const publishedArticles = articles?.filter((a) => a.status === "published").length || 0;
        const draftArticles = articles?.filter((a) => a.status === "draft").length || 0;
        const totalViews = articles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;

        // Fetch SEO metrics
        const { data: seoMetrics } = await supabase
          .from("seo_metrics")
          .select("seo_score");

        const avgSeoScore =
          seoMetrics && seoMetrics.length > 0
            ? seoMetrics.reduce((sum, m) => sum + Number(m.seo_score || 0), 0) / seoMetrics.length
            : 0;

        // Fetch curated news count
        const { count: curatedCount } = await supabase
          .from("curated_news")
          .select("*", { count: "exact", head: true })
          .eq("processed", false);

        setStats({
          totalArticles,
          publishedArticles,
          draftArticles,
          totalViews,
          avgSeoScore: Math.round(avgSeoScore),
          curatedNews: curatedCount || 0,
        });

        // Fetch recent articles
        const { data: recent } = await supabase
          .from("articles")
          .select("id, title, status, views, published_at")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentArticles(recent || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Artigos",
      value: stats?.totalArticles || 0,
      description: `${stats?.publishedArticles || 0} publicados, ${stats?.draftArticles || 0} rascunhos`,
      icon: FileText,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Visualizações",
      value: stats?.totalViews || 0,
      description: "Total de visualizações",
      icon: Eye,
      trend: "+24%",
      trendUp: true,
    },
    {
      title: "Score SEO Médio",
      value: `${stats?.avgSeoScore || 0}%`,
      description: "Média de todos os artigos",
      icon: TrendingUp,
      trend: stats?.avgSeoScore && stats.avgSeoScore > 70 ? "+5%" : "-3%",
      trendUp: stats?.avgSeoScore ? stats.avgSeoScore > 70 : false,
    },
    {
      title: "Notícias para Curar",
      value: stats?.curatedNews || 0,
      description: "Aguardando processamento",
      icon: Newspaper,
      trend: "Novo",
      trendUp: true,
    },
  ];

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do Byoma Research
          </p>
        </div>
        <Button onClick={() => navigate("/admin/articles/new")}>
          <FileText className="mr-2 h-4 w-4" />
          Novo Artigo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <Badge
                  variant={stat.trendUp ? "default" : "destructive"}
                  className="text-xs"
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Articles & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Artigos Recentes
            </CardTitle>
            <CardDescription>
              Últimos artigos criados ou editados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum artigo ainda</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/admin/articles/new")}
                >
                  Criar primeiro artigo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/articles/${article.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {article.views || 0} visualizações
                      </p>
                    </div>
                    <Badge
                      variant={article.status === "published" ? "default" : "secondary"}
                    >
                      {article.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate("/admin/curator")}
            >
              <Newspaper className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Curadoria de Notícias</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.curatedNews || 0} notícias aguardando
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate("/admin/seo")}
            >
              <TrendingUp className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Análise SEO</p>
                <p className="text-xs text-muted-foreground">
                  Otimize seus artigos
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate("/admin/sources")}
            >
              <Eye className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Gerenciar Fontes</p>
                <p className="text-xs text-muted-foreground">
                  Configure feeds de notícias
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
