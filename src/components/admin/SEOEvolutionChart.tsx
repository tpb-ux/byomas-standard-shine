import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LinkData {
  id: string;
  created_at: string | null;
}

interface ScoreData {
  seo_score: number | null;
}

interface SEOEvolutionChartProps {
  internalLinks: LinkData[];
  externalLinks: LinkData[];
  metrics: ScoreData[];
}

const SEOEvolutionChart = ({ internalLinks, externalLinks, metrics }: SEOEvolutionChartProps) => {
  // Prepare data for links evolution chart (last 30 days)
  const linksEvolutionData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, "yyyy-MM-dd"),
        label: format(date, "dd/MM", { locale: ptBR }),
        internal: 0,
        external: 0,
      };
    });

    internalLinks.forEach((link) => {
      if (link.created_at) {
        const linkDate = format(parseISO(link.created_at), "yyyy-MM-dd");
        const dayData = last30Days.find((d) => d.date === linkDate);
        if (dayData) dayData.internal++;
      }
    });

    externalLinks.forEach((link) => {
      if (link.created_at) {
        const linkDate = format(parseISO(link.created_at), "yyyy-MM-dd");
        const dayData = last30Days.find((d) => d.date === linkDate);
        if (dayData) dayData.external++;
      }
    });

    return last30Days;
  }, [internalLinks, externalLinks]);

  // Prepare data for SEO score distribution
  const scoreDistribution = useMemo(() => {
    const distribution = [
      { name: "Excelente (80-100)", value: 0, color: "hsl(var(--primary))" },
      { name: "Bom (60-79)", value: 0, color: "hsl(142, 76%, 36%)" },
      { name: "Regular (40-59)", value: 0, color: "hsl(45, 93%, 47%)" },
      { name: "Baixo (0-39)", value: 0, color: "hsl(var(--destructive))" },
    ];

    metrics.forEach((m) => {
      const score = m.seo_score || 0;
      if (score >= 80) distribution[0].value++;
      else if (score >= 60) distribution[1].value++;
      else if (score >= 40) distribution[2].value++;
      else distribution[3].value++;
    });

    return distribution.filter((d) => d.value > 0);
  }, [metrics]);

  // Cumulative links over time
  const cumulativeLinksData = useMemo(() => {
    let cumulativeInternal = 0;
    let cumulativeExternal = 0;

    return linksEvolutionData.map((day) => {
      cumulativeInternal += day.internal;
      cumulativeExternal += day.external;
      return {
        ...day,
        cumulativeInternal,
        cumulativeExternal,
      };
    });
  }, [linksEvolutionData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Links Creation Over Time */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-sm font-normal">Links Criados (Últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linksEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="internal" name="Internos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="external" name="Externos" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Links Growth */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-sm font-normal">Crescimento Acumulado de Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeLinksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeInternal"
                  name="Links Internos"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeExternal"
                  name="Links Externos"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SEO Score Distribution */}
      <Card className="border border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-normal">Distribuição de Scores SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value} artigos`, "Quantidade"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOEvolutionChart;
