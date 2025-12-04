import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WebVitalsCard } from "@/components/admin/WebVitalsCard";
import { PerformanceChart } from "@/components/admin/PerformanceChart";
import { METRIC_THRESHOLDS, getMetricRating } from "@/lib/webVitals";
import {
  Activity,
  Clock,
  LayoutDashboard,
  MousePointer,
  Paintbrush,
  Server,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface MetricSummary {
  name: string;
  avg: number;
  count: number;
}

interface PageMetric {
  page_url: string;
  lcp_avg: number;
  cls_avg: number;
  inp_avg: number;
  count: number;
}

interface ChartDataPoint {
  date: string;
  LCP?: number;
  CLS?: number;
  INP?: number;
  FCP?: number;
  TTFB?: number;
}

const METRIC_CONFIG = {
  LCP: {
    icon: Paintbrush,
    description: "Largest Contentful Paint - Tempo até o maior elemento visível ser renderizado",
    unit: "ms",
    target: "< 2.5s",
  },
  CLS: {
    icon: LayoutDashboard,
    description: "Cumulative Layout Shift - Estabilidade visual da página",
    unit: "",
    target: "< 0.1",
  },
  INP: {
    icon: MousePointer,
    description: "Interaction to Next Paint - Responsividade às interações do usuário",
    unit: "ms",
    target: "< 200ms",
  },
  FCP: {
    icon: Clock,
    description: "First Contentful Paint - Tempo até o primeiro conteúdo ser exibido",
    unit: "ms",
    target: "< 1.8s",
  },
  TTFB: {
    icon: Server,
    description: "Time to First Byte - Tempo de resposta do servidor",
    unit: "ms",
    target: "< 800ms",
  },
};

export default function Performance() {
  const { user, isLoading: authLoading, isAdmin, isEditor } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("24h");
  const [summaryData, setSummaryData] = useState<MetricSummary[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pageMetrics, setPageMetrics] = useState<PageMetric[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    if (!authLoading && user && !isAdmin && !isEditor) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, isEditor, navigate]);

  const getPeriodDays = () => {
    switch (period) {
      case "7d": return 7;
      case "30d": return 30;
      default: return 1;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const days = getPeriodDays();
    const startDate = startOfDay(subDays(new Date(), days));

    try {
      // Fetch summary data
      const { data: metricsData } = await supabase
        .from("web_vitals_metrics")
        .select("metric_name, metric_value")
        .gte("created_at", startDate.toISOString());

      if (metricsData) {
        const grouped = metricsData.reduce((acc, item) => {
          if (!acc[item.metric_name]) {
            acc[item.metric_name] = { total: 0, count: 0 };
          }
          acc[item.metric_name].total += Number(item.metric_value);
          acc[item.metric_name].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

        const summary = Object.entries(grouped).map(([name, data]) => ({
          name,
          avg: data.total / data.count,
          count: data.count,
        }));

        setSummaryData(summary);
      }

      // Fetch chart data (daily averages)
      const { data: dailyData } = await supabase
        .from("web_vitals_metrics")
        .select("metric_name, metric_value, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (dailyData && dailyData.length > 0) {
        const dailyGrouped: Record<string, Record<string, { total: number; count: number }>> = {};

        dailyData.forEach((item) => {
          const day = format(new Date(item.created_at), "yyyy-MM-dd");
          if (!dailyGrouped[day]) {
            dailyGrouped[day] = {};
          }
          if (!dailyGrouped[day][item.metric_name]) {
            dailyGrouped[day][item.metric_name] = { total: 0, count: 0 };
          }
          dailyGrouped[day][item.metric_name].total += Number(item.metric_value);
          dailyGrouped[day][item.metric_name].count += 1;
        });

        const chartDataPoints: ChartDataPoint[] = Object.entries(dailyGrouped).map(
          ([date, metrics]) => {
            const point: ChartDataPoint = { date };
            Object.entries(metrics).forEach(([metric, data]) => {
              (point as any)[metric] = Math.round(data.total / data.count);
            });
            return point;
          }
        );

        setChartData(chartDataPoints);
      }

      // Fetch page-level metrics
      const { data: pageData } = await supabase
        .from("web_vitals_metrics")
        .select("page_url, metric_name, metric_value")
        .gte("created_at", startDate.toISOString());

      if (pageData) {
        const pageGrouped: Record<
          string,
          { lcp: number[]; cls: number[]; inp: number[] }
        > = {};

        pageData.forEach((item) => {
          if (!item.page_url) return;
          if (!pageGrouped[item.page_url]) {
            pageGrouped[item.page_url] = { lcp: [], cls: [], inp: [] };
          }
          const metric = item.metric_name.toLowerCase() as "lcp" | "cls" | "inp";
          if (pageGrouped[item.page_url][metric]) {
            pageGrouped[item.page_url][metric].push(Number(item.metric_value));
          }
        });

        const pageStats: PageMetric[] = Object.entries(pageGrouped)
          .map(([url, metrics]) => ({
            page_url: url,
            lcp_avg: metrics.lcp.length
              ? metrics.lcp.reduce((a, b) => a + b, 0) / metrics.lcp.length
              : 0,
            cls_avg: metrics.cls.length
              ? metrics.cls.reduce((a, b) => a + b, 0) / metrics.cls.length
              : 0,
            inp_avg: metrics.inp.length
              ? metrics.inp.reduce((a, b) => a + b, 0) / metrics.inp.length
              : 0,
            count: metrics.lcp.length + metrics.cls.length + metrics.inp.length,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setPageMetrics(pageStats);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user && (isAdmin || isEditor)) {
      fetchData();
    }
  }, [user, isAdmin, isEditor, period]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const getMetricSummary = (name: string) => {
    const metric = summaryData.find((m) => m.name === name);
    return metric ? metric.avg : 0;
  };

  const getTotalMeasurements = () => {
    return summaryData.reduce((acc, m) => acc + m.count, 0);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
            CORE WEB VITALS
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Performance
          </h1>
          <p className="text-muted-foreground font-normal">
            Monitore as métricas de Core Web Vitals do seu blog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-border hover:border-primary/50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">Total de Medições</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light tracking-wide">{getTotalMeasurements()}</div>
            <p className="text-xs text-muted-foreground">
              no período selecionado
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">Páginas Analisadas</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light tracking-wide">{pageMetrics.length}</div>
            <p className="text-xs text-muted-foreground">
              URLs únicas
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">LCP Médio</CardTitle>
            <Paintbrush className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light tracking-wide">
              {getMetricSummary("LCP") > 1000
                ? `${(getMetricSummary("LCP") / 1000).toFixed(2)}s`
                : `${Math.round(getMetricSummary("LCP"))}ms`}
            </div>
            <p className="text-xs text-muted-foreground">
              Meta: {"< 2.5s"}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">CLS Médio</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light tracking-wide">
              {getMetricSummary("CLS").toFixed(3)}
            </div>
            <p className="text-xs text-muted-foreground">
              Meta: {"< 0.1"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals Cards */}
      <div>
        <h2 className="text-xl font-light tracking-wide mb-4">Core Web Vitals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Object.entries(METRIC_CONFIG).map(([name, config]) => {
            const value = getMetricSummary(name);
            const rating = getMetricRating(name, value);
            return (
              <WebVitalsCard
                key={name}
                name={name}
                value={value}
                rating={rating}
                unit={config.unit}
                description={config.description}
                target={config.target}
                icon={config.icon}
              />
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas as Métricas</TabsTrigger>
          <TabsTrigger value="core">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="pages">Por Página</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PerformanceChart
            data={chartData}
            title="Evolução de Todas as Métricas"
          />
        </TabsContent>

        <TabsContent value="core">
          <PerformanceChart
            data={chartData}
            title="Core Web Vitals (LCP, CLS, INP)"
            selectedMetrics={["LCP", "CLS", "INP"]}
          />
        </TabsContent>

        <TabsContent value="pages">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-normal">Performance por Página</CardTitle>
            </CardHeader>
            <CardContent>
              {pageMetrics.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-4">
                    BYOMA RESEARCH
                  </span>
                  <p className="text-muted-foreground">Sem dados de páginas para exibir</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-normal">URL</th>
                        <th className="text-center py-3 px-2 font-normal">LCP</th>
                        <th className="text-center py-3 px-2 font-normal">CLS</th>
                        <th className="text-center py-3 px-2 font-normal">INP</th>
                        <th className="text-center py-3 px-2 font-normal">Medições</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageMetrics.map((page) => (
                        <tr key={page.page_url} className="border-b border-border last:border-0 hover:bg-accent/50">
                          <td className="py-3 px-2 text-sm max-w-[200px] truncate">
                            {page.page_url}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                getMetricRating("LCP", page.lcp_avg) === "good"
                                  ? "bg-primary/10 text-primary"
                                  : getMetricRating("LCP", page.lcp_avg) === "needs-improvement"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {page.lcp_avg > 1000
                                ? `${(page.lcp_avg / 1000).toFixed(1)}s`
                                : `${Math.round(page.lcp_avg)}ms`}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                getMetricRating("CLS", page.cls_avg) === "good"
                                  ? "bg-primary/10 text-primary"
                                  : getMetricRating("CLS", page.cls_avg) === "needs-improvement"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {page.cls_avg.toFixed(3)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                getMetricRating("INP", page.inp_avg) === "good"
                                  ? "bg-primary/10 text-primary"
                                  : getMetricRating("INP", page.inp_avg) === "needs-improvement"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {Math.round(page.inp_avg)}ms
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center text-sm text-muted-foreground">
                            {page.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}