import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead, BreadcrumbSchema, HowToSchema } from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Car, Home, Utensils, ShoppingBag, Plane, Zap, 
  Leaf, ArrowRight, ArrowLeft, Share2, RefreshCw,
  TrendingDown, Target, Award
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Emission factors (kg CO2)
const EMISSION_FACTORS = {
  gasoline: 2.31, // per liter
  diesel: 2.68,
  ethanol: 1.50,
  electric: 0,
  domesticFlight: 0.255, // per km per passenger
  internationalFlight: 0.195,
  electricity: 0.075, // per kWh (Brazil average)
  naturalGas: 2.0, // per m3
  lpg: 2.98, // per kg
  beef: 27, // per kg
  pork: 12,
  chicken: 6.9,
  fish: 5,
  vegetarian: 2,
  vegan: 1.5,
  clothing: 10, // per item
  electronics: 50, // per device
};

const STEPS = [
  { id: "transport", icon: Car, title: "Transporte" },
  { id: "energy", icon: Zap, title: "Energia" },
  { id: "food", icon: Utensils, title: "Alimentação" },
  { id: "consumption", icon: ShoppingBag, title: "Consumo" },
];

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

interface FormData {
  // Transport
  carKmWeek: number;
  fuelType: "gasoline" | "diesel" | "ethanol" | "electric";
  fuelConsumption: number; // km/L
  domesticFlights: number;
  internationalFlights: number;
  // Energy
  electricityKwh: number;
  gasType: "none" | "natural" | "lpg";
  gasConsumption: number;
  // Food
  dietType: "beef" | "mixed" | "poultry" | "vegetarian" | "vegan";
  meatFrequency: number; // times per week
  // Consumption
  clothingItems: number;
  electronicsYear: number;
}

