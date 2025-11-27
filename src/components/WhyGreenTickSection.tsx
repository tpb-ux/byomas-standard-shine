import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  "Certificação de crédito internacional validada pela UNFCCC e ONU, registrada e validada em blockchain.",
  "Processo simples e seguro.",
  "Selos certificados e prontos para uso em embalagens, sites, produtos e marketing.",
  "Garantindo a redução das emissões de CO² da sua empresa e tornando-a realmente mais sustentável para hoje e para o futuro."
];

const WhyGreenTickSection = () => {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8 items-start">
          
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Por que escolher a<br />Green Tick?
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Oferecemos mais do que compensar suas emissões de CO² e tornar sua 
              empresa verdadeiramente sustentável entregamos confiança, tecnologia 
              e credibilidade ambiental para fortalecer ainda mais a sua marca.
            </p>
            
            {/* Lista de Benefícios */}
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex gap-3">
                  <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            
            {/* Card CTA Escuro */}
            <div className="bg-gray-800 rounded-2xl p-6 mt-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Pronto para certificar sua empresa?
              </h3>
              <Button 
                asChild 
                variant="ghost" 
                className="text-white hover:text-white hover:bg-white/10 p-0 h-auto font-medium"
              >
                <Link to="/contato" className="flex items-center gap-2">
                  Quero Obter meu Selo Agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Coluna Central - Imagem Oval */}
          <div className="flex justify-center items-center">
            <div className="w-64 h-80 md:w-72 md:h-96 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80"
                alt="Globo digital nas mãos"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Coluna Direita */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Soluções pensadas para empresas comprometidas com o futuro!
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Atendemos empresas de todos os tamanhos e segmentos de pequenos 
              negócios a grandes corporações que desejam alinhar suas operações 
              aos critérios ESG, comunicar responsabilidade ambiental com 
              credibilidade e adotar práticas sustentáveis com transparência 
              e inovação.
            </p>
            
            {/* Imagem Terra Verde */}
            <div className="rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&q=80"
                alt="Mãos segurando planta"
                className="w-full h-48 md:h-56 object-cover"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default WhyGreenTickSection;
