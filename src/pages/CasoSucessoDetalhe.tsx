import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ArrowLeft, Leaf, Factory, Building2, Plane, ShoppingBag, Zap,
  TrendingUp, Target, Calendar, ExternalLink, Award, Recycle, Globe
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { LucideIcon } from "lucide-react";

interface Metrica {
  label: string;
  valor: string;
  unidade: string;
  icon: LucideIcon;
}

interface TimelineItem {
  ano: string;
  titulo: string;
  descricao: string;
}

interface Iniciativa {
  titulo: string;
  descricao: string;
  icon: LucideIcon;
}

interface CasoDetalhe {
  slug: string;
  empresa: string;
  setor: string;
  icon: LucideIcon;
  destaque: string;
  descricaoCompleta: string;
  cor: string;
  metricas: Metrica[];
  timeline: TimelineItem[];
  iniciativas: Iniciativa[];
  certificacoes: string[];
  website?: string;
}

const casosDetalhe: Record<string, CasoDetalhe> = {
  natura: {
    slug: "natura",
    empresa: "Natura",
    setor: "Cosméticos",
    icon: Leaf,
    destaque: "Carbono Negativo desde 2007",
    descricaoCompleta: "A Natura é uma das maiores empresas de cosméticos do Brasil e foi pioneira mundial ao se tornar carbono negativa em 2007. A empresa compensa mais emissões de gases de efeito estufa do que produz, através de investimentos em conservação florestal na Amazônia e programas de bioeconomia com comunidades tradicionais. Sua abordagem integra sustentabilidade em toda a cadeia de valor, desde a extração responsável de ingredientes até embalagens eco-eficientes.",
    cor: "bg-green-500/10 border-green-500/20",
    metricas: [
      { label: "CO2 Removido", valor: "500k", unidade: "ton/ano", icon: Leaf },
      { label: "Energia Renovável", valor: "100", unidade: "%", icon: Zap },
      { label: "Redução de Emissões", valor: "33", unidade: "% desde 2013", icon: TrendingUp },
      { label: "Comunidades Parceiras", valor: "40+", unidade: "na Amazônia", icon: Globe }
    ],
    timeline: [
      { ano: "2007", titulo: "Carbono Neutro", descricao: "Primeira empresa de cosméticos do mundo a se tornar carbono neutra." },
      { ano: "2013", titulo: "Programa Carbono Neutro", descricao: "Início do programa estruturado de redução e compensação de emissões." },
      { ano: "2020", titulo: "Carbono Negativo", descricao: "Passa a remover mais carbono da atmosfera do que emite em suas operações." },
      { ano: "2024", titulo: "Bioeconomia Amazônica", descricao: "Expansão da rede de comunidades fornecedoras de bioingredientes." }
    ],
    iniciativas: [
      { titulo: "Bioingredientes Amazônicos", descricao: "Parceria com 40+ comunidades para extração sustentável de ingredientes.", icon: Leaf },
      { titulo: "Embalagens Ecoeficientes", descricao: "Redução de plástico e aumento de conteúdo reciclado nas embalagens.", icon: Recycle },
      { titulo: "Logística Verde", descricao: "Frota de veículos elétricos e otimização de rotas de distribuição.", icon: TrendingUp }
    ],
    certificacoes: ["B Corp", "Carbono Neutro", "UEBT"],
    website: "https://www.natura.com.br"
  },
  suzano: {
    slug: "suzano",
    empresa: "Suzano",
    setor: "Papel e Celulose",
    icon: Factory,
    destaque: "Maior produtora de celulose do mundo",
    descricaoCompleta: "A Suzano é a maior produtora de celulose de eucalipto do mundo e um exemplo global de como a indústria pode ser parte da solução climática. A empresa remove mais carbono da atmosfera do que emite, sendo carbono positiva. Com mais de 2,4 milhões de hectares de florestas plantadas e áreas de conservação, a Suzano demonstra que produção e preservação podem andar juntas.",
    cor: "bg-emerald-500/10 border-emerald-500/20",
    metricas: [
      { label: "CO2 Capturado", valor: "15M", unidade: "ton/ano", icon: Leaf },
      { label: "Florestas Plantadas", valor: "2.4M", unidade: "hectares", icon: Factory },
      { label: "Meta 2030", valor: "40M", unidade: "ton CO2", icon: Target },
      { label: "Biodiversidade", valor: "1M+", unidade: "ha preservados", icon: Globe }
    ],
    timeline: [
      { ano: "2019", titulo: "Fusão Suzano-Fibria", descricao: "Criação da maior produtora de celulose do mundo." },
      { ano: "2020", titulo: "Compromisso Climático", descricao: "Anúncio da meta de capturar 40 milhões de toneladas de CO2 até 2030." },
      { ano: "2022", titulo: "Carbono Positivo", descricao: "Reconhecimento oficial como empresa carbono positiva." },
      { ano: "2024", titulo: "Bioprodutos", descricao: "Expansão do portfólio de produtos de base biológica." }
    ],
    iniciativas: [
      { titulo: "Florestas do Futuro", descricao: "Programa de restauração de áreas degradadas com espécies nativas.", icon: Leaf },
      { titulo: "Lignina Verde", descricao: "Desenvolvimento de bioprodutos a partir de resíduos da celulose.", icon: Recycle },
      { titulo: "Comunidades Florestais", descricao: "Programas sociais em comunidades vizinhas às operações.", icon: Globe }
    ],
    certificacoes: ["FSC", "PEFC", "ISO 14001"],
    website: "https://www.suzano.com.br"
  },
  ambev: {
    slug: "ambev",
    empresa: "Ambev",
    setor: "Bebidas",
    icon: Building2,
    destaque: "100% energia renovável até 2025",
    descricaoCompleta: "A Ambev, maior cervejaria do Brasil e uma das maiores do mundo, está transformando suas operações com uma agenda ambiciosa de sustentabilidade. A empresa se comprometeu a operar com 100% de energia renovável até 2025 e tem investido pesadamente em economia circular, redução do uso de água e logística verde.",
    cor: "bg-blue-500/10 border-blue-500/20",
    metricas: [
      { label: "Redução de Água", valor: "22", unidade: "% por litro", icon: Factory },
      { label: "Embalagens Circulares", valor: "85", unidade: "%", icon: Recycle },
      { label: "Meta Energia", valor: "100", unidade: "% renovável", icon: Zap },
      { label: "Garrafas Retornáveis", valor: "1B+", unidade: "/ano", icon: Globe }
    ],
    timeline: [
      { ano: "2018", titulo: "Meta 2025", descricao: "Anúncio das metas de sustentabilidade para 2025." },
      { ano: "2020", titulo: "Frota Elétrica", descricao: "Início da eletrificação da frota de distribuição." },
      { ano: "2022", titulo: "Cerveja Carbono Neutro", descricao: "Lançamento de produtos com pegada neutra de carbono." },
      { ano: "2024", titulo: "Economia Circular", descricao: "85% das embalagens já são retornáveis ou recicláveis." }
    ],
    iniciativas: [
      { titulo: "Água: Cada Gota Conta", descricao: "Programa de eficiência hídrica em todas as cervejarias.", icon: Factory },
      { titulo: "Retornáveis", descricao: "Incentivo ao uso de garrafas retornáveis com desconto ao consumidor.", icon: Recycle },
      { titulo: "VOA", descricao: "Programa de logística inteligente com veículos elétricos.", icon: TrendingUp }
    ],
    certificacoes: ["ISO 14001", "Water Stewardship", "CDP A List"],
    website: "https://www.ambev.com.br"
  },
  "latam-airlines": {
    slug: "latam-airlines",
    empresa: "LATAM Airlines",
    setor: "Aviação",
    icon: Plane,
    destaque: "Net Zero até 2050",
    descricaoCompleta: "O grupo LATAM Airlines, maior grupo de aviação da América Latina, está liderando a transição para uma aviação mais sustentável. A empresa foi pioneira no uso de combustíveis sustentáveis de aviação (SAF) na região e oferece programas de compensação de carbono para seus passageiros.",
    cor: "bg-sky-500/10 border-sky-500/20",
    metricas: [
      { label: "Meta Net Zero", valor: "2050", unidade: "", icon: Target },
      { label: "Eficiência", valor: "30", unidade: "% mais eficiente", icon: TrendingUp },
      { label: "SAF", valor: "1º", unidade: "voo LATAM 2022", icon: Plane },
      { label: "Compensação", valor: "5M+", unidade: "ton CO2", icon: Leaf }
    ],
    timeline: [
      { ano: "2019", titulo: "Estratégia Climática", descricao: "Lançamento da estratégia de descarbonização." },
      { ano: "2022", titulo: "Primeiro Voo SAF", descricao: "Primeiro voo com combustível sustentável de aviação na América do Sul." },
      { ano: "2023", titulo: "Frota Renovada", descricao: "Incorporação de aeronaves mais eficientes." },
      { ano: "2024", titulo: "Expansão SAF", descricao: "Ampliação do uso de combustíveis sustentáveis." }
    ],
    iniciativas: [
      { titulo: "Programa de Compensação", descricao: "Passageiros podem compensar suas emissões no momento da compra.", icon: Leaf },
      { titulo: "SAF - Combustível Sustentável", descricao: "Pioneirismo no uso de SAF na América Latina.", icon: Plane },
      { titulo: "Operações Eficientes", descricao: "Otimização de rotas e redução de peso nas aeronaves.", icon: TrendingUp }
    ],
    certificacoes: ["IATA Environmental Assessment", "ISO 14001"],
    website: "https://www.latamairlines.com"
  },
  magalu: {
    slug: "magalu",
    empresa: "Magalu",
    setor: "Varejo",
    icon: ShoppingBag,
    destaque: "Logística Verde",
    descricaoCompleta: "O Magazine Luiza está revolucionando o varejo brasileiro com iniciativas de logística sustentável e economia circular. A empresa investe em frota elétrica para entregas, embalagens 100% recicláveis e programas de reciclagem de eletrônicos para consumidores.",
    cor: "bg-purple-500/10 border-purple-500/20",
    metricas: [
      { label: "Entregas Verdes", valor: "30", unidade: "% da frota", icon: TrendingUp },
      { label: "Embalagens", valor: "100", unidade: "% recicláveis", icon: Recycle },
      { label: "Reciclagem", valor: "50k+", unidade: "eletrônicos/ano", icon: Globe },
      { label: "CDs Solares", valor: "15", unidade: "instalações", icon: Zap }
    ],
    timeline: [
      { ano: "2020", titulo: "Logística Verde", descricao: "Início do programa de eletrificação da frota." },
      { ano: "2021", titulo: "Embalagens Sustentáveis", descricao: "Transição para embalagens 100% recicláveis." },
      { ano: "2023", titulo: "Reciclagem", descricao: "Lançamento do programa de reciclagem de eletrônicos." },
      { ano: "2024", titulo: "Energia Solar", descricao: "Expansão de painéis solares nos centros de distribuição." }
    ],
    iniciativas: [
      { titulo: "Frota Elétrica", descricao: "Veículos elétricos para entregas de última milha.", icon: TrendingUp },
      { titulo: "Programa Recicla", descricao: "Coleta de eletrônicos usados nas lojas.", icon: Recycle },
      { titulo: "Energia Solar", descricao: "Instalação de painéis solares nos centros de distribuição.", icon: Zap }
    ],
    certificacoes: ["B Corp", "ISO 14001"],
    website: "https://www.magazineluiza.com.br"
  },
  raizen: {
    slug: "raizen",
    empresa: "Raízen",
    setor: "Energia",
    icon: Zap,
    destaque: "Líder em etanol 2G",
    descricaoCompleta: "A Raízen, joint venture entre Cosan e Shell, é uma das maiores empresas de energia do Brasil e pioneira mundial na produção de etanol de segunda geração. O etanol 2G é produzido a partir do bagaço da cana, aproveitando resíduos e gerando até 80% menos emissões que a gasolina.",
    cor: "bg-yellow-500/10 border-yellow-500/20",
    metricas: [
      { label: "Produção", valor: "2ª", unidade: "maior do mundo", icon: Factory },
      { label: "Redução CO2", valor: "80", unidade: "% vs gasolina", icon: Leaf },
      { label: "Bioeletricidade", valor: "11M", unidade: "residências", icon: Zap },
      { label: "Etanol 2G", valor: "82M", unidade: "litros/ano", icon: TrendingUp }
    ],
    timeline: [
      { ano: "2015", titulo: "Primeira Planta 2G", descricao: "Inauguração da primeira planta de etanol 2G do Brasil." },
      { ano: "2021", titulo: "IPO", descricao: "Abertura de capital na B3 com foco em energia renovável." },
      { ano: "2023", titulo: "Expansão 2G", descricao: "Ampliação da capacidade de produção de etanol 2G." },
      { ano: "2024", titulo: "Biogás", descricao: "Início da produção de biometano em escala comercial." }
    ],
    iniciativas: [
      { titulo: "Etanol 2G", descricao: "Produção de combustível a partir do bagaço da cana.", icon: Leaf },
      { titulo: "Bioeletricidade", descricao: "Geração de energia elétrica a partir da biomassa.", icon: Zap },
      { titulo: "Biometano", descricao: "Produção de gás renovável para transporte pesado.", icon: Factory }
    ],
    certificacoes: ["Bonsucro", "RenovaBio", "ISO 14001"],
    website: "https://www.raizen.com.br"
  }
};

