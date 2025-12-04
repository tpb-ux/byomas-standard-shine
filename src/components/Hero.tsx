import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full bg-background pt-20">
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-primary">
              BYOMA RESEARCH
            </p>
            <h1 className="mb-8 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="text-foreground">Libere o poder do conhecimento da </span>
              <span className="text-primary">Amazonia</span>
              <span className="text-muted-foreground"> Insight, Research & Relatórios ESG</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-muted-foreground">
              Análises, tendências e insights do mercado de crédito de carbono, 
              finanças regenerativas e economia verde para tomadas de decisão estratégicas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contato">
                <Button variant="outline" size="lg" className="border-primary text-foreground hover:bg-primary hover:text-primary-foreground font-medium px-8">
                  CONECTE-SE CONOSCO
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground font-medium">
                  EXPLORAR INSIGHTS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Hero;
