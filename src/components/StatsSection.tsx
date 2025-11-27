import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TrendingUp, MapPin, Activity } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import ScrollReveal from "./ScrollReveal";

const StatsSection = () => {
  const stats = [
    {
      icon: Leaf,
      number: 5000000000,
      suffix: "+",
      label: "CRÉDITOS",
      description: "Verificados globalmente",
      color: "text-[#4CAF50]",
      bgColor: "bg-[#4CAF50]/10"
    },
    {
      icon: Activity,
      number: 147520,
      suffix: "",
      label: "CRÉDITOS HOJE",
      description: "Gerados nas últimas 24h",
      color: "text-[#FF9800]",
      bgColor: "bg-[#FF9800]/10",
      live: true
    },
    {
      icon: TrendingUp,
      number: 3400,
      suffix: "+",
      label: "PROJETOS ATIVOS",
      description: "Em operação no momento",
      color: "text-[#8BC34A]",
      bgColor: "bg-[#8BC34A]/10"
    },
    {
      icon: MapPin,
      number: 132,
      suffix: "+",
      label: "PAÍSES",
      description: "Com projetos certificados",
      color: "text-[#00BCD4]",
      bgColor: "bg-[#00BCD4]/10"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            NOSSO IMPACTO EM TEMPO REAL
          </h2>
          <p className="mb-12 text-center text-3xl font-bold text-foreground">
            Liderando a ação climática global
          </p>
        </ScrollReveal>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal key={index} delay={index * 0.1}>
                <Card className="border-none shadow-soft relative overflow-hidden">
                  {stat.live && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full bg-[#FF9800] opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 bg-[#FF9800]"></span>
                      </span>
                      <span className="text-xs font-semibold text-[#FF9800]">LIVE</span>
                    </div>
                  )}
                  <CardContent className="p-8 text-center">
                    <div className={`mx-auto mb-6 inline-flex ${stat.bgColor} p-4`}>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="mb-2">
                      <span className={`text-5xl font-bold ${stat.color}`}>
                        <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
