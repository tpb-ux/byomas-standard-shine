import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Clock, 
  Zap, 
  FileText, 
  Image, 
  RefreshCw, 
  Play,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  Newspaper,
  Settings,
  ListOrdered,
  Beaker,
  Save,
  Link2,
  Activity,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const SCHEDULE = [
  { time: "05:00", action: "Busca notícias" },
  { time: "05:15", action: "Publica 3 artigos" },
  { time: "08:00", action: "Busca notícias" },
  { time: "08:15", action: "Publica 3 artigos" },
  { time: "10:00", action: "Publica 2 artigos" },
  { time: "12:00", action: "Busca notícias" },
  { time: "12:15", action: "Publica 2 artigos" },
  { time: "14:00", action: "Publica 2 artigos" },
  { time: "16:00", action: "Busca notícias" },
  { time: "16:15", action: "Publica 2 artigos" },
  { time: "18:00", action: "Publica 1 artigo" },
  { time: "20:00", action: "Busca notícias" },
  { time: "20:15", action: "Publica 2 artigos" },
  { time: "22:00", action: "Publica 1 artigo" },
  { time: "23:30", action: "Busca notícias" },
  { time: "23:45", action: "Publica 1 artigo" },
];

interface TestResult {
  success: boolean;
  article?: {
    title: string;
    slug: string;
    imageGenerated: boolean;
    imageUrl: string | null;
  };
  error?: string;
}

