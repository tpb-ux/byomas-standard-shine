import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Timeline from "@/components/Timeline";
import ValueCard from "@/components/ValueCard";
import ScrollReveal from "@/components/ScrollReveal";
import { Target, Eye, Heart, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">SOBRE A BYOMAS STANDARD</h1>
            <p className="text-xl max-w-3xl text-primary-foreground/90">
              Liderando os padrões globais de certificação ambiental e ação climática desde 2005
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
                Pioneiros em Certificação Ambiental
              </h3>
              <p className="text-lg text-muted-foreground mb-4">
                A Byomas Standard foi fundada com a missão de estabelecer os mais rigorosos padrões 
                de certificação para projetos ambientais e climáticos. Desde 2005, trabalhamos 
                incansavelmente para garantir a integridade e o impacto real de projetos de carbono 
                em todo o mundo.
              </p>
              <p className="text-lg text-muted-foreground">
                Hoje, somos reconhecidos globalmente como a principal autoridade em verificação de 
                créditos de carbono, com mais de 5 bilhões de créditos verificados e 3.400 projetos 
                certificados em 132 países.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-center text-muted-foreground mb-4">
              NOSSA TRAJETÓRIA
            </h2>
            <h3 className="text-3xl font-bold text-center text-foreground mb-16">
              Marcos Importantes
            </h3>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Timeline />
          </ScrollReveal>
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
                description="Garantir a integridade e qualidade dos projetos de ação climática através de certificação rigorosa e transparente."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <ValueCard
                icon={Eye}
                title="Visão"
                description="Ser a referência global em padrões de sustentabilidade e certificação ambiental, liderando a transição para uma economia de baixo carbono."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <ValueCard
                icon={Heart}
                title="Integridade"
                description="Mantemos os mais altos padrões éticos e de transparência em todos os nossos processos de certificação."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <ValueCard
                icon={Lightbulb}
                title="Inovação"
                description="Desenvolvemos continuamente novos padrões e metodologias para enfrentar os desafios climáticos emergentes."
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
