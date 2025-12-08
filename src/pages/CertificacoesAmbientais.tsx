import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, CheckCircle, ExternalLink, Leaf, Building2, Globe, TreePine, Factory, ShieldCheck } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import RelatedPages from "@/components/RelatedPages";
import { useBlogArticles } from "@/hooks/useBlogArticles";

const certificacoes = [
  {
    nome: "ISO 14001",
    descricao: "Sistema de Gestão Ambiental internacional que ajuda organizações a minimizar impactos ambientais, cumprir legislações e melhorar continuamente.",
    beneficios: ["Redução de custos operacionais", "Melhoria da imagem corporativa", "Conformidade legal", "Acesso a novos mercados"],
    icon: Globe,
    nivel: "Internacional",
    cor: "bg-primary/10 text-primary"
  },
  {
    nome: "LEED",
    descricao: "Leadership in Energy and Environmental Design - Certificação para construções sustentáveis que avalia eficiência energética, uso de água e materiais.",
    beneficios: ["Valorização do imóvel", "Economia de energia até 40%", "Ambiente de trabalho saudável", "Incentivos fiscais"],
    icon: Building2,
    nivel: "Internacional",
    cor: "bg-emerald-500/10 text-emerald-400"
  },
  {
    nome: "B Corp",
    descricao: "Certificação para empresas que equilibram propósito e lucro, atendendo padrões rigorosos de desempenho social e ambiental.",
    beneficios: ["Diferenciação de mercado", "Atração de talentos", "Rede global de empresas B", "Credibilidade ESG"],
    icon: ShieldCheck,
    nivel: "Internacional",
    cor: "bg-blue-500/10 text-blue-400"
  },
  {
    nome: "FSC",
    descricao: "Forest Stewardship Council - Certificação que garante que produtos de origem florestal são provenientes de manejo responsável.",
    beneficios: ["Acesso a mercados exigentes", "Rastreabilidade da cadeia", "Preservação florestal", "Valorização do produto"],
    icon: TreePine,
    nivel: "Internacional",
    cor: "bg-green-500/10 text-green-400"
  },
  {
    nome: "Carbono Neutro",
    descricao: "Certificação que atesta que uma organização compensa 100% das suas emissões de gases de efeito estufa.",
    beneficios: ["Neutralidade climática", "Diferenciação competitiva", "Engajamento de stakeholders", "Preparação para regulações"],
    icon: Leaf,
    nivel: "Nacional/Internacional",
    cor: "bg-teal-500/10 text-teal-400"
  },
  {
    nome: "I-REC",
    descricao: "International REC Standard - Certificado de energia renovável que comprova o uso de fontes limpas na matriz energética.",
    beneficios: ["Comprovação de energia limpa", "Redução de emissões Escopo 2", "Relatórios ESG", "Cumprimento de metas"],
    icon: Factory,
    nivel: "Internacional",
    cor: "bg-yellow-500/10 text-yellow-400"
  }
];

const RELATED_TAGS = ["certificacoes", "iso-14001", "leed", "b-corp", "esg", "sustentabilidade"];

const CertificacoesAmbientais = () => {
  const { data: articles, isLoading } = useBlogArticles();
  
  // Filtrar artigos que tenham tags relacionadas a certificações
  const relatedArticles = articles?.filter(article => 
    article.tags?.some(tag => RELATED_TAGS.includes(tag.slug))
  ).slice(0, 4) || [];

  return (
    <>
      <SEOHead
        title="Certificações Ambientais - Guia Completo para Empresas"
        description="Conheça as principais certificações ambientais para empresas: ISO 14001, LEED, B Corp, FSC, Carbono Neutro e I-REC. Saiba como obtê-las e seus benefícios."
        keywords={["certificações ambientais", "ISO 14001", "LEED", "B Corp", "FSC", "carbono neutro", "certificação ambiental empresas", "ESG"]}
      />
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 pt-4">
          <Breadcrumb items={[
            { label: "Para sua Empresa", href: "#" },
            { label: "Certificações Ambientais" }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                  <Award className="w-3 h-3 mr-1" />
                  Guia Completo
                </Badge>
                <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">
                  Certificações <span className="text-primary">Ambientais</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Descubra as principais certificações e selos ambientais que podem transformar 
                  a sustentabilidade da sua empresa em vantagem competitiva.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Certificações Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificacoes.map((cert, index) => (
                <ScrollReveal key={cert.nome} delay={index * 0.1}>
                  <Card className="group hover:border-primary/30 transition-colors duration-300 h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${cert.cor}`}>
                          <cert.icon className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {cert.nivel}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-4">{cert.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cert.descricao}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">Benefícios:</p>
                        <ul className="space-y-1">
                          {cert.beneficios.map((beneficio) => (
                            <li key={beneficio} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                              {beneficio}
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
                Precisa de ajuda para obter uma certificação?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Nossa equipe de consultores especializados pode guiar sua empresa em todo o 
                processo de certificação ambiental.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contato">
                  <Button size="lg" className="gap-2">
                    Fale com um Consultor
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/blog?tag=certificacoes">
                  <Button variant="outline" size="lg">
                    Ver Artigos Relacionados
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

export default CertificacoesAmbientais;
