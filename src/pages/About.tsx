import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import Timeline from "@/components/Timeline";
import ValueCard from "@/components/ValueCard";
import ScrollReveal from "@/components/ScrollReveal";
import { Target, Eye, Heart, Lightbulb, TrendingUp, Leaf } from "lucide-react";

const About = () => {
  const breadcrumbItems = [{ label: "Sobre" }];

  return (
    <div className="min-h-screen">
      {/* SEO */}
      <SEOHead
        title="Sobre o Byoma Research - Nossa Missão e Valores"
        description="Conheça o Byoma Research: sua fonte de inteligência sobre finanças sustentáveis, crédito de carbono, tokenização verde e economia regenerativa. Saiba mais sobre nossa missão."
        url="/about"
        keywords={["sobre byoma research", "missão finanças sustentáveis", "economia verde", "finanças regenerativas"]}
      />

      <Navbar />
      
      <section className="pt-32 pb-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} className="mb-6 text-primary-foreground/70" />
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">SOBRE O BYOMA RESEARCH</h1>
            <p className="text-xl max-w-3xl text-primary-foreground/90">
              Sua fonte de inteligência e insights sobre o mercado de finanças sustentáveis, tokenização verde e economia regenerativa
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                NOSSA HISTÓRIA
              </h2>
              <h3 className="text-3xl font-bold text-foreground mb-6">
                Democratizando o Conhecimento em Finanças Verdes
              </h3>
              <p className="text-lg text-muted-foreground mb-4">
                O Byoma Research nasceu da necessidade de criar uma fonte confiável e acessível de 
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

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-center text-muted-foreground mb-4">
              O QUE COBRIMOS
            </h2>
            <h3 className="text-3xl font-bold text-center text-foreground mb-16">
              Áreas de Cobertura
            </h3>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="bg-card border border-border p-6 h-full">
                <Leaf className="h-10 w-10 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Créditos de Carbono</h4>
                <p className="text-muted-foreground">
                  Análises do mercado voluntário e regulado, metodologias de certificação, 
                  preços e tendências globais.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="bg-card border border-border p-6 h-full">
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Tokenização Verde</h4>
                <p className="text-muted-foreground">
                  Green tokens, ativos digitais sustentáveis, blockchain para rastreabilidade 
                  ambiental e novos modelos de financiamento.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="bg-card border border-border p-6 h-full">
                <Heart className="h-10 w-10 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Finanças Regenerativas</h4>
                <p className="text-muted-foreground">
                  ReFi, DeFi verde, protocolos de impacto positivo e a interseção entre 
                  tecnologia e sustentabilidade.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-center text-muted-foreground mb-4">
              NOSSOS VALORES
            </h2>
            <h3 className="text-3xl font-bold text-center text-foreground mb-16">
              Missão, Visão e Valores
            </h3>
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
