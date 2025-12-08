import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ArrowLeft, Globe, ExternalLink, Award, Calendar
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { casosDetalhe, casosSucesso } from "@/data/casosDetalhe";

const CasoSucessoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const caso = slug ? casosDetalhe[slug] : null;

  if (!caso) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Caso não encontrado</h1>
            <Link to="/casos-de-sucesso">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Casos de Sucesso
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = caso.icon;
  const otherCases = casosSucesso.filter(c => c.slug !== slug).slice(0, 3);

  return (
    <>
      <SEOHead
        title={`${caso.empresa} - Caso de Sucesso em Sustentabilidade`}
        description={`Conheça a jornada sustentável da ${caso.empresa}: ${caso.destaque}. Métricas de impacto, timeline e principais iniciativas.`}
        keywords={[caso.empresa, caso.setor, "sustentabilidade", "ESG", "caso de sucesso", "carbono neutro"]}
      />
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 pt-4">
          <Breadcrumb items={[
            { label: "Casos de Sucesso", href: "/casos-de-sucesso" },
            { label: caso.empresa }
          ]} />
        </div>

        {/* Hero Section */}
        <section className={`relative py-16 ${caso.cor} border-b`}>
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-4xl">
                <Link to="/casos-de-sucesso" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para todos os casos
                </Link>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-background/80">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {caso.setor}
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {caso.empresa}
                </h1>
                <p className="text-xl text-primary font-medium mb-6">
                  {caso.destaque}
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-sm text-muted-foreground">Compartilhe este case:</p>
                  <SocialShareButtons
                    url={`${window.location.origin}/casos-de-sucesso/${caso.slug}`}
                    title={`${caso.empresa} - ${caso.destaque}`}
                    description={caso.descricaoCompleta.slice(0, 150)}
                    hashtags={["Sustentabilidade", "ESG", caso.empresa.replace(/\s/g, "")]}
                    compact
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Visão Geral */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-4xl">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  Visão Geral
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {caso.descricaoCompleta}
                </p>
                
                {caso.website && (
                  <a 
                    href={caso.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
                  >
                    Visitar site oficial
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Métricas de Impacto */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                Métricas de Impacto
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {caso.metricas.map((metrica, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                        <metrica.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {metrica.valor}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metrica.unidade}
                      </div>
                      <div className="text-xs font-medium text-foreground mt-2">
                        {metrica.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                Jornada Sustentável
              </h2>
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  {/* Linha vertical */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-8">
                    {caso.timeline.map((item, index) => (
                      <div key={index} className="relative flex gap-6 pl-12">
                        {/* Ponto */}
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-primary" />
                        </div>
                        
                        <Card className="flex-1">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{item.ano}</Badge>
                              <CardTitle className="text-lg">{item.titulo}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{item.descricao}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Iniciativas */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8">Principais Iniciativas</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {caso.iniciativas.map((iniciativa, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-3">
                        <iniciativa.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{iniciativa.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{iniciativa.descricao}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Certificações */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6">Certificações</h2>
              <div className="flex flex-wrap gap-3">
                {caso.certificacoes.map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-sm py-2 px-4">
                    <Award className="h-4 w-4 mr-2" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Outros Casos */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8">Outros Casos de Sucesso</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {otherCases.map((other) => (
                  <Link key={other.slug} to={`/casos-de-sucesso/${other.slug}`}>
                    <Card className={`group hover:border-primary/30 transition-all ${other.cor}`}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-background/50">
                            <other.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {other.empresa}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{other.setor}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-primary">{other.destaque}</p>
                        <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                          Ver detalhes
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
                Transforme sua empresa em um case de sucesso
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Descubra como implementar práticas sustentáveis que geram resultados 
                reais para o seu negócio e para o planeta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contato">
                  <Button size="lg" className="gap-2">
                    Fale com um Consultor
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/casos-de-sucesso">
                  <Button variant="outline" size="lg">
                    Ver Todos os Casos
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

export default CasoSucessoDetalhe;