const CarbonCalculator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    carKmWeek: 100,
    fuelType: "gasoline",
    fuelConsumption: 12,
    domesticFlights: 2,
    internationalFlights: 1,
    electricityKwh: 200,
    gasType: "lpg",
    gasConsumption: 13,
    dietType: "mixed",
    meatFrequency: 4,
    clothingItems: 24,
    electronicsYear: 2,
  });

  const calculateEmissions = () => {
    // Transport emissions (annual)
    const carKmYear = formData.carKmWeek * 52;
    const fuelLiters = carKmYear / formData.fuelConsumption;
    const carEmissions = fuelLiters * EMISSION_FACTORS[formData.fuelType];
    
    const domesticFlightKm = formData.domesticFlights * 2000; // avg domestic flight
    const internationalFlightKm = formData.internationalFlights * 10000; // avg international
    const flightEmissions = 
      (domesticFlightKm * EMISSION_FACTORS.domesticFlight) +
      (internationalFlightKm * EMISSION_FACTORS.internationalFlight);
    
    const transportTotal = (carEmissions + flightEmissions) / 1000; // to tons

    // Energy emissions (annual)
    const electricityEmissions = formData.electricityKwh * 12 * EMISSION_FACTORS.electricity;
    let gasEmissions = 0;
    if (formData.gasType === "natural") {
      gasEmissions = formData.gasConsumption * 12 * EMISSION_FACTORS.naturalGas;
    } else if (formData.gasType === "lpg") {
      gasEmissions = formData.gasConsumption * 12 * EMISSION_FACTORS.lpg;
    }
    const energyTotal = (electricityEmissions + gasEmissions) / 1000;

    // Food emissions (annual)
    const dietFactors = {
      beef: 27,
      mixed: 15,
      poultry: 8,
      vegetarian: 4,
      vegan: 2,
    };
    const meatKgYear = formData.meatFrequency * 0.25 * 52; // 250g per meal
    const foodEmissions = meatKgYear * dietFactors[formData.dietType];
    const foodTotal = foodEmissions / 1000;

    // Consumption emissions (annual)
    const clothingEmissions = formData.clothingItems * EMISSION_FACTORS.clothing;
    const electronicsEmissions = formData.electronicsYear * EMISSION_FACTORS.electronics;
    const consumptionTotal = (clothingEmissions + electronicsEmissions) / 1000;

    return {
      transport: transportTotal,
      energy: energyTotal,
      food: foodTotal,
      consumption: consumptionTotal,
      total: transportTotal + energyTotal + foodTotal + consumptionTotal,
    };
  };

  const emissions = calculateEmissions();

  const chartData = [
    { name: "Transporte", value: emissions.transport, color: CHART_COLORS[0] },
    { name: "Energia", value: emissions.energy, color: CHART_COLORS[1] },
    { name: "Alimentação", value: emissions.food, color: CHART_COLORS[2] },
    { name: "Consumo", value: emissions.consumption, color: CHART_COLORS[3] },
  ];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleShare = async () => {
    const text = `Minha pegada de carbono é ${emissions.total.toFixed(1)} toneladas de CO₂/ano. Calcule a sua em: ${window.location.href}`;
    
    if (navigator.share) {
      await navigator.share({ title: "Minha Pegada de Carbono", text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setCurrentStep(0);
  };

  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Calculadora de Carbono", href: "/calculadora-carbono" },
  ];

  const schemaBreadcrumbItems = [
    { name: "Início", url: "/" },
    { name: "Calculadora de Carbono", url: "/calculadora-carbono" },
  ];

  const howToSteps = [
    { name: "Informe seu transporte", text: "Adicione quilometragem semanal e viagens aéreas" },
    { name: "Informe consumo de energia", text: "Adicione consumo de eletricidade e gás" },
    { name: "Informe sua alimentação", text: "Selecione seu tipo de dieta" },
    { name: "Informe consumo", text: "Adicione compras de roupas e eletrônicos" },
    { name: "Veja seus resultados", text: "Descubra sua pegada e como reduzi-la" },
  ];

  const getTips = () => {
    const tips = [];
    if (emissions.transport > 2) {
      tips.push("Considere usar transporte público ou carona compartilhada");
      tips.push("Substitua voos curtos por viagens de trem quando possível");
    }
    if (emissions.energy > 1) {
      tips.push("Troque lâmpadas por LED e desligue aparelhos da tomada");
      tips.push("Considere energia solar para sua residência");
    }
    if (emissions.food > 1.5) {
      tips.push("Reduza o consumo de carne vermelha para 2x por semana");
      tips.push("Prefira alimentos locais e da estação");
    }
    if (emissions.consumption > 0.5) {
      tips.push("Compre roupas de segunda mão ou de marcas sustentáveis");
      tips.push("Prolongue a vida útil dos eletrônicos com manutenção");
    }
    return tips.slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Calculadora de Pegada de Carbono - Calcule Suas Emissões"
        description="Calcule sua pegada de carbono anual e descubra como reduzir seu impacto ambiental. Ferramenta gratuita com dicas personalizadas de sustentabilidade."
        url="/calculadora-carbono"
        keywords={["calculadora carbono", "pegada carbono", "emissões CO2", "sustentabilidade", "impacto ambiental"]}
      />
      <BreadcrumbSchema items={schemaBreadcrumbItems} />
      <HowToSchema
        title="Como calcular sua pegada de carbono"
        description="Passo a passo para descobrir suas emissões anuais de CO2"
        steps={howToSteps}
        totalTime="PT5M"
      />

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full mb-4">
            <Leaf className="h-5 w-5" />
            <span className="text-sm font-medium">Ferramenta Gratuita</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Calculadora de Pegada de Carbono
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra seu impacto ambiental e receba dicas personalizadas para reduzir suas emissões.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-2 ${
                          i <= currentStep ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          i <= currentStep ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                      </div>
                    );
                  })}
                </div>
                <Progress value={(currentStep + 1) / STEPS.length * 100} className="h-2" />
              </div>

              {/* Form Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = STEPS[currentStep].icon;
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                    {STEPS[currentStep].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStep === 0 && (
                    <>
                      <div>
                        <Label>Quantos km você dirige por semana?</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[formData.carKmWeek]}
                            onValueChange={([v]) => setFormData(prev => ({ ...prev, carKmWeek: v }))}
                            max={500}
                            step={10}
                            className="flex-1"
                          />
                          <span className="w-20 text-right font-semibold">{formData.carKmWeek} km</span>
                        </div>
                      </div>
                      <div>
                        <Label>Tipo de combustível</Label>
                        <RadioGroup
                          value={formData.fuelType}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, fuelType: v as typeof prev.fuelType }))}
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          {[
                            { value: "gasoline", label: "Gasolina" },
                            { value: "ethanol", label: "Etanol" },
                            { value: "diesel", label: "Diesel" },
                            { value: "electric", label: "Elétrico" },
                          ].map(opt => (
                            <div key={opt.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opt.value} id={opt.value} />
                              <Label htmlFor={opt.value}>{opt.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Plane className="h-4 w-4" />
                          Voos domésticos por ano
                        </Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[formData.domesticFlights]}
                            onValueChange={([v]) => setFormData(prev => ({ ...prev, domesticFlights: v }))}
                            max={20}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-semibold">{formData.domesticFlights}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Plane className="h-4 w-4" />
                          Voos internacionais por ano
                        </Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[formData.internationalFlights]}
                            onValueChange={([v]) => setFormData(prev => ({ ...prev, internationalFlights: v }))}
                            max={10}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-semibold">{formData.internationalFlights}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 1 && (
                    <>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Consumo mensal de eletricidade (kWh)
                        </Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[formData.electricityKwh]}
                            onValueChange={([v]) => setFormData(prev => ({ ...prev, electricityKwh: v }))}
                            max={1000}
                            step={10}
                            className="flex-1"
                          />
                          <span className="w-24 text-right font-semibold">{formData.electricityKwh} kWh</span>
                        </div>
                      </div>
                      <div>
                        <Label>Tipo de gás</Label>
                        <RadioGroup
                          value={formData.gasType}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, gasType: v as typeof prev.gasType }))}
                          className="grid grid-cols-3 gap-2 mt-2"
                        >
                          {[
                            { value: "none", label: "Não uso" },
                            { value: "natural", label: "Gás Natural" },
                            { value: "lpg", label: "GLP (Botijão)" },
                          ].map(opt => (
                            <div key={opt.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opt.value} id={`gas-${opt.value}`} />
                              <Label htmlFor={`gas-${opt.value}`}>{opt.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      {formData.gasType !== "none" && (
                        <div>
                          <Label>
                            Consumo mensal de gás ({formData.gasType === "natural" ? "m³" : "kg"})
                          </Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              value={[formData.gasConsumption]}
                              onValueChange={([v]) => setFormData(prev => ({ ...prev, gasConsumption: v }))}
                              max={formData.gasType === "natural" ? 50 : 26}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-20 text-right font-semibold">
                              {formData.gasConsumption} {formData.gasType === "natural" ? "m³" : "kg"}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div>
                        <Label>Tipo de dieta principal</Label>
                        <RadioGroup
                          value={formData.dietType}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, dietType: v as typeof prev.dietType }))}
                          className="grid grid-cols-1 gap-2 mt-2"
                        >
                          {[
                            { value: "beef", label: "Rica em carne vermelha" },
                            { value: "mixed", label: "Mista (carne vermelha e branca)" },
                            { value: "poultry", label: "Principalmente frango/peixe" },
                            { value: "vegetarian", label: "Vegetariana" },
                            { value: "vegan", label: "Vegana" },
                          ].map(opt => (
                            <div key={opt.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opt.value} id={`diet-${opt.value}`} />
                              <Label htmlFor={`diet-${opt.value}`}>{opt.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div>
                        <Label>Refeições com proteína animal por semana</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[formData.meatFrequency]}
                            onValueChange={([v]) => setFormData(prev => ({ ...prev, meatFrequency: v }))}
                            max={21}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-semibold">{formData.meatFrequency}x</span>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div>
                        <Label>Peças de roupa compradas por ano</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[formData.clothingItems]}
                            onValueChange={([v]) => setFormData(prev => ({ ...prev, clothingItems: v }))}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-semibold">{formData.clothingItems}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Eletrônicos novos por ano (celular, notebook, etc)</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[formData.electronicsYear]}
                            onValueChange={([v]) => setFormData(prev => ({ ...prev, electronicsYear: v }))}
                            max={10}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-semibold">{formData.electronicsYear}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                    <Button onClick={handleNext}>
                      {currentStep === STEPS.length - 1 ? "Ver Resultado" : "Próximo"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Total */}
              <Card className="mb-8 bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">Sua Pegada de Carbono</span>
                  </div>
                  <div className="text-6xl md:text-7xl font-bold text-primary mb-2">
                    {emissions.total.toFixed(1)}
                  </div>
                  <p className="text-xl text-muted-foreground">
                    toneladas de CO₂ por ano
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value.toFixed(2)} t CO₂`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Você</span>
                        <span className="font-semibold">{emissions.total.toFixed(1)} t</span>
                      </div>
                      <Progress value={Math.min((emissions.total / 10) * 100, 100)} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Média Brasil</span>
                        <span className="font-semibold">2.3 t</span>
                      </div>
                      <Progress value={23} className="h-3 bg-muted [&>div]:bg-green-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Média Mundial</span>
                        <span className="font-semibold">4.5 t</span>
                      </div>
                      <Progress value={45} className="h-3 bg-muted [&>div]:bg-yellow-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Meta Sustentável</span>
                        <span className="font-semibold">2.0 t</span>
                      </div>
                      <Progress value={20} className="h-3 bg-muted [&>div]:bg-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tips */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-green-500" />
                    Dicas para Reduzir suas Emissões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {getTips().map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-primary mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar Resultado
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Calcular Novamente
                </Button>
                <Button asChild>
                  <a href="/glossario/compensacao-de-carbono">
                    <Leaf className="mr-2 h-4 w-4" />
                    Saiba como Compensar
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default CarbonCalculator;
