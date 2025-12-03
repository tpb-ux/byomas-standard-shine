import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-forest.jpg";
const Hero = () => {
  return <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: `url(${heroImage})`
    }}>
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-primary-foreground md:text-6xl lg:text-7xl">A BYOMA ESTABELECE OS PADRÕES MAIS IMPORTANTES DO MUNDO PARA AÇÃO CLIMÁTICA.</h1>
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8">
              Saiba mais
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;