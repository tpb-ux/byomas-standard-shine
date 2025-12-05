-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'award',
  color TEXT DEFAULT '#10b981',
  category TEXT DEFAULT 'achievement',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER DEFAULT 1,
  points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create student_badges table
CREATE TABLE public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  shared_at TIMESTAMPTZ,
  UNIQUE(user_id, badge_id)
);

-- Create student_points table
CREATE TABLE public.student_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  login_streak INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create student_activity_log table
CREATE TABLE public.student_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity_log ENABLE ROW LEVEL SECURITY;

-- Badges policies (viewable by everyone)
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Student badges policies
CREATE POLICY "Users can view own badges" ON public.student_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.student_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own badges" ON public.student_badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all badges" ON public.student_badges FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Student points policies
CREATE POLICY "Users can view own points" ON public.student_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points" ON public.student_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points" ON public.student_points FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view points for leaderboard" ON public.student_points FOR SELECT USING (true);

-- Student activity log policies
CREATE POLICY "Users can view own activity" ON public.student_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.student_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity" ON public.student_activity_log FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, color, category, requirement_type, requirement_value, points) VALUES
('Primeiro Passo', 'Complete sua primeira lição', 'sprout', '#22c55e', 'milestone', 'complete_lessons', 1, 10),
('Estudante Dedicado', 'Complete 10 lições', 'book-open', '#3b82f6', 'achievement', 'complete_lessons', 10, 50),
('Aprovado!', 'Passe no seu primeiro quiz', 'target', '#f59e0b', 'milestone', 'pass_quiz', 1, 25),
('Nota Perfeita', 'Tire 100% em um quiz', 'trophy', '#eab308', 'achievement', 'perfect_quiz', 1, 100),
('Módulo Completo', 'Complete um módulo inteiro', 'bookmark', '#8b5cf6', 'milestone', 'complete_modules', 1, 75),
('Certificado Conquistado', 'Conclua um curso e receba certificado', 'graduation-cap', '#ec4899', 'achievement', 'complete_courses', 1, 500),
('Sequência de 7 dias', 'Estude por 7 dias seguidos', 'flame', '#ef4444', 'streak', 'login_streak', 7, 200),
('Explorador', 'Inicie todos os módulos de um curso', 'compass', '#06b6d4', 'achievement', 'start_all_modules', 7, 50),
('Expert em Carbono', 'Complete todos os quizzes de um curso', 'diamond', '#a855f7', 'achievement', 'complete_all_quizzes', 7, 300),
('Top 10', 'Entre no top 10 do ranking', 'medal', '#f97316', 'achievement', 'top_ranking', 10, 250);

-- Create index for leaderboard queries
CREATE INDEX idx_student_points_total ON public.student_points(total_points DESC);
CREATE INDEX idx_student_activity_created ON public.student_activity_log(created_at DESC);