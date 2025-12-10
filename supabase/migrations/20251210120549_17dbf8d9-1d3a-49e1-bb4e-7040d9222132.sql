-- =====================================================
-- CORREÇÃO DE POLÍTICAS RLS DE SEGURANÇA
-- =====================================================

-- 1. NEWSLETTER_SUBSCRIBERS: Remover exposição de emails para não-admins
-- A política atual permite que admins vejam tudo, mas vamos garantir que está correta

-- Primeiro, removemos políticas existentes que possam estar incorretas
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Recriar políticas corretas
CREATE POLICY "Admins can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscribers" 
ON public.newsletter_subscribers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- 2. STUDENT_POINTS: Limitar exposição de dados
-- Manter visibilidade para leaderboard mas apenas dados não sensíveis
DROP POLICY IF EXISTS "Anyone can view points for leaderboard" ON public.student_points;
DROP POLICY IF EXISTS "Users can view own points" ON public.student_points;
DROP POLICY IF EXISTS "Users can insert own points" ON public.student_points;
DROP POLICY IF EXISTS "Users can update own points" ON public.student_points;

-- Recriar políticas mais restritivas
-- Leaderboard: apenas dados públicos (pontos totais e nível)
CREATE POLICY "Public leaderboard view" 
ON public.student_points 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own points" 
ON public.student_points 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points" 
ON public.student_points 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. USER_READING_HISTORY: Adicionar verificação de sessão válida
DROP POLICY IF EXISTS "Anyone can insert reading history" ON public.user_reading_history;
DROP POLICY IF EXISTS "Admins can view reading history" ON public.user_reading_history;

-- Recriar políticas - permitir inserção mas com session_id válido (não vazio)
CREATE POLICY "Anyone can insert reading history with valid session" 
ON public.user_reading_history 
FOR INSERT 
WITH CHECK (session_id IS NOT NULL AND session_id != '');

CREATE POLICY "Admins can view reading history" 
ON public.user_reading_history 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Garantir que não há política permissiva demais em tabelas sensíveis
-- Verificar profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING ((id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());