export default function Automation() {
  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkingResult, setLinkingResult] = useState<{linksCreated: number; articlesProcessed: number} | null>(null);
  
  // Settings state
  const [dailyTarget, setDailyTarget] = useState(15);
  const [articlesPerExecution, setArticlesPerExecution] = useState(3);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [trendingBoost, setTrendingBoost] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load settings
  const { isLoading: loadingSettings } = useQuery({
    queryKey: ["automation-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("automation_settings")
        .select("key, value");
      
      if (data) {
        for (const item of data) {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          switch (item.key) {
            case "articles_per_execution":
              setArticlesPerExecution(parseInt(value, 10) || 3);
              break;
            case "daily_target":
              setDailyTarget(parseInt(value, 10) || 15);
              break;
            case "image_fallback_enabled":
              setFallbackEnabled(value === "true");
              break;
            case "trending_boost_enabled":
              setTrendingBoost(value === "true");
              break;
          }
        }
      }
      return data;
    },
  });

  // Stats for today
  const { data: todayStats, isLoading: loadingStats } = useQuery({
    queryKey: ["automation-stats-today"],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      const [articlesResult, newsResult, imagesResult] = await Promise.all([
        supabase
          .from("articles")
          .select("id, featured_image", { count: "exact" })
          .gte("published_at", startOfToday)
          .lte("published_at", endOfToday)
          .eq("status", "published"),
        supabase
          .from("curated_news")
          .select("id", { count: "exact" })
          .gte("fetched_at", startOfToday)
          .lte("fetched_at", endOfToday),
        supabase
          .from("articles")
          .select("id", { count: "exact" })
          .gte("published_at", startOfToday)
          .lte("published_at", endOfToday)
          .eq("status", "published")
          .not("featured_image", "is", null),
      ]);

      return {
        articlesPublished: articlesResult.count || 0,
        newsFetched: newsResult.count || 0,
        imagesGenerated: imagesResult.count || 0,
        targetArticles: dailyTarget,
      };
    },
    refetchInterval: 30000,
  });

  // Weekly stats
  const { data: weeklyStats, isLoading: loadingWeekly } = useQuery({
    queryKey: ["automation-stats-weekly"],
    queryFn: async () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const start = startOfDay(date).toISOString();
        const end = endOfDay(date).toISOString();

        const { count } = await supabase
          .from("articles")
          .select("id", { count: "exact" })
          .gte("published_at", start)
          .lte("published_at", end)
          .eq("status", "published");

        days.push({
          date: format(date, "EEE", { locale: ptBR }),
          count: count || 0,
        });
      }
      return days;
    },
  });

  // Pending news queue
  const { data: pendingNews, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-news"],
    queryFn: async () => {
      const { data, count } = await supabase
        .from("curated_news")
        .select("id, original_title, engagement_potential, fetched_at", { count: "exact" })
        .eq("processed", false)
        .order("engagement_potential", { ascending: false })
        .limit(10);

      return { items: data || [], total: count || 0 };
    },
    refetchInterval: 30000,
  });

  // Recent published articles
  const { data: recentArticles, isLoading: loadingRecent } = useQuery({
    queryKey: ["recent-published-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, published_at, featured_image")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5);

      return data || [];
    },
    refetchInterval: 30000,
  });

  // Articles per hour (last 24h)
  const { data: hourlyStats, isLoading: loadingHourly } = useQuery({
    queryKey: ["automation-hourly-stats"],
    queryFn: async () => {
      const hours = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const hourStart = new Date(now);
        hourStart.setHours(now.getHours() - i, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourStart.getHours() + 1);

        const { count } = await supabase
          .from("articles")
          .select("id", { count: "exact" })
          .gte("published_at", hourStart.toISOString())
          .lt("published_at", hourEnd.toISOString())
          .eq("status", "published");

        hours.push({
          hour: format(hourStart, "HH:mm"),
          count: count || 0,
        });
      }
      return hours;
    },
    refetchInterval: 60000,
  });

  // System health check
  const { data: systemHealth, isLoading: loadingHealth } = useQuery({
    queryKey: ["automation-system-health"],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

      // Check if articles were published in last 6 hours
      const { count: recentArticles } = await supabase
        .from("articles")
        .select("id", { count: "exact" })
        .gte("published_at", sixHoursAgo.toISOString())
        .eq("status", "published");

      // Check if news was fetched in last hour
      const { count: recentNews } = await supabase
        .from("curated_news")
        .select("id", { count: "exact" })
        .gte("fetched_at", oneHourAgo.toISOString());

      // Get last published article time
      const { data: lastArticle } = await supabase
        .from("articles")
        .select("published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check for articles without images today
      const startOfToday = startOfDay(now).toISOString();
      const { count: articlesWithoutImages } = await supabase
        .from("articles")
        .select("id", { count: "exact" })
        .gte("published_at", startOfToday)
        .eq("status", "published")
        .is("featured_image", null);

      const isHealthy = (recentArticles || 0) > 0 && (recentNews || 0) > 0;
      const hasWarnings = (articlesWithoutImages || 0) > 0;

      return {
        status: isHealthy ? (hasWarnings ? "warning" : "healthy") : "error",
        lastPublished: lastArticle?.published_at,
        recentArticles: recentArticles || 0,
        recentNews: recentNews || 0,
        articlesWithoutImages: articlesWithoutImages || 0,
      };
    },
    refetchInterval: 30000,
  });

  // Manual fetch news
  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      setIsFetching(true);
      const { data, error } = await supabase.functions.invoke("fetch-news");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Notícias buscadas: ${data?.totalNew || 0} novas${data?.totalTrending ? ` (${data.totalTrending} trending)` : ""}`);
      queryClient.invalidateQueries({ queryKey: ["pending-news"] });
      queryClient.invalidateQueries({ queryKey: ["automation-stats-today"] });
    },
    onError: (error) => {
      toast.error(`Erro ao buscar notícias: ${error.message}`);
    },
    onSettled: () => {
      setIsFetching(false);
    },
  });

  // Manual publish articles
  const publishMutation = useMutation({
    mutationFn: async (count: number) => {
      setIsPublishing(true);
      const { data, error } = await supabase.functions.invoke("auto-publish-articles", {
        body: { count },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Publicados: ${data?.published || 0} artigos`);
      queryClient.invalidateQueries({ queryKey: ["pending-news"] });
      queryClient.invalidateQueries({ queryKey: ["automation-stats-today"] });
      queryClient.invalidateQueries({ queryKey: ["recent-published-articles"] });
    },
    onError: (error) => {
      toast.error(`Erro ao publicar: ${error.message}`);
    },
    onSettled: () => {
      setIsPublishing(false);
    },
  });

  // Auto internal linking mutation
  const autoLinkingMutation = useMutation({
    mutationFn: async (mode: 'all' | 'recent') => {
      setIsLinking(true);
      setLinkingResult(null);
      const { data, error } = await supabase.functions.invoke("auto-internal-linking", {
        body: { mode },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setLinkingResult({ 
        linksCreated: data?.linksCreated || 0,
        articlesProcessed: data?.articlesProcessed || 0
      });
      toast.success(`Links SEO criados: ${data?.linksCreated || 0} novos links`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar links: ${error.message}`);
    },
    onSettled: () => {
      setIsLinking(false);
    },
  });

  // Test automation
  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("auto-publish-articles", {
        body: { count: 1, test: true },
      });
      
      if (error) throw error;
      
      if (data?.published > 0 && data?.articles?.length > 0) {
        setTestResult({
          success: true,
          article: data.articles[0],
        });
        toast.success("Teste concluído com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["pending-news"] });
        queryClient.invalidateQueries({ queryKey: ["automation-stats-today"] });
        queryClient.invalidateQueries({ queryKey: ["recent-published-articles"] });
      } else {
        setTestResult({
          success: false,
          error: data?.message || "Nenhuma notícia disponível para teste",
        });
        toast.error("Teste falhou: nenhuma notícia disponível");
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || "Erro desconhecido",
      });
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setIsSavingSettings(true);
    
    try {
      const updates = [
        { key: "articles_per_execution", value: JSON.stringify(articlesPerExecution) },
        { key: "daily_target", value: JSON.stringify(dailyTarget) },
        { key: "image_fallback_enabled", value: JSON.stringify(fallbackEnabled) },
        { key: "trending_boost_enabled", value: JSON.stringify(trendingBoost) },
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from("automation_settings")
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq("key", update.key);
        
        if (error) throw error;
      }
      
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["automation-settings"] });
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const progressPercentage = todayStats 
    ? Math.min((todayStats.articlesPublished / dailyTarget) * 100, 100)
    : 0;

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
          AUTOMAÇÃO DE CONTEÚDO
        </span>
        <h1 className="text-3xl font-light tracking-wide text-foreground flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          Automação
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitoramento e controle da publicação automática de artigos
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoramento</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4" />
            <span className="hidden sm:inline">Fila Inteligente</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            <span className="hidden sm:inline">Teste</span>
          </TabsTrigger>
        </TabsList>

        {/* Monitor Tab */}
        <TabsContent value="monitor" className="space-y-6 mt-6">
          {/* Today's Progress */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal">
                <Calendar className="h-5 w-5 text-primary" />
                Progresso de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingStats ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Meta: {dailyTarget} artigos/dia
                    </span>
                    <span className="text-2xl font-light">
                      {todayStats?.articlesPublished}/{dailyTarget}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-light text-primary">{todayStats?.articlesPublished}</div>
                      <div className="text-xs text-muted-foreground">Artigos Publicados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-primary">{todayStats?.newsFetched}</div>
                      <div className="text-xs text-muted-foreground">Notícias Coletadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-primary">{todayStats?.imagesGenerated}</div>
                      <div className="text-xs text-muted-foreground">Imagens Geradas</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* System Health, Hourly Stats, and Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* System Health Card */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Saúde do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHealth ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        systemHealth?.status === "healthy" 
                          ? "bg-green-500" 
                          : systemHealth?.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      } animate-pulse`} />
                      <span className="text-lg font-light">
                        {systemHealth?.status === "healthy" 
                          ? "Operacional" 
                          : systemHealth?.status === "warning"
                            ? "Atenção"
                            : "Problema Detectado"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última publicação:</span>
                        <span>{systemHealth?.lastPublished 
                          ? format(new Date(systemHealth.lastPublished), "HH:mm") 
                          : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Artigos (6h):</span>
                        <span>{systemHealth?.recentArticles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Busca (1h):</span>
                        <span>{systemHealth?.recentNews}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hourly Stats Card */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Artigos por Hora (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHourly ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="flex items-end gap-0.5 h-20">
                    {hourlyStats?.map((hour, i) => {
                      const maxCount = Math.max(...(hourlyStats?.map(h => h.count) || [1]), 1);
                      const heightPercent = (hour.count / maxCount) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className={`w-full rounded-t transition-all ${hour.count > 0 ? 'bg-primary' : 'bg-muted'}`}
                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            title={`${hour.hour}: ${hour.count} artigos`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>24h atrás</span>
                  <span>Total: {hourlyStats?.reduce((acc, h) => acc + h.count, 0) || 0}</span>
                  <span>Agora</span>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Card */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHealth ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="space-y-2">
                    {(systemHealth?.articlesWithoutImages || 0) > 0 && (
                      <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{systemHealth?.articlesWithoutImages} artigos sem imagem</span>
                      </div>
                    )}
                    {systemHealth?.status === "error" && (
                      <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Sistema inativo há mais de 6h</span>
                      </div>
                    )}
                    {(systemHealth?.articlesWithoutImages || 0) === 0 && systemHealth?.status !== "error" && (
                      <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Nenhum alerta</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  Buscar Notícias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Busca manual de notícias das fontes configuradas
                </p>
                <Button
                  onClick={() => fetchNewsMutation.mutate()}
                  disabled={isFetching}
                  variant="outline"
                  className="w-full border-border hover:border-primary/50"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Buscar Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Publicar Artigos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Fila: {pendingNews?.total || 0} notícias pendentes
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => publishMutation.mutate(1)}
                    disabled={isPublishing || !pendingNews?.total}
                    variant="outline"
                    className="flex-1 border-border hover:border-primary/50"
                  >
                    1
                  </Button>
                  <Button
                    onClick={() => publishMutation.mutate(3)}
                    disabled={isPublishing || (pendingNews?.total || 0) < 3}
                    variant="outline"
                    className="flex-1 border-border hover:border-primary/50"
                  >
                    3
                  </Button>
                  <Button
                    onClick={() => publishMutation.mutate(5)}
                    disabled={isPublishing || (pendingNews?.total || 0) < 5}
                    className="flex-1"
                  >
                    {isPublishing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "5"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auto Internal Linking */}
            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Links Internos SEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gerar links internos automaticamente entre artigos relacionados
                </p>
                {linkingResult && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{linkingResult.linksCreated} links criados</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => autoLinkingMutation.mutate('recent')}
                    disabled={isLinking}
                    variant="outline"
                    className="flex-1 border-border hover:border-primary/50"
                  >
                    {isLinking ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Recentes"
                    )}
                  </Button>
                  <Button
                    onClick={() => autoLinkingMutation.mutate('all')}
                    disabled={isLinking}
                    className="flex-1"
                  >
                    {isLinking ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Todos"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-normal">
                  <Clock className="h-5 w-5 text-primary" />
                  Cronograma Diário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {SCHEDULE.map((item, index) => {
                    const isPast = item.time < currentTimeStr;
                    const isCurrent = 
                      index < SCHEDULE.length - 1 
                        ? item.time <= currentTimeStr && currentTimeStr < SCHEDULE[index + 1].time
                        : item.time <= currentTimeStr;

                    return (
                      <div
                        key={item.time}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          isCurrent 
                            ? "bg-primary/10 border border-primary/50" 
                            : isPast 
                              ? "opacity-50" 
                              : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isPast ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : isCurrent ? (
                            <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                          )}
                          <span className="font-mono text-sm">{item.time}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.action}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-normal">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Publicações da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingWeekly ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-3">
                    {weeklyStats?.map((day) => (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="w-10 text-sm text-muted-foreground capitalize">{day.date}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min((day.count / dailyTarget) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-8 text-sm font-medium">{day.count}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total da semana</span>
                        <span className="font-medium">
                          {weeklyStats?.reduce((acc, day) => acc + day.count, 0) || 0} artigos
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Articles */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal">
                <Image className="h-5 w-5 text-primary" />
                Artigos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecent ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentArticles?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhum artigo publicado recentemente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentArticles?.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      {article.featured_image ? (
                        <img
                          src={article.featured_image}
                          alt=""
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-normal truncate">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {article.published_at && format(new Date(article.published_at), "dd/MM HH:mm")}
                        </p>
                      </div>
                      <Badge variant={article.featured_image ? "default" : "secondary"} className="text-xs">
                        {article.featured_image ? "Com imagem" : "Sem imagem"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="font-normal flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configurações de Automação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSettings ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Daily Target */}
                  <div className="space-y-3">
                    <Label className="text-base">Meta de Artigos por Dia</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[dailyTarget]}
                        onValueChange={(v) => setDailyTarget(v[0])}
                        min={5}
                        max={30}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-mono text-lg bg-muted px-2 py-1 rounded">
                        {dailyTarget}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Quantidade de artigos a serem publicados por dia
                    </p>
                  </div>

                  {/* Articles per Execution */}
                  <div className="space-y-3">
                    <Label className="text-base">Artigos por Execução</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[articlesPerExecution]}
                        onValueChange={(v) => setArticlesPerExecution(v[0])}
                        min={1}
                        max={5}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-mono text-lg bg-muted px-2 py-1 rounded">
                        {articlesPerExecution}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Quantidade de artigos publicados a cada execução do cron job
                    </p>
                  </div>

                  {/* Image Fallback */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="space-y-1">
                      <Label className="text-base">Fallback de Imagens</Label>
                      <p className="text-xs text-muted-foreground">
                        Usar imagem placeholder quando a geração por IA falhar
                      </p>
                    </div>
                    <Switch 
                      checked={fallbackEnabled} 
                      onCheckedChange={setFallbackEnabled} 
                    />
                  </div>

                  {/* Trending Boost */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="space-y-1">
                      <Label className="text-base">Priorização Inteligente</Label>
                      <p className="text-xs text-muted-foreground">
                        Priorizar trending topics e notícias com maior potencial de engajamento
                      </p>
                    </div>
                    <Switch 
                      checked={trendingBoost} 
                      onCheckedChange={setTrendingBoost} 
                    />
                  </div>

                  <Button 
                    onClick={saveSettings} 
                    disabled={isSavingSettings}
                    className="w-full"
                  >
                    {isSavingSettings ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-normal">
                <span className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  Fila de Prioridade
                </span>
                <Badge variant="outline">{pendingNews?.total || 0} pendentes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingNews?.items.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-xs font-medium uppercase tracking-widest text-primary mb-4 block">
                    AMAZONIA RESEARCH
                  </span>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhuma notícia na fila</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => fetchNewsMutation.mutate()}
                    disabled={isFetching}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                    Buscar Notícias
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingNews?.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-mono">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-normal line-clamp-2">{item.original_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {item.fetched_at && format(new Date(item.fetched_at), "dd/MM HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.engagement_potential >= 70 && (
                          <Badge variant="default" className="text-xs">
                            Trending
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs font-mono">
                          {item.engagement_potential}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="mt-6">
          <Card className="border border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-normal flex items-center gap-2 text-primary">
                <Beaker className="h-5 w-5" />
                Teste de Automação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Publique 1 artigo manualmente para verificar se a geração de imagem e o processo de publicação estão funcionando corretamente.
              </p>
              
              {testResult && (
                <div className={`p-4 rounded-lg border ${testResult.success ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? "Teste bem-sucedido!" : "Falha no teste"}
                    </span>
                  </div>
                  
                  {testResult.success && testResult.article && (
                    <div className="space-y-3">
                      <p className="text-sm">
                        <strong>Artigo:</strong> {testResult.article.title}
                      </p>
                      {testResult.article.imageUrl && (
                        <div className="space-y-2">
                          <img
                            src={testResult.article.imageUrl}
                            alt=""
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="flex items-center gap-2">
                            <Badge variant={testResult.article.imageGenerated ? "default" : "secondary"}>
                              {testResult.article.imageGenerated ? "Imagem IA" : "Imagem Fallback"}
                            </Badge>
                            {testResult.article.imageGenerated ? (
                              <span className="text-xs text-primary">✓ Geração de IA funcionando</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Fallback aplicado</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!testResult.success && testResult.error && (
                    <p className="text-sm text-destructive">{testResult.error}</p>
                  )}
                </div>
              )}
              
              <Button
                onClick={runTest}
                disabled={isTesting || !pendingNews?.total}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Executar Teste
                  </>
                )}
              </Button>
              
              {!pendingNews?.total && (
                <p className="text-xs text-center text-muted-foreground">
                  Nenhuma notícia na fila. Busque notícias primeiro para testar.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
