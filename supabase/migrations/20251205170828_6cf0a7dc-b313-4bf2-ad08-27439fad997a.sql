-- Insert lessons for Module 1: Boas Vindas
INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes)
SELECT 
  cm.id,
  'Bem-vindo ao Curso',
  'bem-vindo-ao-curso',
  '# Bem-vindo ao Curso de Crédito de Carbono! 🌱

Parabéns por dar o primeiro passo rumo ao conhecimento sobre **crédito de carbono** e **sustentabilidade**!

## O que você vai aprender

Este curso foi desenvolvido para transformar você em um especialista no mercado de crédito de carbono. Ao longo dos módulos, você irá:

- **Entender os fundamentos** do ciclo do carbono e mudanças climáticas
- **Conhecer o mercado** regulado e voluntário de carbono
- **Dominar os mecanismos** de desenvolvimento limpo (MDL)
- **Analisar oportunidades** no mercado brasileiro

## Por que este conhecimento é importante?

O mercado de carbono movimenta **bilhões de dólares** globalmente e está em rápida expansão. Profissionais capacitados nesta área são cada vez mais requisitados por:

- Empresas buscando neutralizar suas emissões
- Consultorias ambientais
- Instituições financeiras
- Órgãos governamentais
- Startups de tecnologia climática

## Estrutura do Curso

O curso está dividido em **7 módulos** principais:

1. 🎯 **Boas Vindas** - Você está aqui!
2. 📚 **Introdução ao Crédito de Carbono**
3. 🔬 **O Carbono e seu Ciclo**
4. 🌡️ **Aquecimento Global**
5. 🌍 **Composição da Atmosfera**
6. ⚙️ **Mecanismo de Desenvolvimento Limpo**
7. 🇧🇷 **Mercado de Carbono no Brasil**

## Certificação

Ao completar todos os módulos e passar nos quizzes, você receberá um **certificado digital** exclusivo da Amazonia Research, validando seus conhecimentos na área.

Vamos começar essa jornada juntos!',
  0,
  10
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'boas-vindas';

INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes)
SELECT 
  cm.id,
  'Por que Estudar Crédito de Carbono?',
  'por-que-estudar-credito-de-carbono',
  '# Por que Estudar Crédito de Carbono?

O mercado de carbono representa uma das maiores oportunidades econômicas e ambientais do século XXI.

## Oportunidades de Carreira

O setor de créditos de carbono está em **expansão acelerada**, criando demanda por profissionais qualificados em diversas áreas:

### Consultoria Ambiental
- Avaliação de projetos de redução de emissões
- Elaboração de inventários de GEE
- Certificação de créditos de carbono

### Finanças Verdes
- Análise de investimentos em projetos ambientais
- Estruturação de fundos ESG
- Trading de créditos de carbono

### Tecnologia Climática
- Desenvolvimento de plataformas de monitoramento
- Soluções de rastreabilidade blockchain
- Sistemas de MRV (Monitoramento, Reporte e Verificação)

## O Mercado em Números

| Indicador | Valor |
|-----------|-------|
| Mercado global (2023) | US$ 851 bilhões |
| Crescimento previsto até 2030 | 400% |
| Empregos diretos gerados | 2,5 milhões |
| Brasil - potencial de créditos | 15 Gt CO2e |

## Impacto na Carreira

Profissionais com conhecimento em carbono estão sendo contratados com **salários 30% maiores** que a média do mercado de sustentabilidade.

> "A transição para uma economia de baixo carbono não é mais uma opção, é uma necessidade. E os profissionais preparados serão os protagonistas dessa transformação."

## Setores que mais contratam

1. **Agronegócio** - Projetos de agricultura regenerativa
2. **Energia** - Transição energética e renováveis
3. **Florestal** - REDD+ e reflorestamento
4. **Indústria** - Descarbonização de processos
5. **Financeiro** - ESG e investimentos sustentáveis',
  1,
  15
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'boas-vindas';

INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes)
SELECT 
  cm.id,
  'Como Obter seu Certificado',
  'como-obter-seu-certificado',
  '# Como Obter seu Certificado

Ao concluir este curso com sucesso, você receberá um **certificado digital** reconhecido pela Amazonia Research.

## Requisitos para Certificação

Para obter seu certificado, você precisa:

### 1. Completar todas as lições
- Marque cada lição como concluída após estudar o conteúdo
- Não há limite de tempo para conclusão
- Você pode revisitar as lições quantas vezes quiser

