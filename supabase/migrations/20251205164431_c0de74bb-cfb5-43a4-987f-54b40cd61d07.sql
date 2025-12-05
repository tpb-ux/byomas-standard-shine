-- Tabela de cursos
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  duration_hours INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de módulos do curso
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, slug)
);

-- Tabela de lições do módulo
CREATE TABLE public.module_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(module_id, slug)
);

-- Tabela de quizzes do módulo
CREATE TABLE public.module_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de progresso do estudante
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.module_lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- Tabela de tentativas de quiz
CREATE TABLE public.student_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID REFERENCES public.module_quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  passed BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de certificados
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  student_email TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Políticas para cursos (visíveis por todos, gerenciados por admins)
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para módulos
CREATE POLICY "Course modules are viewable by everyone" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "Admins can manage course modules" ON public.course_modules FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para lições
CREATE POLICY "Module lessons are viewable by everyone" ON public.module_lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage module lessons" ON public.module_lessons FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para quizzes
CREATE POLICY "Module quizzes are viewable by everyone" ON public.module_quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can manage module quizzes" ON public.module_quizzes FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para progresso do estudante
CREATE POLICY "Users can view own progress" ON public.student_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.student_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.student_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.student_progress FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Políticas para tentativas de quiz
CREATE POLICY "Users can view own quiz attempts" ON public.student_quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON public.student_quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all quiz attempts" ON public.student_quiz_attempts FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Políticas para certificados
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view certificate by code" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users can insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Inserir o curso inicial "Iniciando no Crédito de Carbono"
INSERT INTO public.courses (title, slug, description, duration_hours, is_active, is_free) VALUES
('Iniciando no Crédito de Carbono', 'iniciando-credito-carbono', 
 'Curso completo para iniciantes no mercado de crédito de carbono. Aprenda desde os conceitos básicos até o funcionamento do mercado brasileiro.',
 15, true, true);

-- Inserir os módulos do curso
INSERT INTO public.course_modules (course_id, title, slug, description, order_index, duration_minutes) 
SELECT 
  c.id,
  m.title,
  m.slug,
  m.description,
  m.order_index,
  m.duration_minutes
FROM public.courses c,
(VALUES 
  ('Boas Vindas', 'boas-vindas', 'Apresentação do curso e como aproveitar ao máximo sua jornada de aprendizado.', 0, 15),
  ('Introdução ao Crédito de Carbono', 'introducao', 'Conceitos fundamentais e história do crédito de carbono no mundo.', 1, 45),
  ('O Carbono', 'o-carbono', 'Entenda o ciclo do carbono, suas emissões e impactos no planeta.', 2, 60),
  ('Aquecimento Global', 'aquecimento-global', 'Causas, consequências e dados científicos sobre as mudanças climáticas.', 3, 60),
  ('Composição da Atmosfera', 'composicao-atmosfera', 'A relevância da composição química da atmosfera e os gases de efeito estufa.', 4, 45),
  ('Mecanismo de Desenvolvimento Limpo (MDL)', 'mdl', 'Como funciona o MDL e sua importância para projetos de carbono.', 5, 60),
  ('Mercado de Carbono no Brasil', 'mercado-brasil', 'Regulamentação, principais players e oportunidades no mercado brasileiro.', 6, 75)
) AS m(title, slug, description, order_index, duration_minutes)
WHERE c.slug = 'iniciando-credito-carbono';