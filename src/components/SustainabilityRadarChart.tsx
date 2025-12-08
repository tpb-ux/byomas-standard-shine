import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CasoDetalhe } from "@/data/casosDetalhe";
import { Target } from "lucide-react";

interface SustainabilityRadarChartProps {
  casos: CasoDetalhe[];
  titulo?: string;
}

const CORES = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(221, 83%, 53%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 55%)",
  "hsl(0, 84%, 60%)"
];

export function SustainabilityRadarChart({ casos, titulo = "Comparação Multi-dimensional" }: SustainabilityRadarChartProps) {
  const dadosRadar = useMemo(() => {
    if (casos.length === 0) return [];

    // Normalizar valores para escala 0-100
    const maxValues = {
      co2: Math.max(...casos.map(c => c.historicoMetricas[c.historicoMetricas.length - 1]?.co2Removido || 0)),
      energia: 100,
      reducao: Math.max(...casos.map(c => c.historicoMetricas[c.historicoMetricas.length - 1]?.reducaoEmissoes || 0)),
      investimento: Math.max(...casos.map(c => c.historicoMetricas[c.historicoMetricas.length - 1]?.investimentoSustentabilidade || 0)),
      certificacoes: Math.max(...casos.map(c => c.certificacoes.length)),
      iniciativas: Math.max(...casos.map(c => c.iniciativas.length))
    };

    const dimensoes = [
      { nome: "CO2 Removido", key: "co2" },
      { nome: "Energia Renovável", key: "energia" },
      { nome: "Redução Emissões", key: "reducao" },
      { nome: "Investimento", key: "investimento" },
      { nome: "Certificações", key: "certificacoes" },
      { nome: "Iniciativas", key: "iniciativas" }
    ];

    return dimensoes.map(dim => {
      const ponto: Record<string, number | string> = { dimensao: dim.nome };
      
      casos.forEach(caso => {
        const ultimoHistorico = caso.historicoMetricas[caso.historicoMetricas.length - 1];
        let valor = 0;
        
        switch (dim.key) {
          case "co2":
            valor = maxValues.co2 > 0 ? ((ultimoHistorico?.co2Removido || 0) / maxValues.co2) * 100 : 0;
            break;
          case "energia":
            valor = ultimoHistorico?.energiaRenovavel || 0;
            break;
          case "reducao":
            valor = maxValues.reducao > 0 ? ((ultimoHistorico?.reducaoEmissoes || 0) / maxValues.reducao) * 100 : 0;
            break;
          case "investimento":
            valor = maxValues.investimento > 0 ? ((ultimoHistorico?.investimentoSustentabilidade || 0) / maxValues.investimento) * 100 : 0;
            break;
          case "certificacoes":
            valor = maxValues.certificacoes > 0 ? (caso.certificacoes.length / maxValues.certificacoes) * 100 : 0;
            break;
          case "iniciativas":
            valor = maxValues.iniciativas > 0 ? (caso.iniciativas.length / maxValues.iniciativas) * 100 : 0;
            break;
        }
        
        ponto[caso.empresa] = Math.round(valor);
      });
      
      return ponto;
    });
  }, [casos]);

  if (casos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Selecione empresas para comparar.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{titulo}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dadosRadar}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis 
                dataKey="dimensao" 
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              {casos.map((caso, index) => (
                <Radar
                  key={caso.empresa}
                  name={caso.empresa}
                  dataKey={caso.empresa}
                  stroke={CORES[index % CORES.length]}
                  fill={CORES[index % CORES.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Valores normalizados em escala de 0-100% para comparação relativa
        </p>
      </CardContent>
    </Card>
  );
}
