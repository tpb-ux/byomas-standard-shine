import { useState, useMemo } from "react";
import { Zap, Fuel, Plane, Car, Leaf, TreeDeciduous, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Fatores de emissão (kg CO₂)
const FACTORS = {
  electricity: 0.0817,
  gasoline: 2.31,
  diesel: 2.68,
  domesticFlight: 0.133,
  internationalFlight: 0.195,
  carKm: 0.21,
};

const COLORS = ['hsl(var(--primary))', 'hsl(195, 65%, 45%)', 'hsl(40, 85%, 55%)', 'hsl(210, 75%, 35%)'];

// Benchmarks por setor (em toneladas CO₂/ano por porte da empresa)
const SECTOR_BENCHMARKS: Record<string, { name: string; small: number; medium: number; large: number }> = {
  technology: { name: "Tecnologia", small: 15, medium: 80, large: 500 },
  retail: { name: "Varejo", small: 25, medium: 150, large: 800 },
  manufacturing: { name: "Indústria", small: 100, medium: 600, large: 3500 },
  services: { name: "Serviços", small: 20, medium: 100, large: 450 },
  logistics: { name: "Logística/Transporte", small: 60, medium: 350, large: 2000 },
  agriculture: { name: "Agronegócio", small: 120, medium: 700, large: 4000 },
  construction: { name: "Construção Civil", small: 45, medium: 280, large: 1500 },
  hospitality: { name: "Hotelaria/Turismo", small: 35, medium: 180, large: 900 },
};

const COMPANY_SIZES = [
  { id: "small", label: "Pequena (até 50 funcionários)" },
  { id: "medium", label: "Média (50-200 funcionários)" },
  { id: "large", label: "Grande (200+ funcionários)" },
];

const EmissionsCalculator = () => {
  // Estados para inputs de emissão
  const [electricity, setElectricity] = useState(500);
  const [gasoline, setGasoline] = useState(100);
  const [diesel, setDiesel] = useState(0);
  const [domesticFlights, setDomesticFlights] = useState(2000);
  const [internationalFlights, setInternationalFlights] = useState(5000);
  const [carKm, setCarKm] = useState(1000);

  // Estados para benchmark
  const [sector, setSector] = useState("services");
  const [companySize, setCompanySize] = useState<"small" | "medium" | "large">("small");

  // Cálculo das emissões por categoria (em kg CO₂/ano)
  const emissions = useMemo(() => ({
    electricity: electricity * 12 * FACTORS.electricity,
    fuel: (gasoline * FACTORS.gasoline + diesel * FACTORS.diesel) * 12,
    flights: domesticFlights * FACTORS.domesticFlight + internationalFlights * FACTORS.internationalFlight,
    transport: carKm * 12 * FACTORS.carKm,
  }), [electricity, gasoline, diesel, domesticFlights, internationalFlights, carKm]);

  // Total em toneladas CO₂/ano
  const totalTonnes = useMemo(() => {
    const totalKg = Object.values(emissions).reduce((a, b) => a + b, 0);
    return totalKg / 1000;
  }, [emissions]);

  // Dados para o gráfico de pizza
  const chartData = [
    { name: 'Energia', value: emissions.electricity, color: COLORS[0] },
    { name: 'Combustíveis', value: emissions.fuel, color: COLORS[1] },
    { name: 'Viagens', value: emissions.flights, color: COLORS[2] },
    { name: 'Transporte', value: emissions.transport, color: COLORS[3] },
  ].filter(d => d.value > 0);

  // Equivalência em árvores (1 árvore absorve ~22kg CO₂/ano)
  const treesEquivalent = Math.round(totalTonnes * 1000 / 22);

  // Cálculo do benchmark
  const benchmark = useMemo(() => {
    const sectorData = SECTOR_BENCHMARKS[sector];
    const sectorAverage = sectorData[companySize];
    const idealTarget = sectorAverage * 0.7;
    const percentDiff = ((totalTonnes - sectorAverage) / sectorAverage) * 100;
    
    let status: 'low' | 'average' | 'high';
    if (percentDiff > 20) {
      status = 'high';
    } else if (percentDiff > 0) {
      status = 'average';
    } else {
      status = 'low';
    }

    return {
      sectorName: sectorData.name,
      sectorAverage,
      idealTarget,
      percentDiff,
      status,
    };
  }, [sector, companySize, totalTonnes]);

  // Dados para o gráfico de barras comparativo
  const comparisonData = [
    { name: 'Sua Empresa', value: totalTonnes, fill: 'hsl(var(--primary))' },
    { name: 'Média do Setor', value: benchmark.sectorAverage, fill: 'hsl(210, 15%, 60%)' },
    { name: 'Meta ESG', value: benchmark.idealTarget, fill: 'hsl(150, 60%, 40%)' },
  ];

  const getStatusMessage = () => {
    switch (benchmark.status) {
      case 'high':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          text: `Suas emissões estão ${Math.abs(benchmark.percentDiff).toFixed(0)}% acima da média do setor. Considere ações de compensação.`,
          color: 'text-red-600 dark:text-red-400',
        };
      case 'average':
        return {
          icon: <Minus className="h-4 w-4" />,
          text: `Suas emissões estão ${Math.abs(benchmark.percentDiff).toFixed(0)}% acima da média. Há espaço para melhorias.`,
          color: 'text-yellow-600 dark:text-yellow-400',
        };
      case 'low':
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          text: `Parabéns! Suas emissões estão ${Math.abs(benchmark.percentDiff).toFixed(0)}% abaixo da média do setor.`,
          color: 'text-green-600 dark:text-green-400',
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <section className="bg-muted py-20 md:py-28">
      <div className="container mx-auto px-6">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Calculadora de Emissões</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Calcule as Emissões da Sua Empresa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estime quanto CO₂ sua empresa emite anualmente e compare com benchmarks do setor.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seleção de Setor e Porte */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Compare com seu setor
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Setor de atuação</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SECTOR_BENCHMARKS).map(([key, data]) => (
                        <SelectItem key={key} value={key}>{data.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Porte da empresa</Label>
                  <Select value={companySize} onValueChange={(v) => setCompanySize(v as "small" | "medium" | "large")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size.id} value={size.id}>{size.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Inputs de Emissão */}
            <Card className="shadow-sm border-border">
              <CardContent className="p-6 md:p-8">
                <Tabs defaultValue="electricity" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="electricity" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Energia</span>
                    </TabsTrigger>
                    <TabsTrigger value="fuel" className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      <span className="hidden sm:inline">Combustível</span>
                    </TabsTrigger>
                    <TabsTrigger value="flights" className="flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      <span className="hidden sm:inline">Viagens</span>
                    </TabsTrigger>
                    <TabsTrigger value="transport" className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span className="hidden sm:inline">Transporte</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="electricity" className="space-y-6">
                    <div>
                      <Label>Consumo de Energia Elétrica (kWh/mês)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider
                          value={[electricity]}
                          onValueChange={([v]) => setElectricity(v)}
                          max={10000}
                          step={50}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={electricity}
                          onChange={(e) => setElectricity(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Consumo médio mensal de eletricidade da empresa
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="fuel" className="space-y-6">
                    <div>
                      <Label>Gasolina (litros/mês)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider
                          value={[gasoline]}
                          onValueChange={([v]) => setGasoline(v)}
                          max={5000}
                          step={10}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={gasoline}
                          onChange={(e) => setGasoline(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Diesel (litros/mês)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider
                          value={[diesel]}
                          onValueChange={([v]) => setDiesel(v)}
                          max={5000}
                          step={10}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={diesel}
                          onChange={(e) => setDiesel(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="flights" className="space-y-6">
                    <div>
                      <Label>Voos Domésticos (km/ano)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider
                          value={[domesticFlights]}
                          onValueChange={([v]) => setDomesticFlights(v)}
                          max={50000}
                          step={500}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={domesticFlights}
                          onChange={(e) => setDomesticFlights(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Voos Internacionais (km/ano)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider
                          value={[internationalFlights]}
                          onValueChange={([v]) => setInternationalFlights(v)}
                          max={100000}
                          step={1000}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={internationalFlights}
                          onChange={(e) => setInternationalFlights(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transport" className="space-y-6">
                    <div>
                      <Label>Quilômetros rodados (km/mês)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider
                          value={[carKm]}
                          onValueChange={([v]) => setCarKm(v)}
                          max={10000}
                          step={100}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={carKm}
                          onChange={(e) => setCarKm(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Total de km rodados pela frota da empresa
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {/* Total de Emissões */}
            <Card className="shadow-sm border-none bg-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg">Suas Emissões Anuais</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <div className="text-5xl md:text-6xl font-bold mb-2">
                  {totalTonnes.toFixed(1)}
                </div>
                <div className="text-primary-foreground/80 text-lg mb-3">
                  toneladas de CO₂/ano
                </div>
                <Badge 
                  className={`${
                    benchmark.status === 'low' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : benchmark.status === 'average' 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950' 
                        : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {benchmark.status === 'low' && '🌱 Abaixo da média'}
                  {benchmark.status === 'average' && '📊 Na média'}
                  {benchmark.status === 'high' && '⚠️ Acima da média'}
                </Badge>
              </CardContent>
            </Card>

            {/* Comparação com Setor */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Comparação com o Setor</CardTitle>
                <p className="text-sm text-muted-foreground">{benchmark.sectorName}</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart layout="vertical" data={comparisonData} margin={{ left: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `${v}t`} fontSize={12} />
                    <YAxis dataKey="name" type="category" width={90} fontSize={11} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)} t/ano`} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className={`flex items-center gap-2 mt-3 text-sm ${statusMessage.color}`}>
                  {statusMessage.icon}
                  <span>{statusMessage.text}</span>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Distribuição */}
            {chartData.length > 0 && (
              <Card className="shadow-sm border-border">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${(value/1000).toFixed(2)} t`} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Equivalência em Árvores */}
            <Card className="shadow-sm border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <TreeDeciduous className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{treesEquivalent.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    árvores necessárias para compensar
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Button asChild size="lg" className="w-full">
              <Link to="/contato" className="flex items-center gap-2">
                Compensar Minhas Emissões
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmissionsCalculator;
