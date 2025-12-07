import { Search, TrendingUp, MousePointerClick, Target, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ArticleSearchConsoleProps {
  data: any[];
}

export default function ArticleSearchConsole({ data }: ArticleSearchConsoleProps) {
  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      clicks: acc.clicks + (item.clicks || 0),
      impressions: acc.impressions + (item.impressions || 0),
      position: acc.position + (item.position || 0),
      ctr: acc.ctr + (item.ctr || 0),
      count: acc.count + 1,
    }),
    { clicks: 0, impressions: 0, position: 0, ctr: 0, count: 0 }
  );

  const avgPosition = totals.count > 0 ? totals.position / totals.count : 0;
  const avgCtr = totals.count > 0 ? totals.ctr / totals.count : 0;

  // Group by date for chart
  const chartData = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = { date, clicks: 0, impressions: 0 };
    }
    acc[date].clicks += item.clicks || 0;
    acc[date].impressions += item.impressions || 0;
    return acc;
  }, {} as Record<string, { date: string; clicks: number; impressions: number }>);

  const chartDataArray = Object.values(chartData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Top queries
  const topQueries = [...data]
    .filter(d => d.query)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <Card className="border border-border">
        <CardContent className="py-12">
          <div className="text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Sem dados do Search Console</h3>
            <p className="text-muted-foreground text-sm">
              Este artigo ainda não possui dados do Google Search Console.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Os dados podem levar alguns dias para aparecer após a publicação.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Cliques</span>
            </div>
            <p className="text-2xl font-light">{totals.clicks}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Impressões</span>
            </div>
            <p className="text-2xl font-light">{totals.impressions}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Posição Média</span>
            </div>
            <p className="text-2xl font-light">{avgPosition.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">CTR Médio</span>
            </div>
            <p className="text-2xl font-light">{(avgCtr * 100).toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      {chartDataArray.length > 1 && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="font-normal">Evolução nos últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataArray}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: ptBR })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), "dd 'de' MMMM", { locale: ptBR })}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    name="Cliques"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    dot={false}
                    name="Impressões"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Queries Table */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-normal flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Top 10 Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topQueries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">Impressões</TableHead>
                  <TableHead className="text-right">Posição</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topQueries.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.query}
                      {index < 3 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Top {index + 1}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.clicks || 0}</TableCell>
                    <TableCell className="text-right">{item.impressions || 0}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline"
                        className={
                          (item.position || 0) <= 3 ? "text-primary border-primary" :
                          (item.position || 0) <= 10 ? "text-yellow-500 border-yellow-500" :
                          "text-muted-foreground"
                        }
                      >
                        {(item.position || 0).toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {((item.ctr || 0) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma query encontrada para este artigo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
