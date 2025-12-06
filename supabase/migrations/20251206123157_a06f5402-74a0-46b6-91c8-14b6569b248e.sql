-- Inserir lições de teste no módulo "Boas Vindas" do curso "Iniciando no Crédito de Carbono"
-- Primeiro, vamos encontrar o módulo correto

-- Inserir 3 lições de teste
INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes) 
SELECT 
  cm.id,
  'Bem-vindo ao Curso de Crédito de Carbono',
  'bem-vindo-ao-curso',
  E'# Bem-vindo ao Curso!\n\nNeste curso, você aprenderá os fundamentos do mercado de crédito de carbono.\n\n## O que você vai aprender\n\n- O que são créditos de carbono\n- Como funciona o mercado\n- Oportunidades de investimento\n- Impacto ambiental positivo\n\n## Por que isso é importante?\n\nO mercado de carbono é uma das principais ferramentas para combater as mudanças climáticas. Ao entender como funciona, você pode:\n\n1. **Investir de forma consciente** - Escolher ativos sustentáveis\n2. **Contribuir para o meio ambiente** - Apoiar projetos de redução de emissões\n3. **Estar à frente** - O mercado de carbono está crescendo rapidamente\n\nVamos começar sua jornada!',
  1,
  5
FROM course_modules cm
JOIN courses c ON c.id = cm.course_id
WHERE c.slug = 'iniciando-credito-carbono' AND cm.slug = 'boas-vindas'
ON CONFLICT DO NOTHING;

INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes) 
SELECT 
  cm.id,
  'Como Usar a Plataforma Educacional',
  'como-usar-plataforma',
  E'# Como Usar a Plataforma\n\nVeja como aproveitar ao máximo nosso sistema de aprendizado.\n\n## Navegação\n\n- **Cursos** - Acesse todos os cursos disponíveis\n- **Módulos** - Cada curso é dividido em módulos temáticos\n- **Lições** - Conteúdo detalhado em cada módulo\n- **Quizzes** - Teste seus conhecimentos\n\n## Sistema de Gamificação\n\nVocê ganha pontos e badges ao:\n\n- ✅ Completar lições\n- ✅ Passar em quizzes\n- ✅ Finalizar módulos\n- ✅ Concluir cursos\n\n## Dicas\n\n1. Complete as lições na ordem sugerida\n2. Faça anotações importantes\n3. Refaça quizzes para melhorar sua pontuação\n4. Compartilhe seu progresso com amigos',
  2,
  3
FROM course_modules cm
JOIN courses c ON c.id = cm.course_id
WHERE c.slug = 'iniciando-credito-carbono' AND cm.slug = 'boas-vindas'
ON CONFLICT DO NOTHING;

INSERT INTO module_lessons (module_id, title, slug, content, order_index, duration_minutes) 
SELECT 
  cm.id,
  'Próximos Passos na sua Jornada',
  'proximos-passos',
  E'# Próximos Passos\n\nAgora que você conhece a plataforma, veja o que vem a seguir!\n\n## Seu Roteiro de Aprendizado\n\n### Semana 1: Fundamentos\n- Complete este módulo introdutório\n- Faça o quiz de verificação\n- Conquiste seu primeiro badge!\n\n### Semana 2: Conceitos Básicos\n- O que são créditos de carbono\n- Tipos de projetos elegíveis\n- Mercado voluntário vs regulado\n\n### Semana 3: Prática\n- Análise de projetos reais\n- Cálculo de pegada de carbono\n- Estratégias de compensação\n\n## Metas Sugeridas\n\n- 🎯 Complete 1 lição por dia\n- 🎯 Passe em todos os quizzes com 80%+\n- 🎯 Conquiste 5 badges na primeira semana\n\nBoa sorte na sua jornada de aprendizado!',
  3,
  2
FROM course_modules cm
JOIN courses c ON c.id = cm.course_id
WHERE c.slug = 'iniciando-credito-carbono' AND cm.slug = 'boas-vindas'
ON CONFLICT DO NOTHING;

-- Inserir quiz de teste para o módulo
INSERT INTO module_quizzes (module_id, title, description, questions, passing_score, max_attempts)
SELECT 
  cm.id,
  'Quiz: Introdução ao Crédito de Carbono',
  'Teste seus conhecimentos sobre os conceitos básicos apresentados neste módulo.',
  '[
    {
      "id": "q1",
      "question": "Qual é o principal objetivo do mercado de crédito de carbono?",
      "options": [
        "Gerar lucro para empresas de petróleo",
        "Combater as mudanças climáticas através da redução de emissões",
        "Aumentar a produção industrial",
        "Substituir todas as fontes de energia"
      ],
      "correctAnswer": 1
    },
    {
      "id": "q2", 
      "question": "O que você ganha ao completar lições na plataforma?",
      "options": [
        "Dinheiro real",
        "Créditos de carbono",
        "Pontos e badges",
        "Nada"
      ],
      "correctAnswer": 2
    },
    {
      "id": "q3",
      "question": "Qual é a meta sugerida de lições por dia?",
      "options": [
        "5 lições",
        "1 lição",
        "10 lições",
        "Nenhuma"
      ],
      "correctAnswer": 1
    }
  ]'::jsonb,
  70,
  3
FROM course_modules cm
JOIN courses c ON c.id = cm.course_id
WHERE c.slug = 'iniciando-credito-carbono' AND cm.slug = 'boas-vindas'
ON CONFLICT DO NOTHING;