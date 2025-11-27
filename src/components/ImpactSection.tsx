import sectionBg from "@/assets/section-bg.jpg";

const ImpactSection = () => {
  return (
    <section className="relative py-32">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${sectionBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
            SAIBA MAIS SOBRE O IMPACTO DE PROJETOS CERTIFICADOS PELA BYOMAS.
          </h2>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
