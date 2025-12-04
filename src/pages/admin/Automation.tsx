import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  Newspaper
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

export default function Automation() {
  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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
        targetArticles: 15,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
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

  // Manual fetch news
  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      setIsFetching(true);
      const { data, error } = await supabase.functions.invoke("fetch-news");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Notícias buscadas: ${data?.inserted || 0} novas`);
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

  const progressPercentage = todayStats 
    ? Math.min((todayStats.articlesPublished / todayStats.targetArticles) * 100, 100)
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
                  Meta: {todayStats?.targetArticles} artigos/dia
                </span>
                <span className="text-2xl font-light">
                  {todayStats?.articlesPublished}/{todayStats?.targetArticles}
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
                1 artigo
              </Button>
              <Button
                onClick={() => publishMutation.mutate(3)}
                disabled={isPublishing || (pendingNews?.total || 0) < 3}
                variant="outline"
                className="flex-1 border-border hover:border-primary/50"
              >
                3 artigos
              </Button>
              <Button
                onClick={() => publishMutation.mutate(5)}
                disabled={isPublishing || (pendingNews?.total || 0) < 5}
                className="flex-1"
              >
                {isPublishing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "5 artigos"
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
                        style={{ width: `${Math.min((day.count / 15) * 100, 100)}%` }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Queue */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-normal">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Fila de Publicação
              </span>
              <Badge variant="outline">{pendingNews?.total || 0} pendentes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPending ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingNews?.items.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-xs font-medium uppercase tracking-widest text-primary mb-4 block">
                  BYOMA RESEARCH
                </span>
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Nenhuma notícia na fila</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingNews?.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <p className="text-sm font-normal line-clamp-2">{item.original_title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {item.fetched_at && format(new Date(item.fetched_at), "dd/MM HH:mm")}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Score: {item.engagement_potential?.toFixed(0) || 0}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Published */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal">
              <Image className="h-5 w-5 text-primary" />
              Últimos Publicados
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
                <span className="text-xs font-medium uppercase tracking-widest text-primary mb-4 block">
                  BYOMA RESEARCH
                </span>
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Nenhum artigo publicado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentArticles?.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt=""
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal line-clamp-1">{article.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.published_at && format(new Date(article.published_at), "dd/MM HH:mm")}
                      </p>
                    </div>
                    {article.featured_image ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
