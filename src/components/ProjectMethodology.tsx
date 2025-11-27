import { CheckCircle2 } from "lucide-react";

interface ProjectMethodologyProps {
  methodology: string;
}

const ProjectMethodology = ({ methodology }: ProjectMethodologyProps) => {
  const principles = [
    "Adicionalidade: O projeto não teria acontecido sem o incentivo dos créditos de carbono",
    "Permanência: As reduções de emissões são garantidas a longo prazo",
    "Não-vazamento: O projeto não causa aumento de emissões em outras áreas",
    "Mensuração precisa: As reduções são calculadas de forma rigorosa e verificável",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Descrição da Metodologia
        </h3>
        <p className="text-muted-foreground leading-relaxed">{methodology}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Princípios Fundamentais
        </h3>
        <div className="space-y-3">
          {principles.map((principle, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{principle}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted p-6">
        <h4 className="font-semibold text-foreground mb-2">
          Certificação e Verificação
        </h4>
        <p className="text-sm text-muted-foreground">
          Este projeto é verificado periodicamente por auditores independentes
          certificados, garantindo que todas as reduções de emissões reportadas
          são reais, mensuráveis e permanentes. Os relatórios de verificação
          estão disponíveis na seção de documentos.
        </p>
      </div>
    </div>
  );
};

export default ProjectMethodology;
