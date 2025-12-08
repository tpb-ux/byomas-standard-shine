import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { 
  Trophy, Medal, Award, TrendingUp, Leaf, Zap, Search, X, Filter,
  ArrowUpDown, ExternalLink, BarChart3
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import { SustainabilityRadarChart } from "@/components/SustainabilityRadarChart";
import { casosDetalhe, CasoDetalhe } from "@/data/casosDetalhe";

interface EmpresaRanking {
  caso: CasoDetalhe;
  pontuacao: number;
  posicao: number;
  pontuacaoDetalhada: {
    co2: number;
    energia: number;
    certificacoes: number;
    timeline: number;
    iniciativas: number;
    destaque: number;
  };
}

const SETORES = ["Todos", "Cosméticos", "Papel e Celulose", "Bebidas", "Aviação", "Varejo", "Energia"];

// Sistema de pontuação ponderado
function calcularPontuacao(caso: CasoDetalhe): { total: number; detalhada: EmpresaRanking["pontuacaoDetalhada"] } {
  const ultimoHistorico = caso.historicoMetricas[caso.historicoMetricas.length - 1];
  
  // CO2 Removido (25% do peso) - normalizado
  const co2Score = Math.min(100, (ultimoHistorico?.co2Removido || 0) / 150) * 0.25;
  
  // Energia Renovável (20% do peso)
  const energiaScore = ((ultimoHistorico?.energiaRenovavel || 0) / 100) * 0.20;
  
  // Certificações (15% do peso) - max 5 certificações = 100%
  const certScore = Math.min(100, (caso.certificacoes.length / 5) * 100) * 0.15;
  
  // Timeline/Histórico (15% do peso) - empresas com mais tempo de atuação
  const timelineScore = Math.min(100, (caso.timeline.length / 5) * 100) * 0.15;
  
  // Iniciativas (15% do peso)
  const iniciativasScore = Math.min(100, (caso.iniciativas.length / 4) * 100) * 0.15;
  
  // Destaque especial (10% do peso) - análise do destaque
  const destaqueKeywords = ["carbono negativo", "net zero", "100%", "líder", "maior", "pioneiro"];
  const destaqueScore = destaqueKeywords.some(kw => caso.destaque.toLowerCase().includes(kw)) ? 10 : 5;
  
  const total = (co2Score + energiaScore + certScore + timelineScore + iniciativasScore + (destaqueScore / 100) * 0.10) * 100;
  
  return {
    total: Math.round(total * 10) / 10,
    detalhada: {
      co2: Math.round(co2Score * 400),
      energia: Math.round(energiaScore * 500),
      certificacoes: Math.round(certScore * 666.67),
      timeline: Math.round(timelineScore * 666.67),
      iniciativas: Math.round(iniciativasScore * 666.67),
      destaque: destaqueScore * 10
    }
  };
}

const Ranking = () => {
  const [setorFiltro, setSetorFiltro] = useState("Todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<"pontuacao" | "co2" | "energia">("pontuacao");
  const [minPontuacao, setMinPontuacao] = useState([0]);
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([]);

  const ranking = useMemo((): EmpresaRanking[] => {
    const casos = Object.values(casosDetalhe);
    
    const comPontuacao = casos.map(caso => {
      const { total, detalhada } = calcularPontuacao(caso);
      return {
        caso,
        pontuacao: total,
        pontuacaoDetalhada: detalhada,
        posicao: 0
      };
    });
    
    // Ordenar por pontuação
    comPontuacao.sort((a, b) => b.pontuacao - a.pontuacao);
    
    // Atribuir posições
    comPontuacao.forEach((item, index) => {
      item.posicao = index + 1;
    });
    
    return comPontuacao;
  }, []);

  const rankingFiltrado = useMemo(() => {
    let resultado = [...ranking];
    
    // Filtro por setor
    if (setorFiltro !== "Todos") {
      resultado = resultado.filter(r => r.caso.setor === setorFiltro);
    }
    
    // Filtro por busca
    if (termoBusca) {
      resultado = resultado.filter(r => 
        r.caso.empresa.toLowerCase().includes(termoBusca.toLowerCase()) ||
        r.caso.destaque.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    
    // Filtro por pontuação mínima
    resultado = resultado.filter(r => r.pontuacao >= minPontuacao[0]);
    
    // Ordenação
    switch (ordenacao) {
      case "co2":
        resultado.sort((a, b) => 
          (b.caso.historicoMetricas[b.caso.historicoMetricas.length - 1]?.co2Removido || 0) -
          (a.caso.historicoMetricas[a.caso.historicoMetricas.length - 1]?.co2Removido || 0)
        );
        break;
      case "energia":
        resultado.sort((a, b) =>
          (b.caso.historicoMetricas[b.caso.historicoMetricas.length - 1]?.energiaRenovavel || 0) -
          (a.caso.historicoMetricas[a.caso.historicoMetricas.length - 1]?.energiaRenovavel || 0)
        );
        break;
      default:
        resultado.sort((a, b) => b.pontuacao - a.pontuacao);
    }
    
    return resultado;
  }, [ranking, setorFiltro, termoBusca, minPontuacao, ordenacao]);

  const estatisticas = useMemo(() => {
    const pontuacoes = ranking.map(r => r.pontuacao);
    const media = pontuacoes.reduce((a, b) => a + b, 0) / pontuacoes.length;
    
    const setoresPontuacao = SETORES.filter(s => s !== "Todos").map(setor => ({
      setor,
      media: ranking.filter(r => r.caso.setor === setor).reduce((acc, r) => acc + r.pontuacao, 0) / 
             ranking.filter(r => r.caso.setor === setor).length || 0
    }));
    
    const setorLider = setoresPontuacao.sort((a, b) => b.media - a.media)[0];
    
    return {
      mediaGeral: Math.round(media * 10) / 10,
      setorLider: setorLider?.setor || "",
      mediaStoLider: Math.round((setorLider?.media || 0) * 10) / 10
    };
  }, [ranking]);

  const casosParaRadar = useMemo(() => {
    if (empresasSelecionadas.length === 0) {
      return ranking.slice(0, 3).map(r => r.caso);
    }
    return empresasSelecionadas.map(slug => casosDetalhe[slug]).filter(Boolean);
  }, [empresasSelecionadas, ranking]);

  const toggleEmpresa = (slug: string) => {
    setEmpresasSelecionadas(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : prev.length < 4 ? [...prev, slug] : prev
    );
  };

  const getPosicaoBadge = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-medium">{posicao}º</span>;
    }
  };

  const limparFiltros = () => {
    setSetorFiltro("Todos");
    setTermoBusca("");
    setMinPontuacao([0]);
    setOrdenacao("pontuacao");
  };

  return (
    <>
      <SEOHead
        title="Ranking de Sustentabilidade Empresarial | Byoma Research"
        description="Conheça as empresas mais sustentáveis do Brasil. Ranking interativo baseado em métricas de CO2, energia renovável, certificações e iniciativas ambientais."
        keywords={["ranking sustentabilidade", "empresas sustentáveis", "ESG Brasil", "carbono neutro", "energia renovável"]}
      />
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 pt-4">
          <Breadcrumb items={[{ label: "Ranking de Sustentabilidade" }]} />
        </div>

        {/* Hero */}
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center">
                <Badge variant="outline" className="mb-4">
                  <Trophy className="h-3 w-3 mr-1" />
                  Ranking Interativo
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Ranking de Sustentabilidade
                </h1>
                <p className="text-lg text-muted-foreground">
                  Descubra as empresas líderes em práticas sustentáveis no Brasil, 
                  classificadas por um sistema de pontuação multi-dimensional.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-foreground">{estatisticas.mediaGeral}</div>
                  <div className="text-sm text-muted-foreground">Score Médio</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-foreground">{ranking[0]?.caso.empresa}</div>
                  <div className="text-sm text-muted-foreground">Líder Geral</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-foreground">{estatisticas.setorLider}</div>
                  <div className="text-sm text-muted-foreground">Setor Líder ({estatisticas.mediaStoLider} pts)</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Busca */}
                <div className="relative w-full lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar empresa..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {termoBusca && (
                    <button onClick={() => setTermoBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Setor */}
                <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                  <SelectTrigger className="w-full lg:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {SETORES.map(setor => (
                      <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as typeof ordenacao)}>
                  <SelectTrigger className="w-full lg:w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pontuacao">Score Geral</SelectItem>
                    <SelectItem value="co2">CO2 Removido</SelectItem>
                    <SelectItem value="energia">Energia Renovável</SelectItem>
                  </SelectContent>
                </Select>

                {/* Pontuação mínima */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Min: {minPontuacao[0]}</span>
                  <Slider
                    value={minPontuacao}
                    onValueChange={setMinPontuacao}
                    max={80}
                    step={5}
                    className="w-32"
                  />
                </div>

                {(termoBusca || setorFiltro !== "Todos" || minPontuacao[0] > 0) && (
                  <Button variant="ghost" size="sm" onClick={limparFiltros}>
                    Limpar filtros
                  </Button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary">{rankingFiltrado.length} empresas</Badge>
                {empresasSelecionadas.length > 0 && (
                  <Badge variant="outline">
                    {empresasSelecionadas.length} selecionadas para comparar
                  </Badge>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Tabela de Ranking */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tabela */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Ranking Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">CO2</TableHead>
                            <TableHead className="text-right">Energia</TableHead>
                            <TableHead className="w-24">Comparar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {rankingFiltrado.map((item, index) => {
                              const Icon = item.caso.icon;
                              const ultimoHistorico = item.caso.historicoMetricas[item.caso.historicoMetricas.length - 1];
                              const selecionada = empresasSelecionadas.includes(item.caso.slug);
                              
                              return (
                                <motion.tr
                                  key={item.caso.slug}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`border-b ${selecionada ? "bg-primary/5" : ""}`}
                                >
                                  <TableCell>
                                    <div className="flex items-center justify-center">
                                      {getPosicaoBadge(item.posicao)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Link 
                                      to={`/casos-de-sucesso/${item.caso.slug}`}
                                      className="flex items-center gap-3 hover:text-primary transition-colors"
                                    >
                                      <div className={`p-2 rounded-lg ${item.caso.cor}`}>
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="font-medium">{item.caso.empresa}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                          {item.caso.destaque}
                                        </div>
                                      </div>
                                    </Link>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {item.caso.setor}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-bold text-primary">{item.pontuacao}</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Leaf className="h-3 w-3 text-green-500" />
                                      <span className="text-sm">{ultimoHistorico?.co2Removido || 0}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Zap className="h-3 w-3 text-yellow-500" />
                                      <span className="text-sm">{ultimoHistorico?.energiaRenovavel || 0}%</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant={selecionada ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => toggleEmpresa(item.caso.slug)}
                                      disabled={!selecionada && empresasSelecionadas.length >= 4}
                                    >
                                      {selecionada ? "✓" : "+"}
                                    </Button>
                                  </TableCell>
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>

                    {rankingFiltrado.length === 0 && (
                      <div className="text-center py-8">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">Nenhuma empresa encontrada com os filtros aplicados.</p>
                        <Button variant="outline" className="mt-4" onClick={limparFiltros}>
                          Limpar filtros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico Radar */}
              <div className="lg:col-span-1">
                <SustainabilityRadarChart 
                  casos={casosParaRadar}
                  titulo="Comparação Visual"
                />
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Como funciona o Score?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CO2 Removido</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Energia Renovável</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificações</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Histórico</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Iniciativas</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destaque</span>
                      <span className="font-medium">10%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
                Explore os casos em detalhes
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Conheça a história, métricas e iniciativas de cada empresa líder em sustentabilidade.
              </p>
              <Link to="/casos-de-sucesso">
                <Button size="lg" className="gap-2">
                  Ver Todos os Casos
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default Ranking;
