-- Criar tabela de termos do glossário
CREATE TABLE public.glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  short_definition TEXT,
  category TEXT DEFAULT 'geral',
  related_terms TEXT[],
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Glossary terms are viewable by everyone"
  ON public.glossary_terms FOR SELECT USING (true);

CREATE POLICY "Admins can manage glossary terms"
  ON public.glossary_terms FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_glossary_terms_updated_at
  BEFORE UPDATE ON public.glossary_terms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir termos iniciais do mercado de carbono
INSERT INTO public.glossary_terms (term, slug, definition, short_definition, category) VALUES
('Crédito de Carbono', 'credito-de-carbono', 'Um crédito de carbono é um certificado que representa uma tonelada de dióxido de carbono (CO₂) que foi evitada ou removida da atmosfera. Empresas e indivíduos podem comprar créditos de carbono para compensar suas emissões de gases de efeito estufa, financiando projetos que reduzem ou sequestram carbono, como reflorestamento, energia renovável e eficiência energética.', 'Certificado que representa 1 tonelada de CO₂ evitada ou removida da atmosfera.', 'mercado-carbono'),
('Mercado Voluntário de Carbono', 'mercado-voluntario-carbono', 'O mercado voluntário de carbono é um sistema onde empresas, organizações e indivíduos compram créditos de carbono de forma voluntária, sem obrigação legal. Diferente do mercado regulado, não há metas obrigatórias de redução. Projetos são verificados por padrões independentes como Verra (VCS) e Gold Standard.', 'Sistema de compra voluntária de créditos de carbono sem obrigação legal.', 'mercado-carbono'),
('Mercado Regulado de Carbono', 'mercado-regulado-carbono', 'O mercado regulado de carbono é estabelecido por governos através de legislação, onde empresas têm metas obrigatórias de redução de emissões. Exemplos incluem o EU ETS (Sistema Europeu de Comércio de Emissões) e o futuro mercado brasileiro. Empresas que excedem suas cotas podem comprar permissões de outras que emitiram menos.', 'Mercado estabelecido por governos com metas obrigatórias de redução.', 'mercado-carbono'),
('Tokenização', 'tokenizacao', 'A tokenização é o processo de converter ativos reais em tokens digitais registrados em blockchain. No contexto ambiental, créditos de carbono são tokenizados para aumentar transparência, liquidez e acessibilidade. Cada token representa uma fração ou unidade do ativo, permitindo negociação fracionada e rastreabilidade imutável.', 'Conversão de ativos reais em tokens digitais em blockchain.', 'tecnologia'),
('ESG', 'esg', 'ESG significa Environmental, Social and Governance (Ambiental, Social e Governança). É um conjunto de critérios usados para avaliar práticas sustentáveis de empresas. Investidores usam métricas ESG para identificar riscos e oportunidades relacionados a mudanças climáticas, direitos humanos, diversidade e ética corporativa.', 'Critérios ambientais, sociais e de governança para avaliar empresas.', 'investimentos'),
('Green Bond', 'green-bond', 'Green bonds (títulos verdes) são instrumentos de dívida emitidos para financiar exclusivamente projetos com benefícios ambientais. Podem financiar energia renovável, eficiência energética, transporte limpo, gestão de água e conservação. São verificados por padrões como Climate Bonds Initiative.', 'Títulos de dívida para financiar projetos ambientais.', 'investimentos'),
('ReFi', 'refi', 'ReFi (Regenerative Finance) ou Finanças Regenerativas é um movimento que usa tecnologia blockchain e DeFi para criar sistemas financeiros que beneficiam o meio ambiente e comunidades. Inclui tokenização de créditos de carbono, DAOs ambientais e mecanismos de financiamento para regeneração ecológica.', 'Finanças regenerativas usando blockchain para benefício ambiental.', 'tecnologia'),
('REDD+', 'redd-plus', 'REDD+ (Reducing Emissions from Deforestation and Forest Degradation) é um mecanismo da ONU que cria incentivos financeiros para países em desenvolvimento reduzirem emissões de desmatamento. O "+" inclui conservação, manejo sustentável de florestas e aumento de estoques de carbono florestal.', 'Mecanismo ONU de incentivos para reduzir desmatamento.', 'mercado-carbono'),
('Net Zero', 'net-zero', 'Net Zero (emissões líquidas zero) é o estado em que as emissões de gases de efeito estufa são equilibradas pela remoção de carbono da atmosfera. Empresas e países assumem metas net zero, geralmente para 2050, combinando reduções de emissões com compensações e tecnologias de captura de carbono.', 'Estado de equilíbrio entre emissões e remoção de carbono.', 'sustentabilidade'),
('Pegada de Carbono', 'pegada-de-carbono', 'A pegada de carbono é a quantidade total de gases de efeito estufa emitidos direta ou indiretamente por uma pessoa, organização, evento ou produto. É medida em toneladas de CO₂ equivalente (tCO₂e) e considera emissões de transporte, energia, alimentação, consumo e processos industriais.', 'Total de emissões de gases de efeito estufa de uma atividade.', 'sustentabilidade'),
('Compensação de Carbono', 'compensacao-de-carbono', 'A compensação de carbono (carbon offset) é a prática de equilibrar emissões de CO₂ investindo em projetos que reduzem ou removem carbono da atmosfera. Pode incluir reflorestamento, energia renovável, captura de metano e distribuição de fogões eficientes em comunidades.', 'Investimento em projetos para equilibrar emissões próprias.', 'mercado-carbono'),
('Economia Circular', 'economia-circular', 'A economia circular é um modelo econômico que elimina desperdício e poluição, mantendo produtos e materiais em uso pelo máximo tempo possível. Contrasta com o modelo linear de "extrair-fazer-descartar", promovendo design regenerativo, reutilização, reciclagem e recuperação de materiais.', 'Modelo econômico que elimina desperdício e maximiza uso de recursos.', 'sustentabilidade'),
('Greenwashing', 'greenwashing', 'Greenwashing é a prática de fazer alegações ambientais falsas ou exageradas para parecer mais sustentável do que realmente é. Inclui marketing enganoso, certificações falsas e compensações de baixa qualidade. Reguladores e consumidores estão cada vez mais atentos a essas práticas.', 'Alegações ambientais falsas ou exageradas por empresas.', 'sustentabilidade'),
('Acordo de Paris', 'acordo-de-paris', 'O Acordo de Paris é um tratado internacional adotado em 2015 por 196 países para limitar o aquecimento global a 1,5°C acima dos níveis pré-industriais. Cada país submete metas de redução (NDCs) e deve aumentar ambição ao longo do tempo. É o principal framework global para ação climática.', 'Tratado internacional para limitar aquecimento global a 1,5°C.', 'regulamentacao'),
('NDC', 'ndc', 'NDC (Nationally Determined Contribution) ou Contribuição Nacionalmente Determinada é a meta climática que cada país submete sob o Acordo de Paris. Inclui metas de redução de emissões, adaptação e financiamento climático. Países devem atualizar NDCs a cada 5 anos com ambição crescente.', 'Meta climática nacional submetida sob o Acordo de Paris.', 'regulamentacao'),
('Sequestro de Carbono', 'sequestro-de-carbono', 'O sequestro de carbono é o processo de capturar e armazenar dióxido de carbono da atmosfera. Pode ser natural (florestas, solos, oceanos) ou tecnológico (captura direta do ar, CCS). É essencial para atingir metas net zero e pode gerar créditos de carbono.', 'Processo de capturar e armazenar CO₂ da atmosfera.', 'mercado-carbono'),
('Verra', 'verra', 'Verra é uma organização sem fins lucrativos que opera o Verified Carbon Standard (VCS), o maior programa de certificação de créditos de carbono do mercado voluntário. Também gerencia o SD VISta para benefícios de desenvolvimento sustentável e o Plastic Waste Reduction Standard.', 'Organização que certifica créditos de carbono voluntários (VCS).', 'certificacao'),
('Gold Standard', 'gold-standard', 'Gold Standard é uma certificação de alta qualidade para projetos de redução de emissões e desenvolvimento sustentável. Fundada pelo WWF, exige que projetos demonstrem benefícios ambientais e sociais além da redução de carbono. É considerada referência em integridade no mercado voluntário.', 'Certificação premium para projetos de carbono com co-benefícios.', 'certificacao'),
('Scope 1, 2 e 3', 'scope-1-2-3', 'Os Scopes são categorias de emissões no GHG Protocol. Scope 1 são emissões diretas (veículos, caldeiras). Scope 2 são emissões indiretas de energia comprada. Scope 3 são todas as outras emissões indiretas da cadeia de valor (fornecedores, uso de produtos, viagens). Scope 3 geralmente representa 70-90% das emissões totais.', 'Categorias de emissões: diretas, energia e cadeia de valor.', 'sustentabilidade'),
('GHG Protocol', 'ghg-protocol', 'O GHG Protocol é o padrão global mais usado para medir e gerenciar emissões de gases de efeito estufa. Desenvolvido pelo WRI e WBCSD, define metodologias para inventários corporativos, projetos e cadeias de valor. É base para a maioria das regulamentações e relatórios climáticos.', 'Padrão global para medir emissões de gases de efeito estufa.', 'sustentabilidade');