const outrosCasos = [
  { slug: "natura", empresa: "Natura", setor: "Cosméticos", icon: Leaf },
  { slug: "suzano", empresa: "Suzano", setor: "Papel e Celulose", icon: Factory },
  { slug: "ambev", empresa: "Ambev", setor: "Bebidas", icon: Building2 },
  { slug: "latam-airlines", empresa: "LATAM Airlines", setor: "Aviação", icon: Plane },
  { slug: "magalu", empresa: "Magalu", setor: "Varejo", icon: ShoppingBag },
  { slug: "raizen", empresa: "Raízen", setor: "Energia", icon: Zap }
];

const CasoSucessoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const caso = slug ? casosDetalhe[slug] : null;

  if (!caso) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Caso não encontrado</h1>
            <Link to="/casos-de-sucesso">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Casos de Sucesso
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = caso.icon;
  const otherCases = outrosCasos.filter(c => c.slug !== slug).slice(0, 3);

  return (
    <>
      <SEOHead
        title={`${caso.empresa} - Caso de Sucesso em Sustentabilidade`}
        description={`Conheça a jornada sustentável da ${caso.empresa}: ${caso.destaque}. Métricas de impacto, timeline e principais iniciativas.`}
        keywords={[caso.empresa, caso.setor, "sustentabilidade", "ESG", "caso de sucesso", "carbono neutro"]}
      />
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 pt-4">
          <Breadcrumb items={[
            { label: "Casos de Sucesso", href: "/casos-de-sucesso" },
            { label: caso.empresa }
          ]} />
        </div>

        {/* Hero Section */}
        <section className={`relative py-16 ${caso.cor} border-b`}>
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-4xl">
                <Link to="/casos-de-sucesso" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para todos os casos
                </Link>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-background/80">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {caso.setor}
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {caso.empresa}
                </h1>
                <p className="text-xl text-primary font-medium mb-6">
                  {caso.destaque}
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-sm text-muted-foreground">Compartilhe este case:</p>
                  <SocialShareButtons
                    url={`${window.location.origin}/casos-de-sucesso/${caso.slug}`}
                    title={`${caso.empresa} - ${caso.destaque}`}
                    description={caso.descricaoCompleta.slice(0, 150)}
                    hashtags={["Sustentabilidade", "ESG", caso.empresa.replace(/\s/g, "")]}
                    compact
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Visão Geral */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-4xl">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  Visão Geral
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {caso.descricaoCompleta}
                </p>
                
                {caso.website && (
                  <a 
                    href={caso.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
                  >
                    Visitar site oficial
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Métricas de Impacto */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                Métricas de Impacto
              </h2>
            </ScrollReveal>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {caso.metricas.map((metrica, index) => {
                const MetricIcon = metrica.icon;
                return (
                  <ScrollReveal key={metrica.label} delay={index * 0.1}>
                    <Card className="text-center p-6 hover:border-primary/30 transition-colors">
                      <MetricIcon className="h-8 w-8 text-primary mx-auto mb-4" />
                      <p className="text-3xl font-bold text-foreground">{metrica.valor}</p>
                      <p className="text-sm text-muted-foreground">{metrica.unidade}</p>
                      <p className="text-xs text-muted-foreground mt-2">{metrica.label}</p>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                Jornada Sustentável
              </h2>
            </ScrollReveal>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />
                
                {caso.timeline.map((item, index) => (
                  <ScrollReveal key={item.ano} delay={index * 0.15}>
                    <div className={`relative flex items-start gap-6 mb-8 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}>
                      {/* Year Badge */}
                      <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {item.ano.slice(2)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                        index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'
                      }`}>
                        <Card className="p-4">
                          <p className="text-sm text-primary font-medium">{item.ano}</p>
                          <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.descricao}</p>
                        </Card>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Iniciativas */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                Principais Iniciativas
              </h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-6">
              {caso.iniciativas.map((iniciativa, index) => {
                const InicIcon = iniciativa.icon;
                return (
                  <ScrollReveal key={iniciativa.titulo} delay={index * 0.1}>
                    <Card className="h-full hover:border-primary/30 transition-colors">
                      <CardHeader>
                        <div className="p-3 rounded-lg bg-primary/10 w-fit">
                          <InicIcon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{iniciativa.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{iniciativa.descricao}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Certificações */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                Certificações
              </h2>
              <div className="flex flex-wrap gap-3">
                {caso.certificacoes.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-sm px-4 py-2">
                    {cert}
                  </Badge>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Outros Casos */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-8">Outros Casos de Sucesso</h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-6">
              {otherCases.map((outro, index) => {
                const OutroIcon = outro.icon;
                return (
                  <ScrollReveal key={outro.slug} delay={index * 0.1}>
                    <Link to={`/casos-de-sucesso/${outro.slug}`}>
                      <Card className="group hover:border-primary/30 transition-all cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <OutroIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">{outro.empresa}</h3>
                            <p className="text-sm text-muted-foreground">{outro.setor}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Sua empresa pode ser o próximo case
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Descubra como implementar práticas sustentáveis que geram resultados 
                reais para o seu negócio e para o planeta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contato">
                  <Button size="lg" className="gap-2">
                    Fale com um Consultor
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/casos-de-sucesso">
                  <Button variant="outline" size="lg">
                    Ver Todos os Cases
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default CasoSucessoDetalhe;
