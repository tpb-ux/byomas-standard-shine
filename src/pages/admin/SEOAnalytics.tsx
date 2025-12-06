import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Link as LinkIcon, BookOpen, FolderTree, Eye, BarChart3, MousePointerClick, Target, Percent, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import SEOEvolutionChart from "@/components/admin/SEOEvolutionChart";
import SearchConsoleCharts from "@/components/admin/SearchConsoleCharts";

const SEOAnalytics = () => {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: seoData, isLoading } = useQuery({
    queryKey: ["admin-seo-analytics"],
    queryFn: async () => {
      // Fetch SEO metrics
      const { data: metrics, error: metricsError } = await supabase
        .from("seo_metrics")
        .select(`
          *,
          article:articles(id, title, slug, status, main_keyword)
        `)
        .order("seo_score", { ascending: true });

      if (metricsError) throw metricsError;

      // Fetch articles without SEO metrics
      const { data: allArticles } = await supabase
        .from("articles")
        .select("id, title, slug, status, main_keyword, content")
        .eq("status", "published");

      // Fetch internal/external links with created_at for charts
      const { data: internalLinks } = await supabase
        .from("internal_links")
        .select("id, source_article_id, created_at");

      const { data: externalLinks } = await supabase
        .from("external_links")
        .select("id, article_id, created_at");

      // Fetch topic clusters
      const { data: topicClusters } = await supabase
        .from("topic_clusters")
        .select(`
          *,
          category:categories(name)
        `)
        .order("article_count", { ascending: false });

      // Fetch pillar pages
      const { data: pillarPages } = await supabase
        .from("pillar_pages")
        .select("id, title, slug, status, views, reading_time, main_keyword")
        .order("views", { ascending: false });

      // Fetch Search Console data
      const { data: searchConsoleData } = await supabase
        .from("search_console_data")
        .select(`
          *,
          article:articles(id, title, slug)
        `)
        .order("clicks", { ascending: false });

      // Calculate Search Console stats
      const gscTotalClicks = searchConsoleData?.reduce((acc, item) => acc + (item.clicks || 0), 0) || 0;
      const gscTotalImpressions = searchConsoleData?.reduce((acc, item) => acc + (item.impressions || 0), 0) || 0;
      const gscAvgPosition = searchConsoleData && searchConsoleData.length > 0
        ? searchConsoleData.reduce((acc, item) => acc + (item.position || 0), 0) / searchConsoleData.length
        : 0;
      const gscAvgCtr = searchConsoleData && searchConsoleData.length > 0
        ? searchConsoleData.reduce((acc, item) => acc + (item.ctr || 0), 0) / searchConsoleData.length
        : 0;

      // Aggregate GSC data by article
      const gscByArticle = searchConsoleData?.reduce((acc, item) => {
        if (!item.article_id) return acc;
        if (!acc[item.article_id]) {
          acc[item.article_id] = {
            article: item.article,
            clicks: 0,
            impressions: 0,
            positionSum: 0,
            ctrSum: 0,
            count: 0,
            keywords: new Set<string>(),
          };
        }
        acc[item.article_id].clicks += item.clicks || 0;
        acc[item.article_id].impressions += item.impressions || 0;
        acc[item.article_id].positionSum += item.position || 0;
        acc[item.article_id].ctrSum += item.ctr || 0;
        acc[item.article_id].count += 1;
        if (item.query) acc[item.article_id].keywords.add(item.query);
        return acc;
      }, {} as Record<string, { article: any; clicks: number; impressions: number; positionSum: number; ctrSum: number; count: number; keywords: Set<string> }>) || {};

      const gscArticleStats = Object.values(gscByArticle)
        .map(item => ({
          article: item.article,
          clicks: item.clicks,
          impressions: item.impressions,
          avgPosition: item.count > 0 ? item.positionSum / item.count : 0,
          avgCtr: item.count > 0 ? item.ctrSum / item.count : 0,
          topKeywords: Array.from(item.keywords).slice(0, 3),
        }))
        .sort((a, b) => b.clicks - a.clicks);

      // Calculate stats
      const totalArticles = allArticles?.length || 0;
      const articlesWithMetrics = metrics?.filter(m => m.article).length || 0;
      const avgScore = metrics && metrics.length > 0
        ? metrics.reduce((acc, m) => acc + (m.seo_score || 0), 0) / metrics.length
        : 0;

      const internalLinksCount = internalLinks?.length || 0;
      const externalLinksCount = externalLinks?.length || 0;

      // Articles with issues
      const lowScoreArticles = metrics?.filter(m => (m.seo_score || 0) < 60) || [];
      const noKeywordArticles = allArticles?.filter(a => !a.main_keyword) || [];

      // Topic clusters stats
      const totalClusters = topicClusters?.length || 0;
      const activeClusters = topicClusters?.filter(tc => tc.is_active).length || 0;
      const totalClusterArticles = topicClusters?.reduce((acc, tc) => acc + (tc.article_count || 0), 0) || 0;

      // Pillar pages stats
      const totalPillarPages = pillarPages?.length || 0;
      const publishedPillarPages = pillarPages?.filter(pp => pp.status === 'published').length || 0;
      const totalPillarViews = pillarPages?.reduce((acc, pp) => acc + (pp.views || 0), 0) || 0;
      const avgPillarReadingTime = pillarPages && pillarPages.length > 0
        ? pillarPages.reduce((acc, pp) => acc + (pp.reading_time || 0), 0) / pillarPages.length
        : 0;

      // Average links per article
      const avgInternalLinks = totalArticles > 0 ? internalLinksCount / totalArticles : 0;
      const avgExternalLinks = totalArticles > 0 ? externalLinksCount / totalArticles : 0;

      return {
        metrics: metrics || [],
        totalArticles,
        articlesWithMetrics,
        avgScore,
        internalLinksCount,
        externalLinksCount,
        lowScoreArticles,
        noKeywordArticles,
        topicClusters: topicClusters || [],
        pillarPages: pillarPages || [],
        totalClusters,
        activeClusters,
        totalClusterArticles,
        totalPillarPages,
        publishedPillarPages,
        totalPillarViews,
        avgPillarReadingTime,
        avgInternalLinks,
        avgExternalLinks,
        internalLinksData: internalLinks || [],
        externalLinksData: externalLinks || [],
        searchConsoleData: searchConsoleData || [],
        gscTotalClicks,
        gscTotalImpressions,
        gscAvgPosition,
        gscAvgCtr,
        gscArticleStats,
      };
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-primary">Bom</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Regular</Badge>;
    return <Badge variant="destructive">Baixo</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
          ANÁLISE DE PERFORMANCE
        </span>
        <h1 className="text-3xl font-light tracking-wide text-foreground">SEO Analytics</h1>
        <p className="text-muted-foreground font-normal">
          Monitore a performance SEO dos seus artigos, topic clusters e pillar pages
        </p>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-light tracking-wide ${getScoreColor(seoData?.avgScore || 0)}`}>
              {(seoData?.avgScore || 0).toFixed(0)}
            </div>
            <Progress
              value={seoData?.avgScore || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Artigos Analisados</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light tracking-wide">
              {seoData?.articlesWithMetrics}/{seoData?.totalArticles}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              artigos com métricas SEO
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Links Internos</CardTitle>
            <LinkIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light tracking-wide">{seoData?.internalLinksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              média: {(seoData?.avgInternalLinks || 0).toFixed(1)} por artigo
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Links Externos</CardTitle>
            <LinkIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light tracking-wide">{seoData?.externalLinksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              média: {(seoData?.avgExternalLinks || 0).toFixed(1)} por artigo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Row 2: Topic Clusters & Pillar Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Topic Clusters</CardTitle>
            <FolderTree className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light tracking-wide">{seoData?.totalClusters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {seoData?.activeClusters} ativos · {seoData?.totalClusterArticles} artigos
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Pillar Pages</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light tracking-wide">{seoData?.totalPillarPages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {seoData?.publishedPillarPages} publicadas
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Views Pillar Pages</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light tracking-wide">{seoData?.totalPillarViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              visualizações totais
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">Tempo Leitura Médio</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light tracking-wide">{(seoData?.avgPillarReadingTime || 0).toFixed(0)} min</div>
            <p className="text-xs text-muted-foreground mt-1">
              pillar pages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {((seoData?.lowScoreArticles?.length || 0) > 0 || (seoData?.noKeywordArticles?.length || 0) > 0) && (
        <Card className="border border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary font-normal">
              <AlertTriangle className="h-5 w-5" />
              Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(seoData?.lowScoreArticles?.length || 0) > 0 && (
              <p className="text-sm text-foreground/80">
                • {seoData?.lowScoreArticles.length} artigo(s) com score SEO abaixo de 60
              </p>
            )}
            {(seoData?.noKeywordArticles?.length || 0) > 0 && (
              <p className="text-sm text-foreground/80">
                • {seoData?.noKeywordArticles.length} artigo(s) sem palavra-chave principal definida
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evolution Charts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-normal text-foreground">Gráficos de Evolução</h2>
        </div>
        <SEOEvolutionChart
          internalLinks={seoData?.internalLinksData || []}
          externalLinks={seoData?.externalLinksData || []}
          metrics={seoData?.metrics || []}
        />
      </div>

      {/* Tabs for different tables */}
      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList className="bg-card border border-border flex-wrap">
          <TabsTrigger value="articles">Artigos SEO</TabsTrigger>
          <TabsTrigger value="topic-clusters">Topic Clusters</TabsTrigger>
          <TabsTrigger value="pillar-pages">Pillar Pages</TabsTrigger>
          <TabsTrigger value="no-keyword">Sem Keyword</TabsTrigger>
          <TabsTrigger value="search-console" className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            Search Console
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="font-normal">Métricas por Artigo</CardTitle>
            </CardHeader>
            <CardContent>
              {seoData?.metrics && seoData.metrics.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-normal">Artigo</TableHead>
                      <TableHead className="font-normal">Score</TableHead>
                      <TableHead className="font-normal">Palavras</TableHead>
                      <TableHead className="font-normal">H1</TableHead>
                      <TableHead className="font-normal">H2</TableHead>
                      <TableHead className="font-normal">H3</TableHead>
                      <TableHead className="font-normal">Densidade KW</TableHead>
                      <TableHead className="font-normal">Links Int.</TableHead>
                      <TableHead className="font-normal">Links Ext.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoData.metrics.map((metric) => (
                      <TableRow key={metric.id} className="hover:bg-accent/50">
                        <TableCell>
                          {metric.article ? (
                            <Link
                              to={`/admin/articles/${metric.article.id}`}
                              className="font-normal hover:text-primary transition-colors line-clamp-1"
                            >
                              {metric.article.title}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Artigo removido</span>
                          )}
                        </TableCell>
                        <TableCell>{getScoreBadge(metric.seo_score || 0)}</TableCell>
                        <TableCell>{metric.word_count}</TableCell>
                        <TableCell className={metric.h1_count === 1 ? "text-primary" : "text-destructive"}>
                          {metric.h1_count}
                        </TableCell>
                        <TableCell>{metric.h2_count}</TableCell>
                        <TableCell>{metric.h3_count}</TableCell>
                        <TableCell>
                          <span className={
                            (metric.keyword_density || 0) >= 1 && (metric.keyword_density || 0) <= 2
                              ? "text-primary"
                              : "text-yellow-500"
                          }>
                            {(metric.keyword_density || 0).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>{metric.internal_links_count}</TableCell>
                        <TableCell>{metric.external_links_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-4">
                    BYOMA RESEARCH
                  </span>
                  Nenhuma métrica SEO registrada ainda.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topic-clusters">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="font-normal">Topic Clusters</CardTitle>
            </CardHeader>
            <CardContent>
              {seoData?.topicClusters && seoData.topicClusters.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-normal">Nome</TableHead>
                      <TableHead className="font-normal">Categoria</TableHead>
                      <TableHead className="font-normal">Artigos</TableHead>
                      <TableHead className="font-normal">Status</TableHead>
                      <TableHead className="font-normal">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoData.topicClusters.map((cluster) => (
                      <TableRow key={cluster.id} className="hover:bg-accent/50">
                        <TableCell className="font-normal">{cluster.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cluster.category?.name || 'Sem categoria'}</Badge>
                        </TableCell>
                        <TableCell>{cluster.article_count || 0}</TableCell>
                        <TableCell>
                          {cluster.is_active ? (
                            <Badge className="bg-primary">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/topico/${cluster.slug}`}
                            className="text-primary hover:underline text-sm"
                          >
                            Ver
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum topic cluster cadastrado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pillar-pages">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="font-normal">Pillar Pages (Guias Completos)</CardTitle>
            </CardHeader>
            <CardContent>
              {seoData?.pillarPages && seoData.pillarPages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-normal">Título</TableHead>
                      <TableHead className="font-normal">Keyword</TableHead>
                      <TableHead className="font-normal">Status</TableHead>
                      <TableHead className="font-normal">Views</TableHead>
                      <TableHead className="font-normal">Leitura</TableHead>
                      <TableHead className="font-normal">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoData.pillarPages.map((page) => (
                      <TableRow key={page.id} className="hover:bg-accent/50">
                        <TableCell className="font-normal">{page.title}</TableCell>
                        <TableCell>
                          {page.main_keyword ? (
                            <Badge variant="outline">{page.main_keyword}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {page.status === 'published' ? (
                            <Badge className="bg-primary">Publicado</Badge>
                          ) : (
                            <Badge variant="secondary">{page.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{page.views || 0}</TableCell>
                        <TableCell>{page.reading_time || 0} min</TableCell>
                        <TableCell>
                          <Link
                            to={`/guia/${page.slug}`}
                            className="text-primary hover:underline text-sm"
                          >
                            Ver
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma pillar page cadastrada.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="no-keyword">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-primary font-normal">
                Artigos sem Palavra-chave Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seoData?.noKeywordArticles && seoData.noKeywordArticles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-normal">Artigo</TableHead>
                      <TableHead className="font-normal">Status</TableHead>
                      <TableHead className="font-normal">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoData.noKeywordArticles.map((article) => (
                      <TableRow key={article.id} className="hover:bg-accent/50">
                        <TableCell className="font-normal">{article.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{article.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/admin/articles/${article.id}`}
                            className="text-primary hover:underline text-sm"
                          >
                            Editar
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-4" />
                  Todos os artigos têm palavra-chave definida.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search-console" className="space-y-6">
          {/* GSC Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-normal">Total de Cliques</CardTitle>
                <MousePointerClick className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light tracking-wide text-primary">
                  {(seoData?.gscTotalClicks || 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-normal">Total de Impressões</CardTitle>
                <Eye className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light tracking-wide">
                  {(seoData?.gscTotalImpressions || 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-normal">Posição Média</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-light tracking-wide ${(seoData?.gscAvgPosition || 0) <= 10 ? 'text-primary' : (seoData?.gscAvgPosition || 0) <= 20 ? 'text-yellow-500' : 'text-destructive'}`}>
                  {(seoData?.gscAvgPosition || 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  no Google
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-normal">CTR Médio</CardTitle>
                <Percent className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-light tracking-wide ${(seoData?.gscAvgCtr || 0) >= 5 ? 'text-primary' : (seoData?.gscAvgCtr || 0) >= 2 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                  {(seoData?.gscAvgCtr || 0).toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  taxa de cliques
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sync Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-normal">Dados do Google Search Console</h3>
              <p className="text-sm text-muted-foreground">
                {seoData?.searchConsoleData?.length || 0} registros · Última sincronização: dados de exemplo
              </p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                setIsSyncing(true);
                try {
                  const { error } = await supabase.functions.invoke('fetch-search-console');
                  if (error) throw error;
                  toast.success('Dados sincronizados com sucesso!');
                  queryClient.invalidateQueries({ queryKey: ['admin-seo-analytics'] });
                } catch (error) {
                  console.error('Error syncing GSC data:', error);
                  toast.error('Erro ao sincronizar. Verifique as credenciais.');
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
            </Button>
          </div>

          {/* Charts */}
          {seoData?.searchConsoleData && seoData.searchConsoleData.length > 0 ? (
            <SearchConsoleCharts data={seoData.searchConsoleData} />
          ) : (
            <Card className="border border-dashed border-primary/50 bg-primary/5">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                <h3 className="text-lg font-normal mb-2">Nenhum dado do Search Console</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Clique em "Sincronizar Dados" para gerar dados de exemplo ou configure as credenciais do GSC para dados reais.
                </p>
                <Button
                  onClick={async () => {
                    setIsSyncing(true);
                    try {
                      const { error } = await supabase.functions.invoke('fetch-search-console');
                      if (error) throw error;
                      toast.success('Dados de exemplo gerados com sucesso!');
                      queryClient.invalidateQueries({ queryKey: ['admin-seo-analytics'] });
                    } catch (error) {
                      console.error('Error generating mock GSC data:', error);
                      toast.error('Erro ao gerar dados de exemplo.');
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Gerar Dados de Exemplo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Performance by Article Table */}
          {seoData?.gscArticleStats && seoData.gscArticleStats.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="font-normal">Performance por Artigo</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-normal">Artigo</TableHead>
                      <TableHead className="font-normal">Posição</TableHead>
                      <TableHead className="font-normal">Cliques</TableHead>
                      <TableHead className="font-normal">Impressões</TableHead>
                      <TableHead className="font-normal">CTR</TableHead>
                      <TableHead className="font-normal">Top Keywords</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoData.gscArticleStats.map((stat, index) => (
                      <TableRow key={stat.article?.id || index} className="hover:bg-accent/50">
                        <TableCell>
                          {stat.article ? (
                            <Link
                              to={`/admin/articles/${stat.article.id}`}
                              className="font-normal hover:text-primary transition-colors line-clamp-1"
                            >
                              {stat.article.title}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">URL externa</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={stat.avgPosition <= 10 ? 'text-primary' : stat.avgPosition <= 20 ? 'text-yellow-500' : 'text-muted-foreground'}>
                            {stat.avgPosition.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>{stat.clicks.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>{stat.impressions.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <span className={stat.avgCtr >= 5 ? 'text-primary' : stat.avgCtr >= 2 ? 'text-yellow-500' : 'text-muted-foreground'}>
                            {stat.avgCtr.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {stat.topKeywords.map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOAnalytics;
