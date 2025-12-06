
-- Tabela de desafios semanais
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- complete_lessons, pass_quizzes, earn_points, perfect_scores, login_streak, complete_module
  target_value INTEGER NOT NULL DEFAULT 1,
  reward_points INTEGER NOT NULL DEFAULT 50,
  reward_badge_id UUID REFERENCES public.badges(id),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT '#10b981',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de progresso dos alunos nos desafios
CREATE TABLE public.student_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Tabela de inscrições push
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Tabela de dados do Google Search Console
CREATE TABLE public.search_console_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  query TEXT, -- Keyword pesquisada
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  position NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_weekly_challenges_dates ON public.weekly_challenges(week_start, week_end);
CREATE INDEX idx_student_challenges_user ON public.student_challenges(user_id);
CREATE INDEX idx_search_console_article ON public.search_console_data(article_id);
CREATE INDEX idx_search_console_date ON public.search_console_data(date);

-- RLS para weekly_challenges
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone"
  ON public.weekly_challenges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage challenges"
  ON public.weekly_challenges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS para student_challenges
ALTER TABLE public.student_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON public.student_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON public.student_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON public.student_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all challenges"
  ON public.student_challenges FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS para push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- RLS para search_console_data
ALTER TABLE public.search_console_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and editors can view GSC data"
  ON public.search_console_data FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can manage GSC data"
  ON public.search_console_data FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Inserir 5 desafios para a semana atual
INSERT INTO public.weekly_challenges (title, description, challenge_type, target_value, reward_points, icon, color, week_start, week_end) VALUES
('Estudante Ativo', 'Complete 5 lições esta semana para ganhar pontos extras!', 'complete_lessons', 5, 100, 'book-open', '#10b981', date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Precisão Total', 'Tire 3 notas perfeitas (100%) em quizzes', 'perfect_scores', 3, 150, 'target', '#8b5cf6', date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Maratonista', 'Estude 3 dias consecutivos', 'login_streak', 3, 75, 'flame', '#f59e0b', date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Módulo Express', 'Complete 1 módulo inteiro', 'complete_module', 1, 125, 'graduation-cap', '#3b82f6', date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Aprovado!', 'Passe em 2 quizzes com nota acima de 70%', 'pass_quizzes', 2, 80, 'check-circle', '#22c55e', date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date);
