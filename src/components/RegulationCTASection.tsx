import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RegulationCTASection = () => {
  return (
    <section className="relative py-16 md:py-24">
      {/* Imagem de fundo - turbinas eólicas */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920&q=80')` 
        }}
      >
        {/* Overlay leve para melhor contraste */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        {/* Card central com fundo cinza semi-transparente */}
        <div className="mx-auto max-w-4xl bg-gray-700/90 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          {/* Título */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-6">
            Se posicione à frente do mercado. Prepare sua empresa para as 
            exigências atuais e para a nova regulamentação do carbono no Brasil.
          </h2>
          
          {/* Parágrafo explicativo */}
          <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-8">
            A Lei nº 15.042/2024 já exige que empresas com emissões superiores a 10 mil 
            toneladas de CO₂ por ano compensem no mercado regulado. Mas mesmo que sua 
            empresa não esteja enquadrada nesta quantidade de emissão, o cenário 
            regulatório está avançando rapidamente e a importância está muito a frente 
            de uma regulamentação, se trata de melhorarmos cada dia mais nosso Planeta. 
            Antecipar-se às exigências não é apenas uma atitude responsável é um diferencial 
            competitivo que posiciona sua marca aonde ela merece estar no mercado.
          </p>
          
          {/* Botão CTA alinhado à direita */}
          <div className="flex justify-end">
            <Button 
              asChild
              className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-6 py-3 font-medium"
            >
              <Link to="/contato">
                Tenho interesse em compensar minhas emissões.
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegulationCTASection;