### 2. Passar nos quizzes
- Cada módulo possui um quiz ao final
- **Nota mínima**: 70% de acertos
- **Tentativas**: Até 3 tentativas por quiz
- Você pode refazer o quiz após estudar mais

### 3. Finalizar a jornada completa
- Conclua os 7 módulos na ordem sugerida
- Complete todos os quizzes com aprovação

## Sobre o Certificado

O certificado digital inclui:

- ✅ Nome completo do aluno
- ✅ Título do curso
- ✅ Carga horária total
- ✅ Data de conclusão
- ✅ Código único de verificação
- ✅ QR Code para validação online

## Validação do Certificado

Cada certificado possui um **código único** que pode ser verificado online a qualquer momento. Empregadores e instituições podem confirmar a autenticidade através do nosso sistema de verificação.

### Como verificar um certificado:

1. Acesse `amazonia.research/certificado/[CÓDIGO]`
2. Digite o código presente no certificado
3. Veja os dados completos da certificação

## Dicas para o Sucesso

- 📖 **Estude com calma** - Não há pressa
- 📝 **Faça anotações** - Ajuda na memorização
- 🔄 **Revise antes do quiz** - Releia as lições
- 💬 **Tire dúvidas** - Use nosso canal de suporte

Boa sorte em sua jornada de aprendizado!',
  2,
  10
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'boas-vindas';

-- Insert lessons for Module 2: Introdução ao Crédito de Carbono
INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes)
SELECT 
  cm.id,
  'O que é Crédito de Carbono?',
  'o-que-e-credito-de-carbono',
  '# O que é Crédito de Carbono?

O crédito de carbono é um instrumento financeiro que representa a **redução ou remoção de uma tonelada de dióxido de carbono equivalente (tCO2e)** da atmosfera.

## Definição Simples

Imagine que uma empresa precisa emitir 100 toneladas de CO2 em sua operação, mas deseja compensar esse impacto ambiental. Ela pode **comprar créditos de carbono** de um projeto que evitou ou removeu emissões equivalentes.

> **1 crédito de carbono = 1 tonelada de CO2 equivalente (tCO2e)**

## Como Funciona na Prática?

### Geração de Créditos

1. **Projeto de redução** é desenvolvido (ex: reflorestamento)
2. **Metodologia aprovada** é aplicada para calcular reduções
3. **Verificação independente** confirma os resultados
4. **Créditos são emitidos** por uma certificadora

### Comercialização

1. **Empresas compram** créditos para compensar suas emissões
2. **Transação registrada** em sistema oficial
3. **Crédito é aposentado** (não pode ser usado novamente)
4. **Empresa declara** a compensação em seus relatórios

## Exemplo Real

**Projeto de Reflorestamento na Amazônia:**

| Dados do Projeto | Valores |
|------------------|---------|
| Área reflorestada | 10.000 hectares |
| CO2 sequestrado/ano | 50.000 toneladas |
| Créditos gerados/ano | 50.000 créditos |
| Preço médio | US$ 15/crédito |
| Receita anual | US$ 750.000 |

## Por que isso importa?

O mercado de carbono cria um **incentivo econômico** para:

- 🌳 Preservar florestas
- ⚡ Desenvolver energia limpa
- 🏭 Modernizar processos industriais
- 🌾 Adotar agricultura sustentável

## Tipos de Projetos que Geram Créditos

- **Florestais**: REDD+, reflorestamento, manejo sustentável
- **Energia**: Solar, eólica, biomassa, hidrelétrica
- **Agropecuários**: Biodigestores, integração lavoura-pecuária
- **Industriais**: Eficiência energética, captura de metano
- **Resíduos**: Compostagem, aproveitamento de biogás',
  0,
  20
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'introducao-ao-credito-de-carbono';

INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes)
SELECT 
  cm.id,
  'História do Mercado de Carbono',
  'historia-do-mercado-de-carbono',
  '# História do Mercado de Carbono

O mercado de carbono é resultado de décadas de negociações internacionais sobre mudanças climáticas.

## Linha do Tempo

### 1992 - Rio-92 (ECO-92)
A **Convenção-Quadro das Nações Unidas sobre Mudança do Clima (UNFCCC)** foi criada durante a Cúpula da Terra no Rio de Janeiro. Foi o primeiro tratado internacional a reconhecer que as mudanças climáticas eram um problema real.

