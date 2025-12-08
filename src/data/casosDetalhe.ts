import { Leaf, Factory, Building2, Plane, ShoppingBag, Zap, TrendingUp, Target, Globe, Recycle } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Metrica {
  label: string;
  valor: string;
  unidade: string;
  icon: LucideIcon;
}

export interface TimelineItem {
  ano: string;
  titulo: string;
  descricao: string;
}

export interface Iniciativa {
  titulo: string;
  descricao: string;
  icon: LucideIcon;
}

export interface HistoricoMetrica {
  ano: number;
  co2Removido: number;
  energiaRenovavel: number;
  reducaoEmissoes: number;
  investimentoSustentabilidade: number;
}

export interface CasoDetalhe {
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
  historicoMetricas: HistoricoMetrica[];
}

export const casosDetalhe: Record<string, CasoDetalhe> = {
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
    website: "https://www.natura.com.br",
    historicoMetricas: [
      { ano: 2018, co2Removido: 280, energiaRenovavel: 78, reducaoEmissoes: 15, investimentoSustentabilidade: 120 },
      { ano: 2019, co2Removido: 320, energiaRenovavel: 82, reducaoEmissoes: 18, investimentoSustentabilidade: 145 },
      { ano: 2020, co2Removido: 380, energiaRenovavel: 88, reducaoEmissoes: 22, investimentoSustentabilidade: 180 },
      { ano: 2021, co2Removido: 420, energiaRenovavel: 92, reducaoEmissoes: 26, investimentoSustentabilidade: 210 },
      { ano: 2022, co2Removido: 460, energiaRenovavel: 96, reducaoEmissoes: 30, investimentoSustentabilidade: 250 },
      { ano: 2023, co2Removido: 500, energiaRenovavel: 100, reducaoEmissoes: 33, investimentoSustentabilidade: 290 }
    ]
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
    website: "https://www.suzano.com.br",
    historicoMetricas: [
      { ano: 2018, co2Removido: 8000, energiaRenovavel: 85, reducaoEmissoes: 10, investimentoSustentabilidade: 500 },
      { ano: 2019, co2Removido: 10000, energiaRenovavel: 88, reducaoEmissoes: 15, investimentoSustentabilidade: 650 },
      { ano: 2020, co2Removido: 11500, energiaRenovavel: 90, reducaoEmissoes: 20, investimentoSustentabilidade: 800 },
      { ano: 2021, co2Removido: 13000, energiaRenovavel: 92, reducaoEmissoes: 25, investimentoSustentabilidade: 950 },
      { ano: 2022, co2Removido: 14200, energiaRenovavel: 94, reducaoEmissoes: 30, investimentoSustentabilidade: 1100 },
      { ano: 2023, co2Removido: 15000, energiaRenovavel: 96, reducaoEmissoes: 35, investimentoSustentabilidade: 1300 }
    ]
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
    website: "https://www.ambev.com.br",
    historicoMetricas: [
      { ano: 2018, co2Removido: 50, energiaRenovavel: 45, reducaoEmissoes: 5, investimentoSustentabilidade: 200 },
      { ano: 2019, co2Removido: 80, energiaRenovavel: 55, reducaoEmissoes: 8, investimentoSustentabilidade: 280 },
      { ano: 2020, co2Removido: 120, energiaRenovavel: 65, reducaoEmissoes: 12, investimentoSustentabilidade: 350 },
      { ano: 2021, co2Removido: 180, energiaRenovavel: 75, reducaoEmissoes: 16, investimentoSustentabilidade: 420 },
      { ano: 2022, co2Removido: 250, energiaRenovavel: 85, reducaoEmissoes: 19, investimentoSustentabilidade: 500 },
      { ano: 2023, co2Removido: 320, energiaRenovavel: 92, reducaoEmissoes: 22, investimentoSustentabilidade: 580 }
    ]
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
    website: "https://www.latamairlines.com",
    historicoMetricas: [
      { ano: 2018, co2Removido: 1000, energiaRenovavel: 5, reducaoEmissoes: 10, investimentoSustentabilidade: 80 },
      { ano: 2019, co2Removido: 1500, energiaRenovavel: 8, reducaoEmissoes: 14, investimentoSustentabilidade: 120 },
      { ano: 2020, co2Removido: 2000, energiaRenovavel: 10, reducaoEmissoes: 18, investimentoSustentabilidade: 90 },
      { ano: 2021, co2Removido: 3000, energiaRenovavel: 12, reducaoEmissoes: 22, investimentoSustentabilidade: 150 },
      { ano: 2022, co2Removido: 4000, energiaRenovavel: 15, reducaoEmissoes: 26, investimentoSustentabilidade: 200 },
      { ano: 2023, co2Removido: 5000, energiaRenovavel: 18, reducaoEmissoes: 30, investimentoSustentabilidade: 280 }
    ]
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
    website: "https://www.magazineluiza.com.br",
    historicoMetricas: [
      { ano: 2018, co2Removido: 10, energiaRenovavel: 20, reducaoEmissoes: 5, investimentoSustentabilidade: 30 },
      { ano: 2019, co2Removido: 15, energiaRenovavel: 28, reducaoEmissoes: 8, investimentoSustentabilidade: 45 },
      { ano: 2020, co2Removido: 25, energiaRenovavel: 38, reducaoEmissoes: 12, investimentoSustentabilidade: 65 },
      { ano: 2021, co2Removido: 40, energiaRenovavel: 50, reducaoEmissoes: 16, investimentoSustentabilidade: 90 },
      { ano: 2022, co2Removido: 60, energiaRenovavel: 65, reducaoEmissoes: 20, investimentoSustentabilidade: 120 },
      { ano: 2023, co2Removido: 85, energiaRenovavel: 78, reducaoEmissoes: 25, investimentoSustentabilidade: 160 }
    ]
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
    website: "https://www.raizen.com.br",
    historicoMetricas: [
      { ano: 2018, co2Removido: 3000, energiaRenovavel: 92, reducaoEmissoes: 60, investimentoSustentabilidade: 400 },
      { ano: 2019, co2Removido: 3800, energiaRenovavel: 94, reducaoEmissoes: 65, investimentoSustentabilidade: 520 },
      { ano: 2020, co2Removido: 4500, energiaRenovavel: 95, reducaoEmissoes: 70, investimentoSustentabilidade: 600 },
      { ano: 2021, co2Removido: 5500, energiaRenovavel: 96, reducaoEmissoes: 74, investimentoSustentabilidade: 750 },
      { ano: 2022, co2Removido: 6500, energiaRenovavel: 97, reducaoEmissoes: 77, investimentoSustentabilidade: 900 },
      { ano: 2023, co2Removido: 7500, energiaRenovavel: 98, reducaoEmissoes: 80, investimentoSustentabilidade: 1050 }
    ]
  }
};

export const casosSucesso = Object.values(casosDetalhe).map(caso => ({
  slug: caso.slug,
  empresa: caso.empresa,
  setor: caso.setor,
  icon: caso.icon,
  destaque: caso.destaque,
  descricao: caso.descricaoCompleta.slice(0, 200) + "...",
  resultados: caso.metricas.slice(0, 3).map(m => `${m.label}: ${m.valor} ${m.unidade}`),
  cor: caso.cor
}));
