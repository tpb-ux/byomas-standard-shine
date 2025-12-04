import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetricDataPoint {
  date: string;
  LCP?: number;
  CLS?: number;
  INP?: number;
  FCP?: number;
  TTFB?: number;
}

interface PerformanceChartProps {
  data: MetricDataPoint[];
  title: string;
  selectedMetrics?: string[];
}

const METRIC_COLORS: Record<string, string> = {
  LCP: "hsl(var(--chart-1))",
  CLS: "hsl(var(--chart-2))",
  INP: "hsl(var(--chart-3))",
  FCP: "hsl(var(--chart-4))",
  TTFB: "hsl(var(--chart-5))",
};

const METRIC_LABELS: Record<string, string> = {
  LCP: "LCP (ms)",
  CLS: "CLS",
  INP: "INP (ms)",
  FCP: "FCP (ms)",
  TTFB: "TTFB (ms)",
};

export function PerformanceChart({
  data,
  title,
  selectedMetrics = ["LCP", "CLS", "INP", "FCP", "TTFB"],
}: PerformanceChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: format(new Date(item.date), "dd/MM", { locale: ptBR }),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Sem dados suficientes para exibir o gráfico</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            {selectedMetrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                name={METRIC_LABELS[metric] || metric}
                stroke={METRIC_COLORS[metric]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
