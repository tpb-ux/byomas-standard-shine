export interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  type: string;
  methodology: string;
  location: { name: string; lat: number; lng: number; country: string };
  status: string;
  credits: { total: string; issued: string; retired: string };
  creditsHistory: { date: string; amount: number }[];
  documents: { name: string; type: string; url: string; size: string }[];
  gallery: { type: "image" | "video"; url: string; caption: string }[];
  timeline: { date: string; event: string; description: string }[];
  area: string;
  startDate: string;
  developer: string;
  image: string;
}

export const projectsData: ProjectDetails[] = [
  {
    id: "1",
    title: "Projeto Amazônia Verde",
    description: "Reflorestamento de áreas degradadas na Amazônia",
    longDescription: "O Projeto Amazônia Verde representa um dos maiores esforços de reflorestamento da região amazônica, focando na restauração de áreas degradadas por atividades agrícolas e pecuárias. Utilizando técnicas avançadas de plantio e manejo florestal sustentável, o projeto combina conservação da biodiversidade com geração de créditos de carbono.",
    type: "Reflorestamento",
    methodology: "O projeto utiliza a metodologia VM0006 (Metodologia para Projetos de Reflorestamento em Pequena Escala) aprovada pela VCS. O processo envolve o plantio de espécies nativas, monitoramento contínuo do crescimento das árvores e medição precisa do sequestro de carbono através de parcelas permanentes de amostragem. O projeto implementa sistemas agroflorestais que beneficiam comunidades locais e promovem a recuperação da biodiversidade.",
    location: { 
      name: "Amazonas", 
      lat: -3.4653, 
      lng: -62.2159,
      country: "Brasil" 
    },
    status: "Certificado",
    credits: { 
      total: "2.500.000", 
      issued: "1.800.000", 
      retired: "700.000" 
    },
    creditsHistory: [
      { date: "2024-01", amount: 45000 },
      { date: "2024-02", amount: 52000 },
      { date: "2024-03", amount: 48000 },
      { date: "2024-04", amount: 55000 },
      { date: "2024-05", amount: 61000 },
      { date: "2024-06", amount: 58000 },
      { date: "2024-07", amount: 63000 },
      { date: "2024-08", amount: 59000 },
      { date: "2024-09", amount: 67000 },
      { date: "2024-10", amount: 71000 },
      { date: "2024-11", amount: 68000 },
    ],
    documents: [
      { name: "Project Design Document (PDD)", type: "PDF", url: "#", size: "2.4 MB" },
      { name: "Relatório de Verificação 2024", type: "PDF", url: "#", size: "1.8 MB" },
      { name: "Certificado VCS", type: "PDF", url: "#", size: "856 KB" },
      { name: "Plano de Monitoramento", type: "PDF", url: "#", size: "3.2 MB" },
    ],
    gallery: [
      { type: "image", url: "/placeholder.svg", caption: "Vista aérea da área reflorestada" },
      { type: "image", url: "/placeholder.svg", caption: "Equipe de campo realizando medições" },
      { type: "image", url: "/placeholder.svg", caption: "Biodiversidade recuperada" },
      { type: "image", url: "/placeholder.svg", caption: "Comunidade local participando do projeto" },
    ],
    timeline: [
      { 
        date: "2020-03", 
        event: "Início do Projeto", 
        description: "Aprovação inicial e início das atividades de campo" 
      },
      { 
        date: "2021-06", 
        event: "Primeira Verificação", 
        description: "Verificação independente dos primeiros créditos gerados" 
      },
      { 
        date: "2022-11", 
        event: "Certificação VCS", 
        description: "Recebimento da certificação completa VCS" 
      },
      { 
        date: "2023-08", 
        event: "Expansão da Área", 
        description: "Inclusão de novas áreas ao projeto" 
      },
      { 
        date: "2024-05", 
        event: "Reconhecimento Internacional", 
        description: "Prêmio de melhor projeto de reflorestamento" 
      },
    ],
    area: "15.000 hectares",
    startDate: "2020-03-15",
    developer: "Amazon Conservation Projects",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    title: "Conservação Mata Atlântica",
    description: "Proteção de remanescentes florestais da Mata Atlântica",
    longDescription: "Iniciativa dedicada à conservação de um dos biomas mais ameaçados do planeta. O projeto protege áreas de floresta primária, implementa corredores ecológicos e trabalha com comunidades locais para garantir a preservação a longo prazo.",
    type: "Conservação",
    methodology: "Utiliza a metodologia VM0010 (Metodologia para Projetos REDD+ em Florestas Tropicais). O projeto estabelece uma linha de base rigorosa de desmatamento evitado, implementa sistemas de monitoramento por satélite e desenvolve atividades econômicas sustentáveis com comunidades tradicionais.",
    location: { 
      name: "São Paulo", 
      lat: -23.5505, 
      lng: -46.6333,
      country: "Brasil" 
    },
    status: "Certificado",
    credits: { 
      total: "1.800.000", 
      issued: "1.200.000", 
      retired: "600.000" 
    },
    creditsHistory: [
      { date: "2024-01", amount: 38000 },
      { date: "2024-02", amount: 41000 },
      { date: "2024-03", amount: 39000 },
      { date: "2024-04", amount: 44000 },
      { date: "2024-05", amount: 47000 },
      { date: "2024-06", amount: 45000 },
      { date: "2024-07", amount: 49000 },
      { date: "2024-08", amount: 46000 },
      { date: "2024-09", amount: 52000 },
      { date: "2024-10", amount: 55000 },
      { date: "2024-11", amount: 53000 },
    ],
    documents: [
      { name: "Project Design Document (PDD)", type: "PDF", url: "#", size: "3.1 MB" },
      { name: "Relatório de Verificação 2024", type: "PDF", url: "#", size: "2.2 MB" },
      { name: "Certificado VCS", type: "PDF", url: "#", size: "921 KB" },
    ],
    gallery: [
      { type: "image", url: "/placeholder.svg", caption: "Floresta primária preservada" },
      { type: "image", url: "/placeholder.svg", caption: "Fauna nativa protegida" },
      { type: "image", url: "/placeholder.svg", caption: "Comunidade tradicional parceira" },
    ],
    timeline: [
      { date: "2019-01", event: "Início do Projeto", description: "Estabelecimento das áreas de proteção" },
      { date: "2020-09", event: "Primeira Verificação", description: "Verificação dos primeiros créditos" },
      { date: "2022-03", event: "Certificação VCS", description: "Certificação completa recebida" },
    ],
    area: "8.500 hectares",
    startDate: "2019-01-10",
    developer: "Mata Atlântica Conservation Fund",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    title: "Energia Solar Nordeste",
    description: "Usina solar fotovoltaica gerando energia limpa",
    longDescription: "Projeto de geração de energia solar em larga escala no sertão nordestino, contribuindo para a diversificação da matriz energética brasileira e redução de emissões de gases de efeito estufa.",
    type: "Energia Renovável",
    methodology: "Aplica a metodologia ACM0002 (Geração de eletricidade conectada à rede a partir de fontes renováveis). O projeto calcula as emissões evitadas comparando a geração solar com o fator de emissão da rede elétrica nacional.",
    location: { 
      name: "Bahia", 
      lat: -12.9714, 
      lng: -38.5014,
      country: "Brasil" 
    },
    status: "Em andamento",
    credits: { 
      total: "950.000", 
      issued: "320.000", 
      retired: "120.000" 
    },
    creditsHistory: [
      { date: "2024-01", amount: 28000 },
      { date: "2024-02", amount: 31000 },
      { date: "2024-03", amount: 29000 },
      { date: "2024-04", amount: 33000 },
      { date: "2024-05", amount: 35000 },
      { date: "2024-06", amount: 34000 },
      { date: "2024-07", amount: 37000 },
      { date: "2024-08", amount: 36000 },
      { date: "2024-09", amount: 39000 },
      { date: "2024-10", amount: 41000 },
      { date: "2024-11", amount: 40000 },
    ],
    documents: [
      { name: "Project Design Document (PDD)", type: "PDF", url: "#", size: "2.7 MB" },
      { name: "Relatório Técnico", type: "PDF", url: "#", size: "1.5 MB" },
    ],
    gallery: [
      { type: "image", url: "/placeholder.svg", caption: "Painéis solares instalados" },
      { type: "image", url: "/placeholder.svg", caption: "Centro de monitoramento" },
    ],
    timeline: [
      { date: "2022-06", event: "Início do Projeto", description: "Início da construção da usina" },
      { date: "2023-09", event: "Operação Comercial", description: "Início da geração de energia" },
      { date: "2024-04", event: "Primeira Emissão", description: "Primeiros créditos emitidos" },
    ],
    area: "450 hectares",
    startDate: "2022-06-01",
    developer: "Solar Energy Brasil",
    image: "/placeholder.svg",
  },
];
