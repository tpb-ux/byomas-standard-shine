import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CreditsHistory {
  date: string;
  amount: number;
}

interface ProjectCreditsChartProps {
  creditsHistory: CreditsHistory[];
}

const ProjectCreditsChart = ({ creditsHistory }: ProjectCreditsChartProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Emissão de Créditos ao Longo do Tempo
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={creditsHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted">
          <p className="text-sm text-muted-foreground mb-1">Total Gerado</p>
          <p className="text-2xl font-bold text-primary">
            {creditsHistory.reduce((sum, item) => sum + item.amount, 0).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="p-4 bg-muted">
          <p className="text-sm text-muted-foreground mb-1">Média Mensal</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(creditsHistory.reduce((sum, item) => sum + item.amount, 0) / creditsHistory.length).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="p-4 bg-muted">
          <p className="text-sm text-muted-foreground mb-1">Último Mês</p>
          <p className="text-2xl font-bold text-foreground">
            {creditsHistory[creditsHistory.length - 1]?.amount.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreditsChart;
