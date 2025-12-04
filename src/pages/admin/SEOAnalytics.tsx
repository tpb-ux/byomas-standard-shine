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
          Monitore a performance SEO dos seus artigos
        </p>
      </div>

      {/* Stats Cards */}
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
              conexões entre artigos
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
              referências externas
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

      {/* SEO Metrics Table */}
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
              Nenhuma métrica SEO registrada ainda. As métricas são geradas automaticamente quando artigos são criados pela IA.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles without keywords */}
      {seoData?.noKeywordArticles && seoData.noKeywordArticles.length > 0 && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-primary font-normal">
              Artigos sem Palavra-chave Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SEOAnalytics;