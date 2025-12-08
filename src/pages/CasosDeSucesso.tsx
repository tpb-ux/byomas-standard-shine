import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Scale, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import RelatedPages from "@/components/RelatedPages";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import ComparisonModal from "@/components/ComparisonModal";
import { casosSucesso, casosDetalhe } from "@/data/casosDetalhe";
import { toast } from "sonner";

const SETORES = ["Todos", "Cosméticos", "Papel e Celulose", "Bebidas", "Aviação", "Varejo", "Energia"];
const RELATED_TAGS = ["sustentabilidade", "carbono-neutro", "empresas-verdes", "esg", "economia-circular"];

const CasosDeSucesso = () => {
  const [setorSelecionado, setSetorSelecionado] = useState("Todos");
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([]);
  const [mostrarComparacao, setMostrarComparacao] = useState(false);
  const { data: articles, isLoading } = useBlogArticles();
  
  const casosFiltrados = setorSelecionado === "Todos" 
    ? casosSucesso 
    : casosSucesso.filter(caso => caso.setor === setorSelecionado);
  
  const relatedArticles = articles?.filter(article => 
    article.tags?.some(tag => RELATED_TAGS.includes(tag.slug))
  ).slice(0, 4) || [];

  const toggleSelecao = (slug: string) => {
    setEmpresasSelecionadas(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= 3) {
        toast.warning("Máximo de 3 empresas para comparação");
        return prev;
      }
      return [...prev, slug];
    });
  };

  return (
    <>
      <SEOHead
        title="Casos de Sucesso em Sustentabilidade - Empresas Brasileiras"
        description="Conheça empresas brasileiras que são referência em sustentabilidade: Natura, Suzano, Ambev, LATAM e outras. Inspire-se com cases reais de sucesso."
        keywords={["casos de sucesso sustentabilidade", "empresas sustentáveis brasil", "ESG empresas brasileiras", "carbono neutro", "economia circular"]}
      />
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20 pb-24">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 pt-4">
          <Breadcrumb items={[
            { label: "Para sua Empresa", href: "#" },
            { label: "Casos de Sucesso" }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Inspiração
                </Badge>
                <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">
                  Casos de <span className="text-primary">Sucesso</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Empresas brasileiras que estão liderando a transformação sustentável 
                  e provando que é possível lucrar enquanto se protege o planeta.
                </p>
                
                {/* Social Share */}
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-sm text-muted-foreground">Compartilhe:</p>
                  <SocialShareButtons
                    url={`${window.location.origin}/casos-de-sucesso`}
                    title="Casos de Sucesso em Sustentabilidade - Empresas Brasileiras"
                    description="Conheça empresas brasileiras que são referência em sustentabilidade"
                    hashtags={["Sustentabilidade", "ESG", "EmpresasVerdes"]}
                    compact
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Filtro por Setor */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">Filtrar por setor:</span>
                {SETORES.map((setor) => (
                  <motion.div key={setor} whileTap={{ scale: 0.95 }}>
                    <Badge
                      variant={setorSelecionado === setor ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${
                        setorSelecionado === setor ? "shadow-md" : "hover:bg-primary/10"
                      }`}
                      onClick={() => setSetorSelecionado(setor)}
                    >
                      {setor}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Cases Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {casosFiltrados.map((caso, index) => (
                  <motion.div
                    key={caso.slug}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    layout
                  >
                    <Card className={`group relative hover:border-primary/30 transition-all duration-300 h-full ${caso.cor}`}>
                      {/* Checkbox de seleção */}
                      <div 
                        className="absolute top-3 right-3 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={empresasSelecionadas.includes(caso.slug)}
                          onCheckedChange={() => toggleSelecao(caso.slug)}
                          className="h-5 w-5 bg-background/80 border-2"
                        />
                      </div>

                      <Link to={`/casos-de-sucesso/${caso.slug}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between pr-8">
                            <div className="p-3 rounded-lg bg-background/50">
                              <caso.icon className="h-6 w-6 text-primary" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {caso.setor}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">{caso.empresa}</CardTitle>
                          <p className="text-sm font-medium text-primary">{caso.destaque}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {caso.descricao}
                          </p>
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-foreground">Resultados:</p>
                            <ul className="space-y-1">
                              {caso.resultados.map((resultado) => (
                                <li key={resultado} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                  {resultado}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-2 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver detalhes completos
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <AnimatePresence mode="wait">
              {casosFiltrados.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">Nenhum caso encontrado para o setor selecionado.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSetorSelecionado("Todos")}
                  >
                    Ver todos os casos
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Artigos Relacionados */}
        {(relatedArticles.length > 0 || isLoading) && (
          <section className="py-16 bg-muted/20">
            <div className="container mx-auto px-6">
              <ScrollReveal>
                <RelatedPages 
                  articles={relatedArticles}
                  isLoading={isLoading}
                  title="Artigos Relacionados"
                  variant="vertical"
                />
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
                Sua empresa pode ser o próximo caso de sucesso
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Descubra como implementar práticas sustentáveis que geram resultados 
                reais para o seu negócio e para o planeta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contato">
                  <Button size="lg" className="gap-2">
                    Iniciar Transformação
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/guias">
                  <Button variant="outline" size="lg">
                    Ver Guias Práticos
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Barra Fixa de Comparação */}
      <AnimatePresence>
        {empresasSelecionadas.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t shadow-lg z-50"
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="shrink-0">
                    {empresasSelecionadas.length}/3 selecionadas
                  </Badge>
                  <div className="flex flex-wrap gap-2">
                    {empresasSelecionadas.map(slug => (
                      <Badge key={slug} variant="outline" className="gap-1 pr-1">
                        {casosDetalhe[slug]?.empresa}
                        <button
                          onClick={() => toggleSelecao(slug)}
                          className="ml-1 p-0.5 hover:bg-muted rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEmpresasSelecionadas([])}
                  >
                    Limpar
                  </Button>
                  <Button 
                    size="sm"
                    disabled={empresasSelecionadas.length < 2}
                    onClick={() => setMostrarComparacao(true)}
                    className="gap-2"
                  >
                    <Scale className="h-4 w-4" />
                    Comparar ({empresasSelecionadas.length})
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Comparação */}
      <ComparisonModal
        open={mostrarComparacao}
        onOpenChange={setMostrarComparacao}
        empresasSelecionadas={empresasSelecionadas}
      />
      
      <Footer />
    </>
  );
};

export default CasosDeSucesso;
