import { useState } from "react";
import { BarChart3, Loader2, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CompetitorAnalysisProps {
  article: any;
}

interface CompetitorData {
  metrics: {
    name: string;
    yours: number;
    average: number;
    recommendation: string;
  }[];
  summary: string;
  strengths: string[];
  improvements: string[];
}

export default function CompetitorAnalysis({ article }: CompetitorAnalysisProps) {
  const [data, setData] = useState<CompetitorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeCompetitors = async () => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-seo-article", {
        body: {
          articleId: article.id,
          action: "competitors",
          content: article.content,
          title: article.title,
          keyword: article.main_keyword,
        },
      });

      if (error) throw error;

      if (result?.competitorData) {
        setData(result.competitorData);
        toast.success("Análise competitiva gerada!");
      }
    } catch (error) {
      console.error("Error analyzing competitors:", error);
      toast.error("Erro ao analisar concorrentes");
    } finally {
      setIsLoading(false);
    }
  };

  const getComparisonIcon = (yours: number, average: number) => {
    const diff = yours - average;
    if (diff >= 10) return <TrendingUp className="h-4 w-4 text-primary" />;
    if (diff <= -10) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getComparisonStatus = (yours: number, average: number) => {
    const diff = ((yours - average) / average) * 100;
    if (diff >= 20) return { label: "Acima da média", color: "bg-primary/10 text-primary border-primary/30" };
    if (diff >= -10) return { label: "Na média", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" };
    return { label: "Abaixo da média", color: "bg-destructive/10 text-destructive border-destructive/30" };
  };

  const radarData = data?.metrics.map(m => ({
    subject: m.name,
    yours: m.yours,
    average: m.average,
    fullMark: 100,
  })) || [];

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparativo com Concorrentes
          </div>
          <Button
            onClick={analyzeCompetitors}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : data ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analisar Concorrentes
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data && !isLoading && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Análise Competitiva</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Compare seu artigo com a média dos top 10 resultados do Google
              para a palavra-chave "{article.main_keyword || "não definida"}".
            </p>
            <Button onClick={analyzeCompetitors} disabled={isLoading || !article.main_keyword}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analisar Concorrentes
            </Button>
            {!article.main_keyword && (
              <p className="text-xs text-muted-foreground mt-2">
                Defina uma palavra-chave principal para habilitar esta análise.
              </p>
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Analisando concorrentes para "{article.main_keyword}"...</p>
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-accent/50 border border-border">
              <p className="text-sm">{data.summary}</p>
            </div>

            {/* Radar Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Seu Artigo"
                    dataKey="yours"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Média Top 10"
                    dataKey="average"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics Table */}
            <div className="space-y-3">
              {data.metrics.map((metric, index) => {
                const status = getComparisonStatus(metric.yours, metric.average);
                return (
                  <div key={index} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getComparisonIcon(metric.yours, metric.average)}
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Seu artigo</p>
                        <p className="text-lg font-light">{metric.yours}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Média Top 10</p>
                        <p className="text-lg font-light">{metric.average}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Progress value={(metric.yours / metric.average) * 50} className="flex-1" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 {metric.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="font-medium text-primary mb-3">✓ Pontos Fortes</h4>
                <ul className="space-y-2">
                  {data.strengths.map((strength, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <h4 className="font-medium text-yellow-600 mb-3">↑ Melhorias Sugeridas</h4>
                <ul className="space-y-2">
                  {data.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
