import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SearchConsoleData {
  id: string;
  article_id: string | null;
  url: string;
  query: string | null;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  date: string;
}

interface SearchConsoleChartsProps {
  data: SearchConsoleData[];
}

const SearchConsoleCharts = ({ data }: SearchConsoleChartsProps) => {
  // Aggregate data by date for evolution charts
  const dateAggregated = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        clicks: 0,
        impressions: 0,
        positionSum: 0,
        positionCount: 0,
      };
    }
    acc[date].clicks += item.clicks || 0;
    acc[date].impressions += item.impressions || 0;
    if (item.position) {
      acc[date].positionSum += item.position;
      acc[date].positionCount += 1;
    }
    return acc;
  }, {} as Record<string, { date: string; clicks: number; impressions: number; positionSum: number; positionCount: number }>);

  const evolutionData = Object.values(dateAggregated)
    .map(item => ({
      date: item.date,
      clicks: item.clicks,
      impressions: item.impressions,
      position: item.positionCount > 0 ? item.positionSum / item.positionCount : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days

  // Aggregate keywords by clicks
  const keywordAggregated = data.reduce((acc, item) => {
    if (!item.query) return acc;
    if (!acc[item.query]) {
      acc[item.query] = { query: item.query, clicks: 0, impressions: 0 };
    }
    acc[item.query].clicks += item.clicks || 0;
    acc[item.query].impressions += item.impressions || 0;
    return acc;
  }, {} as Record<string, { query: string; clicks: number; impressions: number }>);

  const topKeywords = Object.values(keywordAggregated)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // CTR by position range
  const ctrByPosition = data.reduce((acc, item) => {
    if (!item.position || !item.ctr) return acc;
    let range: string;
    if (item.position <= 3) range = "1-3";
    else if (item.position <= 10) range = "4-10";
    else if (item.position <= 20) range = "11-20";
    else range = "21+";

    if (!acc[range]) {
      acc[range] = { range, ctrSum: 0, count: 0 };
    }
    acc[range].ctrSum += item.ctr;
    acc[range].count += 1;
    return acc;
  }, {} as Record<string, { range: string; ctrSum: number; count: number }>);

  const ctrData = ["1-3", "4-10", "11-20", "21+"]
    .map(range => ({
      range,
      ctr: ctrByPosition[range] ? ctrByPosition[range].ctrSum / ctrByPosition[range].count : 0,
    }))
    .filter(item => item.ctr > 0);

  const chartConfig = {
    clicks: { label: "Cliques", color: "hsl(var(--primary))" },
    impressions: { label: "Impressões", color: "hsl(var(--muted-foreground))" },
    position: { label: "Posição", color: "hsl(var(--primary))" },
    ctr: { label: "CTR", color: "hsl(var(--primary))" },
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado do Search Console disponível.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Clicks & Impressions Evolution */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal">Cliques & Impressões (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(parseISO(value), "dd/MM", { locale: ptBR })}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="impressions"
                fill="hsl(var(--muted-foreground) / 0.2)"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="clicks"
                fill="hsl(var(--primary) / 0.3)"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Position Evolution */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal">Posição Média (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(parseISO(value), "dd/MM", { locale: ptBR })}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis reversed domain={[1, 'auto']} tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="position"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal">Top 10 Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={topKeywords}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis
                dataKey="query"
                type="category"
                width={120}
                tick={{ fontSize: 9 }}
                className="text-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* CTR by Position */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal">CTR por Posição</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={ctrData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`${Number(value).toFixed(2)}%`, "CTR"]}
              />
              <Bar dataKey="ctr" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchConsoleCharts;
