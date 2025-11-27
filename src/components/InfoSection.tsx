const InfoSection = () => {
  return (
    <section className="bg-ocean-blue py-20 text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
            NOSSOS PADRÕES
          </h2>
          <h3 className="mb-8 text-4xl font-bold leading-tight md:text-5xl">
            DESENVOLVEDORES DE PROJETOS E PROPONENTES DO PROJETO
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-xl font-semibold">Padrões de Carbono Verificado (VCS)</h4>
              <p className="text-primary-foreground/80">
                O padrão líder mundial para certificação de reduções de emissões de carbono.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xl font-semibold">Clima, Comunidade & Biodiversidade (CCB)</h4>
              <p className="text-primary-foreground/80">
                Identifica projetos de uso da terra que entregam simultaneamente benefícios climáticos, comunitários e de biodiversidade.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xl font-semibold">Desenvolvimento Sustentável Verificado (SD VISta)</h4>
              <p className="text-primary-foreground/80">
                Demonstra e comunica contribuições verificadas para os Objetivos de Desenvolvimento Sustentável.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xl font-semibold">Plástico Verificado (VCP)</h4>
              <p className="text-primary-foreground/80">
                Garante que o plástico foi coletado e devidamente descartado ou reciclado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
