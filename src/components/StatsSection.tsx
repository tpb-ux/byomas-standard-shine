import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TrendingUp, MapPin } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Leaf,
      number: "5",
      label: "BILHÃO+",
      description: "Créditos de carbono verificados",
      color: "text-[#4CAF50]",
      bgColor: "bg-[#4CAF50]/10"
    },
    {
      icon: TrendingUp,
      number: "3.400",
      label: "PROJETOS",
      description: "Registrados globalmente",
      color: "text-[#8BC34A]",
      bgColor: "bg-[#8BC34A]/10"
    },
    {
      icon: MapPin,
      number: "132+",
      label: "PAÍSES",
      description: "Com projetos ativos",
      color: "text-[#00BCD4]",
      bgColor: "bg-[#00BCD4]/10"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          NOSSO IMPACTO
        </h2>
        <p className="mb-12 text-center text-3xl font-bold text-foreground">
          Liderando a ação climática global
        </p>
        
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-none shadow-soft">
                <CardContent className="p-8 text-center">
                  <div className={`mx-auto mb-6 inline-flex rounded-full ${stat.bgColor} p-4`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="mb-2">
                    <span className={`text-5xl font-bold ${stat.color}`}>{stat.number}</span>
                    <span className="ml-2 text-2xl font-semibold text-foreground">{stat.label}</span>
                  </div>
                  <p className="text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
