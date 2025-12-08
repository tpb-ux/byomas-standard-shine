import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Leaf, Factory, Building2, Plane, ShoppingBag, Zap } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import RelatedPages from "@/components/RelatedPages";
import { useBlogArticles } from "@/hooks/useBlogArticles";

const casosSucesso = [
  {
    empresa: "Natura",
    setor: "Cosméticos",
    icon: Leaf,
    destaque: "Carbono Negativo desde 2007",
    descricao: "A Natura foi a primeira empresa de cosméticos do mundo a se tornar carbono negativo, compensando mais emissões do que produz.",
    resultados: [
      "100% energia renovável nas operações",
      "Redução de 33% nas emissões desde 2013",
      "Bioingredientes de 40 comunidades amazônicas"
    ],
    cor: "bg-green-500/10 border-green-500/20"
  },
  {
    empresa: "Suzano",
    setor: "Papel e Celulose",
    icon: Factory,
    destaque: "Maior produtora de celulose do mundo",
    descricao: "A Suzano remove mais carbono da atmosfera do que emite, sendo exemplo global de indústria sustentável no setor florestal.",
    resultados: [
      "Carbono positivo: remove 15mi ton CO2/ano",
      "2,4 milhões de hectares de florestas plantadas",
      "Meta de capturar 40mi ton CO2 até 2030"
    ],
    cor: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    empresa: "Ambev",
    setor: "Bebidas",
    icon: Building2,
    destaque: "100% energia renovável até 2025",
    descricao: "A maior cervejaria do Brasil está transformando suas operações com metas ambiciosas de sustentabilidade e economia circular.",
    resultados: [
      "Redução de 22% no uso de água por litro",
      "85% das embalagens já são retornáveis/recicláveis",
      "Frota de caminhões elétricos em expansão"
    ],
    cor: "bg-blue-500/10 border-blue-500/20"
  },
  {
    empresa: "LATAM Airlines",
    setor: "Aviação",
    icon: Plane,
    destaque: "Net Zero até 2050",
    descricao: "O maior grupo de aviação da América Latina lidera a transição para combustíveis sustentáveis de aviação (SAF).",
    resultados: [
      "1º voo SAF na América do Sul em 2022",
      "Programa de compensação de carbono para passageiros",
      "Investimento em aeronaves mais eficientes"
    ],
    cor: "bg-sky-500/10 border-sky-500/20"
  },
  {
    empresa: "Magalu",
    setor: "Varejo",
    icon: ShoppingBag,
    destaque: "Logística Verde",
    descricao: "O Magazine Luiza está revolucionando o varejo brasileiro com iniciativas de logística sustentável e inclusão digital.",
    resultados: [
      "Frota de veículos elétricos para entregas",
      "Embalagens 100% recicláveis",
      "Programa de reciclagem de eletrônicos"
    ],
    cor: "bg-purple-500/10 border-purple-500/20"
  },
  {
    empresa: "Raízen",
    setor: "Energia",
    icon: Zap,
    destaque: "Líder em etanol 2G",
    descricao: "Joint venture entre Cosan e Shell, a Raízen é pioneira na produção de etanol de segunda geração no Brasil.",
    resultados: [
      "2ª maior produtora de etanol do mundo",
      "Etanol 2G: 80% menos emissões que gasolina",
      "Bioeletricidade para 11 milhões de residências"
    ],
    cor: "bg-yellow-500/10 border-yellow-500/20"
  }
];

const RELATED_TAGS = ["sustentabilidade", "carbono-neutro", "empresas-verdes", "esg", "economia-circular"];

const CasosDeSucesso = () => {
  const { data: articles, isLoading } = useBlogArticles();
  
  // Filtrar artigos que tenham tags relacionadas a casos de sucesso/sustentabilidade
  const relatedArticles = articles?.filter(article => 
    article.tags?.some(tag => RELATED_TAGS.includes(tag.slug))
  ).slice(0, 4) || [];

  return (
    <>
      <SEOHead
        title="Casos de Sucesso em Sustentabilidade - Empresas Brasileiras"
        description="Conheça empresas brasileiras que são referência em sustentabilidade: Natura, Suzano, Ambev, LATAM e outras. Inspire-se com cases reais de sucesso."
        keywords={["casos de sucesso sustentabilidade", "empresas sustentáveis brasil", "ESG empresas brasileiras", "carbono neutro", "economia circular"]}
      />
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 pt-4">
          <Breadcrumb items={[
            { label: "Para sua Empresa", href: "#" },
            { label: "Casos de Sucesso" }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Inspiração
                </Badge>
                <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">
                  Casos de <span className="text-primary">Sucesso</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Empresas brasileiras que estão liderando a transformação sustentável 
                  e provando que é possível lucrar enquanto se protege o planeta.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Cases Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {casosSucesso.map((caso, index) => (
                <ScrollReveal key={caso.empresa} delay={index * 0.1}>
                  <Card className={`group hover:border-primary/30 transition-all duration-300 h-full ${caso.cor}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-lg bg-background/50">
                          <caso.icon className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {caso.setor}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-4">{caso.empresa}</CardTitle>
                      <p className="text-sm font-medium text-primary">{caso.destaque}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {caso.descricao}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">Resultados:</p>
                        <ul className="space-y-1">
                          {caso.resultados.map((resultado) => (
                            <li key={resultado} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                              {resultado}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Artigos Relacionados */}
        {(relatedArticles.length > 0 || isLoading) && (
          <section className="py-16 bg-muted/20">
            <div className="container mx-auto px-6">
              <ScrollReveal>
                <RelatedPages 
                  articles={relatedArticles}
                  isLoading={isLoading}
                  title="Artigos Relacionados"
                  variant="vertical"
                />
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
                Sua empresa pode ser o próximo caso de sucesso
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Descubra como implementar práticas sustentáveis que geram resultados 
                reais para o seu negócio e para o planeta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contato">
                  <Button size="lg" className="gap-2">
                    Iniciar Transformação
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/guias">
                  <Button variant="outline" size="lg">
                    Ver Guias Práticos
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default CasosDeSucesso;
