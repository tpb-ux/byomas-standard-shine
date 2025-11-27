import { useState, useMemo } from "react";
import { Zap, Fuel, Plane, Car, Leaf, TreeDeciduous, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Fatores de emissão (kg CO₂)
const FACTORS = {
  electricity: 0.0817, // kg CO₂/kWh (média Brasil)
  gasoline: 2.31, // kg CO₂/litro
  diesel: 2.68, // kg CO₂/litro
  domesticFlight: 0.133, // kg CO₂/km por passageiro
  internationalFlight: 0.195, // kg CO₂/km por passageiro
  carKm: 0.21, // kg CO₂/km (carro médio)
};

const COLORS = ['hsl(var(--primary))', 'hsl(195, 65%, 45%)', 'hsl(40, 85%, 55%)', 'hsl(210, 75%, 35%)'];

const EmissionsCalculator = () => {
  // Estados para cada input
  const [electricity, setElectricity] = useState(500);
  const [gasoline, setGasoline] = useState(100);
  const [diesel, setDiesel] = useState(0);
  const [domesticFlights, setDomesticFlights] = useState(2000);
  const [internationalFlights, setInternationalFlights] = useState(5000);
  const [carKm, setCarKm] = useState(1000);

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

  // Dados para o gráfico
  const chartData = [
    { name: 'Energia', value: emissions.electricity, color: COLORS[0] },
    { name: 'Combustíveis', value: emissions.fuel, color: COLORS[1] },
    { name: 'Viagens', value: emissions.flights, color: COLORS[2] },
    { name: 'Transporte', value: emissions.transport, color: COLORS[3] },
  ].filter(d => d.value > 0);

  // Equivalência em árvores (1 árvore absorve ~22kg CO₂/ano)
  const treesEquivalent = Math.round(totalTonnes * 1000 / 22);

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
            Estime quanto CO₂ sua empresa emite anualmente e descubra como compensar 
            suas emissões de forma certificada.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Formulário */}
          <div className="lg:col-span-2">
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
            <Card className="shadow-sm border-none bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-center">Suas Emissões Anuais</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="text-5xl md:text-6xl font-bold mb-2">
                  {totalTonnes.toFixed(1)}
                </div>
                <div className="text-primary-foreground/80 text-lg">
                  toneladas de CO₂/ano
                </div>
              </CardContent>
            </Card>

            {/* Gráfico */}
            {chartData.length > 0 && (
              <Card className="shadow-sm border-border">
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${(value/1000).toFixed(2)} t`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Equivalência */}
            <Card className="shadow-sm border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <TreeDeciduous className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{treesEquivalent}</div>
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
