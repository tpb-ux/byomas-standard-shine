import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { HistoricoMetrica } from "@/data/casosDetalhe";
import { TrendingUp } from "lucide-react";

interface EmpresaData {
  empresa: string;
  cor: string;
  historico: HistoricoMetrica[];
}

interface SustainabilityEvolutionChartProps {
  empresas: EmpresaData[];
  titulo?: string;
}

const METRICAS = {
  co2Removido: { label: "CO2 Removido (mil ton)", color: "hsl(var(--primary))" },
  energiaRenovavel: { label: "Energia Renovável (%)", color: "hsl(142, 76%, 36%)" },
  reducaoEmissoes: { label: "Redução de Emissões (%)", color: "hsl(221, 83%, 53%)" },
  investimentoSustentabilidade: { label: "Investimento (R$ milhões)", color: "hsl(38, 92%, 50%)" }
};

const CORES_EMPRESAS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(221, 83%, 53%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 55%)",
  "hsl(0, 84%, 60%)"
];

export function SustainabilityEvolutionChart({ empresas, titulo = "Evolução das Métricas de Sustentabilidade" }: SustainabilityEvolutionChartProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState<keyof typeof METRICAS>("co2Removido");

  const dadosGrafico = useMemo(() => {
    if (empresas.length === 0) return [];

    const anos = [...new Set(empresas.flatMap(e => e.historico.map(h => h.ano)))].sort();
    
    return anos.map(ano => {
      const ponto: Record<string, number | string> = { ano: ano.toString() };
      
      empresas.forEach(empresa => {
        const registro = empresa.historico.find(h => h.ano === ano);
        if (registro) {
          ponto[empresa.empresa] = registro[metricaSelecionada];
        }
      });
      
      return ponto;
    });
  }, [empresas, metricaSelecionada]);

  const crescimento = useMemo(() => {
    if (empresas.length === 0) return null;
    
    const empresa = empresas[0];
    const historico = empresa.historico;
    if (historico.length < 2) return null;
    
    const primeiro = historico[0][metricaSelecionada];
    const ultimo = historico[historico.length - 1][metricaSelecionada];
    const percentual = ((ultimo - primeiro) / primeiro) * 100;
    
    return {
      empresa: empresa.empresa,
      percentual: percentual.toFixed(1),
      positivo: percentual > 0
    };
  }, [empresas, metricaSelecionada]);

  if (empresas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum dado disponível para exibição.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{titulo}</CardTitle>
        </div>
        <Select value={metricaSelecionada} onValueChange={(v) => setMetricaSelecionada(v as keyof typeof METRICAS)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(METRICAS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {crescimento && (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant={crescimento.positivo ? "default" : "destructive"} className="text-xs">
              {crescimento.positivo ? "+" : ""}{crescimento.percentual}%
            </Badge>
            <span className="text-sm text-muted-foreground">
              crescimento desde 2018 ({crescimento.empresa})
            </span>
          </div>
        )}
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="ano" 
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              {empresas.map((empresa, index) => (
                <Line
                  key={empresa.empresa}
                  type="monotone"
                  dataKey={empresa.empresa}
                  stroke={CORES_EMPRESAS[index % CORES_EMPRESAS.length]}
                  strokeWidth={2}
                  dot={{ fill: CORES_EMPRESAS[index % CORES_EMPRESAS.length], strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {empresas.map((empresa, index) => (
            <Badge 
              key={empresa.empresa} 
              variant="outline"
              style={{ borderColor: CORES_EMPRESAS[index % CORES_EMPRESAS.length] }}
            >
              <span 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: CORES_EMPRESAS[index % CORES_EMPRESAS.length] }}
              />
              {empresa.empresa}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
