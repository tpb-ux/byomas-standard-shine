import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Scale, ExternalLink, Download, Image, FileText, Loader2 } from "lucide-react";
import { casosDetalhe } from "@/data/casosDetalhe";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { toast } from "sonner";

interface ComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresasSelecionadas: string[];
}

const ComparisonModal = ({ open, onOpenChange, empresasSelecionadas }: ComparisonModalProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const casos = empresasSelecionadas.map(slug => casosDetalhe[slug]).filter(Boolean);

  if (casos.length < 2) return null;

  const metricLabels = ["CO2", "Energia", "Redução", "Impacto"];

  const exportAsImage = async () => {
    if (!tableRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        style: { padding: "24px", borderRadius: "8px" }
      });
      
      const link = document.createElement("a");
      link.download = `comparacao-${casos.map(c => c.slug).join("-")}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Imagem exportada com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar imagem");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!tableRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comparação - ${casos.map(c => c.empresa).join(" vs ")}</title>
              <style>
                @media print { body { margin: 0; } img { max-width: 100%; } }
                body { display: flex; justify-content: center; padding: 20px; font-family: system-ui; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" />
              <script>window.onload = () => { window.print(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      
      toast.success("PDF aberto para impressão!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Comparação de Casos de Sucesso
          </DialogTitle>
        </DialogHeader>

        {/* Área capturável para exportação */}
        <div ref={tableRef} className="bg-white dark:bg-slate-900 rounded-lg">
          {/* Cabeçalho para exportação */}
          <div className="text-center pb-4 border-b mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Comparação: {casos.map(c => c.empresa).join(" vs ")}
            </h2>
            <p className="text-sm text-muted-foreground">
              Byoma Research • {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="overflow-x-auto">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? "Exportando..." : "Exportar"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportAsImage}>
                <Image className="h-4 w-4 mr-2" />
                Exportar como PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
