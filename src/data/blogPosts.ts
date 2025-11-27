export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "mercado-carbono-brasil-2024",
    title: "O Mercado de Carbono no Brasil em 2024: Oportunidades e Desafios",
    excerpt: "Análise completa do crescimento do mercado voluntário de carbono no Brasil e as perspectivas para os próximos anos.",
    content: `
      <p>O mercado de carbono brasileiro tem experimentado um crescimento exponencial nos últimos anos, impulsionado pela crescente conscientização ambiental e pelos compromissos climáticos corporativos.</p>
      
      <h2>Crescimento do Mercado Voluntário</h2>
      <p>Em 2024, o mercado voluntário de carbono no Brasil movimentou mais de R$ 2 bilhões, um aumento de 150% em relação ao ano anterior. Esse crescimento é impulsionado principalmente por:</p>
      <ul>
        <li>Compromissos de neutralidade de carbono de grandes corporações</li>
        <li>Aumento da demanda internacional por créditos de alta qualidade</li>
        <li>Desenvolvimento de metodologias mais robustas e transparentes</li>
        <li>Maior conscientização sobre a urgência climática</li>
      </ul>
      
      <h2>Projetos em Destaque</h2>
      <p>Os projetos de REDD+ (Redução de Emissões por Desmatamento e Degradação Florestal) continuam dominando o mercado brasileiro, representando cerca de 60% dos créditos emitidos. No entanto, há um crescimento significativo em outros setores:</p>
      <ul>
        <li>Energia renovável: +45% em emissões</li>
        <li>Reflorestamento: +38% em novos projetos</li>
        <li>Agricultura sustentável: +52% em interesse de desenvolvedores</li>
      </ul>
      
      <h2>Desafios Regulatórios</h2>
      <p>A regulamentação do mercado de carbono no Brasil ainda está em desenvolvimento. O Projeto de Lei 412/2022, que cria o Sistema Brasileiro de Comércio de Emissões (SBCE), está em tramitação no Congresso Nacional e promete trazer mais segurança jurídica ao setor.</p>
      
      <h2>Perspectivas Futuras</h2>
      <p>Para 2025, espera-se que o mercado continue crescendo, com previsões apontando para um volume de transações superior a R$ 4 bilhões. A integração com mercados internacionais e o desenvolvimento de padrões de qualidade mais rigorosos serão fundamentais para esse crescimento.</p>
      
      <p>A Byomas Standard continua trabalhando para garantir que todos os projetos certificados atendam aos mais altos padrões de integridade ambiental e social, contribuindo para um mercado de carbono mais robusto e confiável.</p>
    `,
    category: "Mercado de Carbono",
    author: {
      name: "Dr. Carlos Silva",
      avatar: "/placeholder.svg",
    },
    date: "2024-11-15",
    readTime: "8 min",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    slug: "metodologias-certificacao-projetos-carbono",
    title: "Metodologias de Certificação: Como Garantir a Qualidade dos Projetos de Carbono",
    excerpt: "Entenda as principais metodologias utilizadas na certificação de projetos de carbono e os critérios de qualidade.",
    content: `
      <p>A certificação de projetos de carbono é fundamental para garantir a integridade e a efetividade das reduções de emissões. Neste artigo, exploramos as principais metodologias reconhecidas internacionalmente.</p>
      
      <h2>O que são Metodologias de Certificação?</h2>
      <p>Metodologias de certificação são frameworks detalhados que estabelecem como um projeto deve ser desenvolvido, monitorado e verificado para gerar créditos de carbono válidos. Elas garantem:</p>
      <ul>
        <li>Adicionalidade: o projeto não teria acontecido sem o incentivo dos créditos de carbono</li>
        <li>Permanência: as reduções de emissões são duradouras</li>
        <li>Não-vazamento: o projeto não causa aumento de emissões em outras áreas</li>
        <li>Mensuração precisa: as reduções são calculadas de forma rigorosa</li>
      </ul>
      
      <h2>Principais Metodologias</h2>
      
      <h3>VCS (Verified Carbon Standard)</h3>
      <p>O VCS é o padrão mais utilizado no mercado voluntário de carbono. Desenvolvido pela Verra, oferece mais de 100 metodologias aprovadas para diferentes tipos de projetos, incluindo REDD+, energia renovável, gestão de resíduos e agricultura sustentável.</p>
      
      <h3>Gold Standard</h3>
      <p>Conhecido por seus rigorosos critérios de co-benefícios sociais e ambientais, o Gold Standard é especialmente valorizado em projetos que também promovem desenvolvimento sustentável nas comunidades locais.</p>
      
      <h3>Clean Development Mechanism (CDM)</h3>
      <p>Estabelecido pelo Protocolo de Kyoto, o CDM continua sendo uma referência importante, especialmente para projetos de grande escala em países em desenvolvimento.</p>
      
      <h2>Processo de Certificação</h2>
      <p>O processo típico de certificação envolve:</p>
      <ol>
        <li>Desenvolvimento do Project Design Document (PDD)</li>
        <li>Validação por auditores independentes</li>
        <li>Implementação e monitoramento do projeto</li>
        <li>Verificação periódica das reduções de emissões</li>
        <li>Emissão dos créditos de carbono</li>
      </ol>
      
      <h2>Inovações e Tendências</h2>
      <p>O setor está em constante evolução, com novas metodologias sendo desenvolvidas para capturar tipos emergentes de projetos, como soluções baseadas na natureza (nature-based solutions) e tecnologias de captura de carbono.</p>
      
      <p>A Byomas Standard trabalha com as principais metodologias internacionais, garantindo que todos os projetos certificados atendam aos mais altos padrões de qualidade e integridade.</p>
    `,
    category: "Metodologias",
    author: {
      name: "Dra. Ana Paula Rodrigues",
      avatar: "/placeholder.svg",
    },
    date: "2024-11-10",
    readTime: "10 min",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    slug: "estudo-caso-amazonia-verde",
    title: "Estudo de Caso: Projeto Amazônia Verde - 5 Anos de Impacto",
    excerpt: "Análise detalhada dos resultados e impactos socioambientais do Projeto Amazônia Verde após cinco anos de operação.",
    content: `
      <p>O Projeto Amazônia Verde, certificado pela Byomas Standard, completa cinco anos de operação com resultados impressionantes em termos de sequestro de carbono e benefícios sociais para comunidades locais.</p>
      
      <h2>Contexto do Projeto</h2>
      <p>Localizado no estado do Amazonas, o projeto abrange 15.000 hectares de áreas anteriormente degradadas por atividades agrícolas e pecuárias. Desde seu início em 2020, o projeto tem como objetivo restaurar o ecossistema florestal enquanto gera créditos de carbono de alta qualidade.</p>
      
      <h2>Resultados Ambientais</h2>
      <ul>
        <li><strong>2,5 milhões de créditos de carbono</strong> gerados até o momento</li>
        <li><strong>1,2 milhões de árvores</strong> plantadas, incluindo 45 espécies nativas</li>
        <li><strong>Aumento de 340%</strong> na biodiversidade da área</li>
        <li><strong>Recuperação de 89%</strong> das nascentes e cursos d'água</li>
      </ul>
      
      <h2>Impactos Sociais</h2>
      <p>O projeto tem sido fundamental para o desenvolvimento das comunidades locais:</p>
      <ul>
        <li>150 empregos diretos criados</li>
        <li>450 famílias beneficiadas com programas de capacitação</li>
        <li>Aumento de 45% na renda média das famílias participantes</li>
        <li>Implementação de 3 escolas e 2 postos de saúde</li>
      </ul>
      
      <h2>Metodologia e Monitoramento</h2>
      <p>Utilizando a metodologia VM0006 (Metodologia para Projetos de Reflorestamento em Pequena Escala), o projeto implementou um sistema robusto de monitoramento que inclui:</p>
      <ul>
        <li>Parcelas permanentes de amostragem para medição de biomassa</li>
        <li>Monitoramento por satélite com imagens de alta resolução</li>
        <li>Inventários de biodiversidade anuais</li>
        <li>Avaliações socioeconômicas periódicas</li>
      </ul>
      
      <h2>Desafios e Lições Aprendidas</h2>
      <p>Como qualquer projeto de longo prazo, o Amazônia Verde enfrentou desafios:</p>
      <ul>
        <li><strong>Clima:</strong> Períodos de seca mais intensos que o esperado exigiram adaptações no manejo</li>
        <li><strong>Logística:</strong> A remotidade da área demandou investimentos significativos em infraestrutura</li>
        <li><strong>Engajamento comunitário:</strong> O tempo necessário para construir confiança com as comunidades foi maior que o previsto inicialmente</li>
      </ul>
      
      <h2>Perspectivas Futuras</h2>
      <p>Para os próximos cinco anos, o projeto planeja:</p>
      <ul>
        <li>Expansão para mais 5.000 hectares de áreas adjacentes</li>
        <li>Implementação de sistemas agroflorestais para gerar renda adicional</li>
        <li>Desenvolvimento de ecoturismo sustentável</li>
        <li>Programa de pagamento por serviços ambientais para comunidades</li>
      </ul>
      
      <p>O sucesso do Projeto Amazônia Verde demonstra que é possível combinar conservação ambiental com desenvolvimento social, criando um modelo replicável para outras regiões da Amazônia.</p>
    `,
    category: "Estudos de Caso",
    author: {
      name: "Eng. Florestal Roberto Santos",
      avatar: "/placeholder.svg",
    },
    date: "2024-11-05",
    readTime: "12 min",
    image: "/placeholder.svg",
  },
  {
    id: "4",
    slug: "futuro-sustentabilidade-empresas-brasileiras",
    title: "O Futuro da Sustentabilidade nas Empresas Brasileiras",
    excerpt: "Como as empresas brasileiras estão se preparando para um futuro net-zero e o papel dos créditos de carbono nessa transição.",
    content: `
      <p>A pressão por práticas mais sustentáveis tem levado empresas brasileiras a repensarem seus modelos de negócio. Neste artigo, exploramos as principais tendências e estratégias que estão moldando o futuro da sustentabilidade corporativa no Brasil.</p>
      
      <h2>Compromissos Net-Zero</h2>
      <p>Mais de 200 empresas brasileiras já anunciaram metas de neutralidade de carbono, com prazos que variam entre 2030 e 2050. Esses compromissos incluem:</p>
      <ul>
        <li>Redução de emissões diretas (Escopo 1 e 2)</li>
        <li>Engajamento com fornecedores para reduzir emissões da cadeia de valor (Escopo 3)</li>
        <li>Compensação de emissões residuais através de créditos de carbono de alta qualidade</li>
      </ul>
      
      <h2>Estratégias de Descarbonização</h2>
      <p>As empresas líderes estão adotando uma abordagem hierárquica para descarbonização:</p>
      <ol>
        <li><strong>Evitar:</strong> Eliminar fontes de emissões desnecessárias</li>
        <li><strong>Reduzir:</strong> Implementar eficiência energética e processos mais limpos</li>
        <li><strong>Substituir:</strong> Migrar para fontes de energia renovável</li>
        <li><strong>Compensar:</strong> Investir em créditos de carbono de alta qualidade</li>
      </ol>
      
      <h2>O Papel dos Créditos de Carbono</h2>
      <p>Créditos de carbono não são apenas uma ferramenta de compensação - eles representam um investimento direto em projetos que geram benefícios ambientais e sociais reais. As empresas mais avançadas estão:</p>
      <ul>
        <li>Desenvolvendo portfólios diversificados de créditos</li>
        <li>Priorizando projetos com co-benefícios sociais</li>
        <li>Investindo em projetos de longo prazo</li>
        <li>Buscando créditos com certificações reconhecidas internacionalmente</li>
      </ul>
      
      <h2>Tendências para 2025</h2>
      <ul>
        <li><strong>Transparência radical:</strong> Divulgação detalhada de estratégias climáticas e compras de créditos</li>
        <li><strong>Ciência primeiro:</strong> Metas baseadas na iniciativa Science Based Targets (SBTi)</li>
        <li><strong>Integração ESG:</strong> Sustentabilidade como parte central da estratégia de negócios</li>
        <li><strong>Tecnologia blockchain:</strong> Rastreabilidade e transparência na cadeia de créditos de carbono</li>
      </ul>
      
      <h2>Conclusão</h2>
      <p>O futuro da sustentabilidade corporativa no Brasil é promissor. À medida que mais empresas se comprometem com metas ambiciosas e investem em soluções reais, o país se posiciona como líder global em ação climática empresarial.</p>
    `,
    category: "Sustentabilidade",
    author: {
      name: "Juliana Mendes",
      avatar: "/placeholder.svg",
    },
    date: "2024-10-28",
    readTime: "9 min",
    image: "/placeholder.svg",
  },
];
