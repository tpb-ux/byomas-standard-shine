-- Tabela de configurações de automação
CREATE TABLE public.automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins can manage automation settings"
ON public.automation_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins and editors can view automation settings"
ON public.automation_settings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Configurações iniciais
INSERT INTO automation_settings (key, value, description) VALUES
  ('articles_per_execution', '3', 'Quantidade de artigos por execução'),
  ('daily_target', '15', 'Meta diária de artigos'),
  ('image_fallback_enabled', 'true', 'Usar imagem placeholder quando IA falhar'),
  ('trending_boost_enabled', 'true', 'Priorizar trending topics');

-- Tabela para imagens de fallback
CREATE TABLE public.fallback_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  alt_text TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.fallback_images ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Fallback images are viewable by admins and editors"
ON public.fallback_images FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can manage fallback images"
ON public.fallback_images FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir imagens de fallback padrão (Unsplash com licença livre)
INSERT INTO fallback_images (url, category, alt_text) VALUES
  ('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=630&fit=crop', 'sustainability', 'Floresta tropical verde'),
  ('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=630&fit=crop', 'energy', 'Painéis solares em campo'),
  ('https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=630&fit=crop', 'urban', 'Cidade sustentável'),
  ('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&h=630&fit=crop', 'nature', 'Natureza e meio ambiente'),
  ('https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=630&fit=crop', 'finance', 'Gráficos financeiros verdes'),
  ('https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=630&fit=crop', 'wind', 'Turbinas eólicas'),
  ('https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=1200&h=630&fit=crop', 'carbon', 'Floresta e carbono'),
  ('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop', 'forest', 'Floresta densa');