import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import ValueCard from "@/components/ValueCard";
import ScrollReveal from "@/components/ScrollReveal";
import { Target, Eye, Heart, Lightbulb, TrendingUp, Leaf, ChevronRight } from "lucide-react";

const About = () => {
  const breadcrumbItems = [{ label: "Sobre" }];

  return (
    <div className="min-h-screen">
      {/* SEO */}
      <SEOHead
        title="Sobre o Amazonia Research - Nossa Missão e Valores"
        description="Conheça o Amazonia Research: sua fonte de inteligência sobre finanças sustentáveis, crédito de carbono, tokenização verde e economia regenerativa. Saiba mais sobre nossa missão."
        url="/about"
        keywords={["sobre amazonia research", "missão finanças sustentáveis", "economia verde", "finanças regenerativas"]}
      />

      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6 text-muted-foreground" />
            
            <div className="max-w-4xl">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                AMAZONIA RESEARCH
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Sobre <span className="text-primary">Nós</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Sua fonte de inteligência e insights sobre o mercado de finanças sustentáveis, tokenização verde e economia regenerativa
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                NOSSA HISTÓRIA
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Democratizando o Conhecimento em Finanças Verdes
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                O Amazonia Research nasceu da necessidade de criar uma fonte confiável e acessível de 
                informações sobre o mercado de finanças sustentáveis. Em um cenário onde a economia 
                verde cresce exponencialmente, entendemos que investidores, empresas e profissionais 
                precisam de análises aprofundadas e atualizadas.
              </p>
              <p className="text-lg text-muted-foreground">
                Nossa plataforma utiliza inteligência artificial avançada para curar, analisar e 
                produzir conteúdo de alta qualidade sobre créditos de carbono, tokenização de ativos 
                ambientais, ReFi (Finanças Regenerativas) e tendências do mercado de sustentabilidade 
                global.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Áreas de Cobertura */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                O QUE COBRIMOS
              </span>
              <h2 className="text-3xl font-bold text-foreground">
                Áreas de Cobertura
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="bg-card border border-border p-8 h-full hover:border-primary/50 transition-all group">
                <span className="text-xs font-medium tracking-widest text-primary mb-4 block">BYOMA</span>
                <div className="inline-flex bg-primary/10 p-4 mb-6">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Créditos de Carbono
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Análises do mercado voluntário e regulado, metodologias de certificação, 
                  preços e tendências globais.
                </p>
                <span className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  SABER MAIS
                  <ChevronRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="bg-card border border-border p-8 h-full hover:border-primary/50 transition-all group">
                <span className="text-xs font-medium tracking-widest text-primary mb-4 block">BYOMA</span>
                <div className="inline-flex bg-primary/10 p-4 mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Tokenização Verde
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Green tokens, ativos digitais sustentáveis, blockchain para rastreabilidade 
                  ambiental e novos modelos de financiamento.
                </p>
                <span className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  SABER MAIS
                  <ChevronRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="bg-card border border-border p-8 h-full hover:border-primary/50 transition-all group">
                <span className="text-xs font-medium tracking-widest text-primary mb-4 block">BYOMA</span>
                <div className="inline-flex bg-primary/10 p-4 mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Finanças Regenerativas
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  ReFi, DeFi verde, protocolos de impacto positivo e a interseção entre 
                  tecnologia e sustentabilidade.
                </p>
                <span className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  SABER MAIS
                  <ChevronRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                NOSSOS VALORES
              </span>
              <h2 className="text-3xl font-bold text-foreground">
                Missão, Visão e Valores
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollReveal delay={0.1}>
              <ValueCard
                icon={Target}
                title="Missão"
                description="Fornecer inteligência de mercado acessível e de alta qualidade sobre finanças sustentáveis para investidores e profissionais."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <ValueCard
                icon={Eye}
                title="Visão"
                description="Ser a principal fonte de referência em português sobre o mercado de economia verde e finanças regenerativas."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <ValueCard
                icon={Heart}
                title="Transparência"
                description="Compromisso com informações verificadas, fontes confiáveis e análises imparciais do mercado."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <ValueCard
                icon={Lightbulb}
                title="Inovação"
                description="Utilizamos IA e automação para entregar conteúdo relevante e atualizado em tempo real."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;