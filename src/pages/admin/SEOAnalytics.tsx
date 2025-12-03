import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";

const SEOAnalytics = () => {
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

      // Fetch internal/external links count
      const { data: internalLinks } = await supabase
        .from("internal_links")
        .select("source_article_id");

      const { data: externalLinks } = await supabase
        .from("external_links")
        .select("article_id");

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

      return {
        metrics: metrics || [],
        totalArticles,
        articlesWithMetrics,
        avgScore,
        internalLinksCount,
        externalLinksCount,
        lowScoreArticles,
        noKeywordArticles,
      };
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-600">Bom</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Regular</Badge>;
    return <Badge variant="destructive">Baixo</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">SEO Analytics</h1>
        <p className="text-muted-foreground">
          Monitore a performance SEO dos seus artigos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(seoData?.avgScore || 0)}`}>
              {(seoData?.avgScore || 0).toFixed(0)}
            </div>
            <Progress
              value={seoData?.avgScore || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Artigos Analisados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {seoData?.articlesWithMetrics}/{seoData?.totalArticles}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              artigos com métricas SEO
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Links Internos</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{seoData?.internalLinksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              conexões entre artigos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Links Externos</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{seoData?.externalLinksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              referências externas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {((seoData?.lowScoreArticles?.length || 0) > 0 || (seoData?.noKeywordArticles?.length || 0) > 0) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(seoData?.lowScoreArticles?.length || 0) > 0 && (
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                • {seoData?.lowScoreArticles.length} artigo(s) com score SEO abaixo de 60
              </p>
            )}
            {(seoData?.noKeywordArticles?.length || 0) > 0 && (
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                • {seoData?.noKeywordArticles.length} artigo(s) sem palavra-chave principal definida
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEO Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas por Artigo</CardTitle>
        </CardHeader>
        <CardContent>
          {seoData?.metrics && seoData.metrics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artigo</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Palavras</TableHead>
                  <TableHead>H1</TableHead>
                  <TableHead>H2</TableHead>
                  <TableHead>H3</TableHead>
                  <TableHead>Densidade KW</TableHead>
                  <TableHead>Links Int.</TableHead>
                  <TableHead>Links Ext.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seoData.metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell>
                      {metric.article ? (
                        <Link
                          to={`/admin/articles/${metric.article.id}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {metric.article.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Artigo removido</span>
                      )}
                    </TableCell>
                    <TableCell>{getScoreBadge(metric.seo_score || 0)}</TableCell>
                    <TableCell>{metric.word_count}</TableCell>
                    <TableCell className={metric.h1_count === 1 ? "text-green-600" : "text-red-600"}>
                      {metric.h1_count}
                    </TableCell>
                    <TableCell>{metric.h2_count}</TableCell>
                    <TableCell>{metric.h3_count}</TableCell>
                    <TableCell>
                      <span className={
                        (metric.keyword_density || 0) >= 1 && (metric.keyword_density || 0) <= 2
                          ? "text-green-600"
                          : "text-yellow-600"
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
              Nenhuma métrica SEO registrada ainda. As métricas são geradas automaticamente quando artigos são criados pela IA.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles without keywords */}
      {seoData?.noKeywordArticles && seoData.noKeywordArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-500">
              Artigos sem Palavra-chave Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artigo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seoData.noKeywordArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SEOAnalytics;
