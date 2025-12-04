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
  Users,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  avgSeoScore: number;
  curatedNews: number;
  activeSubscribers: number;
  unreadMessages: number;
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
  const [newNotifications, setNewNotifications] = useState<{subscribers: number; messages: number}>({
    subscribers: 0,
    messages: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin && !isEditor) {
      navigate("/");
    }
  }, [user, isAdmin, isEditor, authLoading, navigate]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'newsletter_subscribers' },
        (payload) => {
          const newSubscriber = payload.new as { email: string };
          toast.info(`📧 Novo subscriber: ${newSubscriber.email}`, {
            description: "Alguém se inscreveu na newsletter!",
            duration: 5000,
          });
          setStats(prev => prev ? { ...prev, activeSubscribers: prev.activeSubscribers + 1 } : null);
          setNewNotifications(prev => ({ ...prev, subscribers: prev.subscribers + 1 }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload) => {
          const newMessage = payload.new as { name: string; inquiry_type: string };
          toast.info(`📬 Nova mensagem de ${newMessage.name}`, {
            description: `Tipo: ${getInquiryTypeLabel(newMessage.inquiry_type)}`,
            duration: 5000,
          });
          setStats(prev => prev ? { ...prev, unreadMessages: prev.unreadMessages + 1 } : null);
          setNewNotifications(prev => ({ ...prev, messages: prev.messages + 1 }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getInquiryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      general: "Informação Geral",
      partnership: "Parcerias Comerciais",
      consultation: "Consultoria",
      press: "Imprensa",
      support: "Suporte Técnico",
      certification: "Certificação",
    };
    return types[type] || type;
  };

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

        // Fetch active subscribers count
        const { count: subscribersCount } = await supabase
          .from("newsletter_subscribers")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // Fetch unread messages count
        const { count: messagesCount } = await supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .is("read_at", null);

        setStats({
          totalArticles,
          publishedArticles,
          draftArticles,
          totalViews,
          avgSeoScore: Math.round(avgSeoScore),
          curatedNews: curatedCount || 0,
          activeSubscribers: subscribersCount || 0,
          unreadMessages: messagesCount || 0,
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
      hasNewNotification: false,
    },
    {
      title: "Visualizações",
      value: stats?.totalViews || 0,
      description: "Total de visualizações",
      icon: Eye,
      trend: "+24%",
      trendUp: true,
      hasNewNotification: false,
    },
    {
      title: "Score SEO Médio",
      value: `${stats?.avgSeoScore || 0}%`,
      description: "Média de todos os artigos",
      icon: TrendingUp,
      trend: stats?.avgSeoScore && stats.avgSeoScore > 70 ? "+5%" : "-3%",
      trendUp: stats?.avgSeoScore ? stats.avgSeoScore > 70 : false,
      hasNewNotification: false,
    },
    {
      title: "Notícias para Curar",
      value: stats?.curatedNews || 0,
      description: "Aguardando processamento",
      icon: Newspaper,
      trend: "Novo",
      trendUp: true,
      hasNewNotification: false,
    },
    {
      title: "Subscribers Ativos",
      value: stats?.activeSubscribers || 0,
      description: "Inscritos na newsletter",
      icon: Users,
      trend: newNotifications.subscribers > 0 ? `+${newNotifications.subscribers} novo` : "+8%",
      trendUp: true,
      hasNewNotification: newNotifications.subscribers > 0,
      link: "/admin/subscribers",
    },
    {
      title: "Mensagens Não Lidas",
      value: stats?.unreadMessages || 0,
      description: "Aguardando resposta",
      icon: MessageSquare,
      trend: newNotifications.messages > 0 ? `+${newNotifications.messages} nova` : (stats?.unreadMessages && stats.unreadMessages > 0 ? "Novo" : "0"),
      trendUp: newNotifications.messages > 0 || (stats?.unreadMessages ? stats.unreadMessages === 0 : true),
      hasNewNotification: newNotifications.messages > 0,
      link: "/admin/messages",
    },
  ];

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
            PAINEL ADMINISTRATIVO
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Dashboard</h1>
          <p className="text-muted-foreground font-normal">
            Visão geral do Byoma Research
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(newNotifications.subscribers > 0 || newNotifications.messages > 0) && (
            <Button
              variant="outline"
              size="sm"
              className="relative border-primary/50 text-primary"
              onClick={() => setNewNotifications({ subscribers: 0, messages: 0 })}
            >
              <Bell className="h-4 w-4 mr-2" />
              {newNotifications.subscribers + newNotifications.messages} novas
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
            </Button>
          )}
          <Button 
            onClick={() => navigate("/admin/articles/new")}
            variant="outline"
            className="border-border hover:border-primary/50"
          >
            <FileText className="mr-2 h-4 w-4" />
            Novo Artigo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className={`border transition-all group cursor-pointer ${
              stat.hasNewNotification 
                ? "border-primary bg-primary/5 animate-pulse" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => stat.link && navigate(stat.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="relative">
                <stat.icon className="h-4 w-4 text-primary" />
                {stat.hasNewNotification && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light tracking-wide">{stat.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <Badge
                  variant={stat.trendUp ? "default" : "destructive"}
                  className={`text-xs ${stat.hasNewNotification ? "animate-bounce" : ""}`}
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
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal">
              <FileText className="h-5 w-5 text-primary" />
              Artigos Recentes
            </CardTitle>
            <CardDescription>
              Últimos artigos criados ou editados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-4">
                  BYOMA RESEARCH
                </span>
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-normal">Nenhum artigo ainda</p>
                <Button
                  variant="outline"
                  className="mt-4 border-border hover:border-primary/50"
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
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all"
                    onClick={() => navigate(`/admin/articles/${article.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-normal truncate">{article.title}</p>
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

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal">
              <BarChart3 className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4 border-border hover:border-primary/50"
              onClick={() => navigate("/admin/curator")}
            >
              <Newspaper className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-normal">Curadoria de Notícias</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.curatedNews || 0} notícias aguardando
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 border-border hover:border-primary/50"
              onClick={() => navigate("/admin/seo")}
            >
              <TrendingUp className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-normal">Análise SEO</p>
                <p className="text-xs text-muted-foreground">
                  Otimize seus artigos
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 border-border hover:border-primary/50"
              onClick={() => navigate("/admin/sources")}
            >
              <Eye className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-normal">Gerenciar Fontes</p>
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