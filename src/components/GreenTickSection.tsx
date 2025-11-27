import { Globe, Package, Share2, Mail, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const applications = [
  {
    icon: Globe,
    title: "Site institucional",
    description: "Exiba o selo de certificação no rodapé, nas páginas institucionais ou na home do seu site para comunicar seu compromisso ambiental logo no primeiro acesso."
  },
  {
    icon: Package,
    title: "Embalagens e produtos",
    description: "Inclua o selo em etiquetas, rótulos ou embalagens dos seus produtos físicos. Transmita responsabilidade e confiança diretamente no ponto de consumo."
  },
  {
    icon: Share2,
    title: "Redes sociais",
    description: "Compartilhe o selo em seus perfis, stories e posts. Mostre publicamente que sua empresa é carbono neutro e engajada com o futuro do planeta."
  },
  {
    icon: Mail,
    title: "Assinaturas de e-mail",
    description: "Adicione o selo na assinatura dos e-mails da equipe. Cada mensagem enviada se torna um reforço de reputação e consciência ambiental."
  },
  {
    icon: ShoppingCart,
    title: "Páginas de venda / marketplace",
    description: "Se sua empresa vende em marketplaces ou lojas online, aplique o selo nas descrições dos produtos, aumentando a percepção de valor e diferencial sustentável."
  }
];

const GreenTickSection = () => {
  return (
    <section className="bg-muted py-20 md:py-28">
      <div className="container mx-auto px-6">
        {/* Título Principal */}
        <h2 className="text-center text-3xl font-bold text-primary md:text-4xl lg:text-5xl mb-4">
          Onde aplicar o Selo Green Tick?
        </h2>
        
        {/* Subtítulo em destaque */}
        <p className="text-center text-xl font-medium text-accent mb-6">
          Apresente ao mundo o compromisso da sua marca com a sustentabilidade.
        </p>
        
        {/* Parágrafo introdutório */}
        <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground mb-12 md:mb-16">
          Você pode aplicar o Selo Green Tick nos principais pontos de contato 
          com seus clientes e parceiros, aumentando a credibilidade e o valor 
          percebido da sua empresa.
        </p>
        
        {/* Grid de Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {applications.map((app, index) => (
            <Card key={index} className="border-none shadow-card hover:shadow-lg transition-all bg-card">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 inline-flex bg-primary/10 p-4">
                  <app.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {app.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {app.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GreenTickSection;
