import { Building2, Leaf, Globe2, Award, Zap, Users } from "lucide-react";

const PartnersSection = () => {
  const partners = [
    { name: "Global Energy Corp", icon: Zap },
    { name: "Green Earth Foundation", icon: Leaf },
    { name: "Climate Action Network", icon: Globe2 },
    { name: "Sustainable Development Alliance", icon: Building2 },
    { name: "International Carbon Institute", icon: Award },
    { name: "World Conservation Partnership", icon: Users },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            NOSSOS PARCEIROS
          </h2>
          <p className="text-3xl font-bold text-foreground">
            Organizações que trabalham com o Byomas Standard
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-card border border-border transition-all hover:shadow-card hover:scale-105"
              >
                <Icon className="h-12 w-12 text-primary mb-3" />
                <p className="text-xs text-center font-medium text-muted-foreground">
                  {partner.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
