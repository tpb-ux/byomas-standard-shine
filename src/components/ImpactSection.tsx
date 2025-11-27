import sectionBg from "@/assets/section-bg.jpg";

const ImpactSection = () => {
  return (
    <section className="relative py-20 md:py-32">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${sectionBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-6">
          {/* Título Principal */}
          <h2 className="text-center text-3xl font-bold leading-tight text-primary-foreground md:text-4xl lg:text-5xl mb-6">
            POR QUE COMPENSAR CO₂ IMPORTA PARA TODOS OS NEGÓCIOS?
          </h2>
          
          {/* Parágrafo Introdutório */}
          <p className="mx-auto max-w-4xl text-center text-lg text-primary-foreground/90 mb-12 md:mb-16">
            A mudança climática é um desafio global, e cada tonelada de CO₂ compensada 
            conta muito. Mesmo que sua empresa ainda não esteja legalmente obrigada, 
            compensar as suas emissões é uma forma estratégica de agregar valor à marca, 
            se destacar no mercado e impulsionar a sustentabilidade de nosso Planeta.
          </p>
          
          {/* Grid de Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Card 1 - Impacto das PMEs */}
            <div className="bg-white/10 backdrop-blur-sm p-6 md:p-8 border border-white/20">
              <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mb-4">
                O impacto das Pequenas e Médias Empresas no clima
              </h3>
              <p className="text-primary-foreground/90">
                As pequenas e médias empresas representam cerca de 99% das empresas 
                no Brasil e, juntas, podem ter um impacto climático significativo 
                até maior que grandes corporações quando consideradas em conjunto.
              </p>
            </div>
            
            {/* Card 2 - Selo contra greenwashing */}
            <div className="bg-white/10 backdrop-blur-sm p-6 md:p-8 border border-white/20">
              <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mb-4">
                Selo contra o greenwashing
              </h3>
              <p className="text-primary-foreground/90">
                Hoje, muitos negócios alegam ser "verdes ou sustentáveis", mas poucos 
                realmente compensam suas emissões usando certificações legítimas e 
                créditos de carbono válidos internacionalmente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
