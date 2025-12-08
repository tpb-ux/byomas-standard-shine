import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroForest from "@/assets/hero-forest.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full bg-background pt-20 overflow-hidden">
      {/* Background image with Ken Burns effect - Aerial forest view */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroForest})`,
          animation: 'kenburns 30s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />
      
      {/* Overlay with dark blue transparency - 70% opacity */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(135deg, hsla(220, 18%, 12%, 0.70), hsla(220, 18%, 14%, 0.60))'
        }}
      />
      
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-primary">
              BYOMA RESEARCH
            </p>
            <h1 className="mb-8 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="text-foreground">Libere o poder do conhecimento da </span>
              <span className="text-primary">Amazonia</span>
              <span className="italic bg-primary/30 px-2 py-1 rounded text-foreground"> Insight, Research & Relatórios ESG</span>
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

      {/* Gradient transition to next section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)'
        }}
        aria-hidden="true"
      />
    </section>
  );
};

export default Hero;