### 1997 - Protocolo de Kyoto
Marco histórico que estabeleceu **metas obrigatórias** de redução de emissões para países desenvolvidos. Introduziu três mecanismos de flexibilização:

1. **Comércio de Emissões** (entre países desenvolvidos)
2. **Implementação Conjunta** (entre países desenvolvidos)
3. **Mecanismo de Desenvolvimento Limpo - MDL** (países em desenvolvimento)

### 2005 - Entrada em vigor do Kyoto
O protocolo entrou oficialmente em vigor após ratificação da Rússia. O mercado de carbono começou a operar em escala global.

### 2015 - Acordo de Paris
Substituiu o Protocolo de Kyoto com compromissos mais ambiciosos:

- **Limitar aquecimento** a 1,5°C acima dos níveis pré-industriais
- **NDCs** (Contribuições Nacionalmente Determinadas) para cada país
- **Artigo 6** criou novos mecanismos de mercado

### 2021 - COP26 (Glasgow)
Regulamentação do **Artigo 6** do Acordo de Paris, definindo:

- Regras para mercados internacionais de carbono
- Ajustes correspondentes para evitar dupla contagem
- Transição dos créditos do MDL para novo sistema

### 2024 - Brasil
**Lei do Mercado de Carbono Brasileiro** (SBCE) aprovada, criando:

- Sistema Brasileiro de Comércio de Emissões
- Metas para setores regulados
- Integração com mercado voluntário

## Evolução do Preço do Carbono

| Ano | EU ETS (€/tCO2) |
|-----|-----------------|
| 2010 | 15 |
| 2015 | 8 |
| 2020 | 25 |
| 2023 | 85 |
| 2024 | 70 |

## Mercados Existentes

- 🇪🇺 **EU ETS** - Maior do mundo
- 🇨🇳 **China ETS** - Maior em emissões cobertas
- 🇺🇸 **California Cap-and-Trade**
- 🇰🇷 **Korea ETS**
- 🇧🇷 **SBCE** - Em implementação',
  1,
  25
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'introducao-ao-credito-de-carbono';

INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes)
SELECT 
  cm.id,
  'Tipos de Crédito de Carbono',
  'tipos-de-credito-de-carbono',
  '# Tipos de Crédito de Carbono

Existem diferentes tipos de créditos de carbono, cada um com características e aplicações específicas.

## Mercado Regulado vs. Voluntário

### Mercado Regulado (Compliance)

Governos estabelecem **limites obrigatórios** de emissões para empresas. Quem excede deve comprar créditos; quem fica abaixo pode vender.

**Características:**
- ✅ Obrigatório por lei
- ✅ Preços geralmente mais altos
- ✅ Maior rigor na verificação
- ✅ Liquidez garantida

**Exemplos:**
- EU ETS (União Europeia)
- California Cap-and-Trade
- China ETS

### Mercado Voluntário

Empresas compram créditos **por iniciativa própria** para compensar suas emissões e melhorar sua imagem ESG.

**Características:**
- ✅ Flexibilidade na escolha de projetos
- ✅ Possibilidade de co-benefícios sociais
- ✅ Preços variados
- ✅ Crescimento acelerado

**Padrões principais:**
- Verra (VCS)
- Gold Standard
- American Carbon Registry

## Tipos de Créditos por Origem

### CERs (Certified Emission Reductions)
- Gerados pelo **MDL** sob o Protocolo de Kyoto
- Certificados pela ONU
- Utilizados por países desenvolvidos

### VCUs (Verified Carbon Units)
- Emitidos pela **Verra**
- Padrão mais utilizado no mercado voluntário
- Aceitos globalmente

### GS VERs (Gold Standard Verified Emission Reductions)
- Emitidos pelo **Gold Standard**
- Foco em benefícios sociais e ambientais
- Premium de preço

## Tipos por Metodologia

### Projetos de Redução
Evitam que emissões aconteçam:
- Energia renovável
- Eficiência energética
- Captura de metano

### Projetos de Remoção
Removem CO2 da atmosfera:
- Reflorestamento
- Captura direta de ar (DAC)
- Biochar

## Tabela Comparativa

| Tipo | Mercado | Certificadora | Uso Principal |
|------|---------|---------------|---------------|
| CER | Regulado | ONU | Compliance Kyoto |
| EUA | Regulado | EU | EU ETS |
| VCU | Voluntário | Verra | Compensação corporativa |
| GS VER | Voluntário | Gold Standard | ESG premium |

