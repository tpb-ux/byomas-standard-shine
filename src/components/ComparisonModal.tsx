import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Share2, ExternalLink } from "lucide-react";
import { casosDetalhe } from "@/data/casosDetalhe";
import { SocialShareButtons } from "@/components/SocialShareButtons";

interface ComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresasSelecionadas: string[];
}

const ComparisonModal = ({ open, onOpenChange, empresasSelecionadas }: ComparisonModalProps) => {
  const casos = empresasSelecionadas.map(slug => casosDetalhe[slug]).filter(Boolean);

  if (casos.length < 2) return null;

  const metricLabels = ["CO2", "Energia", "Redução", "Impacto"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Comparação de Casos de Sucesso
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            {/* Header com nomes das empresas */}
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-[140px]">
                  Métrica
                </th>
                {casos.map(caso => (
                  <th key={caso.slug} className="text-center py-3 px-4 min-w-[160px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-2 rounded-lg ${caso.cor}`}>
                        <caso.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-semibold">{caso.empresa}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Setor */}
              <tr className="border-b hover:bg-muted/30 transition-colors">
                <td className="py-3 px-2 text-sm text-muted-foreground">Setor</td>
                {casos.map(caso => (
                  <td key={caso.slug} className="py-3 px-4 text-center">
                    <Badge variant="secondary">{caso.setor}</Badge>
                  </td>
                ))}
              </tr>

              {/* Destaque */}
              <tr className="border-b hover:bg-muted/30 transition-colors">
                <td className="py-3 px-2 text-sm text-muted-foreground">Destaque</td>
                {casos.map(caso => (
                  <td key={caso.slug} className="py-3 px-4 text-center text-sm text-primary font-medium">
                    {caso.destaque}
                  </td>
                ))}
              </tr>

              {/* Métricas */}
              {[0, 1, 2, 3].map(index => (
                <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {casos[0]?.metricas[index]?.label || metricLabels[index]}
                  </td>
                  {casos.map(caso => {
                    const metrica = caso.metricas[index];
                    return (
                      <td key={caso.slug} className="py-3 px-4 text-center">
                        {metrica ? (
                          <div>
                            <span className="text-2xl font-bold">{metrica.valor}</span>
                            <span className="text-xs text-muted-foreground ml-1">{metrica.unidade}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Certificações */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-2 text-sm text-muted-foreground">Certificações</td>
                {casos.map(caso => (
                  <td key={caso.slug} className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {caso.certificacoes.map(cert => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Website */}
              <tr className="border-t hover:bg-muted/30 transition-colors">
                <td className="py-3 px-2 text-sm text-muted-foreground">Site</td>
                {casos.map(caso => (
                  <td key={caso.slug} className="py-3 px-4 text-center">
                    {caso.website && (
                      <a
                        href={caso.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Visitar
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-sm text-muted-foreground">Compartilhar:</span>
            <SocialShareButtons
              url={`${window.location.origin}/casos-de-sucesso?compare=${empresasSelecionadas.join(",")}`}
              title={`Comparação: ${casos.map(c => c.empresa).join(" vs ")}`}
              description="Compare os resultados de sustentabilidade dessas empresas brasileiras"
              hashtags={["Sustentabilidade", "ESG", "Comparacao"]}
              compact
            />
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