## Qualidade dos Créditos

Nem todos os créditos são iguais. Avalie:

- **Adicionalidade**: O projeto só aconteceu por causa do carbono?
- **Permanência**: A redução é duradoura?
- **Vazamento**: Não causou emissões em outro lugar?
- **Co-benefícios**: Impactos sociais positivos?',
  2,
  20
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'introducao-ao-credito-de-carbono';

INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes)
SELECT 
  cm.id,
  'Quem Participa do Mercado?',
  'quem-participa-do-mercado',
  '# Quem Participa do Mercado de Carbono?

O mercado de carbono envolve diversos atores com papéis específicos na cadeia de valor.

## Principais Participantes

### 1. Desenvolvedores de Projetos

São os **geradores** de créditos de carbono. Desenvolvem e implementam projetos que reduzem ou removem emissões.

**Exemplos:**
- Empresas florestais (reflorestamento)
- Produtores rurais (agricultura de baixo carbono)
- Indústrias (eficiência energética)
- Comunidades tradicionais (REDD+)

**Responsabilidades:**
- Conceber e implementar projetos
- Documentar reduções de emissões
- Monitorar resultados continuamente

### 2. Compradores

Empresas e organizações que **adquirem créditos** para compensar suas emissões.

**Motivações:**
- Compliance regulatório
- Metas de neutralidade carbono
- Pressão de investidores ESG
- Diferenciação de mercado

**Setores que mais compram:**
- Aviação
- Tecnologia
- Bancos
- Bens de consumo
- Energia

### 3. Certificadoras (Standards)

Organizações que **definem metodologias** e emitem os créditos oficialmente.

| Certificadora | Sede | Foco |
|---------------|------|------|
| Verra | EUA | VCS, CCB |
| Gold Standard | Suíça | Social + Ambiental |
| ACR | EUA | América do Norte |
| Plan Vivo | UK | Comunidades |

### 4. Verificadores (VVBs)

Auditorias independentes que **validam e verificam** projetos.

**Principais:**
- SCS Global Services
- RINA
- Bureau Veritas
- SGS

### 5. Corretoras e Traders

Intermediários que **facilitam transações** entre compradores e vendedores.

**Serviços:**
- Negociação de créditos
- Assessoria de mercado
- Estruturação de portfólios
- Hedge de preços

### 6. Registros

Sistemas que **rastreiam a propriedade** e aposentadoria de créditos.

**Exemplos:**
- Verra Registry
- Gold Standard Registry
- APX
- Markit

## Fluxo do Mercado

```
Desenvolvedor → Certificadora → Registro → Corretor → Comprador
      ↑                                          ↓
      └──────────── Verificador ─────────────────┘
```

## Novos Participantes

O mercado está atraindo novos players:

- **Fintechs** - Plataformas digitais de negociação
- **Blockchain** - Tokenização de créditos
- **Seguradoras** - Garantia de permanência
- **Raters** - Avaliação de qualidade

## Oportunidades para Brasileiros

O Brasil tem **vantagens competitivas** únicas:

- 🌳 Maior floresta tropical do mundo
- 🌾 Agronegócio em transição
- ⚡ Matriz energética limpa
- 🏛️ Novo marco regulatório',
  3,
  20
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'introducao-ao-credito-de-carbono';

-- Insert quizzes for all 7 modules
-- Quiz 1: Boas Vindas
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: Boas Vindas',
  'Teste seus conhecimentos sobre a estrutura do curso e certificação',
  '[
    {
      "id": "q1",
      "question": "Quantos módulos compõem o curso ''Iniciando no Crédito de Carbono''?",
      "options": ["5 módulos", "7 módulos", "10 módulos", "3 módulos"],
      "correct_answer": 1,
      "explanation": "O curso é dividido em 7 módulos principais, cobrindo desde conceitos básicos até o mercado brasileiro."
    },
    {
      "id": "q2",
      "question": "Qual é a nota mínima necessária para passar nos quizzes?",
      "options": ["50%", "60%", "70%", "80%"],
      "correct_answer": 2,
      "explanation": "A nota mínima para aprovação nos quizzes é de 70% de acertos."
    },
    {
      "id": "q3",
      "question": "Quantas tentativas você tem para fazer cada quiz?",
      "options": ["1 tentativa", "2 tentativas", "3 tentativas", "Ilimitadas"],
      "correct_answer": 2,
      "explanation": "Você pode fazer até 3 tentativas por quiz, podendo estudar mais entre as tentativas."
    },
    {
      "id": "q4",
      "question": "O que você receberá ao concluir o curso com sucesso?",
      "options": ["Apenas uma nota", "Certificado digital", "Desconto em outros cursos", "Nada"],
      "correct_answer": 1,
      "explanation": "Ao completar todos os módulos e passar nos quizzes, você recebe um certificado digital com código de verificação."
    },
    {
      "id": "q5",
      "question": "Qual setor NÃO foi mencionado como um dos que mais contratam profissionais de carbono?",
      "options": ["Agronegócio", "Energia", "Turismo", "Financeiro"],
      "correct_answer": 2,
      "explanation": "Os principais setores mencionados são: Agronegócio, Energia, Florestal, Indústria e Financeiro."
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'boas-vindas';

-- Quiz 2: Introdução ao Crédito de Carbono
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: Introdução ao Crédito de Carbono',
  'Teste seus conhecimentos sobre conceitos básicos, história e tipos de créditos',
  '[
    {
      "id": "q1",
      "question": "O que representa 1 crédito de carbono?",
      "options": ["1 kg de CO2", "100 kg de CO2", "1 tonelada de CO2 equivalente", "1 grama de CO2"],
      "correct_answer": 2,
      "explanation": "1 crédito de carbono = 1 tonelada de CO2 equivalente (tCO2e)."
    },
    {
      "id": "q2",
      "question": "Em que ano foi assinado o Protocolo de Kyoto?",
      "options": ["1992", "1997", "2005", "2015"],
      "correct_answer": 1,
      "explanation": "O Protocolo de Kyoto foi assinado em 1997 e entrou em vigor em 2005."
    },
    {
      "id": "q3",
      "question": "Qual acordo internacional substituiu o Protocolo de Kyoto?",
      "options": ["Tratado de Roma", "Acordo de Paris", "Convenção de Viena", "Protocolo de Montreal"],
      "correct_answer": 1,
      "explanation": "O Acordo de Paris (2015) substituiu o Protocolo de Kyoto com metas mais ambiciosas."
    },
    {
      "id": "q4",
      "question": "Qual é a sigla do padrão de créditos da Verra?",
      "options": ["CER", "VCU", "GS VER", "EUA"],
      "correct_answer": 1,
      "explanation": "VCU significa Verified Carbon Units, emitidos pela Verra no mercado voluntário."
    },
    {
      "id": "q5",
      "question": "Qual mecanismo foi criado pelo Protocolo de Kyoto para países em desenvolvimento?",
      "options": ["EU ETS", "Cap-and-Trade", "MDL", "REDD+"],
      "correct_answer": 2,
      "explanation": "O MDL (Mecanismo de Desenvolvimento Limpo) permitiu que projetos em países em desenvolvimento gerassem créditos."
    },
    {
      "id": "q6",
      "question": "O que significa ''adicionalidade'' em um projeto de carbono?",
      "options": ["O projeto é extra", "O projeto só existe por causa do carbono", "O projeto tem benefícios adicionais", "O projeto gera mais créditos"],
      "correct_answer": 1,
      "explanation": "Adicionalidade significa que o projeto não aconteceria sem os recursos do mercado de carbono."
    },
    {
      "id": "q7",
      "question": "Qual é o maior mercado regulado de carbono do mundo?",
      "options": ["China ETS", "EU ETS", "California", "Korea ETS"],
      "correct_answer": 1,
      "explanation": "O EU ETS (Sistema Europeu de Comércio de Emissões) é o maior mercado regulado em valor negociado."
    },
    {
      "id": "q8",
      "question": "Quem são os VVBs no mercado de carbono?",
      "options": ["Compradores", "Vendedores", "Verificadores independentes", "Corretoras"],
      "correct_answer": 2,
      "explanation": "VVBs (Validation and Verification Bodies) são auditorias independentes que validam e verificam projetos."
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'introducao-ao-credito-de-carbono';

-- Quiz 3: O Carbono
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: O Carbono',
  'Teste seus conhecimentos sobre o ciclo do carbono e emissões',
  '[
    {
      "id": "q1",
      "question": "Qual é o símbolo químico do carbono?",
      "options": ["Ca", "Co", "C", "Cb"],
      "correct_answer": 2,
      "explanation": "O símbolo químico do carbono na tabela periódica é C."
    },
    {
      "id": "q2",
      "question": "Qual processo libera CO2 na atmosfera?",
      "options": ["Fotossíntese", "Respiração", "Precipitação", "Evaporação"],
      "correct_answer": 1,
      "explanation": "A respiração celular libera CO2 como subproduto da queima de nutrientes."
    },
    {
      "id": "q3",
      "question": "Qual processo absorve CO2 da atmosfera?",
      "options": ["Combustão", "Respiração", "Fotossíntese", "Fermentação"],
      "correct_answer": 2,
      "explanation": "A fotossíntese absorve CO2 e libera oxigênio, sendo fundamental para o ciclo do carbono."
    },
    {
      "id": "q4",
      "question": "Qual é o maior reservatório de carbono do planeta?",
      "options": ["Atmosfera", "Oceanos", "Florestas", "Solo"],
      "correct_answer": 1,
      "explanation": "Os oceanos armazenam aproximadamente 38.000 Gt de carbono, muito mais que qualquer outro reservatório."
    },
    {
      "id": "q5",
      "question": "O que significa CO2e?",
      "options": ["Carbono especial", "CO2 equivalente", "Carbono estável", "CO2 essencial"],
      "correct_answer": 1,
      "explanation": "CO2e significa CO2 equivalente, uma unidade que padroniza diferentes gases de efeito estufa."
    },
    {
      "id": "q6",
      "question": "Qual atividade humana é a maior fonte de emissões de CO2?",
      "options": ["Agricultura", "Queima de combustíveis fósseis", "Desmatamento", "Pecuária"],
      "correct_answer": 1,
      "explanation": "A queima de combustíveis fósseis (petróleo, carvão, gás) é responsável por cerca de 75% das emissões globais de CO2."
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'o-carbono';

-- Quiz 4: Aquecimento Global
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: Aquecimento Global',
  'Teste seus conhecimentos sobre causas e consequências das mudanças climáticas',
  '[
    {
      "id": "q1",
      "question": "Qual é a meta de limite de aquecimento do Acordo de Paris?",
      "options": ["1°C", "1,5°C", "2,5°C", "3°C"],
      "correct_answer": 1,
      "explanation": "O Acordo de Paris estabeleceu a meta de limitar o aquecimento global a 1,5°C acima dos níveis pré-industriais."
    },
    {
      "id": "q2",
      "question": "O que é o efeito estufa?",
      "options": ["Poluição do ar", "Retenção de calor por gases na atmosfera", "Destruição da camada de ozônio", "Aquecimento dos oceanos"],
      "correct_answer": 1,
      "explanation": "O efeito estufa é um fenômeno natural em que gases na atmosfera retêm parte do calor do sol, mantendo a Terra aquecida."
    },
    {
      "id": "q3",
      "question": "Qual setor é o maior emissor de GEE no Brasil?",
      "options": ["Transporte", "Energia", "Agropecuária e Mudança de Uso da Terra", "Indústria"],
      "correct_answer": 2,
      "explanation": "No Brasil, a agropecuária e mudança de uso da terra (desmatamento) respondem por mais de 70% das emissões."
    },
    {
      "id": "q4",
      "question": "Quanto a temperatura média global aumentou desde a era pré-industrial?",
      "options": ["0,5°C", "1,1°C", "2°C", "3°C"],
      "correct_answer": 1,
      "explanation": "A temperatura média global já aumentou cerca de 1,1°C em relação aos níveis pré-industriais."
    },
    {
      "id": "q5",
      "question": "Qual é uma consequência do aquecimento global?",
      "options": ["Mais neve nos trópicos", "Elevação do nível do mar", "Resfriamento dos oceanos", "Mais chuvas em desertos"],
      "correct_answer": 1,
      "explanation": "O derretimento de geleiras e a expansão térmica dos oceanos causam elevação do nível do mar."
    },
    {
      "id": "q6",
      "question": "O IPCC é:",
      "options": ["Uma empresa de energia", "Painel Intergovernamental sobre Mudanças Climáticas", "Organização de países", "Mercado de carbono"],
      "correct_answer": 1,
      "explanation": "O IPCC (Painel Intergovernamental sobre Mudanças Climáticas) é o órgão da ONU que avalia a ciência climática."
    },
    {
      "id": "q7",
      "question": "O que significa descarbonização?",
      "options": ["Remover carbono do solo", "Reduzir emissões de carbono das atividades econômicas", "Filtrar CO2 do ar", "Parar de usar carvão"],
      "correct_answer": 1,
      "explanation": "Descarbonização é o processo de reduzir as emissões de carbono das atividades econômicas."
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'aquecimento-global';

-- Quiz 5: Composição da Atmosfera
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: Composição da Atmosfera',
  'Teste seus conhecimentos sobre gases de efeito estufa',
  '[
    {
      "id": "q1",
      "question": "Qual é o gás mais abundante na atmosfera terrestre?",
      "options": ["Oxigênio", "Nitrogênio", "CO2", "Argônio"],
      "correct_answer": 1,
      "explanation": "O nitrogênio (N2) compõe cerca de 78% da atmosfera terrestre."
    },
    {
      "id": "q2",
      "question": "Qual gás de efeito estufa tem maior potencial de aquecimento global?",
      "options": ["CO2", "Metano", "Óxido nitroso", "Hexafluoreto de enxofre"],
      "correct_answer": 3,
      "explanation": "O SF6 (hexafluoreto de enxofre) tem potencial de aquecimento 23.500 vezes maior que o CO2."
    },
    {
      "id": "q3",
      "question": "Qual é a principal fonte de emissão de metano?",
      "options": ["Carros", "Fábricas", "Pecuária e decomposição orgânica", "Aviação"],
      "correct_answer": 2,
      "explanation": "A pecuária (fermentação entérica) e a decomposição de matéria orgânica são as principais fontes de metano."
    },
    {
      "id": "q4",
      "question": "Qual a concentração atual de CO2 na atmosfera (aproximadamente)?",
      "options": ["280 ppm", "350 ppm", "420 ppm", "500 ppm"],
      "correct_answer": 2,
      "explanation": "A concentração atual de CO2 é de aproximadamente 420 ppm (partes por milhão), 50% acima do período pré-industrial."
    },
    {
      "id": "q5",
      "question": "O vapor d''água é considerado um gás de efeito estufa?",
      "options": ["Não, apenas poluentes", "Sim, é o mais abundante", "Apenas em grandes altitudes", "Apenas quando condensado"],
      "correct_answer": 1,
      "explanation": "O vapor d''água é o gás de efeito estufa mais abundante, mas sua concentração não é controlada diretamente pelo homem."
    },
    {
      "id": "q6",
      "question": "O que significa GWP?",
      "options": ["Global Wind Power", "Potencial de Aquecimento Global", "Green World Protocol", "Gas Warming Percentage"],
      "correct_answer": 1,
      "explanation": "GWP (Global Warming Potential) mede o potencial de aquecimento de um gás comparado ao CO2."
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'composicao-da-atmosfera';

-- Quiz 6: MDL
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: Mecanismo de Desenvolvimento Limpo',
  'Teste seus conhecimentos sobre o MDL e projetos de carbono',
  '[
    {
      "id": "q1",
      "question": "O MDL foi criado por qual tratado internacional?",
      "options": ["Acordo de Paris", "Protocolo de Kyoto", "Convenção de Viena", "Tratado de Roma"],
      "correct_answer": 1,
      "explanation": "O Mecanismo de Desenvolvimento Limpo foi criado pelo Protocolo de Kyoto em 1997."
    },
    {
      "id": "q2",
      "question": "Qual tipo de crédito é gerado pelo MDL?",
      "options": ["VCU", "CER", "EUA", "GS VER"],
      "correct_answer": 1,
      "explanation": "CER (Certified Emission Reductions) são os créditos certificados pela ONU através do MDL."
    },
    {
      "id": "q3",
      "question": "Em quais países podem ser desenvolvidos projetos de MDL?",
      "options": ["Apenas países desenvolvidos", "Apenas países em desenvolvimento", "Qualquer país", "Apenas países da Europa"],
      "correct_answer": 1,
      "explanation": "Projetos de MDL são desenvolvidos em países em desenvolvimento (Anexo II do Protocolo de Kyoto)."
    },
    {
      "id": "q4",
      "question": "O que é uma AND no contexto do MDL?",
      "options": ["Agência Nacional Designada", "Acordo Nacional de Desenvolvimento", "Autoridade Normativa", "Associação Nacional"],
      "correct_answer": 0,
      "explanation": "AND (Autoridade Nacional Designada) é o órgão do país responsável por aprovar projetos de MDL."
    },
    {
      "id": "q5",
      "question": "Qual é a etapa final do ciclo de projeto MDL?",
      "options": ["Registro", "Validação", "Emissão de CERs", "Monitoramento"],
      "correct_answer": 2,
      "explanation": "A emissão de CERs é a etapa final, após verificação das reduções de emissões."
    },
    {
      "id": "q6",
      "question": "O Brasil é o país com mais projetos de MDL?",
      "options": ["Sim, é o primeiro", "Não, é a China", "Não, é a Índia", "Sim, empatado com China"],
      "correct_answer": 1,
      "explanation": "A China é o país com maior número de projetos de MDL registrados, seguida por Índia e Brasil."
    },
    {
      "id": "q7",
      "question": "O que substitui o MDL no Acordo de Paris?",
      "options": ["Nada, MDL continua", "Artigo 6", "REDD+", "EU ETS"],
      "correct_answer": 1,
      "explanation": "O Artigo 6 do Acordo de Paris cria novos mecanismos de mercado que substituem o MDL."
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'mecanismo-de-desenvolvimento-limpo';

-- Quiz 7: Mercado Brasil
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: Mercado de Carbono no Brasil',
  'Teste seus conhecimentos sobre o mercado brasileiro de carbono',
  '[
    {
      "id": "q1",
      "question": "Qual é a sigla do mercado regulado brasileiro de carbono?",
      "options": ["MCB", "SBCE", "BEX", "CBR"],
      "correct_answer": 1,
      "explanation": "SBCE significa Sistema Brasileiro de Comércio de Emissões, criado pela Lei 15.042/2024."
    },
    {
      "id": "q2",
      "question": "Em que ano foi aprovada a lei do mercado de carbono brasileiro?",
      "options": ["2020", "2022", "2024", "2025"],
      "correct_answer": 2,
      "explanation": "A Lei 15.042 que institui o SBCE foi sancionada em dezembro de 2024."
    },
    {
      "id": "q3",
      "question": "Qual é o limite de emissões para empresas serem reguladas pelo SBCE?",
      "options": ["10.000 tCO2e/ano", "25.000 tCO2e/ano", "50.000 tCO2e/ano", "100.000 tCO2e/ano"],
      "correct_answer": 1,
      "explanation": "Empresas que emitem mais de 25.000 tCO2e por ano são obrigadas a participar do SBCE."
    },
    {
      "id": "q4",
      "question": "O Brasil tem potencial de gerar quantos créditos de carbono?",
      "options": ["1 bilhão tCO2e", "5 bilhões tCO2e", "15 bilhões tCO2e", "50 bilhões tCO2e"],
      "correct_answer": 2,
      "explanation": "O Brasil tem potencial estimado de 15 bilhões de toneladas de CO2e em créditos de carbono."
    },
    {
      "id": "q5",
      "question": "Qual setor brasileiro tem maior potencial de geração de créditos?",
      "options": ["Industrial", "Florestal (REDD+)", "Energético", "Transporte"],
      "correct_answer": 1,
      "explanation": "O setor florestal, especialmente projetos REDD+ na Amazônia, tem o maior potencial de geração de créditos."
    },
    {
      "id": "q6",
      "question": "O que é a NDC brasileira?",
      "options": ["Nota de Crédito", "Contribuição Nacionalmente Determinada", "Norma de Carbono", "Novo Decreto Climático"],
      "correct_answer": 1,
      "explanation": "NDC (Nationally Determined Contribution) é o compromisso do Brasil com reduções de emissões no Acordo de Paris."
    },
    {
      "id": "q7",
      "question": "Qual ministério coordena a política climática brasileira?",
      "options": ["Meio Ambiente", "Economia", "Agricultura", "Minas e Energia"],
      "correct_answer": 0,
      "explanation": "O Ministério do Meio Ambiente e Mudança do Clima coordena as políticas climáticas nacionais."
    },
    {
      "id": "q8",
      "question": "O mercado voluntário brasileiro já existe?",
      "options": ["Não, ainda não começou", "Sim, já opera há anos", "Apenas para exportação", "Somente para governo"],
      "correct_answer": 1,
      "explanation": "O mercado voluntário brasileiro já opera há anos, com projetos certificados por padrões como Verra e Gold Standard."
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
WHERE c.slug = 'iniciando-no-credito-de-carbono' AND cm.slug = 'mercado-de-carbono-no-brasil';